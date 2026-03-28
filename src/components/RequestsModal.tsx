import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { 
  X as LucideX, 
  CheckCircle2 as LucideCheck, 
  XCircle as LucideXCircle, 
  Clock as LucideClock, 
  ArrowUpRight as LucideArrowUp, 
  ArrowDownLeft as LucideArrowDown,
  ClipboardCheck as LucideClipboard,
} from "lucide-react-native";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { useStore, Request, Session } from "../store/useStore";
import { AppBadge } from "./AppBadge";
import { AppButton } from "./AppButton";
import { AppCard } from "./AppCard";

const X = LucideX as any;
const CheckCircle2 = LucideCheck as any;
const XCircle = LucideXCircle as any;
const Clock = LucideClock as any;
const ArrowUpRight = LucideArrowUp as any;
const ArrowDownLeft = LucideArrowDown as any;
const ClipboardCheck = LucideClipboard as any;

interface RequestsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const RequestsModal = ({ isVisible, onClose }: RequestsModalProps) => {
  const navigation = useNavigation<any>();
  const { requests, sessions, currentUser, respondToRequest, fetchRequests, fetchSessions } = useStore();
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch fresh data every time the modal opens
  useEffect(() => {
    if (isVisible) {
      setLoading(true);
      Promise.all([fetchRequests(), fetchSessions()]).finally(() => setLoading(false));
    }
  }, [isVisible]);

  const receivedRequests = (requests || []).filter(r => r.receiverId === currentUser?.id);
  const sentRequests = (requests || []).filter(r => r.senderId === currentUser?.id);

  const handleResponse = async (requestId: number, status: "accepted" | "rejected") => {
    Alert.alert(
      `${status === "accepted" ? "Accept" : "Decline"} Request`,
      `Are you sure you want to ${status} this request?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: async () => {
            setProcessingId(requestId);
            try {
              await respondToRequest(requestId, status);
            } catch (error) {
              Alert.alert("Error", "Failed to update request status");
            } finally {
              setProcessingId(null);
            }
          }
        }
      ]
    );
  };

  const handleConfirmSession = (requestId: number) => {
    // Find the session that was created for this accepted request
    const session = (sessions || []).find((s: Session) => s.requestId === requestId);
    if (!session) {
      Alert.alert("Not Ready", "The session is still being set up. Please try again in a moment.");
      return;
    }
    onClose();
    // Small delay to allow modal to close before navigating
    setTimeout(() => {
      navigation.navigate("ConfirmSession", { sessionId: session.id });
    }, 300);
  };

  const getStatusVariant = (status: string): any => {
    if (status === "accepted") return "success";
    if (status === "rejected") return "gray";
    return "orange";
  };

  const renderRequestItem = ({ item }: { item: Request }) => {
    const isReceived = activeTab === "received";
    const otherPartyName = isReceived ? item.senderName : item.receiverName;
    const otherPartyAvatar = isReceived ? item.senderAvatar : item.receiverAvatar;
    
    // Check if this accepted request already has a session confirmed by current user
    const linkedSession = item.status === "accepted" 
      ? (sessions || []).find((s: Session) => s.requestId === item.id) 
      : null;
    const alreadyConfirmed = linkedSession 
      ? (linkedSession.tutorId === currentUser?.id ? linkedSession.confirmedByTutor : linkedSession.confirmedByLearner)
      : false;

    return (
      <AppCard style={styles.card} variant="outlined">
        {/* Header: Avatar + Name + Status Badge */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            {otherPartyAvatar ? (
              <Image source={{ uri: otherPartyAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.placeholderAvatar}>
                <Clock size={20} color={COLORS.textLight} />
              </View>
            )}
            <View>
              <Text style={styles.userName}>{otherPartyName || "Anonymous"}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
          <AppBadge 
            label={item.status.toUpperCase()} 
            variant={getStatusVariant(item.status)} 
          />
        </View>

        {/* Skill name */}
        {item.skillName && (
          <View style={styles.skillRow}>
            <Text style={styles.skillLabel}>Skill: </Text>
            <Text style={styles.skillValue}>{item.skillName}</Text>
          </View>
        )}

        {/* Message */}
        <Text style={styles.message} numberOfLines={2}>
          {item.message || "No message provided."}
        </Text>

        {/* Direction tag */}
        <View style={styles.typeContainer}>
          <View style={styles.typeBadge}>
            {isReceived ? (
              <ArrowDownLeft size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
            ) : (
              <ArrowUpRight size={16} color={COLORS.secondary} style={{ marginRight: 4 }} />
            )}
            <Text style={styles.typeText}>
              {item.type === "learn" ? "Wants to Learn" : "Skill Exchange"}
            </Text>
          </View>
        </View>

        {/* Accept / Decline — only for received pending requests */}
        {isReceived && item.status === "pending" && (
          <View style={styles.actions}>
            <TouchableOpacity 
              onPress={() => !processingId && handleResponse(item.id, "rejected")}
              style={[styles.actionButton, styles.declineButton]}
              disabled={!!processingId}
            >
              {processingId === item.id ? (
                <ActivityIndicator size="small" color={COLORS.red} />
              ) : (
                <>
                  <XCircle size={20} color={COLORS.red} />
                  <Text style={[styles.actionText, { color: COLORS.red }]}>Decline</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => !processingId && handleResponse(item.id, "accepted")}
              style={[styles.actionButton, styles.acceptButton]}
              disabled={!!processingId}
            >
              {processingId === item.id ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <>
                  <CheckCircle2 size={20} color={COLORS.primary} />
                  <Text style={[styles.actionText, { color: COLORS.primary }]}>Accept</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Confirm Session CTA — visible once accepted, to both parties */}
        {item.status === "accepted" && !alreadyConfirmed && (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => handleConfirmSession(item.id)}
          >
            <ClipboardCheck size={18} color={COLORS.white} />
            <Text style={styles.confirmButtonText}>Confirm Session Completion</Text>
          </TouchableOpacity>
        )}

        {/* Already confirmed label */}
        {item.status === "accepted" && alreadyConfirmed && (
          <View style={styles.confirmedBadge}>
            <CheckCircle2 size={16} color={COLORS.primary} />
            <Text style={styles.confirmedText}>
              {linkedSession?.status === "completed" ? "Session Completed ✓" : "Your confirmation submitted. Waiting for partner."}
            </Text>
          </View>
        )}
      </AppCard>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.modalHeader}>
            <Text style={styles.title}>Your Requests</Text>
            <TouchableOpacity onPress={onClose}>
              <X color={COLORS.text} size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity 
              onPress={() => setActiveTab("received")}
              style={[styles.tab, activeTab === "received" && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === "received" && styles.activeTabText]}>
                Received ({receivedRequests.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveTab("sent")}
              style={[styles.tab, activeTab === "sent" && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === "sent" && styles.activeTabText]}>
                Sent ({sentRequests.length})
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading requests...</Text>
            </View>
          ) : (
            <FlatList
              data={activeTab === "received" ? receivedRequests : sentRequests}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderRequestItem}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Clock size={48} color={COLORS.border} />
                  <Text style={styles.emptyText}>No {activeTab} requests yet.</Text>
                </View>
              }
              onRefresh={() => { fetchRequests(); fetchSessions(); }}
              refreshing={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    height: "88%",
    padding: SPACING.md,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  tabs: {
    flexDirection: "row",
    marginTop: SPACING.lg,
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: BORDER_RADIUS.sm,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textLight,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  list: {
    paddingVertical: SPACING.lg,
  },
  card: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  placeholderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  userName: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.text,
  },
  date: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  skillRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  skillLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  skillValue: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  message: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: SPACING.sm,
    fontStyle: "italic",
  },
  typeContainer: {
    marginTop: SPACING.md,
    flexDirection: "row",
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },
  actions: {
    flexDirection: "row",
    marginTop: SPACING.lg,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    gap: 8,
  },
  acceptButton: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  },
  declineButton: {
    borderColor: COLORS.red,
    backgroundColor: COLORS.red + "10",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 12,
    marginTop: SPACING.md,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 14,
  },
  confirmedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary + "10",
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  confirmedText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
    flexShrink: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  empty: {
    alignItems: "center",
    marginTop: 100,
    opacity: 0.5,
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.textLight,
  },
});
