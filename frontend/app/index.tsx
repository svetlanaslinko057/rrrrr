import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  useWindowDimensions,
  TextInput,
  Pressable,
  Alert,
  Linking,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  cancelAnimation,
  runOnJS,
} from "react-native-reanimated";
import QRCode from "react-native-qrcode-svg";
import * as ImagePicker from "expo-image-picker";

import { storage } from "@/src/utils/storage";
import ServicesScreen from "@/src/components/ServicesScreen";
import EditOnlineScreen from "@/src/components/EditOnlineScreen";
import VacanciesScreen from "@/src/components/VacanciesScreen";
import SupportScreen from "@/src/components/SupportScreen";
import MenuScreen from "@/src/components/MenuScreen";
import ActiveSessionsScreen from "@/src/components/ActiveSessionsScreen";
import DocumentActionsSheet from "@/src/components/DocumentActionsSheet";
import DocumentDetailSheet from "@/src/components/DocumentDetailSheet";
import NotificationsScreen from "@/src/components/NotificationsScreen";
import { generateAndShareMilitaryPdf } from "@/src/utils/pdfGenerator";

// ---- Артефакти ----
const TRIDENT_SRC = require("../assets/images/trident.png");
const BELL_SRC = require("../assets/images/bell.png");
const FAB_SRC = require("../assets/images/fab.png");
const TEST_PHOTO_SRC = require("../assets/images/test_photo.png");
const TAB_ICON_RESERVE = require("../assets/images/tab_reserve_inactive.png");
const TAB_ICON_RESERVE_ACTIVE = require("../assets/images/reserve_id_icon.png");
const TAB_ICON_SERVICES = require("../assets/images/tab2_new.png");
const TAB_ICON_SERVICES_ACTIVE = require("../assets/images/tab_services_active.png");
const TAB_ICON_VACANCIES = require("../assets/images/tab_vacancies_new.png");
const TAB_ICON_VACANCIES_ACTIVE = require("../assets/images/tab_vacancies_active.png");
const TAB_ICON_MENU = require("../assets/images/tab_menu_new.png");
const TAB_ICON_MENU_ACTIVE = require("../assets/images/tab_menu_active.png");

// ---- Дизайн-консти (канвас 1290) ----
const DESIGN_WIDTH = 1290;
const MAX_PHONE_WIDTH = 430;

const BG = "#E0DFCA";
const CARD_BG = "#D5D3BE";
const CARD_BORDER = "#A5A291";
const TEXT_PRIMARY = "#000000";
const TEXT_MUTED = "#55544B";
const STRIP_BG = "#6B5421";
const TAB_BG = "#FFFFFF";
const PILL_BG = "#FBFCFC";
const ACCENT = "#FF8100";

const FONT_INTER_M = "Inter_500Medium";
const FONT_INTER_SB = "Inter_600SemiBold";
const FONT_INTER_B = "Inter_700Bold";
const sfPro = Platform.select({ ios: undefined, default: FONT_INTER_SB });

const MONTHS_UA = [
  "січня", "лютого", "березня", "квітня", "травня", "червня",
  "липня", "серпня", "вересня", "жовтня", "листопада", "грудня",
];

const STORAGE_KEY = "rezerv_profile_v1";

// ---- Типи ----
type Profile = {
  surname: string;
  name: string;
  patronymic: string;
  birthDate: string;
  deferralUntil: string;
  customTicker: string;
  photoBase64: string | null;
  noPhoto?: boolean; // true → варіант без фото (інша верстка/шрифти)
};

const DEFAULT_PROFILE: Profile = {
  surname: "ІВАНОВ",
  name: "ІВАН",
  patronymic: "Іванович",
  birthDate: "11.11.1111",
  deferralUntil: "08.01.2027",
  customTicker: "",
  photoBase64: null,
};

// Мок-варіанти, які надалі повертатиме бекенд.
// Перемикання — long-press на табі "Резерв ID".
const MOCK_VARIANTS: Profile[] = [
  DEFAULT_PROFILE,
  {
    surname: "СЕНЮК",
    name: "ДМИТРО",
    patronymic: "ВОЛОДИМИРОВИЧ",
    birthDate: "27.05.1993",
    deferralUntil: "завершення мобілізації",
    customTicker: "",
    photoBase64: null,
    noPhoto: true,
  },
];

const pad2 = (n: number) => String(n).padStart(2, "0");

function buildAutoTicker(): string {
  const n = new Date();
  return `Документ оновлено о ${pad2(n.getHours())}:${pad2(n.getMinutes())} | ${pad2(n.getDate())}.${pad2(n.getMonth() + 1)}.${n.getFullYear()}`;
}

function buildQrValidLabel(tickerText: string): string {
  const m = tickerText.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!m) return "QR-код дійсний";
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const y = parseInt(m[3], 10) + 1;
  return `QR-код дійсний до ${d} ${MONTHS_UA[mo - 1]} ${y}`;
}

function formatDateInput(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}.${d.slice(2)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4)}`;
}

export default function ReserveIdScreen() {
  const { width: winWidth } = useWindowDimensions();
  const W = Math.min(winWidth || MAX_PHONE_WIDTH, MAX_PHONE_WIDTH);
  const scale = W / DESIGN_WIDTH;
  const s = useCallback((v: number) => v * scale, [scale]);

  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [draft, setDraft] = useState<Profile>(DEFAULT_PROFILE);
  const [editMode, setEditMode] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [tickerStamp, setTickerStamp] = useState<string>(buildAutoTicker());
  const [variantIdx, setVariantIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"reserve" | "services" | "vacancies" | "menu">("reserve");
  const [servicesSubScreen, setServicesSubScreen] = useState<null | "edit-online">(null);
  const [vacanciesSubScreen, setVacanciesSubScreen] = useState<null | "support">(null);
  const [menuSubScreen, setMenuSubScreen] = useState<null | "support" | "sessions">(null);
  const [docSheetOpen, setDocSheetOpen] = useState(false);
  const [docDetailOpen, setDocDetailOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reset sub-screen on tab switch
  useEffect(() => {
    if (activeTab !== "services") setServicesSubScreen(null);
    if (activeTab !== "vacancies") setVacanciesSubScreen(null);
    if (activeTab !== "menu") setMenuSubScreen(null);
    if (activeTab !== "reserve") setShowNotifications(false);
  }, [activeTab]);

  const cycleVariant = useCallback(() => {
    setVariantIdx((i) => {
      const next = (i + 1) % MOCK_VARIANTS.length;
      setProfile(MOCK_VARIANTS[next]);
      setDraft(MOCK_VARIANTS[next]);
      return next;
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const raw = await storage.getItem<string>(STORAGE_KEY, "");
      if (mounted && raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<Profile>;
          const merged = { ...DEFAULT_PROFILE, ...parsed };
          setProfile(merged);
          setDraft(merged);
        } catch {
          /* ignore */
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (profile.customTicker) return;
    const id = setInterval(() => setTickerStamp(buildAutoTicker()), 60_000);
    return () => clearInterval(id);
  }, [profile.customTicker]);

  const tickerText = profile.customTicker || tickerStamp;
  const TICKER_UNIT = isRefreshing
    ? `Оновлюємо документ   •   Оновимо за годину   •   `
    : `${tickerText}   •   `;
  const TICKER_REPEAT = 30;
  const STRIP_BG_ACTIVE = isRefreshing ? "#F9D85D" : STRIP_BG;
  const TICKER_COLOR = isRefreshing ? "#1A1A1A" : "#FFFFFF";

  const handleConfirmUpdate = useCallback(() => {
    setUpdateModalVisible(false);
    setIsRefreshing(true);
    setTimeout(() => {
      setTickerStamp(buildAutoTicker());
      setIsRefreshing(false);
    }, 1500);
  }, []);

  const qrValue = JSON.stringify({
    s: profile.surname,
    n: profile.name,
    p: profile.patronymic,
    b: profile.birthDate,
    d: profile.deferralUntil,
    t: Date.now(),
  });
  const qrValidLabel = buildQrValidLabel(tickerText);

  // Ticker animation
  const tx = useSharedValue(0);
  const [tickerW, setTickerW] = useState(0);
  useEffect(() => {
    if (tickerW > 0) {
      tx.value = 0;
      const duration = (tickerW / s(140)) * 1000;
      tx.value = withRepeat(
        withTiming(-tickerW, { duration, easing: Easing.linear }),
        -1,
        false,
      );
    }
    return () => cancelAnimation(tx);
  }, [tickerW, tx, s]);
  const tickerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }));

  // Flip animation
  const flipSx = useSharedValue(1);
  const flipSy = useSharedValue(1);
  const flipBright = useSharedValue(1);
  const flippingRef = useRef(false);

  const swapSide = useCallback(() => setShowQR((v) => !v), []);

  const doFlip = useCallback(() => {
    if (flippingRef.current || editMode) return;
    flippingRef.current = true;
    const HALF = 200;
    flipSx.value = withSequence(
      withTiming(0, { duration: HALF, easing: Easing.bezier(0.4, 0, 1, 1) }),
      withTiming(1, { duration: HALF, easing: Easing.bezier(0, 0, 0.6, 1) }, () => {
        flippingRef.current = false;
      }),
    );
    flipSy.value = withSequence(
      withTiming(0.97, { duration: HALF }),
      withTiming(1, { duration: HALF }),
    );
    flipBright.value = withSequence(
      withTiming(0.6, { duration: HALF }, () => {
        runOnJS(swapSide)();
      }),
      withTiming(1, { duration: HALF }),
    );
  }, [editMode, flipSx, flipSy, flipBright, swapSide]);

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: flipSx.value }, { scaleY: flipSy.value }],
    opacity: 0.4 + 0.6 * flipBright.value,
  }));

  const startEdit = useCallback(() => {
    setDraft(profile);
    setEditMode(true);
    if (showQR) setShowQR(false);
  }, [profile, showQR]);

  const saveEdit = useCallback(async () => {
    const cleaned: Profile = {
      surname: (draft.surname || "").trim().toUpperCase() || DEFAULT_PROFILE.surname,
      name: (draft.name || "").trim().toUpperCase() || DEFAULT_PROFILE.name,
      patronymic: (draft.patronymic || "").trim() || DEFAULT_PROFILE.patronymic,
      birthDate: draft.birthDate || DEFAULT_PROFILE.birthDate,
      deferralUntil: draft.deferralUntil || DEFAULT_PROFILE.deferralUntil,
      customTicker: draft.customTicker || "",
      photoBase64: draft.photoBase64,
    };
    setProfile(cleaned);
    setEditMode(false);
    await storage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
  }, [draft]);

  const pickPhoto = useCallback(async () => {
    if (!editMode) return;
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
        setDraft((d) => ({ ...d, photoBase64: b64 }));
      }
    } catch (e) {
      console.warn("pickPhoto failed", e);
    }
  }, [editMode]);

  const currentPhoto = editMode ? draft.photoBase64 : profile.photoBase64;

  // QR canvas-розмір (980px на 1290px-канвасі)
  const qrSize = useMemo(() => s(980), [s]);

  // Card geometry (FIXED for both sides)
  const CARD_W = s(1146);
  const CARD_H = s(1542);
  const CARD_RADIUS = s(48);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} translucent={false} />

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={[styles.screen, { width: W }]}>
          {/* ===== Pill "Сповіщення" ===== */}
          {activeTab === "reserve" && showNotifications && (
            <NotificationsScreen
              s={s}
              scale={scale}
              onBack={() => setShowNotifications(false)}
            />
          )}

          {activeTab === "reserve" && !showNotifications && (
          <>
          <View
            style={{
              paddingTop: s(80),
              paddingHorizontal: s(40),
              alignItems: "flex-end",
            }}
          >
            <TouchableOpacity
              testID="notifications-button"
              activeOpacity={0.85}
              onPress={() => setShowNotifications(true)}
              style={{
                height: s(96),
                borderRadius: s(100),
                backgroundColor: PILL_BG,
                paddingHorizontal: s(32),
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 10,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  color: TEXT_PRIMARY,
                  fontFamily: sfPro,
                  fontSize: s(40),
                  fontWeight: "500",
                }}
              >
                Сповіщення
              </Text>
              <View style={{ width: s(16) }} />
              <Image
                source={BELL_SRC}
                style={{ width: s(50), height: s(50) }}
                contentFit="contain"
              />
            </TouchableOpacity>
          </View>

          {/* ===== Картка — ФІКСОВАНА геометрія 1146×1542, radius 48 ===== */}
          <View
            style={{
              paddingTop: s(330),
              alignItems: "center",
            }}
          >
            <Pressable testID="card-flip-area" onPress={doFlip} disabled={editMode}>
              <Animated.View
                testID="reserve-id-card"
                style={[
                  {
                    width: CARD_W,
                    height: CARD_H,
                    backgroundColor: showQR ? "#FBFCFC" : CARD_BG,
                    borderColor: showQR ? "#C8C8BF" : CARD_BORDER,
                    borderWidth: s(3),
                    borderRadius: CARD_RADIUS,
                    overflow: "hidden",
                  },
                  cardAnimStyle,
                ]}
              >
                {!showQR ? (
                  <FrontSide
                    s={s}
                    scale={scale}
                    editMode={editMode}
                    draft={draft}
                    setDraft={setDraft}
                    profile={profile}
                    photo={currentPhoto}
                    onTridentPress={startEdit}
                    onPhotoPress={pickPhoto}
                    setTickerW={setTickerW}
                    tickerAnimStyle={tickerAnimStyle}
                    TICKER_UNIT={TICKER_UNIT}
                    TICKER_REPEAT={TICKER_REPEAT}
                    isRefreshing={isRefreshing}
                    onTickerPress={() => setUpdateModalVisible(true)}
                    onSavePress={saveEdit}
                    onFabPress={() => setDocSheetOpen(true)}
                  />
                ) : (
                  <BackSide
                    s={s}
                    qrValue={qrValue}
                    qrSize={qrSize}
                    qrValidLabel={qrValidLabel}
                  />
                )}
              </Animated.View>
            </Pressable>
          </View>

          {/* Заповнюючий простір */}
          <View style={{ flex: 1 }} />
          </>
          )}

          {activeTab === "services" && (
            servicesSubScreen === "edit-online" ? (
              <EditOnlineScreen
                s={s}
                scale={scale}
                onBack={() => setServicesSubScreen(null)}
              />
            ) : (
              <ServicesScreen
                s={s}
                scale={scale}
                onItemPress={(_label, idx) => {
                  if (idx === 0) setServicesSubScreen("edit-online");
                }}
              />
            )
          )}

          {activeTab === "vacancies" && (
            vacanciesSubScreen === "support" ? (
              <SupportScreen
                s={s}
                scale={scale}
                onBack={() => setVacanciesSubScreen(null)}
              />
            ) : (
              <VacanciesScreen
                s={s}
                scale={scale}
                onHelp={() => setVacanciesSubScreen("support")}
              />
            )
          )}

          {activeTab === "menu" && (
            menuSubScreen === "support" ? (
              <SupportScreen
                s={s}
                scale={scale}
                onBack={() => setMenuSubScreen(null)}
              />
            ) : menuSubScreen === "sessions" ? (
              <ActiveSessionsScreen
                s={s}
                scale={scale}
                onBack={() => setMenuSubScreen(null)}
              />
            ) : (
              <MenuScreen
                s={s}
                scale={scale}
                onSupport={() => setMenuSubScreen("support")}
                onActiveSessions={() => setMenuSubScreen("sessions")}
              />
            )
          )}

          {/* ===== Нижній таб-бар ===== */}
          <View
            style={{
              backgroundColor: TAB_BG,
              flexDirection: "row",
              paddingTop: s(43),
              paddingBottom: s(81),
              paddingHorizontal: s(40),
            }}
          >
            <TabItem
              testID="tab-reserve-id"
              iconSrc={TAB_ICON_RESERVE}
              activeIconSrc={TAB_ICON_RESERVE_ACTIVE}
              label="Резерв ID"
              s={s}
              active={activeTab === "reserve"}
              onPress={() => {
                if (activeTab === "reserve") {
                  cycleVariant();
                } else {
                  setActiveTab("reserve");
                }
              }}
              onLongPress={cycleVariant}
            />
            <TabItem
              testID="tab-services"
              iconSrc={TAB_ICON_SERVICES}
              activeIconSrc={TAB_ICON_SERVICES_ACTIVE}
              label="Сервіси"
              s={s}
              active={activeTab === "services"}
              onPress={() => setActiveTab("services")}
            />
            <TabItem
              testID="tab-vacancies"
              iconSrc={TAB_ICON_VACANCIES}
              activeIconSrc={TAB_ICON_VACANCIES_ACTIVE}
              label="Вакансії"
              s={s}
              active={activeTab === "vacancies"}
              onPress={() => setActiveTab("vacancies")}
            />
            <TabItem
              testID="tab-menu"
              iconSrc={TAB_ICON_MENU}
              activeIconSrc={TAB_ICON_MENU_ACTIVE}
              label="Меню"
              s={s}
              active={activeTab === "menu"}
              onPress={() => setActiveTab("menu")}
            />
          </View>
        </View>
      </SafeAreaView>

      {/* Bottom Sheet — дії з документом (відкривається з FAB у Резерв ID) */}
      <DocumentActionsSheet
        visible={docSheetOpen}
        s={s}
        scale={scale}
        onClose={() => setDocSheetOpen(false)}
        onView={() => setDocDetailOpen(true)}
        onDownload={() => {
          // Генеруємо та ділимося PDF-документом з даними поточного профілю
          generateAndShareMilitaryPdf({
            surname: profile.surname,
            name: profile.name,
            patronymic: profile.patronymic,
            birthDate: profile.birthDate,
            deferralUntil: profile.deferralUntil,
            photoBase64: profile.photoBase64,
          });
        }}
        onRefresh={() => setUpdateModalVisible(true)}
      />

      {/* Детальний модал документа */}
      <DocumentDetailSheet
        visible={docDetailOpen}
        s={s}
        scale={scale}
        onClose={() => setDocDetailOpen(false)}
        profile={profile}
        photoBase64={profile.photoBase64}
        tickerText={profile.customTicker || tickerStamp}
      />

      {/* Модал підтвердження оновлення документа */}
      <Modal
        visible={updateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUpdateModalVisible(false)}
      >
        <Pressable
          onPress={() => setUpdateModalVisible(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: s(60),
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation?.()}
            style={{
              width: "100%",
              backgroundColor: "#FFFFFF",
              borderRadius: s(48),
              paddingHorizontal: s(60),
              paddingTop: s(110),
              paddingBottom: s(60),
              alignItems: "center",
            }}
          >
            {/* Іконка info — сіра обводка + чорна "i" без круга (окремий шар) */}
            <View
              style={{
                width: s(160),
                height: s(160),
                borderRadius: s(80),
                borderWidth: s(5),
                borderColor: TEXT_MUTED,
                marginBottom: s(50),
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={require("../assets/images/info_i_only.png")}
                style={{ width: s(70), height: s(90) }}
                contentFit="contain"
              />
            </View>

            <Text
              style={{
                fontFamily: sfPro,
                fontSize: s(44),
                color: "#1A1A1A",
                textAlign: "center",
                lineHeight: s(60),
                marginBottom: s(70),
              }}
            >
              Поки генеруватиметься нова версія документу, деякі послуги можуть бути недоступні
            </Text>

            {/* Кнопка Оновити */}
            <TouchableOpacity
              testID="update-confirm-btn"
              activeOpacity={0.85}
              onPress={handleConfirmUpdate}
              style={{
                width: "100%",
                height: s(150),
                borderRadius: s(75),
                backgroundColor: ACCENT,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: sfPro,
                  fontSize: s(48),
                  fontWeight: "600",
                  color: "#1A1A1A",
                  textDecorationLine: "underline",
                }}
              >
                Оновити
              </Text>
            </TouchableOpacity>

            {/* Кнопка Скасувати */}
            <TouchableOpacity
              testID="update-cancel-btn"
              activeOpacity={0.7}
              onPress={() => setUpdateModalVisible(false)}
              style={{
                paddingVertical: s(56),
                paddingHorizontal: s(24),
              }}
            >
              <Text
                style={{
                  fontFamily: sfPro,
                  fontSize: s(46),
                  fontWeight: "500",
                  color: "#1A1A1A",
                  textDecorationLine: "underline",
                }}
              >
                Скасувати
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ============================================================
//                       ЛИЦЬОВА СТОРОНА
// ============================================================
type FrontProps = {
  s: (v: number) => number;
  scale: number;
  editMode: boolean;
  draft: Profile;
  setDraft: React.Dispatch<React.SetStateAction<Profile>>;
  profile: Profile;
  photo: string | null;
  onTridentPress: () => void;
  onPhotoPress: () => void;
  setTickerW: (n: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tickerAnimStyle: any;
  TICKER_UNIT: string;
  TICKER_REPEAT: number;
  isRefreshing: boolean;
  onTickerPress: () => void;
  onSavePress: () => void;
  onFabPress: () => void;
};

function FrontSide(props: FrontProps) {
  const {
    s, scale, editMode, draft, setDraft, profile, photo,
    onTridentPress, onPhotoPress,
    setTickerW, tickerAnimStyle, TICKER_UNIT, TICKER_REPEAT, isRefreshing, onTickerPress, onSavePress, onFabPress,
  } = props;

  const view = editMode ? draft : profile;

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: s(60),
          paddingTop: s(72),
        }}
      >
        <Text
          style={{
            fontFamily: FONT_INTER_SB,
            fontSize: s(64),
            color: TEXT_PRIMARY,
            letterSpacing: 1.92 * scale,
            fontWeight: "600",
          }}
        >
          Резерв ID
        </Text>
        <TouchableOpacity
          testID="trident-edit-button"
          activeOpacity={0.7}
          onPress={onTridentPress}
          disabled={editMode}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{
            shadowColor: editMode ? ACCENT : "transparent",
            shadowOpacity: editMode ? 0.9 : 0,
            shadowRadius: editMode ? s(10) : 0,
            shadowOffset: { width: 0, height: 0 },
          }}
        >
          <Image
            source={TRIDENT_SRC}
            style={{ width: s(120), height: s(150) }}
            contentFit="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Body: photo + info  АБО  full-width info (варіант без фото) */}
      {view.noPhoto ? (
        <View style={{ paddingHorizontal: s(60), paddingTop: s(50) }}>
          <Text style={labelStyleBig(s)}>Дата народження:</Text>
          {editMode ? (
            <TextInput
              testID="input-birthDate"
              value={draft.birthDate}
              onChangeText={(t) => setDraft((d) => ({ ...d, birthDate: formatDateInput(t) }))}
              keyboardType="number-pad"
              placeholder="ДД.ММ.РРРР"
              placeholderTextColor="#aaa"
              style={inputStyleBig(s)}
            />
          ) : (
            <Text style={valueStyleBig(s)}>{view.birthDate}</Text>
          )}
          <View style={{ height: s(60) }} />
          <Text style={labelStyleBig(s)}>Відстрочка до:</Text>
          {editMode ? (
            <TextInput
              testID="input-deferralUntil"
              value={draft.deferralUntil}
              onChangeText={(t) => setDraft((d) => ({ ...d, deferralUntil: t }))}
              placeholder="завершення мобілізації"
              placeholderTextColor="#aaa"
              style={inputStyleBig(s)}
            />
          ) : (
            <Text style={valueStyleBig(s)}>{view.deferralUntil}</Text>
          )}
        </View>
      ) : (
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: s(60),
            paddingTop: s(50),
            gap: s(40),
          }}
        >
        <TouchableOpacity
          testID="photo-area"
          activeOpacity={editMode ? 0.6 : 1}
          onPress={onPhotoPress}
          disabled={!editMode}
          style={{
            width: s(468),
            height: s(624),
            backgroundColor: "#FFFFFF",
            borderRadius: s(24),
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {photo ? (
            <Image
              source={{ uri: photo }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          ) : (
            editMode ? (
              <Text style={{ color: "#999", fontSize: s(34), textAlign: "center", padding: s(20) }}>
                Натисніть, щоб обрати фото
              </Text>
            ) : (
              <Image
                source={TEST_PHOTO_SRC}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            )
          )}
          {editMode && photo && (
            <View
              style={{
                position: "absolute",
                left: 0, right: 0, top: 0, bottom: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: s(36), fontWeight: "500" }}>Змінити</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={{ flex: 1, paddingTop: s(20) }}>
          <Text style={labelStyle(s)}>Дата народження:</Text>
          {editMode ? (
            <TextInput
              testID="input-birthDate"
              value={draft.birthDate}
              onChangeText={(t) => setDraft((d) => ({ ...d, birthDate: formatDateInput(t) }))}
              keyboardType="number-pad"
              placeholder="ДД.ММ.РРРР"
              placeholderTextColor="#aaa"
              style={inputStyle(s)}
            />
          ) : (
            <Text style={valueStyle(s)}>{view.birthDate}</Text>
          )}
          <View style={{ height: s(60) }} />
          <Text style={labelStyle(s)}>Відстрочка до:</Text>
          {editMode ? (
            <TextInput
              testID="input-deferralUntil"
              value={draft.deferralUntil}
              onChangeText={(t) => setDraft((d) => ({ ...d, deferralUntil: formatDateInput(t) }))}
              keyboardType="number-pad"
              placeholder="ДД.ММ.РРРР"
              placeholderTextColor="#aaa"
              style={inputStyle(s)}
            />
          ) : (
            <Text style={valueStyle(s)}>{view.deferralUntil}</Text>
          )}
        </View>
      </View>
      )}

      {/* Ticker editor (edit mode) */}
      {editMode && (
        <View style={{ paddingHorizontal: s(60), paddingTop: s(30) }}>
          <Text style={{ fontSize: s(30), color: TEXT_MUTED, marginBottom: s(4) }}>
            Текст стрічки (порожньо = авто з часом)
          </Text>
          <TextInput
            testID="input-ticker"
            value={draft.customTicker}
            onChangeText={(t) => setDraft((d) => ({ ...d, customTicker: t }))}
            placeholder="Свій текст стрічки..."
            placeholderTextColor="#aaa"
            style={inputStyle(s)}
          />
        </View>
      )}

      {/* Ticker strip - ABSOLUTE position */}
      <Pressable
        onPress={onTickerPress}
        style={{
          position: "absolute",
          left: 0, right: 0,
          top: view.noPhoto ? s(980) : s(1031),
          height: s(72),
          backgroundColor: isRefreshing ? "#F9D85D" : STRIP_BG,
          overflow: "hidden",
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={[
            { flexDirection: "row", flexWrap: "nowrap", flexShrink: 0 },
            Platform.OS === "web" ? ({ width: "max-content" } as any) : {},
            tickerAnimStyle,
          ]}
        >
          <View
            onLayout={(e) => setTickerW(e.nativeEvent.layout.width)}
            style={[
              { flexDirection: "row", flexWrap: "nowrap", flexShrink: 0 },
              Platform.OS === "web" ? ({ width: "max-content" } as any) : {},
            ]}
          >
            {Array.from({ length: TICKER_REPEAT }).map((_, i) => (
              <Text key={`a-${i}`} style={tickerStyle(s, isRefreshing)}>
                {TICKER_UNIT}
              </Text>
            ))}
          </View>
          <View
            style={[
              { flexDirection: "row", flexWrap: "nowrap", flexShrink: 0 },
              Platform.OS === "web" ? ({ width: "max-content" } as any) : {},
            ]}
          >
            {Array.from({ length: TICKER_REPEAT }).map((_, i) => (
              <Text key={`b-${i}`} style={tickerStyle(s, isRefreshing)}>
                {TICKER_UNIT}
              </Text>
            ))}
          </View>
        </Animated.View>
      </Pressable>

      {/* Bottom: ПІБ + FAB / Save - ABSOLUTE */}
      <View
        style={{
          position: "absolute",
          left: s(50),
          right: s(50),
          bottom: s(50),
          flexDirection: "row",
          alignItems: "flex-end",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={statusStyle(s, scale)}>Військовозобов&apos;язаний</Text>
          {editMode ? (
            <>
              <TextInput
                testID="input-surname"
                value={draft.surname}
                onChangeText={(t) => setDraft((d) => ({ ...d, surname: t.toUpperCase() }))}
                style={surnameInput(s, scale)}
                autoCapitalize="characters"
              />
              <TextInput
                testID="input-name"
                value={draft.name}
                onChangeText={(t) => setDraft((d) => ({ ...d, name: t.toUpperCase() }))}
                style={surnameInput(s, scale)}
                autoCapitalize="characters"
              />
              <TextInput
                testID="input-patronymic"
                value={draft.patronymic}
                onChangeText={(t) => setDraft((d) => ({ ...d, patronymic: t }))}
                style={surnameInput(s, scale)}
              />
            </>
          ) : (
            <>
              <Text
                style={surnameStyle(s, scale, view.noPhoto)}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {view.surname}
              </Text>
              <Text
                style={surnameStyle(s, scale, view.noPhoto)}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {view.name}
              </Text>
              <Text
                style={surnameStyle(s, scale, view.noPhoto)}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {view.patronymic}
              </Text>
            </>
          )}
        </View>

        {editMode ? (
          <TouchableOpacity
            testID="save-button"
            activeOpacity={0.85}
            onPress={onSavePress}
            style={{
              width: s(180),
              height: s(180),
              backgroundColor: ACCENT,
              borderRadius: s(90),
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: s(40), fontWeight: "700" }}>OK</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            testID="fab-open-doc-actions"
            activeOpacity={0.85}
            onPress={onFabPress}
            style={{ width: s(180), height: s(180) }}
          >
            <Image source={FAB_SRC} style={{ width: "100%", height: "100%" }} contentFit="contain" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ============================================================
//                       ЗВОРОТ — QR (центровано в карті)
// ============================================================
type BackProps = {
  s: (v: number) => number;
  qrValue: string;
  qrSize: number;
  qrValidLabel: string;
};

function BackSide({ s, qrValue, qrSize, qrValidLabel }: BackProps) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: s(60),
      }}
    >
      <Text
        style={{
          fontFamily: sfPro,
          fontSize: s(46),
          fontWeight: "600",
          color: TEXT_PRIMARY,
          textAlign: "center",
          marginBottom: s(72),
          letterSpacing: 1.84 * s(1),
        }}
      >
        {qrValidLabel}
      </Text>
      <View
        style={{
          padding: s(24),
          backgroundColor: "#fff",
          borderRadius: s(16),
        }}
      >
        <QRCode value={qrValue} size={qrSize} backgroundColor="#fff" color="#000" />
      </View>
    </View>
  );
}

// ---- Стилі тексту ----
function labelStyle(s: (v: number) => number) {
  return {
    fontFamily: sfPro,
    fontSize: s(38),
    color: TEXT_MUTED,
    letterSpacing: s(38) * 0.02,
  };
}
// Великі стилі для варіанту без фото (як на скріншоті)
function labelStyleBig(s: (v: number) => number) {
  return {
    fontFamily: sfPro,
    fontSize: s(58),
    fontWeight: "500" as const,
    color: TEXT_MUTED,
    letterSpacing: s(58) * 0.015,
  };
}
function valueStyleBig(s: (v: number) => number) {
  return {
    fontFamily: sfPro,
    fontSize: s(90),
    fontWeight: "700" as const,
    color: TEXT_PRIMARY,
    letterSpacing: s(90) * 0.01,
    marginTop: s(14),
    lineHeight: s(110),
  };
}
function inputStyleBig(s: (v: number) => number) {
  return {
    fontFamily: sfPro,
    fontSize: s(80),
    fontWeight: "700" as const,
    color: TEXT_PRIMARY,
    paddingVertical: s(6),
    borderBottomWidth: s(3),
    borderBottomColor: ACCENT,
    marginTop: s(10),
  };
}
function valueStyle(s: (v: number) => number) {
  return {
    fontFamily: sfPro,
    fontSize: s(52),
    fontWeight: "700" as const,
    color: TEXT_PRIMARY,
    letterSpacing: s(52) * 0.02,
    marginTop: s(8),
  };
}
function inputStyle(s: (v: number) => number) {
  return {
    fontFamily: sfPro,
    fontSize: s(48),
    fontWeight: "600" as const,
    color: TEXT_PRIMARY,
    paddingVertical: s(6),
    borderBottomWidth: s(3),
    borderBottomColor: ACCENT,
    marginTop: s(6),
  };
}
function surnameInput(s: (v: number) => number, scale: number) {
  return {
    fontFamily: sfPro,
    fontSize: s(58),
    fontWeight: "600" as const,
    color: TEXT_PRIMARY,
    paddingVertical: s(4),
    borderBottomWidth: s(3),
    borderBottomColor: ACCENT,
    letterSpacing: 3.96 * scale,
    marginBottom: s(6),
  };
}
function tickerStyle(s: (v: number) => number, isRefreshing: boolean = false) {
  return {
    color: isRefreshing ? "#1A1A1A" : "#FFFFFF",
    fontFamily: sfPro,
    fontSize: s(44),
    fontWeight: "500" as const,
    letterSpacing: s(44) * 0.02,
    paddingHorizontal: s(20),
    flexShrink: 0,
    ...(Platform.OS === "web"
      ? ({
          whiteSpace: "nowrap",
          textOverflow: "clip",
          overflow: "visible",
        } as any)
      : {}),
  };
}
function statusStyle(s: (v: number) => number, scale: number) {
  return {
    fontFamily: sfPro,
    fontSize: s(48),
    fontWeight: "600" as const,
    color: TEXT_MUTED,
    letterSpacing: 0.96 * scale,
    marginBottom: s(14),
  };
}
function surnameStyle(s: (v: number) => number, scale: number, big?: boolean) {
  const sz = big ? 56 : 66;
  return {
    fontFamily: sfPro,
    fontSize: s(sz),
    fontWeight: "700" as const,
    color: TEXT_PRIMARY,
    letterSpacing: (big ? 0 : 3.96) * scale,
    lineHeight: s(sz * 1.1),
  };
}

// ---- Таб ----
type TabItemProps = {
  testID: string;
  iconSrc: number;
  activeIconSrc?: number;
  label: string;
  active?: boolean;
  s: (v: number) => number;
  onLongPress?: () => void;
  onPress?: () => void;
};
function TabItem({ testID, iconSrc, activeIconSrc, label, active, s, onLongPress, onPress }: TabItemProps) {
  const icon = active && activeIconSrc ? activeIconSrc : iconSrc;
  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      style={{ flex: 1, alignItems: "center", justifyContent: "flex-start" }}
    >
      <Image
        source={icon}
        style={{ width: s(96), height: s(96) }}
        contentFit="contain"
      />
      <Text
        style={{
          marginTop: s(16),
          fontFamily: active ? "Inter_900Black" : "Inter_600SemiBold",
          fontSize: s(36),
          fontWeight: active ? "900" : "600",
          color: TEXT_PRIMARY,
          letterSpacing: 1.44 * (s(1)),
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, alignItems: "center" },
  safe: { flex: 1, backgroundColor: BG, width: "100%", alignItems: "center" },
  screen: { flex: 1, alignSelf: "center" },
});
