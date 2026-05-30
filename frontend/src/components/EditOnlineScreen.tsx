import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

const CHEVRON_SRC = require("../../assets/images/chevron_right.png");

const TEXT_PRIMARY = "#000000";
const TEXT_MUTED = "#7E7C68";
const DIVIDER = "#C0BEA8";
const CARD_BG = "#FFFFFF";
const BACK_BTN_BG = "#EDECD7";

const FONT_INTER_M = "Inter_500Medium";
const FONT_INTER_SB = "Inter_600SemiBold";
const FONT_INTER_B = "Inter_700Bold";
const sfPro = Platform.select({ ios: undefined, default: FONT_INTER_SB });

type Item = { title: string; desc: string };

const ITEMS: Item[] = [
  { title: "Помилка в персональних даних", desc: "Потрібно внести їх правильно" },
  { title: "Я вже не маю бути на обліку", desc: "Маю на це підстави" },
  {
    title: "Помилка у даних бронювання",
    desc: "Якщо неправильно відображаються дані з наказу про бронювання",
  },
  {
    title: "Неактуальне місце роботи",
    desc: "Потрібно оновити інформацію, щоб оформити бронювання",
  },
  {
    title: "Відомості про інвалідність",
    desc: "Даних про інвалідність немає чи вони помилкові",
  },
  {
    title: "Актуалізувати фото",
    desc: "Натисніть – і ми підтягнемо ваше фото з реєстру у документ",
  },
  {
    title: "Я вже військовий",
    desc: "Але застосунок відображає мене як цивільного",
  },
];

type Props = {
  s: (v: number) => number;
  scale: number;
  onBack: () => void;
  onItemPress?: (item: Item, idx: number) => void;
};

export default function EditOnlineScreen({ s, scale, onBack, onItemPress }: Props) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: s(80) }}
      showsVerticalScrollIndicator={false}
    >
      {/* Кнопка "назад" — кругла світла */}
      <View style={{ paddingTop: s(70), paddingHorizontal: s(60) }}>
        <TouchableOpacity
          testID="edit-online-back"
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

      {/* Заголовок — великий жирний */}
      <View style={{ paddingTop: s(40), paddingHorizontal: s(60) }}>
        <Text
          testID="edit-online-title"
          style={{
            fontFamily: sfPro,
            fontSize: s(112),
            fontWeight: "700",
            color: TEXT_PRIMARY,
            letterSpacing: 2.24 * scale,
            lineHeight: s(112) * 1.08,
          }}
        >
          Виправити дані онлайн
        </Text>
      </View>

      {/* Картка зі списком пунктів */}
      <View
        style={{
          marginTop: s(110),
          marginHorizontal: s(50),
          backgroundColor: CARD_BG,
          borderRadius: s(48),
          paddingVertical: s(20),
          paddingHorizontal: s(60),
        }}
      >
        {ITEMS.map((item, idx) => {
          const isLast = idx === ITEMS.length - 1;
          return (
            <View key={item.title}>
              <TouchableOpacity
                testID={`edit-online-item-${idx}`}
                activeOpacity={0.6}
                onPress={() => onItemPress?.(item, idx)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: s(48),
                }}
              >
                <View style={{ flex: 1, paddingRight: s(24) }}>
                  <Text
                    style={{
                      fontFamily: FONT_INTER_B,
                      fontSize: s(60),
                      fontWeight: "700",
                      color: TEXT_PRIMARY,
                      letterSpacing: 1.2 * scale,
                      lineHeight: s(60) * 1.18,
                    }}
                  >
                    {item.title}
                  </Text>
                  <View style={{ height: s(18) }} />
                  <Text
                    style={{
                      fontFamily: FONT_INTER_M,
                      fontSize: s(44),
                      fontWeight: "500",
                      color: TEXT_MUTED,
                      letterSpacing: 0.4 * scale,
                      lineHeight: s(44) * 1.25,
                    }}
                  >
                    {item.desc}
                  </Text>
                </View>
                <Image
                  source={CHEVRON_SRC}
                  style={{ width: s(50), height: s(50) }}
                  contentFit="contain"
                />
              </TouchableOpacity>

              {!isLast && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: DIVIDER,
                    opacity: 0.55,
                  }}
                />
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
