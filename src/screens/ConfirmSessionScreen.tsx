import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { fetchClient } from "../api/client";
import { CheckCircle, XCircle, Camera, MessageSquare } from "lucide-react-native";

export const ConfirmSessionScreen = ({ route, navigation }: any) => {
  const { sessionId } = route.params || {};
  const [outcome, setOutcome] = useState<"yes" | "no" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!outcome) {
      Alert.alert("Selection Required", "Please select whether the session was successful or not.");
      return;
    }

    setLoading(true);
    try {
      await fetchClient(`/sessions/${sessionId}/confirm`, {
        method: "PATCH",
        body: JSON.stringify({
          outcome,
          feedback,
          evidence: null, // Placeholder for image upload 
        }),
      });

      Alert.alert(
        outcome === "yes" ? "Success! 🎉" : "Note Recorded",
        outcome === "yes" 
          ? "Confirmation recorded. If the other user also confirms, you'll receive your XP!" 
          : "Your response has been recorded and flagged for review.",
        [{ text: "OK", onPress: () => navigation.navigate("Main", { screen: "Activity" }) }]
      );
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.message || "Failed to submit confirmation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <AppHeader title="Session Confirmation" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.label}>Did you successfully learn/teach?</Text>
          <View style={styles.outcomeContainer}>
            <TouchableOpacity 
              onPress={() => setOutcome("yes")}
              style={[styles.outcomeOption, outcome === "yes" && styles.outcomeYesSelected]}
            >
              <CheckCircle color={outcome === "yes" ? COLORS.white : COLORS.primary} size={32} />
              <Text style={[styles.outcomeText, outcome === "yes" && styles.outcomeTextSelected]}>Yes, it was great!</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setOutcome("no")}
              style={[styles.outcomeOption, outcome === "no" && styles.outcomeNoSelected]}
            >
              <XCircle color={outcome === "no" ? COLORS.white : COLORS.red} size={32} />
              <Text style={[styles.outcomeText, outcome === "no" && styles.outcomeTextSelected]}>No, there was an issue</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Feedback (Optional)</Text>
          <View style={styles.inputContainer}>
            <MessageSquare size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              value={feedback}
              onChangeText={setFeedback}
              placeholder="What did you learn or teach? Any comments on the interaction?"
              textAlignVertical="top"
            />
          </View>

          <Text style={styles.label}>Evidence (Optional)</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={() => alert("Image upload functionality would be integrated here.")}>
            <Camera size={24} color={COLORS.primary} />
            <Text style={styles.uploadText}>Upload Proof / Screenshot</Text>
          </TouchableOpacity>

          <AppCard style={styles.infoCard}>
            <Text style={styles.infoText}>
              Honesty is key to our community. Misleading confirmations may result in penalties or account suspension.
            </Text>
          </AppCard>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <AppButton 
          title="Submit Confirmation" 
          onPress={handleConfirm} 
          loading={loading}
          disabled={!outcome}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { padding: SPACING.md },
  content: { flex: 1 },
  label: { fontSize: 16, fontWeight: "bold", color: COLORS.text, marginBottom: SPACING.md, marginTop: SPACING.lg },
  outcomeContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: SPACING.lg },
  outcomeOption: {
    width: "48%",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  outcomeYesSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  outcomeNoSelected: { backgroundColor: COLORS.red, borderColor: COLORS.red },
  outcomeText: { fontSize: 14, fontWeight: "bold", color: COLORS.text, marginTop: SPACING.sm, textAlign: "center" },
  outcomeTextSelected: { color: COLORS.white },
  inputContainer: { flexDirection: "row", backgroundColor: COLORS.lightGray, borderRadius: BORDER_RADIUS.md, padding: SPACING.sm },
  inputIcon: { marginTop: 8, marginRight: 8 },
  textArea: { flex: 1, height: 100, fontSize: 16, color: COLORS.text },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.border,
    backgroundColor: COLORS.lightGray + "50",
    gap: 12,
  },
  uploadText: { fontSize: 14, color: COLORS.primary, fontWeight: "600" },
  infoCard: { marginTop: SPACING.xl, backgroundColor: COLORS.orange + "10" },
  infoText: { fontSize: 12, color: COLORS.orange, lineHeight: 18, textAlign: "center" },
  footer: { padding: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border, paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.md },
});
