import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TEXT_PRIMARY = "#000000";
const TEXT_MUTED = "#7E7C68";
const CARD_BG = "#FFFFFF";
const BACK_BTN_BG = "#EDECD7";
const DIVIDER = "#D5D3BE";

const FONT_INTER_M = "Inter_500Medium";
const FONT_INTER_SB = "Inter_600SemiBold";
const FONT_INTER_B = "Inter_700Bold";
const sfPro = Platform.select({ ios: undefined, default: FONT_INTER_SB });

type Notification = {
  id: string;
  title: string;
  body: string;
  dateText: string; // "30.05.2026 о 01:21"
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "Отримали дані з реєстру",
    body: "Резерв ID з QR-кодом уже на головному екрані",
    dateText: "30.05.2026 о 01:21",
  },
  {
    id: "n2",
    title: "Надсилаємо запит до реєстру",
    body: "Ви отримаєте сповіщення про результат",
    dateText: "30.05.2026 о 01:19",
  },
  {
    id: "n3",
    title: "Отримали дані з реєстру",
    body: "Резерв ID з QR-кодом уже на головному екрані",
    dateText: "29.05.2026 о 22:37",
  },
  {
    id: "n4",
    title: "Надсилаємо запит до реєстру",
    body: "Ви отримаєте сповіщення про результат",
    dateText: "29.05.2026 о 22:35",
  },
];

type Props = {
  s: (v: number) => number;
  scale: number;
  onBack: () => void;
};

export default function NotificationsScreen({ s, scale, onBack }: Props) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: s(100) }}
      showsVerticalScrollIndicator={false}
    >
      {/* Кнопка "назад" */}
      <View style={{ paddingTop: s(70), paddingHorizontal: s(60) }}>
        <TouchableOpacity
          testID="notifications-back"
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

      {/* Заголовок */}
      <View style={{ paddingTop: s(40), paddingHorizontal: s(60) }}>
        <Text
          testID="notifications-title"
          style={{
            fontFamily: sfPro,
            fontSize: s(120),
            fontWeight: "700",
            color: TEXT_PRIMARY,
            letterSpacing: 2.4 * scale,
            lineHeight: s(120) * 1.05,
          }}
        >
          Сповіщення
        </Text>
      </View>

      {/* Список карток */}
      <View style={{ marginTop: s(80), paddingHorizontal: s(60) }}>
        {MOCK_NOTIFICATIONS.map((n, idx) => (
          <View
            key={n.id}
            testID={`notification-card-${n.id}`}
            style={{
              backgroundColor: CARD_BG,
              borderRadius: s(48),
              paddingTop: s(56),
              paddingBottom: s(40),
              paddingHorizontal: s(60),
              marginTop: idx === 0 ? 0 : s(60),
            }}
          >
            {/* Title — жирний */}
            <Text
              style={{
                fontFamily: FONT_INTER_B,
                fontSize: s(56),
                fontWeight: "700",
                color: TEXT_PRIMARY,
                letterSpacing: 1.12 * scale,
                lineHeight: s(56) * 1.18,
              }}
            >
              {n.title}
            </Text>

            {/* Body — medium */}
            <Text
              style={{
                fontFamily: FONT_INTER_M,
                fontSize: s(48),
                fontWeight: "500",
                color: TEXT_PRIMARY,
                letterSpacing: 0.96 * scale,
                lineHeight: s(48) * 1.3,
                marginTop: s(28),
              }}
            >
              {n.body}
            </Text>

            {/* Divider */}
            <View
              style={{
                marginTop: s(40),
                marginBottom: s(40),
                height: 1,
                backgroundColor: DIVIDER,
              }}
            />

            {/* Дата і час — muted */}
            <Text
              style={{
                fontFamily: FONT_INTER_M,
                fontSize: s(44),
                fontWeight: "500",
                color: TEXT_MUTED,
                letterSpacing: 0.44 * scale,
              }}
            >
              {n.dateText}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
