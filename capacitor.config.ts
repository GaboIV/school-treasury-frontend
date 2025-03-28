import type { CapacitorConfig } from '@capacitor/cli';
import { registerPlugin } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.gabonet.creativosatreasury',
  appName: 'Creativos A - Tesorería',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      launchAutoHide: true,
      launchFadeOutDuration: 1000,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "small",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffffff",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
  },
};

const PushNotifications = registerPlugin('PushNotifications');

export default config;