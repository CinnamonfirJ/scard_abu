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
    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { ...form, year: parseInt(form.year) };

      const res = await fetchClient(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.token) {
        await setToken(res.token);
        authenticate(res.user);
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

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
              <TextInput
                style={styles.input}
                placeholder='Full Name'
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
              />
              <TextInput
                style={styles.input}
                placeholder='Matric Number'
                value={form.matric}
                onChangeText={(t) => setForm({ ...form, matric: t })}
              />
              <TextInput
                style={styles.input}
                placeholder='Phone'
                value={form.phone}
                onChangeText={(t) => setForm({ ...form, phone: t })}
                keyboardType='phone-pad'
              />
              <TextInput
                style={styles.input}
                placeholder='Department'
                value={form.department}
                onChangeText={(t) => setForm({ ...form, department: t })}
              />
              <TextInput
                style={styles.input}
                placeholder='Faculty'
                value={form.faculty}
                onChangeText={(t) => setForm({ ...form, faculty: t })}
              />
              <TextInput
                style={styles.input}
                placeholder='Year'
                value={form.year}
                onChangeText={(t) => setForm({ ...form, year: t })}
                keyboardType='numeric'
              />
            </>
          )}
          <TextInput
            style={styles.input}
            placeholder='Email'
            value={form.email}
            onChangeText={(t) => setForm({ ...form, email: t })}
            keyboardType='email-address'
            autoCapitalize='none'
          />
          <TextInput
            style={styles.input}
            placeholder='Password'
            value={form.password}
            onChangeText={(t) => setForm({ ...form, password: t })}
            secureTextEntry
          />

          <AppButton
            title={isLogin ? "Log In" : "Sign Up"}
            onPress={handleSubmit}
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
