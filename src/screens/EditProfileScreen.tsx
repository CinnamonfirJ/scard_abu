import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, Image, TouchableOpacity, Text, Alert } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { AppButton } from "../components/AppButton";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { useStore } from "../store/useStore";
import { fetchClient } from "../api/client";
import * as ImagePicker from "expo-image-picker";
import { Camera, User as UserIcon } from "lucide-react-native";

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
      <AppHeader title='Edit Profile' showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.imagePickerSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.placeholderAvatar}>
                <UserIcon size={40} color={COLORS.textLight} />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Camera size={16} color={COLORS.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.changeText}>Tap to change picture</Text>
        </View>

        <TextInput style={styles.input} placeholder='Name' value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
        <TextInput style={styles.input} placeholder='Phone' value={form.phone} onChangeText={(t) => setForm({ ...form, phone: t })} />
        <TextInput style={styles.input} placeholder='Department' value={form.department} onChangeText={(t) => setForm({ ...form, department: t })} />
        <TextInput style={styles.input} placeholder='Faculty' value={form.faculty} onChangeText={(t) => setForm({ ...form, faculty: t })} />
        <TextInput style={styles.input} placeholder='Year' value={form.year} keyboardType="numeric" onChangeText={(t) => setForm({ ...form, year: t })} />

        <TextInput 
          style={styles.textArea} 
          placeholder='Skills to Teach (comma separated)' 
          multiline 
          value={skillsTeachInput} 
          onChangeText={setSkillsTeachInput} 
        />
        <TextInput 
          style={styles.textArea} 
          placeholder='Skills to Learn (comma separated)' 
          multiline 
          value={skillsLearnInput} 
          onChangeText={setSkillsLearnInput} 
        />

        <AppButton title={loading ? "Saving..." : "Save Changes"} onPress={handleSave} style={{ marginTop: SPACING.lg }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { padding: SPACING.md, gap: SPACING.sm },
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
    width: 100,
    height: 100,
    borderRadius: 50,
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
