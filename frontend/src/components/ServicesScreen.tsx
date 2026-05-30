import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { Image } from "expo-image";

const CHEVRON_SRC = require("../../assets/images/chevron_right.png");

const TEXT_PRIMARY = "#000000";
const DIVIDER = "#B7B59C";

const FONT_INTER_SB = "Inter_600SemiBold";
const sfPro = Platform.select({ ios: undefined, default: FONT_INTER_SB });

const SERVICES = [
  "Виправити дані онлайн",
  "Електронна черга в ТЦК та СП",
  "Запит на відстрочку",
  "Направлення на ВЛК",
  "Розширені дані з реєстру",
  "Стати на облік",
  "Уточнити контактні дані",
  "Штрафи",
];

type Props = {
  s: (v: number) => number;
  scale: number;
  onItemPress?: (title: string, index: number) => void;
};

export default function ServicesScreen({ s, scale, onItemPress }: Props) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: s(40) }}
      showsVerticalScrollIndicator={false}
    >
      {/* Заголовок "Сервіси" — SF Pro 96px, weight 510, letter-spacing 2.88 */}
      <View style={{ paddingTop: s(242), paddingHorizontal: s(60) }}>
        <Text
          testID="services-title"
          style={{
            fontFamily: sfPro,
            fontSize: s(96),
            fontWeight: "500",
            color: TEXT_PRIMARY,
            letterSpacing: 2.88 * scale,
            lineHeight: s(96) * 1.05,
          }}
        >
          Сервіси
        </Text>
      </View>

      {/* Список сервісів */}
      <View style={{ paddingTop: s(154), paddingHorizontal: s(60) }}>
        {SERVICES.map((label, idx) => {
          const isLast = idx === SERVICES.length - 1;
          return (
            <View key={label}>
              <TouchableOpacity
                testID={`service-item-${idx}`}
                activeOpacity={0.6}
                onPress={() => onItemPress?.(label, idx)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: s(8),
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    fontFamily: FONT_INTER_SB,
                    fontSize: s(52),
                    fontWeight: "600",
                    color: TEXT_PRIMARY,
                    letterSpacing: 1.56 * scale,
                    lineHeight: s(52) * 1.2,
                  }}
                  numberOfLines={2}
                >
                  {label}
                </Text>
                <Image
                  source={CHEVRON_SRC}
                  style={{ width: s(60), height: s(60), marginLeft: s(24) }}
                  contentFit="contain"
                />
              </TouchableOpacity>

              {!isLast && (
                <>
                  <View style={{ height: s(66) }} />
                  <View
                    style={{
                      height: 1,
                      backgroundColor: DIVIDER,
                      opacity: 0.55,
                    }}
                  />
                  <View style={{ height: s(60) }} />
                </>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
