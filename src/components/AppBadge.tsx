import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, BORDER_RADIUS, SPACING } from "../constants/theme";

interface AppBadgeProps {
  label: string;
  variant?: "primary" | "secondary" | "success" | "orange" | "gray";
}

export const AppBadge: React.FC<AppBadgeProps> = ({ label, variant = "primary" }) => {
  const getVariantStyle = () => {
    switch (variant) {
      case "secondary":
        return { backgroundColor: COLORS.secondary + "20", color: COLORS.secondary };
      case "success":
        return { backgroundColor: COLORS.primary + "20", color: COLORS.primary };
      case "orange":
        return { backgroundColor: COLORS.orange + "20", color: COLORS.orange };
      case "gray":
        return { backgroundColor: COLORS.gray + "20", color: COLORS.textLight };
      default:
        return { backgroundColor: COLORS.primary, color: COLORS.white };
    }
  };

  const style = getVariantStyle();

  return (
    <View style={[styles.badge, { backgroundColor: style.backgroundColor }]}>
      <Text style={[styles.text, { color: style.color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.pill,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
