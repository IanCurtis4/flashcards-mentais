// events.ts

import { handleSignUp, handleSignIn, handleGoogleSignIn, handleLogout } from './auth';
import { render, state, deleteCard, toggleEditMode, onPointerStart, clearCanvasState, canvas, fromCardSelect, toCardSelect, initializeZoomControls } from './canvas';
import { saveCurrentMap, loadMap, deleteMap } from './maps';
import { Card } from './types';

// --- DOM ELEMENTS (Sem alterações) ---
const loginForm = document.getElementById('login-form')!;
const signupBtn = document.getElementById('signup-btn')!;
const googleSigninBtn = document.getElementById('google-signin-btn')!;
const logoutBtn = document.getElementById('logout-btn')!;
const addCardForm = document.getElementById('add-card-form')!;
const connectCardsForm = document.getElementById('connect-cards-form')!;
const filterBtn = document.getElementById('filter-btn')!;
const clearFilterBtn = document.getElementById('clear-filter-btn')!;
const saveMapBtn = document.getElementById('save-map')!;
const loadMapBtn = document.getElementById('load-map')!;
const deleteMapBtn = document.getElementById('delete-map')!;
const clearCanvasBtn = document.getElementById('clear-canvas')!;
const filterTagInput = document.getElementById('filter-tag-input') as HTMLInputElement;
const menuToggleBtn = document.getElementById('menu-toggle-btn')!;
const controls = document.getElementById('controls')!;

// --- FUNÇÕES DE MANIPULAÇÃO DE EVENTOS (Sem grandes alterações) ---
function handleAddCard(e: Event) {
    e.preventDefault();
    const perguntaInput = document.getElementById('pergunta') as HTMLInputElement;
    const respostaInput = document.getElementById('resposta') as HTMLInputElement;
    const tagsInput = document.getElementById('tags') as HTMLInputElement;
    
    const tags = tagsInput.value.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean);
    if (tags.length === 0) {
        alert('Por favor, adicione pelo menos uma tag.');
        return;
    }

    const newCard: Card = {
        id: state.nextCardId++,
        pergunta: perguntaInput.value,
        resposta: respostaInput.value,
        tags: tags,
        x: (canvas.clientWidth / 2 - 100) / state.view.zoom + state.view.x,
        y: (canvas.clientHeight / 2 - 60) / state.view.zoom + state.view.y,
        width: 200,
        height: 120,
        isFlipped: false
    };

    state.cards.push(newCard);
    (addCardForm as HTMLFormElement).reset();
    render();
}

function handleConnectCards(e: Event) {
    e.preventDefault();
    const fromId = parseInt(fromCardSelect.value);
    const toId = parseInt(toCardSelect.value);

    if (fromId && toId && fromId !== toId) {
        const exists = state.connections.some(c => (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId));
        if (!exists) {
            state.connections.push({ from: fromId, to: toId });
            render();
        } else {
            alert('Essa conexão já existe.');
        }
    }
}

function handleFilterByTag() {
    const filterValue = filterTagInput.value.trim().toLowerCase();
    state.activeFilter = filterValue || null;
    render();
}

function handleClearFilter() {
    state.activeFilter = null;
    filterTagInput.value = '';
    render();
}

function handleMenuToggle() {
    controls.classList.toggle('active');
}

function handleOutsideClick(e: Event) {
    const target = e.target as Node;
    if (!controls.contains(target) && !menuToggleBtn.contains(target) && controls.classList.contains('active')) {
        controls.classList.remove('active');
    }
}

/**
 * Inicializa todos os event listeners da aplicação.
 */
export function initializeEventListeners(): void {
    // Auth
    loginForm.addEventListener('submit', handleSignIn);
    signupBtn.addEventListener('click', handleSignUp);
    googleSigninBtn.addEventListener('click', handleGoogleSignIn);
    logoutBtn.addEventListener('click', handleLogout);

    // Card & Connection Forms
    addCardForm.addEventListener('submit', handleAddCard);
    connectCardsForm.addEventListener('submit', handleConnectCards);

    // Canvas Interaction
    canvas.addEventListener('mousedown', onPointerStart);
    canvas.addEventListener('touchstart', onPointerStart, { passive: false });

    // Inicializa controles de zoom (scroll do mouse)
    initializeZoomControls();

    // MODIFICADO: A lógica de virar o card foi movida para o onPointerEnd.
    // Este listener agora só cuida dos botões de ação (delete, edit).
    canvas.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const deleteBtn = target.closest('.btn-delete');
        const editBtn = target.closest('.btn-edit');

        if (deleteBtn) {
            e.stopPropagation(); // Impede que o clique se propague
            const cardEl = deleteBtn.closest('.flashcard') as HTMLDivElement;
            deleteCard(parseInt(cardEl.dataset.id!));
        } else if (editBtn) {
            e.stopPropagation(); // Impede que o clique se propague
            const cardEl = editBtn.closest('.flashcard') as HTMLDivElement;
            toggleEditMode(cardEl);
        }
    });

    // Map Management
    saveMapBtn.addEventListener('click', saveCurrentMap);
    loadMapBtn.addEventListener('click', loadMap);
    deleteMapBtn.addEventListener('click', deleteMap);
    clearCanvasBtn.addEventListener('click', clearCanvasState);

    // Filtering
    filterBtn.addEventListener('click', handleFilterByTag);
    clearFilterBtn.addEventListener('click', handleClearFilter);

    // Menu Toggle (Mobile)
    menuToggleBtn.addEventListener('click', handleMenuToggle);
    document.addEventListener('click', handleOutsideClick);
    
    // Window resize
    window.addEventListener('resize', render);
    // ADICIONADO: Listener para orientação para ajustar a UI
    window.addEventListener('orientationchange', render);
}
