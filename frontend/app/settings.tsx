import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Linking,
  useWindowDimensions,
  KeyboardAvoidingView,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import {
  UserProfile,
  DEFAULT_PROFILE,
  loadProfile,
  saveProfile,
} from "@/src/utils/profile";

const DESIGN_WIDTH = 1290;
const MAX_PHONE_WIDTH = 430;

const BG = "#E0DFCA";
const CARD_BG = "#FBFCFC";
const CARD_BORDER = "#D5D3BE";
const TEXT_PRIMARY = "#000000";
const TEXT_MUTED = "#55544B";
const ACCENT = "#FF8100";
const BTN_DARK = "#2C2B26";

const FONT_INTER_M = "Inter_500Medium";
const FONT_INTER_SB = "Inter_600SemiBold";
const FONT_INTER_B = "Inter_700Bold";
const sfPro = Platform.select({ ios: undefined, default: FONT_INTER_M });

type FieldDef = {
  key: keyof UserProfile;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad" | "number-pad";
  autoCapitalize?: "none" | "characters" | "sentences";
};

const SECTIONS: { title: string; fields: FieldDef[] }[] = [
  {
    title: "Особиста інформація",
    fields: [
      { key: "surname", label: "Прізвище", autoCapitalize: "characters" },
      { key: "name", label: "Ім'я", autoCapitalize: "characters" },
      { key: "patronymic", label: "По батькові" },
      { key: "birthDate", label: "Дата народження", placeholder: "ДД.ММ.РРРР" },
      { key: "validUntil", label: "Дійсний до", placeholder: "ДД.ММ.РРРР" },
      { key: "rnokpp", label: "РНОКПП", keyboardType: "number-pad" },
      { key: "status", label: "Статус" },
    ],
  },
  {
    title: "Військова інформація",
    fields: [
      { key: "category", label: "Категорія обліку" },
      { key: "tck", label: "ТЦК та СП", multiline: true },
      { key: "rank", label: "Звання" },
      { key: "registryNumber", label: "Номер в реєстрі Оберіг" },
      { key: "vos", label: "ВОС" },
      { key: "note", label: "Примітка", multiline: true },
      { key: "deferralType", label: "Тип відстрочки" },
      { key: "deferralUntil", label: "Відстрочка до" },
    ],
  },
  {
    title: "Адреса та контакти",
    fields: [
      { key: "address", label: "Адреса проживання", multiline: true },
      { key: "email", label: "Email", keyboardType: "email-address", autoCapitalize: "none" },
      { key: "phone", label: "Телефон", keyboardType: "phone-pad" },
      { key: "dataUpdateDate", label: "Дата уточнення даних", placeholder: "ДД.ММ.РРРР" },
    ],
  },
  {
    title: "Стрічка документа",
    fields: [
      {
        key: "customTicker",
        label: "Свій текст стрічки (порожньо = авто)",
        multiline: true,
      },
    ],
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { width: winWidth } = useWindowDimensions();
  const W = Math.min(winWidth || MAX_PHONE_WIDTH, MAX_PHONE_WIDTH);
  const scale = W / DESIGN_WIDTH;
  const s = useCallback((v: number) => v * scale, [scale]);

  const [draft, setDraft] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const p = await loadProfile();
      if (mounted) {
        setDraft(p);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const updateField = useCallback(<K extends keyof UserProfile>(k: K, v: UserProfile[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
  }, []);

  const pickPhoto = useCallback(async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        if (perm.canAskAgain === false) {
          Alert.alert(
            "Потрібен доступ до фото",
            "Будь ласка, надайте доступ до галереї в налаштуваннях.",
            [
              { text: "Скасувати", style: "cancel" },
              { text: "Відкрити налаштування", onPress: () => Linking.openSettings() },
            ],
          );
        }
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.7,
        base64: true,
      });
      if (!res.canceled && res.assets && res.assets[0]) {
        const a = res.assets[0];
        const b64 = a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri;
        updateField("photoBase64", b64);
      }
    } catch (e) {
      console.warn("pickPhoto failed", e);
    }
  }, [updateField]);

  const removePhoto = useCallback(() => {
    updateField("photoBase64", null);
  }, [updateField]);

  const onSave = useCallback(async () => {
    setSaving(true);
    const cleaned: UserProfile = {
      ...draft,
      surname: (draft.surname || "").trim().toUpperCase() || DEFAULT_PROFILE.surname,
      name: (draft.name || "").trim().toUpperCase() || DEFAULT_PROFILE.name,
      patronymic: (draft.patronymic || "").trim() || DEFAULT_PROFILE.patronymic,
    };
    const ok = await saveProfile(cleaned);
    setSaving(false);
    if (ok) {
      router.back();
    } else {
      Alert.alert("Помилка", "Не вдалося зберегти дані.");
    }
  }, [draft, router]);

  const onResetDefaults = useCallback(() => {
    Alert.alert(
      "Скинути дані?",
      "Профіль буде повернуто до значень за замовчуванням.",
      [
        { text: "Скасувати", style: "cancel" },
        {
          text: "Скинути",
          style: "destructive",
          onPress: () => setDraft({ ...DEFAULT_PROFILE }),
        },
      ],
    );
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: BG }]}>
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1, width: "100%", alignItems: "center" }}
        >
          <View style={{ width: W, flex: 1 }}>
            {/* Header */}
            <View
              style={{
                paddingTop: s(60),
                paddingHorizontal: s(72),
                paddingBottom: s(24),
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                testID="settings-back"
                activeOpacity={0.7}
                onPress={() => router.back()}
                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                style={{ paddingVertical: s(10) }}
              >
                <Text
                  style={{
                    fontFamily: sfPro,
                    fontSize: s(48),
                    fontWeight: "500",
                    color: TEXT_PRIMARY,
                    letterSpacing: 1.2 * scale,
                  }}
                >
                  ‹ Назад
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="settings-reset"
                activeOpacity={0.7}
                onPress={onResetDefaults}
                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              >
                <Text
                  style={{
                    fontFamily: sfPro,
                    fontSize: s(36),
                    color: TEXT_MUTED,
                    textDecorationLine: "underline",
                  }}
                >
                  Скинути
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingHorizontal: s(72),
                paddingBottom: s(220),
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text
                style={{
                  fontFamily: sfPro,
                  fontSize: s(86),
                  fontWeight: "500",
                  color: TEXT_PRIMARY,
                  letterSpacing: 3.44 * scale,
                  lineHeight: s(86) * 1.05,
                  marginBottom: s(40),
                }}
              >
                Налаштування
              </Text>

              {/* Photo */}
              <View
                style={{
                  backgroundColor: CARD_BG,
                  borderRadius: s(48),
                  padding: s(40),
                  marginBottom: s(40),
                  flexDirection: "row",
                  alignItems: "center",
                  gap: s(40),
                }}
              >
                <TouchableOpacity
                  testID="settings-photo"
                  activeOpacity={0.7}
                  onPress={pickPhoto}
                  style={{
                    width: s(280),
                    height: s(360),
                    backgroundColor: "#fff",
                    borderRadius: s(24),
                    borderWidth: s(2),
                    borderColor: CARD_BORDER,
                    overflow: "hidden",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {draft.photoBase64 ? (
                    <Image
                      source={{ uri: draft.photoBase64 }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                    />
                  ) : (
                    <Text style={{ color: "#999", fontSize: s(30), textAlign: "center", padding: s(16) }}>
                      Натисніть, щоб обрати фото
                    </Text>
                  )}
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={[fieldLabelStyle(s), { marginBottom: s(20) }]}>Фото профілю</Text>
                  <TouchableOpacity
                    testID="settings-photo-pick"
                    activeOpacity={0.85}
                    onPress={pickPhoto}
                    style={{
                      height: s(110),
                      borderRadius: s(55),
                      backgroundColor: ACCENT,
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: s(20),
                    }}
                  >
                    <Text style={{ color: "#1A1A1A", fontFamily: sfPro, fontSize: s(36), fontWeight: "600" }}>
                      Обрати фото
                    </Text>
                  </TouchableOpacity>
                  {!!draft.photoBase64 && (
                    <TouchableOpacity
                      testID="settings-photo-remove"
                      activeOpacity={0.7}
                      onPress={removePhoto}
                      style={{
                        height: s(110),
                        borderRadius: s(55),
                        backgroundColor: "transparent",
                        borderWidth: s(3),
                        borderColor: TEXT_MUTED,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: TEXT_MUTED, fontFamily: sfPro, fontSize: s(34), fontWeight: "500" }}>
                        Видалити фото
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Sections */}
              {SECTIONS.map((section) => (
                <View
                  key={section.title}
                  style={{
                    backgroundColor: CARD_BG,
                    borderRadius: s(48),
                    paddingHorizontal: s(40),
                    paddingTop: s(36),
                    paddingBottom: s(20),
                    marginBottom: s(40),
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FONT_INTER_SB,
                      fontSize: s(44),
                      fontWeight: "600",
                      color: TEXT_PRIMARY,
                      marginBottom: s(24),
                      letterSpacing: 1.32 * scale,
                    }}
                  >
                    {section.title}
                  </Text>
                  {section.fields.map((f) => (
                    <View key={String(f.key)} style={{ marginBottom: s(28) }}>
                      <Text style={fieldLabelStyle(s)}>{f.label}</Text>
                      <TextInput
                        testID={`settings-input-${String(f.key)}`}
                        value={(draft[f.key] as string) || ""}
                        onChangeText={(t) => updateField(f.key, t as any)}
                        placeholder={f.placeholder || ""}
                        placeholderTextColor="#aaa"
                        multiline={!!f.multiline}
                        keyboardType={f.keyboardType || "default"}
                        autoCapitalize={f.autoCapitalize || "sentences"}
                        style={inputStyle(s, !!f.multiline)}
                      />
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>

            {/* Save bar */}
            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                paddingHorizontal: s(72),
                paddingTop: s(20),
                paddingBottom: s(40),
                backgroundColor: BG,
                borderTopWidth: 1,
                borderTopColor: CARD_BORDER,
              }}
            >
              <TouchableOpacity
                testID="settings-save"
                activeOpacity={0.85}
                onPress={onSave}
                disabled={saving || loading}
                style={{
                  height: s(150),
                  borderRadius: s(75),
                  backgroundColor: saving ? "#aaa" : BTN_DARK,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: sfPro,
                    fontSize: s(48),
                    fontWeight: "600",
                    color: "#FFFFFF",
                    letterSpacing: 1.44 * scale,
                  }}
                >
                  {saving ? "Збереження..." : "Зберегти"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function fieldLabelStyle(s: (v: number) => number) {
  return {
    fontFamily: sfPro,
    fontSize: s(32),
    color: TEXT_MUTED,
    marginBottom: s(8),
    letterSpacing: 0.6,
  };
}

function inputStyle(s: (v: number) => number, multiline: boolean) {
  return {
    fontFamily: sfPro,
    fontSize: s(38),
    fontWeight: "500" as const,
    color: TEXT_PRIMARY,
    paddingVertical: s(14),
    paddingHorizontal: s(20),
    borderWidth: s(2),
    borderColor: CARD_BORDER,
    borderRadius: s(20),
    backgroundColor: "#fff",
    minHeight: multiline ? s(140) : s(90),
    textAlignVertical: multiline ? ("top" as const) : ("center" as const),
  };
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center" },
});
