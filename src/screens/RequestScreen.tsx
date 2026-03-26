import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { useStore } from "../store/useStore";
import { BookOpen, Repeat, Send } from "lucide-react-native";

import { fetchClient } from "../api/client";

export const RequestScreen = ({ route, navigation }: any) => {
  const { userId, userName, skillId } = route.params || {};
  const { users } = useStore();
  const receiver = users.find(u => u.id === userId) || { id: userId, name: userName || "Peer" };
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState<"learn" | "exchange">("learn");
  const [message, setMessage] = useState(`Hi ${receiver.name}! I'd love to connect and share some skills.`);

  const handleSend = async () => {
    setLoading(true);
    try {
      await fetchClient("/requests", {
        method: "POST",
        body: JSON.stringify({
          receiverId: receiver.id,
          type,
          skillId: skillId || 1, // Use passed skillId or fallback to 1
          message,
        })
      });
      navigation.navigate("Confirmation", { type: "request_sent" });
    } catch (e: any) {
      console.error(e);
      alert("Failed to send request. " + (e.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <AppHeader title="Send a Request" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.label}>What are you looking for?</Text>
          <View style={styles.optionContainer}>
            <TouchableOpacity 
              onPress={() => setType("learn")}
              style={[styles.option, type === "learn" && styles.optionSelected]}
            >
              <BookOpen color={type === "learn" ? COLORS.white : COLORS.primary} size={28} />
              <Text style={[styles.optionTitle, type === "learn" && styles.optionTitleSelected]}>Learn from them</Text>
              <Text style={[styles.optionDesc, type === "learn" && styles.optionDescSelected]}>Book a lesson or session</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setType("exchange")}
              style={[styles.option, type === "exchange" && styles.optionSelected]}
            >
              <Repeat color={type === "exchange" ? COLORS.white : COLORS.primary} size={28} />
              <Text style={[styles.optionTitle, type === "exchange" && styles.optionTitleSelected]}>Skill exchange</Text>
              <Text style={[styles.optionDesc, type === "exchange" && styles.optionDescSelected]}>Trade skills with each other</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Personal Message</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            value={message}
            onChangeText={setMessage}
            placeholder="Add a short message about why you'd like to connect..."
          />

          <AppCard style={styles.infoCard}>
            <Text style={styles.infoText}>
              By sending this request, you agree to our community guidelines of mutual respect and helpfulness.
            </Text>
          </AppCard>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <AppButton 
          title="Send Request" 
          onPress={handleSend} 
          loading={loading}
          icon={<Send color={COLORS.white} size={20} style={{ marginRight: 8 }} />}
        />
        <AppButton 
          title="Cancel" 
          variant="ghost" 
          onPress={() => navigation.goBack()} 
          style={{ marginTop: 8 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  option: {
    width: "48%",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.lightGray,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
  },
  optionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: SPACING.sm,
    textAlign: "center",
  },
  optionTitleSelected: {
    color: COLORS.white,
  },
  optionDesc: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
    textAlign: "center",
  },
  optionDescSelected: {
    color: COLORS.white + "AA",
  },
  textArea: {
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    height: 120,
    fontSize: 16,
    color: COLORS.text,
    textAlignVertical: "top",
  },
  infoCard: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.secondary + "10",
  },
  infoText: {
    fontSize: 12,
    color: COLORS.secondary,
    lineHeight: 18,
    textAlign: "center",
  },
  footer: {
    padding: SPACING.md,
    paddingBottom: Platform.OS === "ios" ? SPACING.xl : SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
