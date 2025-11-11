import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GenerateStackNavigator } from './GenerateStackNavigator';
import ExploreScreen from '../screens/ExploreScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TemplatesScreen from '../screens/TemplatesScreen';
import { colors } from '../theme/colors';
import { SIDEBAR } from '../constants/responsive';

const Tab = createBottomTabNavigator();

// Custom sidebar component that renders on the left
const SidebarTabBar = ({ state, navigation }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandAnim] = useState(new Animated.Value(SIDEBAR.collapsedWidth));
  const insets = useSafeAreaInsets();

  const handleMouseEnter = () => {
    setIsExpanded(true);
    Animated.timing(expandAnim, {
      toValue: SIDEBAR.expandedWidth,
      duration: SIDEBAR.transitionDuration,
      useNativeDriver: false,
    }).start();
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
    Animated.timing(expandAnim, {
      toValue: SIDEBAR.collapsedWidth,
      duration: SIDEBAR.transitionDuration,
      useNativeDriver: false,
    }).start();
  };

  const getIconName = (routeName: string, focused: boolean): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      Generate: focused ? 'videocam' : 'videocam-outline',
      Templates: focused ? 'albums' : 'albums-outline',
      Gallery: focused ? 'grid' : 'grid-outline',
      Profile: focused ? 'person-circle' : 'person-circle-outline',
    };
    return icons[routeName] ?? 'help-outline';
  };

  const getLabel = (routeName: string): string => {
    const labels = {
      Generate: 'Generate',
      Templates: 'Templates',
      Gallery: 'Gallery',
      Profile: 'Profile',
    };
    return labels[routeName as keyof typeof labels] || routeName;
  };

  return (
    <Animated.View
      style={[
        styles.sidebar,
        {
          width: expandAnim,
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 20),
        },
      ]}
      // @ts-ignore - onMouseEnter/Leave work on web
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFillObject} />

      <View style={styles.sidebarContent}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const iconName = getIconName(route.name, isFocused);
          const label = getLabel(route.name);

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

          return (
            <Pressable key={route.key} onPress={onPress}>
              {({ pressed, hovered }: any) => {
                const isActive = isFocused || pressed || hovered;

                return (
                  <View style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}>
                    <View
                      style={[styles.iconContainer, isActive && styles.iconContainerActive]}
                    >
                      <Ionicons
                        name={iconName}
                        size={26}
                        color={isFocused ? colors.text.primary : colors.text.secondary}
                      />
                    </View>

                    {isExpanded && (
                      <Text
                        style={[
                          styles.sidebarLabel,
                          { color: isFocused ? colors.text.primary : colors.text.secondary },
                        ]}
                        numberOfLines={1}
                      >
                        {label}
                      </Text>
                    )}
                  </View>
                );
              }}
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
};

export const SidebarNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <SidebarTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
      sceneContainerStyle={{
        marginLeft: SIDEBAR.collapsedWidth, // Push content right by sidebar width
      }}
    >
      <Tab.Screen name="Generate" component={GenerateStackNavigator} />
      <Tab.Screen name="Templates" component={TemplatesScreen} />
      <Tab.Screen name="Gallery" component={ExploreScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute' as any,
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRightWidth: 1,
    borderRightColor: colors.glass.border,
    zIndex: SIDEBAR.zIndex,
    overflow: 'hidden',
  },
  sidebarContent: {
    flex: 1,
    paddingVertical: 20,
    gap: 4,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 16,
    gap: 14,
    minHeight: 56,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sidebarItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sidebarLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
