import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Must match the applicationId in android/app/build.gradle and iOS bundle ID
  appId: 'br.com.terraforte.app',
  appName: 'TerraForte',
  // Vite outputs to dist/
  webDir: 'dist',
  server: {
    // During development, point to the Vite dev server for live-reload on device.
    // Comment this block out before running `npx cap sync` for a production build.
    url: 'http://192.0.2.2:5173',
    cleartext: true, // allows http in debug builds (Android)
  },
  android: {
    // Allows network requests to localhost during dev (Android 9+)
    allowMixedContent: true,
    // Target SDK — keep in sync with android/app/build.gradle
    minWebViewVersion: 55,
  },
  ios: {
    // Allows arbitrary loads for dev server (must be removed for App Store submission)
    allowsLinkPreview: false,
  },
  plugins: {
    // SplashScreen plugin (install separately if needed: @capacitor/splash-screen)
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#15803d', // TerraForte green
      showSpinner: false,
    },
    // StatusBar plugin (install separately if needed: @capacitor/status-bar)
    StatusBar: {
      style: 'light',
      backgroundColor: '#15803d',
    },
  },
};

export default config;
