import React, { useEffect, useRef } from "react";

import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MainNavigator } from "./src/navigation/MainNavigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { useStore } from "./src/store/useStore";
import Toast from "react-native-toast-message";
import { NavigationContainerRef } from "@react-navigation/native";

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
    // Get the project ID from Constants
    const projectId = 
      Constants.expoConfig?.extra?.eas?.projectId ?? 
      Constants.easConfig?.projectId;

    token = (await Notifications.getExpoPushTokenAsync({
      projectId
    })).data;
  } else {
    console.warn("Must use physical device for Push Notifications");
  }

  return token;
}

export default function App() {
  const { updatePushToken, fetchRequests, isAuthenticated, fetchCurrentUser } = useStore();
  const notificationListener = useRef<Notifications.Subscription>(undefined);
  const responseListener = useRef<Notifications.Subscription>(undefined);
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotificationsAsync().then(token => {
        if (token) updatePushToken(token);
      });

      // Handle foreground notifications
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log("Notification received:", notification);
        
        const data = notification.request.content.data;
        
        // Refresh relevant data based on context
        fetchRequests();
        if (data?.screen === "Leaderboard" || data?.screen === "Sessions") {
          fetchCurrentUser?.(); // Refresh XP/Score
        }

        // Show a local toast if user is already in the app
        Toast.show({
          type: 'info',
          text1: notification.request.content.title || 'Notification',
          text2: notification.request.content.body || '',
          onPress: () => {
            if (data?.screen) {
              navigationRef.current?.navigate(data.screen, data);
            }
          }
        });
      });

      // Handle notification taps (background/quit state)
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log("Notification response received:", response);
        const data = response.notification.request.content.data;
        
        if (data?.screen) {
          // Delay navigation slightly to ensure app is ready
          setTimeout(() => {
            navigationRef.current?.navigate(data.screen, data);
          }, 500);
        }
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
        <NavigationContainer ref={navigationRef}>
          <StatusBar style="dark" />
          <MainNavigator />
        </NavigationContainer>
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
