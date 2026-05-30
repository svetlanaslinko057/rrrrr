import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

const CHEVRON_SRC = require("../../assets/images/chevron_right.png");

const TEXT_PRIMARY = "#000000";
const TEXT_MUTED = "#7E7C68";
const CARD_BG = "#FFFFFF";
const BACK_BTN_BG = "#EDECD7";
const GREEN_DOT = "#1F8A3F";

const FONT_INTER_M = "Inter_500Medium";
const FONT_INTER_SB = "Inter_600SemiBold";
const sfPro = Platform.select({ ios: undefined, default: FONT_INTER_M });

type Session = {
  id: string;
  isCurrent: boolean;
  device: string;
  connectedAt: string;
  lastActivity: string;
};

const MOCK_SESSIONS: Session[] = [
  {
    id: "current",
    isCurrent: true,
    device: "iOS 26.4.2",
    connectedAt: "21.05.26, 14:14",
    lastActivity: "сьогодні, 12:48",
  },
];

type Props = {
  s: (v: number) => number;
  scale: number;
  onBack: () => void;
  onSessionPress?: (session: Session) => void;
};

export default function ActiveSessionsScreen({ s, scale, onBack, onSessionPress }: Props) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: s(80) }}
      showsVerticalScrollIndicator={false}
    >
      {/* Кнопка "назад" */}
      <View style={{ paddingTop: s(70), paddingHorizontal: s(60) }}>
        <TouchableOpacity
          testID="sessions-back"
          activeOpacity={0.7}
          onPress={onBack}
          style={{
            width: s(140),
            height: s(140),
            borderRadius: s(70),
            backgroundColor: BACK_BTN_BG,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="arrow-back" size={s(72)} color={TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* Заголовок — Inter Medium (не bold), як "Меню" */}
      <View style={{ paddingTop: s(40), paddingHorizontal: s(60) }}>
        <Text
          testID="sessions-title"
          style={{
            fontFamily: sfPro,
            fontSize: s(110),
            fontWeight: "500",
            color: TEXT_PRIMARY,
            letterSpacing: 3.3 * scale,
            lineHeight: s(110) * 1.05,
          }}
        >
          Активні сесії
        </Text>
      </View>

      {/* Картка сесії */}
      <View style={{ marginTop: s(80), paddingHorizontal: s(60) }}>
        {MOCK_SESSIONS.map((session) => (
          <TouchableOpacity
            key={session.id}
            testID={`session-card-${session.id}`}
            activeOpacity={0.7}
            onPress={() => onSessionPress?.(session)}
            style={{
              backgroundColor: CARD_BG,
              borderRadius: s(48),
              paddingTop: s(50),
              paddingBottom: s(56),
              paddingLeft: s(56),
              paddingRight: s(50),
              flexDirection: "row",
              alignItems: "stretch",
            }}
          >
            <View style={{ flex: 1 }}>
              {/* Поточна сесія + зелена крапка */}
              {session.isCurrent && (
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: s(28) }}>
                  <View
                    style={{
                      width: s(36),
                      height: s(36),
                      borderRadius: s(18),
                      backgroundColor: GREEN_DOT,
                    }}
                  />
                  <View style={{ width: s(22) }} />
                  <Text
                    style={{
                      fontFamily: FONT_INTER_M,
                      fontSize: s(48),
                      fontWeight: "500",
                      color: TEXT_PRIMARY,
                      letterSpacing: 0.96 * scale,
                    }}
                  >
                    Поточна сесія
                  </Text>
                </View>
              )}

              {/* Версія iOS — НЕ bold, Inter SemiBold */}
              <Text
                testID={`session-device-${session.id}`}
                style={{
                  fontFamily: FONT_INTER_SB,
                  fontSize: s(72),
                  fontWeight: "600",
                  color: TEXT_PRIMARY,
                  letterSpacing: 1.44 * scale,
                  marginBottom: s(24),
                }}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {session.device}
              </Text>

              {/* Дата підключення */}
              <Text
                style={{
                  fontFamily: FONT_INTER_M,
                  fontSize: s(44),
                  fontWeight: "500",
                  color: TEXT_MUTED,
                  letterSpacing: 0.44 * scale,
                  lineHeight: s(44) * 1.25,
                }}
              >
                Дата підключення: {session.connectedAt}
              </Text>

              {/* Остання активність */}
              <Text
                style={{
                  fontFamily: FONT_INTER_M,
                  fontSize: s(44),
                  fontWeight: "500",
                  color: TEXT_MUTED,
                  letterSpacing: 0.44 * scale,
                  lineHeight: s(44) * 1.25,
                  marginTop: s(8),
                }}
              >
                Остання активність: {session.lastActivity}
              </Text>
            </View>

            {/* Шеврон — точно напроти "Дата підключення".
                Card layout: paddingTop 50 + "Поточна сесія" row (~70) + marginBottom 28
                + iOS row (~85) + marginBottom 24 = ~257 до початку "Дата підключення".
                Шеврон висотою 56 → вирівнюємо центр на ~280 від верху картки.
                Реалізуємо через justifyContent: "flex-end" + paddingBottom від картки */}
            <View
              style={{
                justifyContent: "flex-end",
                paddingBottom: s(60),
                marginLeft: s(20),
              }}
            >
              <Image
                source={CHEVRON_SRC}
                style={{ width: s(56), height: s(56) }}
                contentFit="contain"
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
