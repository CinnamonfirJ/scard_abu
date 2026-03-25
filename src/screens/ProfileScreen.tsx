import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { AppCard } from "../components/AppCard";
import { AppBadge } from "../components/AppBadge";
import { AppButton } from "../components/AppButton";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { useStore } from "../store/useStore";
import { Trophy, Award, MapPin, Zap, User as UserIcon } from "lucide-react-native";
import { useState, useEffect } from "react";

export const ProfileScreen = ({ navigation }: any) => {
  const { currentUser } = useStore();

  if (!currentUser) return <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}><Text>Loading profile...</Text></View>;

  const skillsTeach = currentUser.skillsTeach || [];
  const skillsLearn = currentUser.skillsLearn || [];
  const achievements = currentUser.achievements || [];
  const engagementScore = currentUser.engagementScore || currentUser.totalScore || 0;
  const weeklyGain = currentUser.weeklyGain || 0;
  const avatar = currentUser.avatar;

  return (
    <View style={styles.container}>
      <AppHeader title='Student Profile' />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={styles.largeAvatar}
            />
          ) : (
            <View style={[styles.largeAvatar, styles.placeholderAvatar]}>
              <UserIcon size={60} color={COLORS.textLight} />
            </View>
          )}
          <View style={styles.badgeContainer}>
            <AppBadge
              label={`Level ${Math.floor(engagementScore / 100)}`}
              variant='orange'
            />
          </View>
        </View>

        <View style={styles.statsGrid}>
          <AppCard style={styles.statCard}>
            <Award color={COLORS.primary} size={24} />
            <AnimatedCounter
              value={engagementScore}
              style={styles.statValue}
            />
            <Text style={styles.statLabel}>Engagement</Text>
          </AppCard>
          <AppCard style={styles.statCard}>
            <Trophy color={COLORS.secondary} size={24} />
            <View style={styles.weeklyContainer}>
              <Text style={styles.statValue}>+{weeklyGain}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
          </AppCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills I'm Teaching 🎓</Text>
          <View style={styles.tagCloud}>
            {skillsTeach.length > 0 ? (
              skillsTeach.map((skill: string, idx: number) => (
                <View key={idx} style={styles.tag}>
                  <AppBadge label={skill} variant='success' />
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No teaching skills added yet.</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills I Want to Learn 🎯</Text>
          <View style={styles.tagCloud}>
            {skillsLearn.length > 0 ? (
              skillsLearn.map((skill: string, idx: number) => (
                <View key={idx} style={styles.tag}>
                  <AppBadge label={skill} variant='secondary' />
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No learning goals added yet.</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earned Badges 🏆</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.badgeScroll}
          >
            {achievements.map(
              (achievement: string, idx: number) => (
                <AppCard key={idx} style={styles.achievementCard}>
                  <Text style={styles.achievementText}>{achievement}</Text>
                </AppCard>
              ),
            )}
          </ScrollView>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Next Level Progress</Text>
            <Text style={styles.progressText}>
              {engagementScore % 100}/100
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${engagementScore % 100}%` },
              ]}
            />
          </View>
        </View>

        <AppButton
          title='Edit Profile'
          variant='outline'
          onPress={() => navigation.navigate("EditProfile")}
          style={styles.editButton}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
  profileHeader: {
    alignItems: "center",
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  largeAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  badgeContainer: {
    marginTop: SPACING.sm,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.xl,
  },
  statCard: {
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.lightGray,
  },
  placeholderAvatar: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  weeklyContainer: {
    alignItems: "center",
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  tagCloud: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  badgeScroll: {
    marginHorizontal: -SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  achievementCard: {
    marginRight: SPACING.md,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  achievementText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
  },
  progressSection: {
    marginBottom: SPACING.xl,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: SPACING.sm,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  progressBarBg: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  editButton: {
    marginTop: SPACING.md,
  },
  contactInfo: {
    marginTop: SPACING.md,
    gap: 4,
    alignItems: "center",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.text,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: "italic",
    marginTop: 4,
  },
});
