import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

const HELP_ICON = require("../../assets/images/help_icon.png");

const TEXT_PRIMARY = "#000000";
const BTN_ORANGE = "#FC8809";

const FONT_INTER_M = "Inter_500Medium";
const FONT_INTER_SB = "Inter_600SemiBold";
const sfPro = Platform.select({ ios: undefined, default: FONT_INTER_SB });

type Props = {
  s: (v: number) => number;
  scale: number;
  onStart?: () => void;
  onHelp?: () => void;
};

export default function VacanciesScreen({ s, scale, onStart, onHelp }: Props) {
  const [hide, setHide] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: s(40) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header row: title left, "?" icon right */}
        <View
          style={{
            paddingTop: s(160),
            paddingHorizontal: s(70),
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Text
            testID="vacancies-title"
            style={{
              // SF Pro Medium 510, 96px, letter-spacing 2.88px
              fontFamily: Platform.select({ ios: undefined, default: FONT_INTER_M }),
              fontSize: s(96),
              fontWeight: "500",
              color: TEXT_PRIMARY,
              letterSpacing: 2.88 * scale,
              lineHeight: s(96) * 1.05,
              flex: 1,
            }}
          >
            Вакансії
          </Text>
          <TouchableOpacity
            testID="vacancies-help"
            activeOpacity={0.7}
            onPress={onHelp}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              marginTop: s(10),
            }}
          >
            <Image
              source={HELP_ICON}
              style={{ width: s(110), height: s(110) }}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Body text — 2 параграфи (завжди видимі) */}
        <View style={{ paddingTop: s(120), paddingHorizontal: s(70) }}>
          <Text testID="vacancies-body-1" style={bodyStyle(s, scale)}>
            Тут знаходяться актуальні посади для служби в українському війську,
            надані у співпраці з платформою Lobby X.
          </Text>
          <View style={{ height: s(56) }} />
          <Text testID="vacancies-body-2" style={bodyStyle(s, scale)}>
            Це найбільший перелік пропозицій, який допоможе знайти ту, що
            підходить саме вам. Обирайте варіанти, подавайте заявки у кілька
            кліків і очікуйте відповіді від бригади.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom: checkbox + "Почати" button (pinned) */}
      <View
        style={{
          paddingHorizontal: s(70),
          paddingBottom: s(72),
        }}
      >
        <TouchableOpacity
          testID="vacancies-hide-toggle"
          activeOpacity={0.7}
          onPress={() => setHide((v) => !v)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: s(20),
            marginBottom: s(40),
          }}
        >
          <View
            style={{
              width: s(80),
              height: s(80),
              borderRadius: s(14),
              borderWidth: s(4),
              borderColor: hide ? BTN_ORANGE : TEXT_PRIMARY,
              backgroundColor: hide ? BTN_ORANGE : "transparent",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {hide && (
              <Ionicons name="checkmark" size={s(60)} color={TEXT_PRIMARY} />
            )}
          </View>
          <View style={{ width: s(28) }} />
          <Text
            style={{
              // SF Pro Medium 510, 48px, letter-spacing 1.92px
              fontFamily: FONT_INTER_M,
              fontSize: s(48),
              fontWeight: "500",
              color: TEXT_PRIMARY,
              letterSpacing: 1.92 * scale,
            }}
          >
            Більше не показувати
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="vacancies-start-btn"
          activeOpacity={0.85}
          onPress={onStart}
          style={{
            // height: 192px design, border-radius: 100px (як коло-pill)
            height: s(192),
            borderRadius: s(100),
            backgroundColor: BTN_ORANGE,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              // SF Pro Medium 510, 54px, letter-spacing 2.16px
              fontFamily: FONT_INTER_M,
              fontSize: s(54),
              fontWeight: "500",
              color: TEXT_PRIMARY,
              letterSpacing: 2.16 * scale,
            }}
          >
            Почати
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function bodyStyle(s: (v: number) => number, scale: number) {
  return {
    // SF Pro 590, 52px, letter-spacing 3.12px, color #000
    fontFamily: FONT_INTER_SB,
    fontSize: s(52),
    fontWeight: "600" as const,
    color: TEXT_PRIMARY,
    letterSpacing: 3.12 * scale,
    lineHeight: s(52) * 1.35,
  };
}
