import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

const INFO_ICON = require("../../assets/images/info_icon.png");
const DOC_ICON = require("../../assets/images/doc_icon.png");
const REFRESH_ICON = require("../../assets/images/refresh_icon.png");

const TEXT_PRIMARY = "#000000";
const SHEET_BG = "#FFFFFF";
const HANDLE_COLOR = "#000000";
const BACKDROP = "rgba(0,0,0,0.7)";

const FONT_INTER_M = "Inter_500Medium";
const sfPro = Platform.select({ ios: undefined, default: FONT_INTER_M });

type Action = {
  testID: string;
  icon: number;
  label: string;
  onPress?: () => void;
};

type Props = {
  visible: boolean;
  s: (v: number) => number;
  scale: number;
  onClose: () => void;
  onView?: () => void;
  onDownload?: () => void;
  onRefresh?: () => void;
};

export default function DocumentActionsSheet({
  visible,
  s,
  scale,
  onClose,
  onView,
  onDownload,
  onRefresh,
}: Props) {
  // Slide-up animation
  const translateY = useSharedValue(1000);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) });
      opacity.value = withTiming(1, { duration: 220 });
    } else {
      translateY.value = withTiming(1000, { duration: 220, easing: Easing.in(Easing.cubic) });
      opacity.value = withTiming(0, { duration: 180 });
    }
  }, [visible, translateY, opacity]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const actions: Action[] = [
    {
      testID: "doc-action-view",
      icon: INFO_ICON,
      label: "Переглянути документ",
      onPress: () => {
        onView?.();
        onClose();
      },
    },
    {
      testID: "doc-action-download",
      icon: DOC_ICON,
      label: "Завантажити PDF",
      onPress: () => {
        onDownload?.();
        onClose();
      },
    },
    {
      testID: "doc-action-refresh",
      icon: REFRESH_ICON,
      label: "Оновити документ",
      onPress: () => {
        onRefresh?.();
        onClose();
      },
    },
  ];

  const screenH = Dimensions.get("window").height;

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
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: BACKDROP,
          },
          backdropStyle,
        ]}
      >
        <Pressable
          testID="doc-actions-backdrop"
          onPress={onClose}
          style={{ flex: 1 }}
        />
      </Animated.View>

      {/* Bottom-sheet */}
      <Animated.View
        style={[
          {
            position: "absolute",
            left: s(24),
            right: s(24),
            bottom: s(40),
            backgroundColor: SHEET_BG,
            borderRadius: s(46),
            paddingTop: s(48),
            paddingBottom: s(102),
            paddingHorizontal: s(72),
            // Гарантуємо макс. висоту не перевищить ¾ екрана
            maxHeight: screenH * 0.85,
          },
          sheetStyle,
        ]}
      >
        {/* Handle bar 120×12 центрований */}
        <View style={{ alignItems: "center", marginBottom: s(98) }}>
          <View
            style={{
              width: s(120),
              height: s(12),
              borderRadius: s(6),
              backgroundColor: HANDLE_COLOR,
            }}
          />
        </View>

        {/* Список дій */}
        {actions.map((a, idx) => (
          <TouchableOpacity
            key={a.testID}
            testID={a.testID}
            activeOpacity={0.6}
            onPress={a.onPress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: idx === 0 ? 0 : s(97),
            }}
          >
            <Image
              source={a.icon}
              style={{ width: s(60), height: s(60) }}
              contentFit="contain"
            />
            <View style={{ width: s(40) }} />
            <Text
              style={{
                fontFamily: sfPro,
                fontSize: s(48),
                fontWeight: "500",
                color: TEXT_PRIMARY,
                letterSpacing: 1.44 * scale,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {a.label}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </Modal>
  );
}
