import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Modal,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useOAuth, useSignIn } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import { colors, typography } from '../theme/colors';
import { GlassButton, GoogleIcon } from '../components';

WebBrowser.maybeCompleteAuthSession();

type Provider = 'google' | 'apple';

const TERMS_URL = 'https://example.com/terms';
const PRIVACY_URL = 'https://example.com/privacy';

export default function SignInScreen() {
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: 'oauth_apple' });
  const { signIn, setActive, isLoaded } = useSignIn();

  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [oauthError, setOauthError] = useState('');
  const [showEmailSheet, setShowEmailSheet] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const handleOAuth = async (provider: Provider) => {
    try {
      setLoadingProvider(provider);
      setOauthError('');

      const start = provider === 'google' ? startGoogleOAuth : startAppleOAuth;
      const { createdSessionId, setActive: setActiveOAuth } = await start();

      if (createdSessionId) {
        await setActiveOAuth?.({ session: createdSessionId });
      }
    } catch (err: any) {
      setOauthError(err.errors?.[0]?.message || 'Sign in failed');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleEmailSubmit = async () => {
    if (!isLoaded) return;

    try {
      setEmailLoading(true);
      setEmailError('');

      const completeSignIn = await signIn.create({
        identifier: email.trim(),
        password,
      });

      await setActive({ session: completeSignIn.createdSessionId });
      closeEmailSheet();
    } catch (err: any) {
      setEmailError(err.errors?.[0]?.message || 'Sign in failed');
    } finally {
      setEmailLoading(false);
    }
  };

  const closeEmailSheet = () => {
    setShowEmailSheet(false);
    setEmail('');
    setPassword('');
    setEmailError('');
    setEmailLoading(false);
  };

  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      // ignore
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.badge}>
            <Ionicons name="finger-print-outline" size={32} color={colors.text.primary} />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <View style={styles.buttons}>
            <GlassButton
              title="Continue with Apple"
              onPress={() => handleOAuth('apple')}
              size="large"
              loading={loadingProvider === 'apple'}
              leftIcon={<Ionicons name="logo-apple" size={20} color={colors.text.primary} />}
              style={styles.buttonSpacing}
            />
            <GlassButton
              title="Continue with Google"
              onPress={() => handleOAuth('google')}
              size="large"
              loading={loadingProvider === 'google'}
              leftIcon={<GoogleIcon size={20} />}
              style={styles.buttonSpacing}
            />
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <GlassButton
            title="Continue with Email"
            onPress={() => setShowEmailSheet(true)}
            size="large"
            leftIcon={<Ionicons name="mail-outline" size={20} color={colors.text.primary} />}
          />

          {oauthError ? <Text style={styles.errorText}>{oauthError}</Text> : null}
        </View>

        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimer}>
            By continuing, you agree to our{'\n'}
            <Text style={styles.link} onPress={() => openLink(TERMS_URL)}>
              Terms of Service
            </Text>
            {' '}and{' '}
            <Text style={styles.link} onPress={() => openLink(PRIVACY_URL)}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showEmailSheet}
        transparent
        animationType="fade"
        onRequestClose={closeEmailSheet}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeEmailSheet} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalWrapper}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Sign in with Email</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.text.tertiary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.text.tertiary}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
              {emailError ? <Text style={styles.modalError}>{emailError}</Text> : null}
              <GlassButton
                title="Sign In"
                onPress={handleEmailSubmit}
                loading={emailLoading}
                disabled={!email || !password}
                size="large"
              />
              <Pressable onPress={closeEmailSheet} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.surface.primary,
    borderWidth: 1,
    borderColor: colors.surface.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    ...typography.title1,
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.callout,
    color: colors.text.secondary,
    marginBottom: 32,
  },
  buttons: {
    width: '100%',
  },
  buttonSpacing: {
    marginBottom: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surface.border,
  },
  dividerText: {
    ...typography.caption1,
    color: colors.text.secondary,
    marginHorizontal: 16,
    letterSpacing: 1.5,
  },
  errorText: {
    marginTop: 12,
    ...typography.caption1,
    color: '#f87171',
    textAlign: 'center',
  },
  disclaimerContainer: {
    paddingHorizontal: 32,
    paddingBottom: 24,
    paddingTop: 16,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: colors.text.secondary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: colors.surface.primary,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  modalTitle: {
    ...typography.title2,
    color: colors.text.primary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    ...typography.subheadline,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...typography.callout,
    color: colors.text.primary,
  },
  modalError: {
    ...typography.caption1,
    color: '#f87171',
    marginBottom: 12,
  },
  modalCancel: {
    marginTop: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    ...typography.callout,
    color: colors.text.secondary,
  },
});
