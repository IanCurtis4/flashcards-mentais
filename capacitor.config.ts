// capacitor.config.ts

import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.seuapp.id',
  appName: 'Flashcards-Mentais',
  // ðŸ‘‡ Garanta que este valor corresponda ao 'outDir' do Vite
  webDir: 'dist', 
  server: {
    androidScheme: 'https'
  },
  plugins: {
    FirebaseAuthentication: {
      authDomain: undefined,
      skipNativeAuth: false,
      providers: ["google.com"],
    },
    Electron: {
      // Define o comando para iniciar o servidor Vite de forma explÃ­cita e robusta
      vite: {
        devServer: {
          command: 'npx vite dev',
        }
      }
    }
  },
};

export default config;