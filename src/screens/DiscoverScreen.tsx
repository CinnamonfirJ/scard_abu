import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { AppHeader } from "../components/AppHeader";
import { AppCard } from "../components/AppCard";
import { AppBadge } from "../components/AppBadge";
import { AppButton } from "../components/AppButton";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { useStore } from "../store/useStore";
import { Search, SlidersHorizontal, User as UserIcon, X } from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";
import { User } from "../constants/types";

const TypedFlashList = FlashList as any;

export const DiscoverScreen = ({ navigation }: any) => {
  const { users, fetchUsers } = useStore();
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchUsers().finally(() => setLoading(false));
  }, []);

  const userList = users || [];
  const departments = Array.from(new Set(userList.map((u) => u.department).filter(Boolean)));
  const faculties = Array.from(new Set(userList.map((u) => u.faculty).filter(Boolean)));
  const years = [1, 2, 3, 4, 5];

  const cleanSearch = search.toLowerCase().trim();
  const filteredUsers = useMemo(() => {
    return userList.filter((user) => {
      const matchSearch =
        user.name?.toLowerCase().includes(cleanSearch) ||
        (user.skillsTeach || []).some((s: string) =>
          s.toLowerCase().includes(cleanSearch),
        ) ||
        user.department?.toLowerCase().includes(cleanSearch);
      const matchDept = !selectedDept || user.department === selectedDept;
      const matchYear = !selectedYear || user.year === selectedYear;
      const matchFaculty = !selectedFaculty || user.faculty === selectedFaculty;
      return matchSearch && matchDept && matchYear && matchFaculty;
    });
  }, [userList, search, selectedDept, selectedYear, selectedFaculty]);

  const resetFilters = () => {
    setSelectedDept(null);
    setSelectedYear(null);
    setSelectedFaculty(null);
  };

  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("UserDetail", { userId: item.id })}
    >
      <AppCard style={styles.userCard} variant='outlined'>
        <View style={styles.userRow}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholderAvatar]}>
              <UserIcon size={30} color={COLORS.textLight} />
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userDetail}>
              {item.department} • Year {item.year}
            </Text>
            <View style={styles.skillsTagContainer}>
              {(item.skillsTeach || []).map((skill: string, idx: number) => (
                <View key={idx} style={styles.skillTag}>
                  <AppBadge label={skill} variant='secondary' />
                </View>
              ))}
            </View>
          </View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader title='Discover Peers' />
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color={COLORS.textLight} size={20} />
          <TextInput
            placeholder='Search skills or names...'
            style={styles.input}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setIsFilterVisible(true)}
        >
          <SlidersHorizontal color={COLORS.primary} size={24} />
          {(selectedYear || selectedFaculty) && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>

      <View style={styles.deptFilter}>
        <FlatList
          data={["All", ...departments]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedDept(item === "All" ? null : item)}
              style={[
                styles.deptChip,
                (selectedDept === item || (item === "All" && !selectedDept)) &&
                  styles.deptChipActive,
              ]}
            >
              <Text
                style={[
                  styles.deptText,
                  (selectedDept === item ||
                    (item === "All" && !selectedDept)) &&
                    styles.deptTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={{ flex: 1 }}>
        <TypedFlashList
          data={filteredUsers}
          renderItem={renderItem}
          estimatedItemSize={100}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                {loading ? "Loading peers..." : "No matching peers found"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {!loading && "Try adjusting your search or filters."}
              </Text>
            </View>
          }
        />
      </View>

      <Modal
        visible={isFilterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Peers</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                <X color={COLORS.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.filterLabel}>Study Year</Text>
              <View style={styles.filterGrid}>
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    onPress={() => setSelectedYear(selectedYear === year ? null : year)}
                    style={[
                      styles.filterChip,
                      selectedYear === year && styles.filterChipActive,
                    ]}
                  >
                    <Text style={[styles.filterChipText, selectedYear === year && styles.filterChipTextActive]}>
                      Year {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterLabel}>Faculty</Text>
              <View style={styles.filterGrid}>
                {faculties.map((faculty) => (
                  <TouchableOpacity
                    key={faculty}
                    onPress={() => setSelectedFaculty(selectedFaculty === faculty ? null : faculty)}
                    style={[
                      styles.filterChip,
                      selectedFaculty === faculty && styles.filterChipActive,
                    ]}
                  >
                    <Text style={[styles.filterChipText, selectedFaculty === faculty && styles.filterChipTextActive]}>
                      {faculty}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <AppButton 
                title="Reset All" 
                variant="ghost" 
                onPress={resetFilters} 
                style={{ flex: 1, marginRight: SPACING.md }}
              />
              <AppButton 
                title="Show Results" 
                onPress={() => setIsFilterVisible(false)} 
                style={{ flex: 2 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    height: 50,
  },
  input: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 16,
    color: COLORS.text,
  },
  filterButton: {
    marginLeft: SPACING.md,
    backgroundColor: COLORS.primary + "10",
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  modalBody: {
    marginBottom: SPACING.lg,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  filterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: SPACING.lg,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary + "20",
    borderColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.textLight,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: COLORS.primary,
  },
  modalFooter: {
    flexDirection: "row",
    paddingBottom: SPACING.xl,
  },
  deptFilter: {
    paddingBottom: SPACING.md,
  },
  deptChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginLeft: SPACING.md,
  },
  deptChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  deptText: {
    color: COLORS.textLight,
    fontWeight: "bold",
  },
  deptTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: SPACING.md,
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
    borderRadius: BORDER_RADIUS.pill,
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
  },
  skillsTagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: SPACING.sm,
  },
  skillTag: {
    marginRight: 4,
    marginBottom: 4,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
  },
});
