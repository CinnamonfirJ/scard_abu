import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";

interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "default" | "flat" | "outlined";
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  style,
  variant = "default",
}) => {
  return (
    <View
      style={[
        styles.card,
        variant === "flat" && styles.flat,
        variant === "outlined" && styles.outlined,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    // No shadows/glows as per requirements
  },
  flat: {
    backgroundColor: COLORS.white,
    borderWidth: 0,
  },
  outlined: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
});
