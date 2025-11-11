import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';

import SignInScreen from './src/screens/SignInScreen';
import { RootNavigator } from './src/navigation/RootNavigator';
import { darkTheme } from './src/theme/colors';
import { tokenCache } from './src/utils/tokenCache';

function AppNavigator() {
  const { isSignedIn } = useAuth();

  return (
    <NavigationContainer theme={darkTheme}>
      <StatusBar style="light" />
      {isSignedIn ? <RootNavigator /> : <SignInScreen />}
    </NavigationContainer>
  );
}

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
}

export default function App() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
