import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { AppCard } from "../components/AppCard";
import { AppBadge } from "../components/AppBadge";
import { AppButton } from "../components/AppButton";
import { Skeleton } from "../components/Skeleton";
import { fetchClient } from "../api/client";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { Session, useStore } from "../store/useStore";
import { MessageCircle, Phone, User as UserIcon, BookOpen, GraduationCap } from "lucide-react-native";

export const SessionsScreen = ({ navigation }: any) => {
  const { currentUser } = useStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSessions = async () => {
    try {
      const data = await fetchClient("/sessions");
      setSessions(data);
    } catch (error) {
      console.error("Failed to load sessions", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadSessions();
  };

  const renderSkeletons = () => (
    <View style={styles.list}>
      {[1, 2, 3].map(i => (
        <AppCard key={i} style={styles.card}>
           <Skeleton width={150} height={20} style={{ marginBottom: 10 }} />
           <Skeleton width={100} height={15} style={{ marginBottom: 15 }} />
           <Skeleton width="100%" height={40} borderRadius={8} />
        </AppCard>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader title="My Sessions" />
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {loading ? renderSkeletons() : (
          sessions.length === 0 ? (
             <Text style={styles.emptyText}>No active sessions</Text>
          ) : (
            sessions.map(session => {
              const isTutor = currentUser?.id === session.tutorId;
              const otherName = isTutor ? session.learnerName : session.tutorName;
              const otherPhone = isTutor ? session.learnerPhone : session.tutorPhone;
              
              return (
                <AppCard key={session.id} style={styles.card}>
                  <View style={styles.headerRow}>
                     <View>
                        <Text style={styles.skillTitle}>{session.skillName || "New Skill"}</Text>
                        <View style={styles.roleContainer}>
                           {isTutor ? <GraduationCap size={14} color={COLORS.primary} /> : <BookOpen size={14} color={COLORS.secondary} />}
                           <Text style={[styles.roleText, { color: isTutor ? COLORS.primary : COLORS.secondary }]}>
                              {isTutor ? "You are the Tutor" : "You are the Learner"}
                           </Text>
                        </View>
                     </View>
                     <AppBadge label={session.status} variant={session.status === 'completed' ? 'success' : 'orange'} />
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.partnerInfo}>
                     <View style={styles.partnerHeader}>
                        <UserIcon size={16} color={COLORS.textLight} />
                        <Text style={styles.partnerName}>Partner: {otherName}</Text>
                     </View>
                     
                     {session.status === 'scheduled' && otherPhone && (
                        <View style={styles.contactActions}>
                           <TouchableOpacity 
                             style={styles.contactItem}
                             onPress={() => alert(`Call ${otherPhone}`)}
                           >
                              <Phone size={16} color={COLORS.primary} />
                              <Text style={styles.contactText}>{otherPhone}</Text>
                           </TouchableOpacity>
                           <AppButton 
                             title="WhatsApp"
                             variant="outline"
                             onPress={() => {
                                alert(`Opening WhatsApp for ${otherPhone}`);
                             }}
                             style={styles.whatsappMiniButton}
                             icon={<MessageCircle size={16} color={COLORS.primary} />}
                           />
                        </View>
                     )}
                  </View>

                  <Text style={styles.sub}>
                     {session.status === 'completed' ? 'This session is finished and scored.' : 'Awaiting confirmation from both parties.'}
                  </Text>
                  
                  {session.status === 'scheduled' && (
                     <AppButton 
                       title="Confirm Completion" 
                       onPress={() => navigation.navigate("ConfirmSession", { sessionId: session.id })}
                       style={{ marginTop: SPACING.md }} 
                     />
                  )}
                </AppCard>
              );
            })
          )
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: SPACING.md },
  list: { gap: SPACING.md },
  card: { padding: SPACING.md, marginBottom: SPACING.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  skillTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, flex: 1, marginRight: SPACING.sm },
  roleContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  roleText: { fontSize: 12, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md, opacity: 0.5 },
  partnerInfo: { marginBottom: SPACING.md },
  partnerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm },
  partnerName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  contactActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.lightGray, padding: SPACING.sm, borderRadius: BORDER_RADIUS.md, marginTop: SPACING.xs },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  contactText: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  whatsappMiniButton: { height: 32, paddingHorizontal: SPACING.sm },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  sub: { fontSize: 14, color: COLORS.textLight, lineHeight: 20 },
  emptyText: { textAlign: 'center', color: COLORS.textLight, marginTop: SPACING.xl }
});
