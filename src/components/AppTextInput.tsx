import React from "react";
import { TextInput, StyleSheet, View, Text, TextInputProps } from "react-native";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";

interface AppTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const AppTextInput: React.FC<AppTextInputProps> = ({ 
  label, 
  error, 
  style, 
  placeholder,
  ...props 
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholder={placeholder}
        placeholderTextColor="#5F6C6D" // Darker gray for higher visibility
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    backgroundColor: COLORS.lightGray,
    fontSize: 16,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.red,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.red,
    marginTop: 2,
  },
});
