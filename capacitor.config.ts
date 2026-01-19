import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.itone.karaoke',
  appName: 'iTone Karaoke',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#1e1b4b',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1e1b4b'
    },
    Device: {
      android: {
        requestPermissions: ['CAMERA', 'MICROPHONE', 'RECORD_AUDIO']
      }
    },
    Network: {
      android: {
        usesCleartextTraffic: false
      }
    }
  },
  android: {
    buildOptions: {
      keystorePath: 'release-key.keystore',
      keystorePassword: 'itone2025',
      keystoreAlias: 'itone-key',
      keystoreAliasPassword: 'itone2025',
      releaseType: 'AAB',
      signingType: 'apksigner'
    },
    allowMixedContent: false,
    captureExceptions: true,
    webContentsDebuggingEnabled: false,
    appendUserAgent: 'iTone-Karaoke-Android/1.0',
    overrideUserAgent: undefined,
    backgroundColor: '#1e1b4b',
    loggingBehavior: 'production'
  },
  ios: {
    scheme: 'iTone Karaoke',
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#1e1b4b',
    handleApplicationNotifications: false,
    appendUserAgent: 'iTone-Karaoke-iOS/1.0',
    overrideUserAgent: undefined,
    preferredContentMode: 'mobile',
    limitsNavigationsToAppBoundDomains: true,
    allowsLinkPreview: false
  }
};

export default config;