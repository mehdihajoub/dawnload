import React, { createContext, useContext, useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StyleSheet, Animated, View } from 'react-native';

import { theme } from '../theme';
import { RootStackParamList, MainTabParamList } from '../data/types';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import PlugScreen from '../screens/PlugScreen';
import LaMapScreen from '../screens/LaMapScreen';
import SessionsScreen from '../screens/SessionsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateSessionScreen from '../screens/CreateSessionScreen';
import ChatScreen from '../screens/ChatScreen';

interface NavbarContextType {
  setNavbarOpacity: (opacity: number) => void;
  setNavbarTranslateY: (translateY: number) => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MainTabNavigator() {
  const navbarOpacity = useRef(new Animated.Value(1)).current;
  const navbarTranslateY = useRef(new Animated.Value(0)).current;

  const setNavbarOpacity = (opacity: number) => {
    navbarOpacity.setValue(opacity);
  };

  const setNavbarTranslateY = (translateY: number) => {
    navbarTranslateY.setValue(translateY);
  };

  const CustomTabBar = (props: any) => {
    const { BottomTabBar } = require('@react-navigation/bottom-tabs');
    
    return (
      <Animated.View
        style={[
          {
            opacity: navbarOpacity,
            transform: [{ translateY: navbarTranslateY }],
          },
        ]}
      >
        <BottomTabBar {...props} />
      </Animated.View>
    );
  };

  return (
    <NavbarContext.Provider value={{ setNavbarOpacity, setNavbarTranslateY }}>
      <Tab.Navigator
        tabBar={CustomTabBar}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Plug') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'LaMap') {
              iconName = focused ? 'map' : 'map-outline';
            } else if (route.name === 'Sessions') {
              iconName = focused ? 'trending-up' : 'trending-up-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.accent,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            height: 85,
            paddingBottom: 10,
            paddingTop: 10,
            paddingHorizontal: 20,
          },
          tabBarBackground: () => (
            <BlurView tint="dark" intensity={100} style={StyleSheet.absoluteFill} />
          ),
          tabBarLabelStyle: {
            fontSize: theme.typography.sizes.xs,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.border,
            borderBottomWidth: 1,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontSize: theme.typography.sizes.lg,
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'Discover',
            headerShown: false,
          }}
        />
        <Tab.Screen 
          name="Plug" 
          component={PlugScreen}
          options={{
            title: 'Plugs',
            headerShown: false,
          }}
        />
        <Tab.Screen 
          name="LaMap" 
          component={LaMapScreen}
          options={{
            title: 'La Map',
            headerShown: false,
          }}
        />
        <Tab.Screen 
          name="Sessions" 
          component={SessionsScreen}
          options={{
            title: 'Sessions',
            headerShown: false,
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            title: 'Profile',
            headerShown: false,
          }}
        />
      </Tab.Navigator>
    </NavbarContext.Provider>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.primary,
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: 'normal',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: 'bold',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '900',
          },
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontSize: theme.typography.sizes.lg,
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Main" 
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
          options={({ route }) => ({
            title: `${route.params.user.name} ${route.params.user.surname}`,
            headerBackTitleVisible: false,
          })}
        />
        <Stack.Screen 
          name="CreateSession" 
          component={CreateSessionScreen}
          options={{
            title: 'Create Session',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 