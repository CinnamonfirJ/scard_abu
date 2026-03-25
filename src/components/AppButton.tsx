import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.95);
  };

  const onPressOut = () => {
    scale.value = withSpring(1);
  };

  const getVariantStyle = () => {
    switch (variant) {
      case "secondary":
        return { backgroundColor: COLORS.secondary };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: COLORS.primary,
        };
      case "ghost":
        return { backgroundColor: "transparent" };
      default:
        return { backgroundColor: COLORS.primary };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "outline":
        return { color: COLORS.primary };
      case "ghost":
        return { color: COLORS.primary };
      default:
        return { color: COLORS.white };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "sm":
        return { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md };
      case "lg":
        return { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl };
      default:
        return { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg };
    }
  };

  return (
    <AnimatedTouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        getVariantStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? COLORS.primary : COLORS.white} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // No shadows as requested
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});
