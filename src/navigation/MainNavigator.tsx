import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { 
  standardTransition, 
  modalTransition, 
  bottomSheetTransition, 
  scaleFadeTransition,
  tabTransition
} from "../constants/transitions";
import { Home, Compass, Trophy, User as UserIcon } from "lucide-react-native";
import { COLORS } from "../constants/theme";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { createBlankStackNavigator } from "react-native-screen-transitions/blank-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
const Stack = createBlankStackNavigator();

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const Icon = options.tabBarIcon;

        return (
          <TouchableOpacity
            key={route.name}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            {Icon && <Icon color={isFocused ? COLORS.primary : COLORS.textLight} size={24} />}
            <Text style={[styles.tabLabel, { color: isFocused ? COLORS.primary : COLORS.textLight }]}>
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name='Activity' 
        component={HomeScreen} 
        options={{ tabBarIcon: (props: any) => <Home {...props} /> }}
      />
      <Tab.Screen 
        name='Discover' 
        component={DiscoverScreen} 
        options={{ tabBarIcon: (props: any) => <Compass {...props} /> }}
      />
      <Tab.Screen 
        name='Ranking' 
        component={LeaderboardScreen} 
        options={{ tabBarIcon: (props: any) => <Trophy {...props} /> }}
      />
      <Tab.Screen 
        name='Profile' 
        component={ProfileScreen} 
        options={{ tabBarIcon: (props: any) => <UserIcon {...props} /> }}
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
    <Stack.Navigator 
      screenOptions={{ 
        ...standardTransition,
      }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen name='Welcome' component={WelcomeScreen} />
          <Stack.Screen name='Auth' component={AuthScreen} options={modalTransition} />
        </>
      ) : (
        <>
          <Stack.Screen name='Main' component={TabNavigator} />
          <Stack.Screen
            name='Request'
            component={RequestScreen}
            options={modalTransition}
          />
          <Stack.Screen 
            name='Confirmation' 
            component={ConfirmationScreen} 
            options={scaleFadeTransition}
          />
          <Stack.Screen 
            name='EditProfile' 
            component={EditProfileScreen} 
            options={bottomSheetTransition} 
          />
          <Stack.Screen 
            name='UserDetail' 
            component={UserDetailScreen} 
            options={bottomSheetTransition} 
          />
        </>
      )}
    </Stack.Navigator>
  );
};
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
    // Position at bottom of screen
    position: 'relative',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
  },
});
