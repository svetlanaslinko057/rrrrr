import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { Image } from "expo-image";

const SESSIONS_ICON = require("../../assets/images/sessions_icon.png");
const SETTINGS_ICON = require("../../assets/images/settings_icon.png");
const QA_ICON = require("../../assets/images/qa_icon.png");
const SUPPORT_ICON = require("../../assets/images/support_icon.png");
const COPY_ICON = require("../../assets/images/copy_icon.png");
const QR_ICON = require("../../assets/images/qr_icon.png");
const CHEVRON_SRC = require("../../assets/images/chevron_right.png");

const TEXT_PRIMARY = "#000000";
const TEXT_VERSION = "#7D7D7A";
const CARD_BG = "#FBFCFC";
const DIVIDER = "#D5D3BE";
const BTN_DARK = "#2C2B26";

const FONT_INTER_M = "Inter_500Medium";
const FONT_INTER_SB = "Inter_600SemiBold";
const sfPro = Platform.select({ ios: undefined, default: FONT_INTER_M });

type Props = {
  s: (v: number) => number;
  scale: number;
  onActiveSessions?: () => void;
  onSettings?: () => void;
  onQA?: () => void;
  onSupport?: () => void;
  onCopyDeviceId?: () => void;
  onScanDoc?: () => void;
  onLogout?: () => void;
  onPersonalDataInfo?: () => void;
};

type Row = {
  testID: string;
  icon: React.ReactNode;
  label: string;
  chevron?: boolean;
  onPress?: () => void;
};

export default function MenuScreen({
  s,
  scale,
  onActiveSessions,
  onSettings,
  onQA,
  onSupport,
  onCopyDeviceId,
  onScanDoc,
  onLogout,
  onPersonalDataInfo,
}: Props) {
  const ICON_W = s(70);
  const ICON_H = s(72);
  const imgIcon = (src: number) => (
    <Image
      source={src}
      style={{ width: ICON_W, height: ICON_H }}
      contentFit="contain"
    />
  );

  const card1Rows: Row[] = [
    {
      testID: "menu-active-sessions",
      icon: imgIcon(SESSIONS_ICON),
      label: "Активні сесії",
      chevron: true,
      onPress: onActiveSessions,
    },
    {
      testID: "menu-settings",
      icon: imgIcon(SETTINGS_ICON),
      label: "Налаштування",
      chevron: true,
      onPress: onSettings,
    },
  ];

  const card2Rows: Row[] = [
    {
      testID: "menu-qa",
      icon: imgIcon(QA_ICON),
      label: "Питання та відповіді",
      chevron: true,
      onPress: onQA,
    },
    {
      testID: "menu-support",
      icon: imgIcon(SUPPORT_ICON),
      label: "Служба підтримки",
      chevron: true,
      onPress: onSupport,
    },
    {
      testID: "menu-copy-device-id",
      icon: imgIcon(COPY_ICON),
      label: "Копіювати номер пристрою",
      chevron: false,
      onPress: onCopyDeviceId,
    },
  ];

  const card3Rows: Row[] = [
    {
      testID: "menu-scan-doc",
      icon: imgIcon(QR_ICON),
      label: "Сканувати документ",
      chevron: false,
      onPress: onScanDoc,
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: s(80) }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header: Меню + Версія 2.2.1 */}
      <View style={{ paddingTop: s(219), paddingHorizontal: s(72) }}>
        <Text
          testID="menu-title"
          style={{
            fontFamily: sfPro,
            fontSize: s(86),
            fontWeight: "500",
            color: TEXT_PRIMARY,
            letterSpacing: 3.44 * scale,
            lineHeight: s(86) * 1.05,
          }}
        >
          Меню
        </Text>
        <Text
          testID="menu-version"
          style={{
            fontFamily: sfPro,
            fontSize: s(40),
            fontWeight: "500",
            color: TEXT_VERSION,
            letterSpacing: 1.2 * scale,
            marginTop: s(8),
          }}
        >
          Версія 2.2.1
        </Text>
      </View>

      {/* Card 1: Активні сесії / Налаштування */}
      <MenuCard
        s={s}
        scale={scale}
        rows={card1Rows}
        marginTop={s(80)}
      />

      {/* Card 2: Q&A / Support / Copy device */}
      <MenuCard
        s={s}
        scale={scale}
        rows={card2Rows}
        marginTop={s(24)}
      />

      {/* Card 3: Сканувати документ */}
      <MenuCard
        s={s}
        scale={scale}
        rows={card3Rows}
        marginTop={s(24)}
      />

      {/* "Вийти" button — centered, 85px below scan card */}
      <View style={{ alignItems: "center", marginTop: s(85) }}>
        <TouchableOpacity
          testID="menu-logout-btn"
          activeOpacity={0.85}
          onPress={onLogout}
          style={{
            width: s(360),
            height: s(144),
            borderRadius: s(100),
            backgroundColor: BTN_DARK,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: sfPro,
              fontSize: s(48),
              fontWeight: "500",
              color: "#FFFFFF",
              letterSpacing: 1.92 * scale,
            }}
          >
            Вийти
          </Text>
        </TouchableOpacity>
      </View>

      {/* "Повідомлення про обробку персональних даних" — підкреслене,
          52px від кнопки "Вийти", одним рядком (numberOfLines=1). */}
      <View
        style={{
          marginTop: s(52),
          paddingHorizontal: s(40),
          alignItems: "center",
          marginBottom: s(160),
        }}
      >
        <TouchableOpacity
          testID="menu-personal-data-link"
          activeOpacity={0.6}
          onPress={onPersonalDataInfo}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{
              fontFamily: FONT_INTER_SB,
              fontSize: s(36),
              fontWeight: "600",
              color: TEXT_PRIMARY,
              letterSpacing: 2.16 * scale,
              textDecorationLine: "underline",
              textAlign: "center",
            }}
          >
            Повідомлення про обробку персональних даних
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ============================================================
//                       MENU CARD
// ============================================================
type CardProps = {
  s: (v: number) => number;
  scale: number;
  rows: Row[];
  marginTop?: number;
};

function MenuCard({ s, scale, rows, marginTop = 0 }: CardProps) {
  return (
    <View
      style={{
        marginTop,
        marginHorizontal: s(72),
        backgroundColor: CARD_BG,
        borderRadius: s(48),
        // Padding: 58 top / 64 right / 64 bottom / 60 left (точно за дизайном)
        paddingTop: s(58),
        paddingRight: s(64),
        paddingBottom: s(64),
        paddingLeft: s(60),
      }}
    >
      {rows.map((row, idx) => {
        const isLast = idx === rows.length - 1;
        return (
          <View key={row.testID}>
            <TouchableOpacity
              testID={row.testID}
              activeOpacity={0.6}
              onPress={row.onPress}
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {row.icon}
              <View style={{ width: s(40) }} />
              <Text
                style={{
                  fontFamily: FONT_INTER_M,
                  fontSize: s(52),
                  fontWeight: "500",
                  color: TEXT_PRIMARY,
                  letterSpacing: 1.56 * scale,
                  flex: 1,
                }}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {row.label}
              </Text>
              {row.chevron && (
                <Image
                  source={CHEVRON_SRC}
                  style={{ width: s(50), height: s(50) }}
                  contentFit="contain"
                />
              )}
            </TouchableOpacity>

            {!isLast && (
              <View
                style={{
                  // 46px gap above divider, 1px line, 46px gap below
                  marginTop: s(46),
                  marginBottom: s(46),
                  height: 1,
                  backgroundColor: DIVIDER,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
