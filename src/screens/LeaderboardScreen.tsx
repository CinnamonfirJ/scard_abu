import { Trophy, Medal, Crown, User as UserIcon } from "lucide-react-native";
import {
  TouchableOpacity,
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useStore, User } from "../store/useStore";
import { useState, useEffect, useCallback } from "react";
import { AppHeader } from "../components/AppHeader";
import { AppBadge } from "../components/AppBadge";
import { BORDER_RADIUS, COLORS, SPACING } from "../constants/theme";
import { AppCard } from "../components/AppCard";
import { fetchClient } from "../api/client";
import { Skeleton } from "../components/Skeleton";

export const LeaderboardScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState("Global");
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      let endpoint = "/leaderboard/global";
      if (activeTab === "Dept") endpoint = "/leaderboard/department?dept=Computer Science"; // hardcoded for demo
      if (activeTab === "Weekly") endpoint = "/leaderboard/weekly";
      
      const data = await fetchClient(endpoint);
      setLeaderboardData(data);
    } catch (error) {
      console.error("Leaderboard fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const top3 = leaderboardData.slice(0, 3);
  const others = leaderboardData.slice(3);

  const renderSkeletons = () => (
    <View style={styles.scrollContent}>
      <View style={styles.podium}>
        {[80, 110, 80].map((h, i) => (
          <View key={i} style={[styles.podiumItem, i === 1 && styles.goldItem]}>
            <Skeleton width={80} height={80} borderRadius={40} style={{ marginBottom: 10 }} />
            <Skeleton width={60} height={12} style={{ marginBottom: 8 }} />
            <Skeleton width={40} height={20} borderRadius={10} />
          </View>
        ))}
      </View>
      <View style={styles.listContainer}>
        {[1, 2, 3, 4, 5].map((item) => (
          <AppCard key={item} variant="flat" style={styles.userListItem}>
            <View style={styles.userRow}>
              <Skeleton width={20} height={20} style={{ marginHorizontal: 10 }} />
              <Skeleton width={40} height={40} borderRadius={20} />
              <View style={[styles.userInfo, { marginLeft: 10 }]}>
                <Skeleton width={120} height={14} style={{ marginBottom: 4 }} />
                <Skeleton width={80} height={10} />
              </View>
            </View>
          </AppCard>
        ))}
      </View>
    </View>
  );

  const tabs = ["Global", "Dept", "Weekly"];

  return (
    <View style={styles.container}>
      <AppHeader title='Leaderboard' />

      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {loading ? renderSkeletons() : (
          <>
            <View style={styles.podium}>
              {/* 2nd Place */}
              {top3[1] && (
                <TouchableOpacity 
                  style={styles.podiumItem}
                  onPress={() => navigation.navigate('UserDetail', { userId: top3[1].id })}
                >
                  <View style={styles.avatarContainer}>
                    {top3[1].avatar ? (
                      <Image
                        source={{ uri: top3[1].avatar }}
                        style={[styles.avatar, styles.silverAvatar]}
                      />
                    ) : (
                      <View style={[styles.avatar, styles.silverAvatar, styles.placeholderAvatar]}>
                        <UserIcon size={30} color={COLORS.textLight} />
                      </View>
                    )}
                    <View style={[styles.rankBadge, styles.silverBadge]}>
                      <Text style={styles.rankText}>2</Text>
                    </View>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {top3[1].name.split(" ")[0]}
                  </Text>
                  <AppBadge label={`${top3[1].totalScore || 0}`} variant='gray' />
                </TouchableOpacity>
              )}

              {/* 1st Place */}
              {top3[0] && (
                <TouchableOpacity 
                  style={[styles.podiumItem, styles.goldItem]}
                  onPress={() => navigation.navigate('UserDetail', { userId: top3[0].id })}
                >
                  <Crown color={COLORS.orange} size={30} style={styles.crown} />
                  <View style={styles.avatarContainer}>
                    {top3[0].avatar ? (
                      <Image
                        source={{ uri: top3[0].avatar }}
                        style={[styles.avatar, styles.goldAvatar]}
                      />
                    ) : (
                      <View style={[styles.avatar, styles.goldAvatar, styles.placeholderAvatar]}>
                        <UserIcon size={40} color={COLORS.textLight} />
                      </View>
                    )}
                    <View style={[styles.rankBadge, styles.goldBadge]}>
                      <Text style={styles.rankText}>1</Text>
                    </View>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {top3[0].name.split(" ")[0]}
                  </Text>
                  <AppBadge label={`${top3[0].totalScore || 0}`} variant='orange' />
                </TouchableOpacity>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <TouchableOpacity 
                  style={styles.podiumItem}
                  onPress={() => navigation.navigate('UserDetail', { userId: top3[2].id })}
                >
                  <View style={styles.avatarContainer}>
                    {top3[2].avatar ? (
                      <Image
                        source={{ uri: top3[2].avatar }}
                        style={[styles.avatar, styles.bronzeAvatar]}
                      />
                    ) : (
                      <View style={[styles.avatar, styles.bronzeAvatar, styles.placeholderAvatar]}>
                        <UserIcon size={30} color={COLORS.textLight} />
                      </View>
                    )}
                    <View style={[styles.rankBadge, styles.bronzeBadge]}>
                      <Text style={styles.rankText}>3</Text>
                    </View>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {top3[2].name.split(" ")[0]}
                  </Text>
                  <AppBadge label={`${top3[2].totalScore || 0}`} variant='gray' />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.listContainer}>
              <Text style={styles.listTitle}>Top Performers</Text>
              {others.map((user, index) => (
                <TouchableOpacity 
                  key={user.id} 
                  onPress={() => navigation.navigate('UserDetail', { userId: user.id })}
                >
                  <AppCard variant='flat' style={styles.userListItem}>
                    <View style={styles.userRow}>
                      <Text style={styles.rankNumber}>{index + 4}</Text>
                      {user.avatar ? (
                        <Image
                          source={{ uri: user.avatar }}
                          style={styles.smallAvatar}
                        />
                      ) : (
                        <View style={[styles.smallAvatar, styles.placeholderAvatar]}>
                          <UserIcon size={20} color={COLORS.textLight} />
                        </View>
                      )}
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userDept}>{user.department}</Text>
                      </View>
                      <View style={styles.scoreInfo}>
                        <Text style={styles.scoreValue}>{user.totalScore || 0}</Text>
                      </View>
                    </View>
                  </AppCard>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  tabBar: {
    flexDirection: "row",
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: "center",
    borderRadius: BORDER_RADIUS.pill,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textLight,
    fontWeight: "bold",
  },
  activeTabText: {
    color: COLORS.white,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  podium: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.lightGray + "50",
  },
  podiumItem: {
    alignItems: "center",
    width: 100,
  },
  goldItem: {
    width: 130,
    marginTop: -SPACING.xl,
  },
  crown: {
    marginBottom: 4,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  goldAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderColor: COLORS.orange,
  },
  silverAvatar: {
    borderColor: COLORS.gray,
  },
  bronzeAvatar: {
    borderColor: COLORS.gray,
  },
  rankBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  goldBadge: { backgroundColor: COLORS.orange },
  silverBadge: { backgroundColor: COLORS.gray },
  bronzeBadge: { backgroundColor: COLORS.gray },
  rankText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  podiumName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  listContainer: {
    padding: SPACING.md,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  userListItem: {
    padding: SPACING.sm,
    backgroundColor: COLORS.lightGray,
    marginBottom: SPACING.sm,
  },
  placeholderAvatar: {
    justifyContent: "center",
    alignItems: "center",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rankNumber: {
    width: 30,
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textLight,
    textAlign: "center",
  },
  smallAvatar: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.pill,
    marginHorizontal: SPACING.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
  },
  userDept: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  scoreInfo: {
    alignItems: "flex-end",
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  gainPositive: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  gainNeutral: {
    fontSize: 10,
    color: COLORS.textLight,
  },
});
