import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, Image, TouchableOpacity, Text, Alert } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { AppPicker } from "../components/AppPicker";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { useStore } from "../store/useStore";
import { fetchClient } from "../api/client";
import * as ImagePicker from "expo-image-picker";
import { Camera, User as UserIcon } from "lucide-react-native";
import Transition from "react-native-screen-transitions";

export const EditProfileScreen = ({ navigation }: any) => {
  const { currentUser, checkAuth } = useStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: currentUser?.name || "",
    phone: currentUser?.phone || "",
    department: currentUser?.department || "",
    faculty: currentUser?.faculty || "",
    year: currentUser?.year?.toString() || "",
  });

  const [skillsTeachInput, setSkillsTeachInput] = useState(currentUser?.skillsTeach?.join(", ") || "");
  const [skillsLearnInput, setSkillsLearnInput] = useState(currentUser?.skillsLearn?.join(", ") || "");
  const [avatar, setAvatar] = useState(currentUser?.avatar || "");

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setAvatar(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. Update basic profile + avatar
      await fetchClient(`/users/${currentUser?.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...form,
          year: parseInt(form.year) || 1,
          avatar,
        }),
      });

      // 2. Sync skills
      const teachArr = skillsTeachInput.split(",").map(s => s.trim()).filter(Boolean);
      const learnArr = skillsLearnInput.split(",").map(s => s.trim()).filter(Boolean);

      await fetchClient("/users/me/sync-skills", {
        method: "POST",
        body: JSON.stringify({
          skillsTeach: teachArr,
          skillsLearn: learnArr,
        })
      });
      
      await checkAuth(); // Refetch user
      navigation.goBack();
    } catch (error) {
      console.error("Failed to update profile", error);
      Alert.alert("Error", "Failed to update profile. " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.sheetContainer}>
        <View style={styles.sheetHeader}>
          <View style={styles.sheetIndicator} />
        </View>
        <Transition.ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.imagePickerSection}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarWrapper, styles.placeholderAvatar]}>
                  <UserIcon size={40} color={COLORS.textLight} />
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Camera size={16} color={COLORS.white} />
              </View>
            </TouchableOpacity>
            <Text style={styles.changeText}>Tap to change picture</Text>
          </View>

          <AppTextInput placeholder='Name' value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
          <AppTextInput placeholder='Phone' value={form.phone} onChangeText={(t) => setForm({ ...form, phone: t })} />
          <AppTextInput placeholder='Department' value={form.department} onChangeText={(t) => setForm({ ...form, department: t })} />
          <AppTextInput placeholder='Faculty' value={form.faculty} onChangeText={(t) => setForm({ ...form, faculty: t })} />
          <AppPicker 
            label="Year of Study" 
            value={form.year} 
            options={[
              { label: "Year 1", value: "1" },
              { label: "Year 2", value: "2" },
              { label: "Year 3", value: "3" },
              { label: "Year 4", value: "4" },
              { label: "Year 5", value: "5" },
              { label: "Year 6", value: "6" },
            ]} 
            onSelect={(v) => setForm({ ...form, year: v })} 
          />

          <AppTextInput 
            placeholder='Skills to Teach (comma separated)' 
            multiline 
            value={skillsTeachInput} 
            onChangeText={setSkillsTeachInput} 
            style={{ height: 80 }}
          />
          <AppTextInput 
            placeholder='Skills to Learn (comma separated)' 
            multiline 
            value={skillsLearnInput} 
            onChangeText={setSkillsLearnInput} 
            style={{ height: 80 }}
          />

          <AppButton title="Save Changes" onPress={handleSave} loading={loading} style={{ marginTop: SPACING.lg }} />
          <View style={{ height: 40 }} />
        </Transition.ScrollView>
      </View>
    </KeyboardAvoidingView>
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
  scrollContent: { padding: SPACING.md, gap: SPACING.sm, paddingBottom: 100 },
  imagePickerSection: {
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderAvatar: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  changeText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, backgroundColor: COLORS.lightGray, fontSize: 16,
  },
  textArea: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, backgroundColor: COLORS.lightGray, fontSize: 16,
    height: 100, textAlignVertical: "top", marginTop: SPACING.sm
  }
});
