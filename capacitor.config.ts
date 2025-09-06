import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.dccc87d3b9f4428f9f0dcfba1d515872',
  appName: 'ossian-icons',
  webDir: 'dist',
  server: {
    url: "https://dccc87d3-b9f4-428f-9f0d-cfba1d515872.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    Haptics: {
      // Enable haptics for iOS and Android
    }
  }
};

export default config;