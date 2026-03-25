import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { AppCard } from "../components/AppCard";
import { AppBadge } from "../components/AppBadge";
import { AppButton } from "../components/AppButton";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { useStore, User } from "../store/useStore";
import { Trophy, Award, MapPin, MessageCircle, Mail, Phone, ArrowLeft, User as UserIcon } from "lucide-react-native";
import { fetchClient } from "../api/client";
import Transition from "react-native-screen-transitions";

export const UserDetailScreen = ({ route, navigation }: any) => {
  const { userId } = route.params || {};
  const { currentUser, logout } = useStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnectionAccepted, setIsConnectionAccepted] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        navigation.goBack();
        return;
      }
      setLoading(true);
      try {
        const [userData, requestsData] = await Promise.all([
          fetchClient(`/users/${userId}`),
          fetchClient(`/requests`).catch(() => [])
        ]);

        const hasAcceptedRequest = requestsData.some((r: any) => 
          r.status === 'accepted' && 
          ((r.senderId === currentUser?.id && r.receiverId === userData.id) || 
           (r.senderId === userData.id && r.receiverId === currentUser?.id))
        );
        setIsConnectionAccepted(hasAcceptedRequest);

        const formattedUser = {
          ...userData,
          skillsTeach: userData.skills?.filter((s:any) => s.type === 'teach').map((s:any) => s.name) || [],
          skillsLearn: userData.skills?.filter((s:any) => s.type === 'learn').map((s:any) => s.name) || [],
          achievements: [],
          avatar: userData.avatar,
        };
        setUser(formattedUser);
      } catch (e) {
        console.error("Failed to load user profile", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Fetching profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={{ fontSize: 18, color: COLORS.text, marginBottom: 10 }}>User not found</Text>
        <Text style={{ color: COLORS.textLight, marginBottom: 20 }}>This profile may have been removed.</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <AppButton 
            title="Go Back" 
            onPress={() => navigation.goBack()} 
            variant="secondary"
          />
          <AppButton 
            title="Logout" 
            onPress={() => logout()} 
            variant="outline"
          />
        </View>
      </View>
    );
  }

  const engagementScore = user.engagementScore || user.totalScore || 0;
  const avatar = user.avatar;

  return (
    <View style={styles.container}>
      <View style={styles.sheetContainer}>
        <View style={styles.sheetHeader}>
          <View style={styles.sheetIndicator} />
        </View>
        <Transition.ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.profileHeader}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.largeAvatar} />
            ) : (
              <View style={[styles.largeAvatar, styles.placeholderAvatar]}>
                <UserIcon size={60} color={COLORS.textLight} />
              </View>
            )}
            <Text style={styles.name}>{user.name}</Text>
            <View style={styles.locationRow}>
              <MapPin size={16} color={COLORS.primary} />
              <Text style={styles.locationText}>{user.department} Hub</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills to Teach 🎓</Text>
            <View style={styles.tagCloud}>
              {user.skillsTeach && user.skillsTeach.length > 0 ? (
                user.skillsTeach.map((skill: string, idx: number) => (
                  <View key={idx} style={styles.tag}>
                    <AppBadge label={skill} variant='success' />
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No teaching skills listed.</Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills to Learn 🎯</Text>
            <View style={styles.tagCloud}>
              {user.skillsLearn && user.skillsLearn.length > 0 ? (
                user.skillsLearn.map((skill: string, idx: number) => (
                  <View key={idx} style={styles.tag}>
                    <AppBadge label={skill} variant='secondary' />
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No learning goals listed.</Text>
              )}
            </View>
          </View>

          <AppButton
            title='Request to Learn'
            onPress={() => {
              const firstSkillId = user.skills && user.skills.length > 0 ? user.skills[0].skillId : 1;
              navigation.navigate("Request", { userId: user.id, userName: user.name, skillId: firstSkillId });
            }}
            style={styles.connectButton}
            icon={<MessageCircle color={COLORS.white} size={20} style={{ marginRight: 8 }} />}
          />

          <View style={{ height: 40 }} />
        </Transition.ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  sheetContainer: { 
    flex: 1, 
    backgroundColor: COLORS.white, 
    borderTopLeftRadius: BORDER_RADIUS.xl, 
    borderTopRightRadius: BORDER_RADIUS.xl,
    marginTop: 20,
    overflow: "hidden",
  },
  sheetHeader: {
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetIndicator: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 3,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: COLORS.textLight },
  scrollContent: { padding: SPACING.md, paddingBottom: 100 },
  profileHeader: { alignItems: "center", marginBottom: SPACING.xl, marginTop: SPACING.md },
  largeAvatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: COLORS.primary },
  name: { fontSize: 24, fontWeight: "bold", color: COLORS.text, marginTop: SPACING.md },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  locationText: { fontSize: 14, color: COLORS.textLight, marginLeft: 4 },
  badgeContainer: { marginTop: SPACING.sm },
  statsGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: SPACING.xl },
  statCard: { width: "48%", alignItems: "center", padding: SPACING.md, backgroundColor: COLORS.lightGray },
  statValue: { fontSize: 24, fontWeight: "bold", color: COLORS.text, marginTop: 8 },
  statLabel: { fontSize: 12, color: COLORS.textLight },
  section: { marginBottom: SPACING.xl },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.text, marginBottom: SPACING.md },
  tagCloud: { flexDirection: "row", flexWrap: "wrap" },
  tag: { marginRight: SPACING.sm, marginBottom: SPACING.sm },
  connectButton: { marginTop: SPACING.md },
  contactInfo: { marginTop: SPACING.md, gap: 4, alignItems: "center" },
  contactItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  contactText: { fontSize: 14, color: COLORS.text },
  placeholderAvatar: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: "italic",
    marginTop: 4,
  },
});
