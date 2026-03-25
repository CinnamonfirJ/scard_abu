import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home, Compass, Trophy, User } from "lucide-react-native";
import { COLORS } from "../constants/theme";

// Screens (Placeholder imports - will be created next)
import { HomeScreen } from "../screens/HomeScreen";
import { DiscoverScreen } from "../screens/DiscoverScreen";
import { LeaderboardScreen } from "../screens/LeaderboardScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { AuthScreen } from "../screens/AuthScreen";
import { RequestScreen } from "../screens/RequestScreen";
import { ConfirmationScreen } from "../screens/ConfirmationScreen";
import { useStore } from "../store/useStore";
import { EditProfileScreen } from "../screens/EditProfileScreen";
import { UserDetailScreen } from "../screens/UserDetailScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Tab.Screen
        name='Activity'
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name='Discover'
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Compass color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name='Ranking'
        component={LeaderboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name='Profile'
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const MainNavigator = () => {
  const { isAuthenticated, checkAuth } = useStore();

  React.useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name='Welcome' component={WelcomeScreen} />
          <Stack.Screen name='Auth' component={AuthScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name='Main' component={TabNavigator} />
          <Stack.Screen
            name='Request'
            component={RequestScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen name='Confirmation' component={ConfirmationScreen} />
          <Stack.Screen name='EditProfile' component={EditProfileScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name='UserDetail' component={UserDetailScreen} options={{ presentation: 'modal' }} />
        </>
      )}
    </Stack.Navigator>
  );
};
