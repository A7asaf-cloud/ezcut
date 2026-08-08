import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.a7asaf.ezcut',
  appName: 'EZCut',
  webDir: 'www',
  server: {
    url: 'https://ezcut-rouge.vercel.app',
    cleartext: false
  }
};

export default config;
