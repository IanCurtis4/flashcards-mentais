// auth.ts

import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    signInWithCredential,
    getRedirectResult,
    signOut,
    User
} from "firebase/auth";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { Capacitor } from '@capacitor/core';
import { auth } from './firebase';
import { state } from './canvas';
import { listenToFirestoreMaps, updateMapList } from './maps';
import { clearCanvasState } from './canvas';

// --- REFERÊNCIAS AOS ELEMENTOS DO DOM ---
const authContainer = document.getElementById('auth-container') as HTMLDivElement;
const appContainer = document.getElementById('app-container') as HTMLDivElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const userInfoPanel = document.getElementById('user-info-panel') as HTMLDivElement;
const userEmailDisplay = document.getElementById('user-email-display') as HTMLParagraphElement;
const loadingContainer = document.getElementById('loading-container') as HTMLDivElement;

/**
 * Lida com a criação de uma nova conta de usuário.
 */
export async function handleSignUp(): Promise<void> {
    try {
        await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    } catch (error: any) {
        alert(`Erro ao criar conta: ${error.message}`);
    }
}

/**
 * Lida com o login de um usuário existente.
 */
export async function handleSignIn(e: Event): Promise<void> {
    e.preventDefault();
    try {
        await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    } catch (error: any) {
        alert(`Erro ao entrar: ${error.message}`);
    }
}

/**
 * Inicia o fluxo de login com o Google.
 */
export async function handleGoogleSignIn(): Promise<void> {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    const platform = Capacitor.getPlatform();
    
    try {
        // No Electron, prefira redirect ao invés de popup
        if (platform === 'electron') {
            console.log("Iniciando login com Google (Desktop)...");
            await signInWithRedirect(auth, provider);
            console.log("Login com Google (Desktop) bem-sucedido!");
        } else if (platform === 'web') {
            // --- FLUXO PARA DESKTOP (ELECTRON) E WEB ---
            // Use o método de login com Pop-up padrão do Firebase Web SDK
            console.log("Iniciando login com Google (Web)...");
            await signInWithPopup(auth, provider);
            console.log("Login com Google (Web) bem-sucedido!");

        } else {
            // --- FLUXO PARA MÓVEL (ANDROID/IOS) ---
            // Mantenha o código que você já tem para o Capacitor
            console.log("Iniciando login com Google (Nativo)...");
            const result = await FirebaseAuthentication.signInWithGoogle();
            const credential = GoogleAuthProvider.credential(result.credential?.idToken);
            await signInWithCredential(auth, credential);
            console.log("Login com Google (Nativo) bem-sucedido!");
        }
    } catch (error: any) {
        console.error('Erro no login com Google:', error);
        alert(`Erro no login com Google: ${error.message}`);
    }
}

/**
 * Desloga o usuário atual.
 */
export async function handleLogout(): Promise<void> {
    await signOut(auth);
}

/**
 * Observador principal do estado de autenticação.
 * Atualiza a UI e os dados com base no status de login do usuário.
 */
export function initializeAuthObserver(): void {
    // Verifica se há resultado de redirect (importante para Electron)
    getRedirectResult(auth)
        .then((result) => {
            if (result?.user) {
                console.log('Login com Google via redirect bem-sucedido');
            }
        })
        .catch((error) => {
            console.error('Erro no redirect do Google:', error);
        });

    onAuthStateChanged(auth, (user: User | null) => {
        state.currentUser = user;

        if (user) {
            // Usuário está logado
            document.body.className = '';
            authContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
            userInfoPanel.classList.remove('hidden');
            userEmailDisplay.textContent = user.email || 'Usuário';

            clearCanvasState();
            listenToFirestoreMaps(); // Ouve os mapas da nuvem
        } else {
            // Usuário deslogado
            document.body.className = 'auth-view';
            authContainer.classList.remove('hidden');
            appContainer.classList.add('hidden');
            userInfoPanel.classList.add('hidden');

            if (state.unsubscribeFromMaps) {
                state.unsubscribeFromMaps(); // Para de ouvir os mapas
                state.unsubscribeFromMaps = null;
            }

            clearCanvasState();
            updateMapList(); // Carrega mapas locais/cache
        }
        loadingContainer.classList.add('hidden'); // Esconde o carregamento após a autenticação
    });
}