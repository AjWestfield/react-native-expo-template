import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';

import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TemplatesScreen from './src/screens/TemplatesScreen';
import { BillingScreen } from './src/screens/BillingScreen';
import { darkTheme, colors } from './src/theme/colors';
import { STRIPE_CONFIG } from './src/config/stripe.config';
import { StripeAgent } from './src/services/stripeAgent';

const Tab = createBottomTabNavigator();

function Navigation() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Generate') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'Templates') {
            iconName = focused ? 'albums' : 'albums-outline';
          } else if (route.name === 'Gallery') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.text.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderTopColor: colors.glass.border,
          borderTopWidth: 1,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 10,
          height: 60 + Math.max(insets.bottom, 10),
          backdropFilter: 'blur(20px)',
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Generate"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Generate',
        }}
      />
      <Tab.Screen
        name="Templates"
        component={TemplatesScreen}
        options={{
          tabBarLabel: 'Templates',
        }}
      />
      <Tab.Screen
        name="Gallery"
        component={ExploreScreen}
        options={{
          tabBarLabel: 'Gallery',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
      <Tab.Screen
        name="Billing"
        component={BillingScreen}
        options={{
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  // Initialize Stripe Agent
  React.useEffect(() => {
    StripeAgent.initialize(STRIPE_CONFIG.apiBaseUrl, STRIPE_CONFIG.publishableKey);
  }, []);

  return (
    <SafeAreaProvider>
      <StripeProvider
        publishableKey={STRIPE_CONFIG.publishableKey}
        merchantIdentifier={STRIPE_CONFIG.merchantIdentifier}
        urlScheme={STRIPE_CONFIG.urlScheme}
      >
        <NavigationContainer theme={darkTheme}>
          <StatusBar style="light" />
          <Navigation />
        </NavigationContainer>
      </StripeProvider>
    </SafeAreaProvider>
  );
}
