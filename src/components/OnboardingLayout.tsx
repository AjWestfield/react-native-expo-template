import React from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, ViewProps } from 'react-native';
import { colors, spacing } from '../theme/colors';
import { useResponsive } from '../hooks/useResponsive';
import { CONTENT_MAX_WIDTHS } from '../constants/responsive';
import { getResponsiveSpacing } from '../utils/responsive';

interface OnboardingLayoutProps extends ViewProps {
  children: React.ReactNode;
  sideContent?: React.ReactNode;
  contentWidth?: keyof typeof CONTENT_MAX_WIDTHS;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  sideContent,
  contentWidth = 'small',
  style,
  ...viewProps
}) => {
  const responsive = useResponsive();
  const responsiveSpacing = getResponsiveSpacing(responsive);
  const isDesktop = responsive.isDesktop || responsive.isLargeDesktop;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: responsiveSpacing.horizontal,
            paddingVertical: responsiveSpacing.vertical,
          },
        ]}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.layout,
            {
              flexDirection: isDesktop && sideContent ? 'row' : 'column',
              gap: responsiveSpacing.horizontal,
              maxWidth: CONTENT_MAX_WIDTHS.extraLarge,
            },
          ]}
        >
          {sideContent ? (
            <View
              style={[
                styles.sideContent,
                isDesktop ? { flex: 1 } : { width: '100%' },
                { marginBottom: isDesktop ? 0 : responsiveSpacing.vertical },
              ]}
            >
              {sideContent}
            </View>
          ) : null}

          <View
            style={[
              styles.mainContent,
              style,
              {
                flex: isDesktop && sideContent ? 1 : undefined,
                width: '100%',
                maxWidth: CONTENT_MAX_WIDTHS[contentWidth],
                alignSelf: 'center',
              },
            ]}
            {...viewProps}
          >
            {children}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  layout: {
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideContent: {
    width: '100%',
    alignSelf: 'center',
  },
  mainContent: {
    width: '100%',
    alignSelf: 'center',
  },
});
