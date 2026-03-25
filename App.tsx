import React, { useEffect, useRef } from "react";

import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MainNavigator } from "./src/navigation/MainNavigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useStore } from "./src/store/useStore";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.warn("Failed to get push token for push notification!");
      return;
    }
    // Note: ProjectId is needed for newer Expo versions.
    // If you don't have one set up in app.json, this might use a fallback.
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: "your-project-id" // This should ideally be read from Constants
    })).data;
  } else {
    console.warn("Must use physical device for Push Notifications");
  }

  return token;
}

export default function App() {
  const { updatePushToken, fetchRequests, isAuthenticated } = useStore();
  const notificationListener = useRef<Notifications.Subscription>(undefined);
  const responseListener = useRef<Notifications.Subscription>(undefined);

  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotificationsAsync().then(token => {
        if (token) updatePushToken(token);
      });

      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log("Notification received:", notification);
        fetchRequests(); // Refresh data when notification arrives
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log("Notification response:", response);
      });

      return () => {
        if (notificationListener.current) notificationListener.current.remove();
        if (responseListener.current) responseListener.current.remove();
      };
    }
  }, [isAuthenticated]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <MainNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
