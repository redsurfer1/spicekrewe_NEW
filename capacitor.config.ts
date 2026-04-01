import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.spicekrewe.app',
  appName: 'Spice Krewe',
  webDir: 'dist',
  server: {
    url: 'https://www.spicekrewe.com',
    allowNavigation: [
      'www.spicekrewe.com',
      '*.supabase.co'
    ]
  }
};

export default config;
