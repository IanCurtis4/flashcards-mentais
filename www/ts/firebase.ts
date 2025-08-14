
// firebase.ts

import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { Capacitor } from '@capacitor/core';

// Sua configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyClIgyrDCxr2w9j8DuDd8IsdTkJQ3d4S9M",
    authDomain: "flashcards-mentais.firebaseapp.com",
    projectId: "flashcards-mentais",
    storageBucket: "flashcards-mentais.firebasestorage.app",
    messagingSenderId: "190585744647",
    appId: "1:190585744647:web:f70b1fafe69e99f10229a2",
    measurementId: "G-WZJ8RP1QS5"
};

// Inicializa o Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

// Configuração específica para Electron
if (Capacitor.getPlatform() === 'electron') {
    // Define um domínio customizado para o Electron
    auth.settings.appVerificationDisabledForTesting = true;
}