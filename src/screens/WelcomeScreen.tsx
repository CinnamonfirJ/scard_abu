import React from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../components/AppButton";
import { COLORS, SPACING } from "../constants/theme";

const { width } = Dimensions.get("window");

export const WelcomeScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/welcome.png")}
            style={styles.image}
            resizeMode='cover'
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>
            Welcome to <Text style={styles.highlight}>Scard ABU</Text>
          </Text>
          <Text style={styles.subtitle}>
            Learn and teach skills with students around you. Build a better
            campus together.
          </Text>
        </View>

        <View style={styles.footer}>
          <AppButton
            title='Get Started'
            onPress={() => navigation.navigate("Auth", { isLogin: false })}
            size='lg'
            style={styles.button}
          />
          <Text style={styles.loginText}>
            Already have an account?{" "}
            <Text style={styles.loginLink} onPress={() => navigation.navigate("Auth", { isLogin: true })}>Log In</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: "space-between",
    alignItems: "center",
  },
  imageContainer: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: SPACING.lg,
    overflow: "hidden",
    marginTop: SPACING.xl,
    backgroundColor: COLORS.lightGray,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
  },
  highlight: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: SPACING.md,
    lineHeight: 26,
  },
  footer: {
    width: "100%",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  button: {
    width: "100%",
    marginBottom: SPACING.md,
  },
  loginText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
});
