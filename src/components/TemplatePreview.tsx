import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Template } from '../types/image';
import { colors, typography } from '../theme/colors';

const { width } = Dimensions.get('window');

interface TemplatePreviewProps {
  template: Template;
  size?: 'small' | 'medium' | 'large';
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  size = 'medium'
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: width * 0.25, height: width * 0.25 };
      case 'large':
        return { width: width * 0.9, height: width * 0.6 };
      default:
        return { width: width * 0.4, height: width * 0.3 };
    }
  };

  const getOverlayElements = () => {
    switch (template.id) {
      case 'ring-camera':
        return (
          <>
            <View style={styles.timestamp}>
              <Text style={styles.timestampText}>11:42 PM</Text>
              <View style={styles.recIndicator} />
            </View>
            <View style={styles.ringLogo}>
              <Ionicons name="ellipse-outline" size={24} color="rgba(255,255,255,0.9)" />
            </View>
          </>
        );
      case 'security-camera':
        return (
          <>
            <View style={styles.securityOverlay}>
              <Text style={styles.securityText}>CAM 01</Text>
              <Text style={styles.securityText}>● REC</Text>
            </View>
            <View style={styles.scanline} />
          </>
        );
      case 'smartphone':
        return (
          <>
            <View style={styles.phoneNotch} />
            <View style={styles.phoneButtons}>
              <View style={styles.phoneButton}>
                <Ionicons name="camera-reverse" size={20} color="white" />
              </View>
              <View style={styles.phoneButton}>
                <Ionicons name="flash" size={20} color="white" />
              </View>
            </View>
          </>
        );
      case 'body-cam':
        return (
          <>
            <View style={styles.bodyCamHeader}>
              <Text style={styles.bodyCamText}>OFFICER #4521</Text>
              <Text style={styles.bodyCamText}>11/11/2025 23:42:15</Text>
            </View>
            <View style={styles.bodyCamFooter}>
              <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.7)" />
              <Text style={styles.bodyCamFooterText}>ENCRYPTED</Text>
            </View>
          </>
        );
      case 'drone':
        return (
          <>
            <View style={styles.droneHud}>
              <View style={styles.droneInfo}>
                <Text style={styles.droneText}>ALT: 120m</Text>
                <Text style={styles.droneText}>SPD: 15m/s</Text>
              </View>
              <View style={styles.droneCrosshair}>
                <Ionicons name="add" size={32} color="rgba(0,255,0,0.5)" />
              </View>
            </View>
            <View style={styles.droneGrid} />
          </>
        );
      case 'dashcam':
        return (
          <>
            <View style={styles.dashcamOverlay}>
              <Text style={styles.dashcamText}>65 MPH</Text>
              <Text style={styles.dashcamDate}>11/11/2025 11:42 PM</Text>
            </View>
            <View style={styles.dashcamGPS}>
              <Ionicons name="location" size={12} color="rgba(255,255,255,0.7)" />
              <Text style={styles.dashcamGPSText}>GPS: 37.7749°N, 122.4194°W</Text>
            </View>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, getSizeStyles()]}>
      <LinearGradient
        colors={template.gradient as [string, string, ...string[]]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {getOverlayElements()}

        {/* Vignette effect */}
        <View style={styles.vignette} />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 12,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
  },

  // Ring Camera
  timestamp: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  timestampText: {
    ...typography.caption1,
    color: colors.text.white,
    fontWeight: '600',
  },
  recIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
  },
  ringLogo: {
    alignSelf: 'flex-end',
    zIndex: 1,
  },

  // Security Camera
  securityOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  securityText: {
    ...typography.caption2,
    color: colors.text.white,
    fontFamily: 'Courier New',
    fontWeight: 'bold',
  },
  scanline: {
    height: 2,
    backgroundColor: 'rgba(0, 255, 0, 0.3)',
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    zIndex: 1,
  },

  // Smartphone
  phoneNotch: {
    width: 80,
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    alignSelf: 'center',
    zIndex: 1,
  },
  phoneButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignSelf: 'flex-end',
    width: '100%',
    zIndex: 1,
  },
  phoneButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Body Cam
  bodyCamHeader: {
    zIndex: 1,
  },
  bodyCamText: {
    ...typography.caption2,
    color: colors.text.white,
    fontFamily: 'Courier New',
    fontWeight: 'bold',
  },
  bodyCamFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 1,
  },
  bodyCamFooterText: {
    ...typography.caption2,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
  },

  // Drone
  droneHud: {
    zIndex: 1,
  },
  droneInfo: {
    gap: 2,
  },
  droneText: {
    ...typography.caption2,
    color: 'rgba(0, 255, 0, 0.8)',
    fontFamily: 'Courier New',
    fontWeight: 'bold',
  },
  droneCrosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
  },
  droneGrid: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.1)',
    zIndex: 0,
  },

  // Dashcam
  dashcamOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  dashcamText: {
    ...typography.body,
    color: colors.text.white,
    fontWeight: 'bold',
  },
  dashcamDate: {
    ...typography.caption2,
    color: colors.text.white,
  },
  dashcamGPS: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 1,
  },
  dashcamGPSText: {
    ...typography.caption2,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 9,
  },
});
