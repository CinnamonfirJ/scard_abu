import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../components/AppHeader";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { AppPicker } from "../components/AppPicker";
import Toast from "react-native-toast-message";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { useStore } from "../store/useStore";
import { setToken, fetchClient } from "../api/client";

export const AuthScreen = ({ route }: any) => {
  const isLoginInitially = route.params?.isLogin ?? true;
  const [isLogin, setIsLogin] = useState(isLoginInitially);
  const [loading, setLoading] = useState(false);
  const { authenticate } = useStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    matric: "",
    phone: "",
    department: "",
    faculty: "",
    year: "",
  });

  const handleSubmit = async () => {
    console.log("BASE URL:", process.env.EXPO_PUBLIC_API_URL);
    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { ...form, year: parseInt(form.year || "1") };

      const res = await fetchClient(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.token) {
        await setToken(res.token);
        authenticate(res.user);
      }
    } catch (e: any) {
      // Handle backend validation errors (Zod often returns an array)
      const errorMsg = Array.isArray(e.message) 
        ? e.message.map((m: any) => m.message).join(", ") 
        : typeof e.message === 'string' ? e.message : "Authentication failed";

      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const yearOptions = [
    { label: "Year 1", value: "1" },
    { label: "Year 2", value: "2" },
    { label: "Year 3", value: "3" },
    { label: "Year 4", value: "4" },
    { label: "Year 5", value: "5" },
    { label: "Year 6", value: "6" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={isLogin ? "Welcome Back" : "Create Account"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {!isLogin && (
            <>
              <AppTextInput
                placeholder='Full Name'
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
              />
              <AppTextInput
                placeholder='Matric Number'
                value={form.matric}
                onChangeText={(t) => setForm({ ...form, matric: t })}
              />
              <AppTextInput
                placeholder='Phone'
                value={form.phone}
                onChangeText={(t) => setForm({ ...form, phone: t })}
                keyboardType='phone-pad'
              />
              <AppTextInput
                placeholder='Department'
                value={form.department}
                onChangeText={(t) => setForm({ ...form, department: t })}
              />
              <AppTextInput
                placeholder='Faculty'
                value={form.faculty}
                onChangeText={(t) => setForm({ ...form, faculty: t })}
              />
              <AppPicker
                label="Year of Study"
                value={form.year}
                options={yearOptions}
                onSelect={(v) => setForm({ ...form, year: v })}
                placeholder="Select Year"
              />
            </>
          )}
          <AppTextInput
            placeholder='Email'
            value={form.email}
            onChangeText={(t) => setForm({ ...form, email: t })}
            keyboardType='email-address'
            autoCapitalize='none'
          />
          <AppTextInput
            placeholder='Password'
            value={form.password}
            onChangeText={(t) => setForm({ ...form, password: t })}
            secureTextEntry
          />

          <AppButton
            title={isLogin ? "Log In" : "Sign Up"}
            onPress={handleSubmit}
            loading={loading}
            style={{ marginTop: SPACING.md }}
          />
          <AppButton
            title={
              isLogin
                ? "Need an account? Sign Up"
                : "Already have an account? Log In"
            }
            variant='outline'
            onPress={() => setIsLogin(!isLogin)}
            style={{ marginTop: SPACING.sm }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { padding: SPACING.lg, gap: SPACING.sm },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    backgroundColor: COLORS.lightGray,
    fontSize: 16,
  },
});
