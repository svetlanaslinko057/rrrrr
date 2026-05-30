import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";

const TRIDENT_SRC = require("../../assets/images/trident.png");
const TEST_PHOTO_SRC = require("../../assets/images/test_photo.png");

const BG = "#E0DFCA";
const SHEET_BG = "#FFFFFF";
const CARD_DIVIDER = "#E5E4D2";
const STRIP_BG = "#6B5421";
const STRIP_TEXT = "#FFFFFF";
const TEXT_PRIMARY = "#000000";
const HANDLE_COLOR = "#000000";
const BACKDROP = "rgba(0,0,0,0.6)";
const GREEN_OK = "#1F8A3F";

const FONT_INTER_M = "Inter_500Medium";
const FONT_INTER_SB = "Inter_600SemiBold";
const sfPro = Platform.select({ ios: undefined, default: FONT_INTER_M });

import type { UserProfile } from "@/src/utils/profile";

type Props = {
  visible: boolean;
  s: (v: number) => number;
  scale: number;
  onClose: () => void;
  profile: UserProfile;
  photoBase64?: string | null;
  tickerText: string;
};

export default function DocumentDetailSheet({
  visible,
  s,
  scale,
  onClose,
  profile,
  photoBase64,
  tickerText,
}: Props) {
  const translateY = useSharedValue(2000);
  const opacity = useSharedValue(0);

  // Бігучий рядок — анімація як на головному екрані
  const tickerX = useSharedValue(0);
  const [tickerW, setTickerW] = useState(0);
  const TICKER_UNIT = `${tickerText}   •   `;
  const TICKER_REPEAT = 30;

  useEffect(() => {
    if (visible && tickerW > 0) {
      tickerX.value = 0;
      const duration = (tickerW / s(140)) * 1000;
      tickerX.value = withRepeat(
        withTiming(-tickerW, { duration, easing: Easing.linear }),
        -1,
        false,
      );
    } else {
      cancelAnimation(tickerX);
      tickerX.value = 0;
    }
    return () => cancelAnimation(tickerX);
  }, [visible, tickerW, tickerX, s]);

  const tickerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tickerX.value }],
  }));

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) });
      opacity.value = withTiming(1, { duration: 220 });
    } else {
      translateY.value = withTiming(2000, { duration: 240, easing: Easing.in(Easing.cubic) });
      opacity.value = withTiming(0, { duration: 180 });
    }
  }, [visible, translateY, opacity]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  // Поднимаємо лист трохи вище (≈ 3% від екрана зверху)
  const screenH = Dimensions.get("window").height;
  const TOP_GAP = Math.max(28, screenH * 0.035);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Затемнення фону */}
      <Animated.View
        style={[
          { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: BACKDROP },
          backdropStyle,
        ]}
      >
        <Pressable onPress={onClose} style={{ height: TOP_GAP }} />
      </Animated.View>

      {/* Лист — БЕЗ скруглення зверху */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: TOP_GAP,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: BG,
            overflow: "hidden",
          },
          sheetStyle,
        ]}
      >
        {/* Handle bar */}
        <View style={{ alignItems: "center", paddingTop: s(36) }}>
          <View
            style={{
              width: s(120),
              height: s(12),
              borderRadius: s(6),
              backgroundColor: HANDLE_COLOR,
            }}
          />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: s(80) }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header: "Резерв ID" + trident — як на головному екрані */}
          <View
            style={{
              paddingTop: s(80),
              paddingHorizontal: s(60),
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: sfPro,
                fontSize: s(110),
                fontWeight: "500",
                color: TEXT_PRIMARY,
                letterSpacing: 2.2 * scale,
              }}
            >
              Резерв ID
            </Text>
            <Image
              source={TRIDENT_SRC}
              style={{ width: s(150), height: s(150) }}
              contentFit="contain"
            />
          </View>

          {/* Brown ticker bar — анімований бігучий рядок */}
          <View
            style={{
              marginTop: s(50),
              height: s(80),
              backgroundColor: STRIP_BG,
              justifyContent: "center",
              overflow: "hidden",
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
                  <Text key={`a-${i}`} style={tickerStyle(s, scale)}>
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
                  <Text key={`b-${i}`} style={tickerStyle(s, scale)}>
                    {TICKER_UNIT}
                  </Text>
                ))}
              </View>
            </Animated.View>
          </View>

          {/* Card 1: ПІБ + Фото + DOB + РНОКПП */}
          <Card s={s} marginTop={s(40)}>
            <Text style={nameStyle(s, scale)}>{profile.surname}</Text>
            <Text style={nameStyle(s, scale)}>{profile.name}</Text>
            <Text style={nameStyle(s, scale)}>{capitalizeFirst(profile.patronymic)}</Text>
            <Text
              style={{
                fontFamily: FONT_INTER_M,
                fontSize: s(48),
                fontWeight: "500",
                color: TEXT_PRIMARY,
                letterSpacing: 0.96 * scale,
                marginTop: s(28),
              }}
            >
              Військовозобов&apos;язаний
            </Text>

            <View style={{ marginTop: s(56), flexDirection: "row", alignItems: "flex-start" }}>
              {/* Photo */}
              <View
                style={{
                  width: s(440),
                  height: s(550),
                  backgroundColor: "#E8E6D2",
                  borderRadius: s(8),
                  overflow: "hidden",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {photoBase64 ? (
                  <Image
                    source={{ uri: photoBase64 }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                ) : (
                  <Image
                    source={TEST_PHOTO_SRC}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                )}
              </View>

              <View style={{ width: s(40) }} />

              <View style={{ flex: 1, paddingTop: s(8) }}>
                <FieldLabel s={s} scale={scale}>Дата народження:</FieldLabel>
                <FieldValue s={s} scale={scale}>{profile.birthDate}</FieldValue>

                <View style={{ height: s(40) }} />

                <FieldLabel s={s} scale={scale}>РНОКПП:</FieldLabel>
                <FieldValue s={s} scale={scale}>{profile.rnokpp}</FieldValue>
              </View>
            </View>
          </Card>

          {/* Card 2 */}
          <Card s={s} marginTop={s(40)}>
            <FieldLabel s={s} scale={scale}>ТЦК та СП:</FieldLabel>
            <FieldValue s={s} scale={scale}>{profile.tck}</FieldValue>

            <Divider s={s} />

            <KeyValueRow s={s} scale={scale} k="Звання:" v={profile.rank} />
            <KeyValueRow s={s} scale={scale} k="ВОС:" v={profile.vos} marginTop={s(28)} />

            <View style={{ height: s(40) }} />
            <FieldLabel s={s} scale={scale}>Категорія обліку:</FieldLabel>
            <FieldValue s={s} scale={scale}>{profile.category}</FieldValue>

            <View style={{ height: s(40) }} />
            <FieldValue s={s} scale={scale}>{profile.note}</FieldValue>

            <View style={{ height: s(40) }} />
            <FieldLabel s={s} scale={scale}>Номер в реєстрі Оберіг:</FieldLabel>
            <FieldValue s={s} scale={scale}>{profile.registryNumber}</FieldValue>
          </Card>

          {/* Card 3: Контакти */}
          <Card s={s} marginTop={s(40)}>
            <FieldLabel s={s} scale={scale}>Телефон:</FieldLabel>
            <FieldValue s={s} scale={scale}>{profile.phone}</FieldValue>

            <View style={{ height: s(40) }} />
            <FieldLabel s={s} scale={scale}>Email:</FieldLabel>
            <FieldValue s={s} scale={scale}>{profile.email}</FieldValue>

            <View style={{ height: s(40) }} />
            <FieldLabel s={s} scale={scale}>Адреса проживання:</FieldLabel>
            <FieldValue s={s} scale={scale}>{profile.address}</FieldValue>
          </Card>

          {/* Card 4 */}
          <Card s={s} marginTop={s(40)}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: s(56),
                  height: s(56),
                  borderRadius: s(28),
                  backgroundColor: GREEN_OK,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="checkmark" size={s(40)} color="#FFFFFF" />
              </View>
              <View style={{ width: s(28) }} />
              <Text
                style={{
                  fontFamily: FONT_INTER_M,
                  fontSize: s(44),
                  fontWeight: "500",
                  color: TEXT_PRIMARY,
                  letterSpacing: 0.88 * scale,
                }}
              >
                Дані оновлено вчасно
              </Text>
            </View>

            <View style={{ height: s(36) }} />
            <KeyValueRow
              s={s}
              scale={scale}
              k="Дата останнього уточнення даних:"
              v={profile.dataUpdateDate}
              alignTop
            />
          </Card>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ============================================================
//                       SUB-COMPONENTS
// ============================================================
function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function Card({
  s,
  marginTop,
  children,
}: {
  s: (v: number) => number;
  marginTop?: number;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        marginTop,
        marginHorizontal: s(40),
        backgroundColor: SHEET_BG,
        borderRadius: s(48),
        paddingTop: s(56),
        paddingBottom: s(56),
        paddingHorizontal: s(56),
      }}
    >
      {children}
    </View>
  );
}

function Divider({ s }: { s: (v: number) => number }) {
  return (
    <View
      style={{
        marginTop: s(40),
        marginBottom: s(40),
        height: 1,
        backgroundColor: CARD_DIVIDER,
      }}
    />
  );
}

function FieldLabel({
  s,
  scale,
  children,
}: {
  s: (v: number) => number;
  scale: number;
  children: React.ReactNode;
}) {
  return (
    <Text
      style={{
        fontFamily: FONT_INTER_M,
        fontSize: s(44),
        fontWeight: "500",
        color: TEXT_PRIMARY,
        letterSpacing: 0.88 * scale,
        lineHeight: s(44) * 1.25,
      }}
    >
      {children}
    </Text>
  );
}

function FieldValue({
  s,
  scale,
  children,
}: {
  s: (v: number) => number;
  scale: number;
  children: React.ReactNode;
}) {
  return (
    <Text
      style={{
        fontFamily: FONT_INTER_M,
        fontSize: s(44),
        fontWeight: "500",
        color: TEXT_PRIMARY,
        letterSpacing: 0.88 * scale,
        lineHeight: s(44) * 1.32,
        marginTop: s(10),
      }}
    >
      {children}
    </Text>
  );
}

function KeyValueRow({
  s,
  scale,
  k,
  v,
  marginTop,
  alignTop,
}: {
  s: (v: number) => number;
  scale: number;
  k: string;
  v: string;
  marginTop?: number;
  alignTop?: boolean;
}) {
  return (
    <View
      style={{
        marginTop,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: alignTop ? "flex-start" : "center",
      }}
    >
      <Text
        style={{
          fontFamily: FONT_INTER_M,
          fontSize: s(44),
          fontWeight: "500",
          color: TEXT_PRIMARY,
          letterSpacing: 0.88 * scale,
          flex: 1,
          lineHeight: s(44) * 1.25,
        }}
      >
        {k}
      </Text>
      <Text
        style={{
          fontFamily: FONT_INTER_M,
          fontSize: s(44),
          fontWeight: "500",
          color: TEXT_PRIMARY,
          letterSpacing: 0.88 * scale,
          marginLeft: s(20),
        }}
      >
        {v}
      </Text>
    </View>
  );
}

function nameStyle(s: (v: number) => number, scale: number) {
  return {
    // SemiBold (не Bold!), як на скріншоті
    fontFamily: FONT_INTER_SB,
    fontSize: s(96),
    fontWeight: "600" as const,
    color: TEXT_PRIMARY,
    letterSpacing: 1.92 * scale,
    lineHeight: s(96) * 1.08,
  };
}

function tickerStyle(s: (v: number) => number, scale: number) {
  return {
    fontFamily: FONT_INTER_M,
    fontSize: s(36),
    fontWeight: "500" as const,
    color: STRIP_TEXT,
    letterSpacing: 0.72 * scale,
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
