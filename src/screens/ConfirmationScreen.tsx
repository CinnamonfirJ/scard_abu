import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../components/AppButton";
import { COLORS, SPACING } from "../constants/theme";
import { CheckCircle2 } from "lucide-react-native";
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";

export const ConfirmationScreen = ({ route, navigation }: any) => {
  const { type } = route.params || { type: "request_sent" };

  const isSessionDone = type === "session_completed";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View entering={ZoomIn.duration(500)} style={styles.iconContainer}>
          <CheckCircle2 color={COLORS.primary} size={100} strokeWidth={3} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)} style={styles.textContainer}>
          <Text style={styles.title}>
            {isSessionDone ? "Awesome! \nYou shared a skill." : "Request Sent!"}
          </Text>
          <Text style={styles.subtitle}>
            {isSessionDone 
              ? "Your knowledge is helping others grow. Keep it up!" 
              : "We've notified them. You'll get a notification as soon as they respond."}
          </Text>
        </Animated.View>

        {isSessionDone && (
          <Animated.View entering={FadeInUp.delay(500)} style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Engagement Reward</Text>
              <Text style={styles.statValue}>+15 pts</Text>
            </View>
          </Animated.View>
        )}

        <View style={styles.footer}>
          <AppButton
            title={isSessionDone ? "Return to Dashboard" : "Back to Home"}
            onPress={() => navigation.navigate("Main")}
            style={styles.button}
          />
          {!isSessionDone && (
            <AppButton
              title="View Sent Requests"
              variant="ghost"
              onPress={() => navigation.navigate("Main", { screen: "Activity" })}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: SPACING.md,
    lineHeight: 24,
  },
  statsContainer: {
    width: "100%",
    backgroundColor: COLORS.lightGray,
    padding: SPACING.lg,
    borderRadius: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statBox: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 4,
  },
  footer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    width: "100%",
    marginBottom: SPACING.md,
  },
});
