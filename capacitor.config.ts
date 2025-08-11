// capacitor.config.ts

import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.seuapp.id',
  appName: 'Flashcards-Mentais',
  // 👇 Garanta que este valor corresponda ao 'outDir' do Vite
  webDir: 'dist', 
  server: {
    androidScheme: 'https'
  }
};

export default config;