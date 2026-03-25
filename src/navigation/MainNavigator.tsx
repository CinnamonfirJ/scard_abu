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

const TabStack = createBlankStackNavigator();
const Stack = createBlankStackNavigator();

const CustomTabBar = ({ navigation, focusedIndex }: any) => {
  if (focusedIndex === undefined) return null;

  const tabs = [
    { name: 'Activity', icon: Home },
    { name: 'Discover', icon: Compass },
    { name: 'Ranking', icon: Trophy },
    { name: 'Profile', icon: UserIcon },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab, index) => {
        const isFocused = focusedIndex === index;
        const Icon = tab.icon;

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => navigation.navigate(tab.name)}
            style={styles.tabItem}
          >
            <Icon color={isFocused ? COLORS.primary : COLORS.textLight} size={24} />
            <Text style={[styles.tabLabel, { color: isFocused ? COLORS.primary : COLORS.textLight }]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const TabNavigator = () => {
  return (
    <TabStack.Navigator
      screenOptions={{
        ...tabTransition,
        overlay: (props) => <CustomTabBar {...props} />,
        overlayShown: true,
      }}
    >
      <TabStack.Screen name='Activity' component={HomeScreen} />
      <TabStack.Screen name='Discover' component={DiscoverScreen} />
      <TabStack.Screen name='Ranking' component={LeaderboardScreen} />
      <TabStack.Screen name='Profile' component={ProfileScreen} />
    </TabStack.Navigator>
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
    height: 70,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    // Position at bottom of screen
    position: 'absolute',
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
