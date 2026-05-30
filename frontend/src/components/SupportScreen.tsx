import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TEXT_PRIMARY = "#000000";
const DIVIDER = "#C0BEA8";
const CARD_BG = "#FFFFFF";
const BACK_BTN_BG = "#EDECD7";
const VIBER_PURPLE = "#7360F2";

const FONT_INTER_M = "Inter_500Medium";
const FONT_INTER_SB = "Inter_600SemiBold";
const FONT_INTER_B = "Inter_700Bold";
const sfPro = Platform.select({ ios: undefined, default: FONT_INTER_SB });

type Props = {
  s: (v: number) => number;
  scale: number;
  onBack: () => void;
  onViberPress?: () => void;
  onCopyDeviceId?: () => void;
};

export default function SupportScreen({ s, scale, onBack, onViberPress, onCopyDeviceId }: Props) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: s(80) }}
      showsVerticalScrollIndicator={false}
    >
      {/* Кнопка "назад" — кругла світла (як в EditOnlineScreen) */}
      <View style={{ paddingTop: s(70), paddingHorizontal: s(60) }}>
        <TouchableOpacity
          testID="support-back"
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

      {/* Заголовок — великий жирний (як на скріншоті) */}
      <View style={{ paddingTop: s(40), paddingHorizontal: s(60) }}>
        <Text
          testID="support-title"
          style={{
            fontFamily: sfPro,
            fontSize: s(120),
            fontWeight: "700",
            color: TEXT_PRIMARY,
            letterSpacing: 2.4 * scale,
            lineHeight: s(120) * 1.05,
          }}
        >
          Служба{"\n"}підтримки
        </Text>
      </View>

      {/* Опис */}
      <View style={{ paddingTop: s(50), paddingHorizontal: s(60) }}>
        <Text
          style={{
            fontFamily: FONT_INTER_SB,
            fontSize: s(52),
            fontWeight: "600",
            color: TEXT_PRIMARY,
            letterSpacing: 0.52 * scale,
            lineHeight: s(52) * 1.3,
          }}
        >
          Маєте додаткові питання про послуги або виникла проблема із застосунком?
          Чатбот підкаже, що робити.
        </Text>
      </View>

      {/* Біла карта-кнопка з Viber */}
      <View
        style={{
          marginTop: s(110),
          marginHorizontal: s(60),
          backgroundColor: CARD_BG,
          borderRadius: s(48),
          overflow: "hidden",
        }}
      >
        <TouchableOpacity
          testID="support-viber-btn"
          activeOpacity={0.7}
          onPress={onViberPress}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: s(56),
            paddingHorizontal: s(60),
          }}
        >
          {/* Viber-іконка (фіолетове коло з phone-icon всередині) */}
          <View
            style={{
              width: s(140),
              height: s(140),
              borderRadius: s(40),
              backgroundColor: VIBER_PURPLE,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="call" size={s(72)} color="#FFFFFF" />
          </View>
          <View style={{ width: s(40) }} />
          <Text
            style={{
              fontFamily: FONT_INTER_B,
              fontSize: s(64),
              fontWeight: "700",
              color: TEXT_PRIMARY,
              letterSpacing: 1.28 * scale,
            }}
          >
            Viber
          </Text>
        </TouchableOpacity>
      </View>

      {/* "Копіювати номер пристрою" */}
      <View
        style={{
          marginTop: s(60),
          marginHorizontal: s(60),
          paddingTop: s(40),
          borderTopWidth: 1,
          borderTopColor: DIVIDER,
        }}
      >
        <TouchableOpacity
          testID="support-copy-device-id"
          activeOpacity={0.6}
          onPress={onCopyDeviceId}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: s(36),
          }}
        >
          <Ionicons name="copy-outline" size={s(72)} color={TEXT_PRIMARY} />
          <View style={{ width: s(32) }} />
          <Text
            style={{
              fontFamily: FONT_INTER_M,
              fontSize: s(52),
              fontWeight: "500",
              color: TEXT_PRIMARY,
              letterSpacing: 1.04 * scale,
            }}
          >
            Копіювати номер пристрою
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
