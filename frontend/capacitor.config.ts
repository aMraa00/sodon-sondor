import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'mn.sodon.sondor',
  appName: 'Содон Сондор',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Production: API calls go to Render backend
    // Capacitor bundles the built frontend inside the APK
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0d9488',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#0d9488',
    },
  },
};

export default config;
