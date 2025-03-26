import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gabonet.treasuryschool',
  appName: 'TreasurySchool',
  webDir: 'dist',
  server: {
    allowNavigation: ["api.creativos.uno"]
  }
};

export default config;