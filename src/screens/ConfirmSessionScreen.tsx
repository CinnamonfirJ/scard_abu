import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Platform, 
  KeyboardAvoidingView,
  ActivityIndicator
} from "react-native";
import { AppHeader } from "../components/AppHeader";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { fetchClient } from "../api/client";
import { useStore, Session } from "../store/useStore";
import { 
  CheckCircle, 
  XCircle, 
  Camera, 
  MessageSquare, 
  BookOpen, 
  GraduationCap, 
  Info 
} from "lucide-react-native";

export const ConfirmSessionScreen = ({ route, navigation }: any) => {
  const { sessionId } = route.params || {};
  const { currentUser } = useStore();
  
  const [session, setSession] = useState<Session | null>(null);
  const [outcome, setOutcome] = useState<"yes" | "no" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const data = await fetchClient(`/sessions`);
        const found = data.find((s: Session) => s.id === sessionId);
        if (found) setSession(found);
      } catch (err) {
        console.error("Error loading session:", err);
      } finally {
        setFetching(false);
      }
    };
    loadSession();
  }, [sessionId]);

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
          evidence: null, 
        }),
      });

      Alert.alert(
        outcome === "yes" ? "Success! 🎉" : "Note Recorded",
        outcome === "yes" 
          ? "Confirmation recorded. Once your partner also confirms, XP will be awarded!" 
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

  const isTutor = session?.tutorId === currentUser?.id;

  if (fetching) {
     return (
       <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
         <ActivityIndicator size="large" color={COLORS.primary} />
       </View>
     );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <AppHeader title="Session Confirmation" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <AppCard style={styles.sessionHeaderCard}>
             <Text style={styles.sessionSkillLabel}>Skill Learned/Taught:</Text>
             <Text style={styles.sessionSkillName}>{session?.skillName || "Untitled Session"}</Text>
             <View style={styles.roleTag}>
                {isTutor ? <GraduationCap size={16} color={COLORS.white} /> : <BookOpen size={16} color={COLORS.white} />}
                <Text style={styles.roleTagText}>{isTutor ? "You were the Tutor" : "You were the Learner"}</Text>
             </View>
          </AppCard>

          <Text style={styles.label}>Did you successfully {isTutor ? "teach" : "learn"} this skill?</Text>
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

          <Text style={styles.label}>What did you {isTutor ? "teach" : "learn"}? (Optional)</Text>
          <View style={styles.inputContainer}>
            <MessageSquare size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              value={feedback}
              onChangeText={setFeedback}
              placeholder={isTutor ? "Describe how the teaching went..." : "What are the key takeaways from this session?"}
              textAlignVertical="top"
            />
          </View>

          <Text style={styles.label}>Evidence (Optional)</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={() => alert("Image upload functionality would be integrated here.")}>
            <Camera size={24} color={COLORS.primary} />
            <Text style={styles.uploadText}>Upload Proof / Screenshot</Text>
          </TouchableOpacity>

          <AppCard style={styles.infoCard}>
            <View style={styles.infoTitleRow}>
               <Info size={16} color={COLORS.orange} />
               <Text style={styles.infoTitle}>About XP Rewards</Text>
            </View>
            <Text style={styles.infoText}>
               • XP is awarded only after **both** users confirm.{"\n"}
               • Same Faculty: 10 XP | Cross Faculty: 15 XP.{"\n"}
               • Initiator Bonus: +25% XP.
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
  sessionHeaderCard: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  sessionSkillLabel: {
    color: COLORS.white + '90',
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  sessionSkillName: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 12,
    gap: 6,
  },
  roleTagText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
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
  infoTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  infoTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.orange },
  infoText: { fontSize: 12, color: COLORS.orange, lineHeight: 18 },
  footer: { padding: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border, paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.md },
});
