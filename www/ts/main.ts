// main.ts

import { initializeAuthObserver } from './auth';
import { initializeEventListeners } from './events';
import { render, clearCanvasState } from './canvas';
import { updateMapList } from './maps';

/**
 * Previne comportamentos padrão de zoom e scroll em dispositivos móveis
 */
function preventDefaultMobileBehaviors(): void {
    // Previne zoom com duplo toque
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });

    // Previne zoom com gesture
    document.addEventListener('gesturestart', (e) => {
        e.preventDefault();
    });

    // Previne pull-to-refresh e outros comportamentos de scroll
    document.addEventListener('touchmove', (e) => {
        // Só previne se não estiver em um elemento que precisa de scroll (como o painel de controles)
        const target = e.target as HTMLElement;
        if (!target.closest('#controls') && !target.closest('.edit-textarea')) {
            e.preventDefault();
        }
    }, { passive: false });

    // Previne contexto menu em touch longo (opcional)
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
}

/**
 * Configura a orientação e viewport para mobile
 */
function setupMobileViewport(): void {
    // Adiciona meta viewport se não existir
    let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (viewportMeta) {
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    }

    // Lida com mudanças de orientação
    const handleOrientationChange = () => {
        // Pequeno delay para garantir que as dimensões foram atualizadas
        setTimeout(() => {
            render();
        }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
}

/**
 * Função principal que inicializa a aplicação.
 */
function main() {
    // Configura comportamentos mobile
    preventDefaultMobileBehaviors();
    setupMobileViewport();
    
    // Configura o observador de autenticação que controla o fluxo da UI
    initializeAuthObserver();
    
    // Anexa todos os manipuladores de eventos aos elementos do DOM
    initializeEventListeners();
    
    // Renderização inicial e carregamento de mapas locais (para o caso de começar offline)
    render();
    updateMapList();
}

// Inicia a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', main);