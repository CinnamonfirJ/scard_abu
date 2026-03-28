import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppCard } from "../components/AppCard";
import { AppBadge } from "../components/AppBadge";
import { AppHeader } from "../components/AppHeader";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { useStore } from "../store/useStore";
import { Bell, Sparkles, TrendingUp, UserIcon } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { fetchClient } from "../api/client";
import { useState, useCallback } from "react";
import { Skeleton } from "../components/Skeleton";
import { AppButton } from "../components/AppButton";
import { useFocusEffect } from "@react-navigation/native";
import { RequestsModal } from "../components/RequestsModal";

export const HomeScreen = ({ navigation }: any) => {
  const { currentUser } = useStore();

  const [trendingSkills, setTrendingSkills] = useState<any[]>([]);
  const [topTeachers, setTopTeachers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRequestsVisible, setIsRequestsVisible] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [skillsRes, teachersRes, activitiesRes, requestsRes] =
        await Promise.all([
          fetchClient("/skills/trending").catch(() => []),
          fetchClient("/users/top-teachers").catch(() => []),
          fetchClient("/users/me/activities").catch(() => []),
          fetchClient("/requests").catch(() => []),
        ]);

      setTrendingSkills(skillsRes);
      setTopTeachers(teachersRes);
      setActivities(activitiesRes);
      setRequests(
        requestsRes.filter(
          (r: any) =>
            r.status === "pending" && r.receiverId === currentUser?.id,
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleRequestAction = async (id: number, status: string) => {
    try {
      await fetchClient(`/requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setRequests((prev: any[]) => prev.filter((r) => r.id !== id));
      if (status === "accepted") {
        setActivities((prev: any[]) => [
          {
            id: Date.now(),
            text: "You accepted a new connection!",
            time: "Just now",
          },
          ...prev,
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title='Scard ABU'
        rightElement={
          <TouchableOpacity onPress={() => setIsRequestsVisible(true)}>
            <View>
              <Bell color={COLORS.primary} size={24} />
              {requests.length > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{requests.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        }
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        <View style={styles.headerRow}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>
              Hello, {currentUser?.name.split(" ")[0]}! 👋
            </Text>
            <Text style={styles.welcomeSubtitle}>
              What do you want to learn today?
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            {currentUser?.avatar ? (
              <Image source={{ uri: currentUser.avatar }} style={styles.headerAvatar} />
            ) : (
              <View style={[styles.headerAvatar, styles.placeholderHeaderAvatar]}>
                <UserIcon size={24} color={COLORS.textLight} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {trendingSkills.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Skills</Text>
              <TrendingUp color={COLORS.orange} size={20} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.skillsScroll}
            >
              {trendingSkills.map((skill, index) => (
                <View
                  key={index}
                  style={[
                    styles.skillChip,
                    index === 0 && { marginLeft: SPACING.md },
                  ]}
                >
                  <AppBadge label={skill.name} variant='secondary' />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Teachers</Text>
            <Sparkles color={COLORS.primary} size={20} />
          </View>
          {loading
            ? [1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  width='100%'
                  height={80}
                  style={{ marginBottom: SPACING.sm }}
                />
              ))
            : topTeachers.slice(0, 3).map((user, index) => (
                <TouchableOpacity
                  key={user.id}
                  onPress={() =>
                    navigation.navigate("UserDetail", { userId: user.id })
                  }
                >
                  <Animated.View
                    entering={FadeInUp.delay(index * 100).duration(500)}
                  >
                    <AppCard style={styles.userCard}>
                      <View style={styles.userRow}>
                        {user.avatar ? (
                          <Image
                            source={{ uri: `${user.avatar}` }}
                            style={styles.avatar}
                          />
                        ) : (
                          <View
                            style={[styles.avatar, styles.placeholderAvatar]}
                          >
                            <UserIcon size={60} color={COLORS.textLight} />
                          </View>
                        )}

                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>{user.name}</Text>
                          <Text style={styles.userDetail}>
                            {user.department} {user.faculty} • Year {user.year}
                          </Text>
                        </View>
                        <View style={styles.scoreContainer}>
                          <Text style={styles.scoreText}>
                            {user.totalScore}
                          </Text>
                          <Text style={styles.scoreLabel}>pts</Text>
                        </View>
                      </View>
                    </AppCard>
                  </Animated.View>
                </TouchableOpacity>
              ))}
        </View>

        {requests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Action Required</Text>
            </View>
            {requests.map((req: any) => (
              <AppCard
                key={req.id}
                variant='outlined'
                style={{ marginBottom: SPACING.sm }}
              >
                <View style={styles.userRow}>
                  {req.senderAvatar ? (
                    <Image source={{ uri: req.senderAvatar }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.placeholderAvatar]}>
                      <UserIcon size={30} color={COLORS.textLight} />
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: SPACING.md }}>
                    <Text style={styles.activityText}>
                      <Text style={styles.bold}>{req.senderName}</Text> wants to{" "}
                      <Text style={styles.bold}>{req.type}</Text> a skill with
                      you!
                    </Text>
                    <View style={{ flexDirection: "row", marginTop: SPACING.sm }}>
                      <AppButton
                        title='Accept'
                        onPress={() => handleRequestAction(req.id, "accepted")}
                        style={{ flex: 1, marginRight: 4, height: 36 }}
                      />
                      <AppButton
                        title='Reject'
                        variant='outline'
                        onPress={() => handleRequestAction(req.id, "rejected")}
                        style={{ flex: 1, marginLeft: 4, height: 36 }}
                      />
                    </View>
                  </View>
                </View>
              </AppCard>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>
          {loading ? (
            <Skeleton width='100%' height={60} />
          ) : activities.length > 0 ? (
            activities.map((act) => (
              <AppCard
                key={act.id}
                variant='outlined'
                style={{ marginBottom: SPACING.sm }}
              >
                <View style={styles.userRow}>
                  {act.avatar ? (
                    <Image source={{ uri: act.avatar }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.placeholderAvatar]}>
                      <UserIcon size={30} color={COLORS.textLight} />
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: SPACING.md }}>
                    <Text style={styles.activityText}>{act.text}</Text>
                    <Text style={styles.activityTime}>{act.time}</Text>
                  </View>
                </View>
              </AppCard>
            ))
          ) : (
            <Text style={styles.activityTime}>No recent activities.</Text>
          )}
        </View>
      </ScrollView>

      <RequestsModal 
        isVisible={isRequestsVisible} 
        onClose={() => setIsRequestsVisible(false)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  bellBadge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: COLORS.red,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  bellBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 100, // Account for absolute TabBar
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  welcomeSection: {
    flex: 1,
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  placeholderHeaderAvatar: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 4,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  skillsScroll: {
    marginHorizontal: -SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  skillChip: {
    marginRight: SPACING.sm,
  },
  userCard: {
    padding: SPACING.md,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
  },
  placeholderAvatar: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  userDetail: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  skillsRow: {
    flexDirection: "row",
    marginTop: SPACING.sm,
  },
  smallSkillChip: {
    marginRight: 4,
  },
  scoreContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary + "10",
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 50,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  scoreLabel: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  activityText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  bold: {
    fontWeight: "bold",
  },
  activityTime: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
});
