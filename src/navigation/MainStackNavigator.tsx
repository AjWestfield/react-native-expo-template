import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ResponsiveNavigator } from './ResponsiveNavigator';

const Stack = createNativeStackNavigator();

export const MainStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={ResponsiveNavigator} />
    </Stack.Navigator>
  );
};
