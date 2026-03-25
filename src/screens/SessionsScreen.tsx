import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { AppCard } from "../components/AppCard";
import { AppBadge } from "../components/AppBadge";
import { AppButton } from "../components/AppButton";
import { Skeleton } from "../components/Skeleton";
import { fetchClient } from "../api/client";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { Session } from "../store/useStore";

export const SessionsScreen = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await fetchClient("/sessions");
        setSessions(data);
      } catch (error) {
        console.error("Failed to load sessions", error);
      } finally {
        setLoading(false);
      }
    };
    loadSessions();
  }, []);

  const confirmSession = async (id: number) => {
    try {
      await fetchClient(`/sessions/${id}/confirm`, { method: 'PATCH' });
      // update state optimistic
      setSessions(sessions.map(s => s.id === id ? { ...s, status: 'completed' } : s));
    } catch(err) {
      console.error(err);
    }
  }

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
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? renderSkeletons() : (
          sessions.length === 0 ? (
             <Text style={styles.emptyText}>No active sessions</Text>
          ) : (
            sessions.map(session => (
              <AppCard key={session.id} style={styles.card}>
                <View style={styles.headerRow}>
                   <Text style={styles.title}>Session #{session.id}</Text>
                   <AppBadge label={session.status} variant={session.status === 'completed' ? 'success' : 'orange'} />
                </View>
                <Text style={styles.sub}>
                   {session.status === 'completed' ? 'This session is finished and scored.' : 'Awaiting confirmation.'}
                </Text>
                {session.status === 'scheduled' && (
                   <AppButton 
                     title="Confirm Completion" 
                     onPress={() => confirmSession(session.id)}
                     style={{ marginTop: SPACING.md }} 
                   />
                )}
              </AppCard>
            ))
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  sub: { fontSize: 14, color: COLORS.textLight },
  emptyText: { textAlign: 'center', color: COLORS.textLight, marginTop: SPACING.xl }
});
