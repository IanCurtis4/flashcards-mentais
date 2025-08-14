// canvas.ts

import { AppState, Card, PointerCoords } from './types';

// --- ÍCONES SVG (Sem alterações) ---
const icons = {
    delete: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>`,
    edit: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>`,
    save: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>`
};

// --- DOM ELEMENTS (Sem alterações) ---
export const canvasWrapper = document.getElementById('canvas-wrapper')!;
export const canvas = document.getElementById('canvas')!;
export const connectorSvg = document.getElementById('connector-svg') as unknown as SVGElement;
export const fromCardSelect = document.getElementById('from-card') as HTMLSelectElement;
export const toCardSelect = document.getElementById('to-card') as HTMLSelectElement;
const mapNameInput = document.getElementById('map-name') as HTMLInputElement;
const filterTagInput = document.getElementById('filter-tag-input') as HTMLInputElement;

// --- ESTADO DA APLICAÇÃO (Sem alterações) ---
export let state: AppState = {
    cards: [],
    connections: [],
    nextCardId: 1,
    activeFilter: null,
    view: { x: 0, y: 0, zoom: 1 },
    currentUser: null,
    unsubscribeFromMaps: null,
};

// --- LÓGICA DE INTERAÇÃO ---
let isDraggingCard = false;
let isPanning = false;
let isResizing = false;
let isZooming = false;
let dragOffsetX: number, dragOffsetY: number;
let panStartX: number, panStartY: number;
let activeCardElement: HTMLDivElement | null;
let initialCardWidth: number, initialCardHeight: number, initialCardX: number, initialCardY: number;
// MODIFICADO: Reintroduzindo a lógica de 'lastTap' do main.old.js
let lastTap = { time: 0, target: null as EventTarget | null };
let initialDistance: number = 0;

// --- FUNÇÕES DE RENDERIZAÇÃO E ESTADO (Sem grandes alterações) ---
// ... (As funções clearCanvasState, render, renderCards, renderConnections, updateSelects, deleteCard, toggleEditMode permanecem as mesmas da sua versão com zoom)
export function clearCanvasState(): void {
    state.cards = [];
    state.connections = [];
    state.nextCardId = 1;
    state.activeFilter = null;
    state.view = { x: 0, y: 0, zoom: 1 };
    mapNameInput.value = '';
    filterTagInput.value = '';
    render();
}

export function render(): void {
    renderCards();
    renderConnections();
    updateSelects();

    // REMOVA o transform do canvas. O zoom será aplicado nos filhos.
    canvas.style.transform = ``; 
    canvas.style.transformOrigin = '0 0';

    // O pan do background agora é aplicado diretamente, sem multiplicar pelo zoom,
    // pois o canvas não é mais escalado.
    canvas.style.backgroundPosition = `${-state.view.x}px ${-state.view.y}px`;

    // O tamanho da malha ainda depende do zoom.
    canvas.style.backgroundSize = `${20 * state.view.zoom}px ${20 * state.view.zoom}px`;
}

function renderCards(): void {
    canvas.innerHTML = '';
    const filteredCards = state.activeFilter
        ? state.cards.filter(card => card.tags.includes(state.activeFilter!))
        : state.cards;

    filteredCards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'flashcard';
        if (card.isFlipped) cardEl.classList.add('flipped');

        cardEl.dataset.id = card.id.toString();

        // APLIQUE O ZOOM AQUI
        cardEl.style.left = `${(card.x - state.view.x) * state.view.zoom}px`;
        cardEl.style.top = `${(card.y - state.view.y) * state.view.zoom}px`;
        cardEl.style.width = `${card.width * state.view.zoom}px`;
        cardEl.style.height = `${card.height * state.view.zoom}px`;
        
        const tagsHtml = card.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        cardEl.innerHTML = `
            <div class="flashcard-inner">
                <div class="flashcard-face flashcard-front">
                    <div class="card-actions">
                         <button class="action-btn btn-edit" title="Editar Card">${icons.edit}</button>
                         <button class="action-btn btn-delete" title="Deletar Card">${icons.delete}</button>
                    </div>
                    <span class="flashcard-id">${card.id}</span>
                    <div class="card-content" data-face="front">${card.pergunta}</div>
                    <div class="tags-container">${tagsHtml}</div>
                    <div class="resize-handle"></div>
                </div>
                <div class="flashcard-face flashcard-back">
                    <div class="card-actions">
                         <button class="action-btn btn-edit" title="Editar Card">${icons.edit}</button>
                         <button class="action-btn btn-delete" title="Deletar Card">${icons.delete}</button>
                    </div>
                    <span class="flashcard-id">${card.id}</span>
                    <div class="card-content" data-face="back">${card.resposta}</div>
                    <div class="tags-container">${tagsHtml}</div>
                    <div class="resize-handle"></div>
                </div>
            </div>`;
        canvas.appendChild(cardEl);
    });
}


function renderConnections(): void {
    connectorSvg.innerHTML = '';
    const visibleCardIds = new Set(
        (state.activeFilter
            ? state.cards.filter(card => card.tags.includes(state.activeFilter!))
            : state.cards
        ).map(c => c.id)
    );

    state.connections.forEach(conn => {
        if (visibleCardIds.has(conn.from) && visibleCardIds.has(conn.to)) {
            const fromCard = state.cards.find(c => c.id === conn.from);
            const toCard = state.cards.find(c => c.id === conn.to);

            if (fromCard && toCard) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                // MODIFICADO: As coordenadas das conexões também precisam considerar o zoom
                const x1 = ((fromCard.x + fromCard.width / 2) - state.view.x) * state.view.zoom;
                const y1 = ((fromCard.y + fromCard.height / 2) - state.view.y) * state.view.zoom;
                const x2 = ((toCard.x + toCard.width / 2) - state.view.x) * state.view.zoom;
                const y2 = ((toCard.y + toCard.height / 2) - state.view.y) * state.view.zoom;

                line.setAttribute('x1', x1.toString());
                line.setAttribute('y1', y1.toString());
                line.setAttribute('x2', x2.toString());
                line.setAttribute('y2', y2.toString());
                line.setAttribute('stroke', '#4A5568');
                line.setAttribute('stroke-width', (2 * state.view.zoom).toString());
                connectorSvg.appendChild(line);
            }
        }
    });
}

export function updateSelects(): void {
    fromCardSelect.innerHTML = '';
    toCardSelect.innerHTML = '';
    state.cards.forEach(card => {
        fromCardSelect.add(new Option(`Card #${card.id}`, card.id.toString()));
        toCardSelect.add(new Option(`Card #${card.id}`, card.id.toString()));
    });
}

export function deleteCard(cardId: number): void {
    state.cards = state.cards.filter(c => c.id !== cardId);
    state.connections = state.connections.filter(c => c.from !== cardId && c.to !== cardId);
    render();
}

export function toggleEditMode(cardEl: HTMLDivElement): void {
    const cardId = parseInt(cardEl.dataset.id!);
    const cardData = state.cards.find(c => c.id === cardId);
    if (!cardData) return;

    const isEditing = cardEl.dataset.editing === 'true';
    const frontContent = cardEl.querySelector('.card-content[data-face="front"]')!;
    const backContent = cardEl.querySelector('.card-content[data-face="back"]')!;
    const editBtns = cardEl.querySelectorAll('.btn-edit');

    if (isEditing) {
        cardData.pergunta = (frontContent.querySelector('textarea') as HTMLTextAreaElement).value;
        cardData.resposta = (backContent.querySelector('textarea') as HTMLTextAreaElement).value;
        cardEl.removeAttribute('data-editing');
        frontContent.innerHTML = cardData.pergunta;
        backContent.innerHTML = cardData.resposta;
        editBtns.forEach(btn => {
            btn.innerHTML = icons.edit;
            btn.setAttribute('title', 'Editar Card');
        });
    } else {
        cardEl.dataset.editing = 'true';
        frontContent.innerHTML = `<textarea class="edit-textarea">${cardData.pergunta}</textarea>`;
        backContent.innerHTML = `<textarea class="edit-textarea">${cardData.resposta}</textarea>`;
        editBtns.forEach(btn => {
            btn.innerHTML = icons.save;
            btn.setAttribute('title', 'Salvar Mudanças');
        });
        cardEl.querySelectorAll('.edit-textarea').forEach(ta => {
            ta.addEventListener('mousedown', e => e.stopPropagation());
            ta.addEventListener('touchstart', e => e.stopPropagation());
        });
    }
}


// --- LÓGICA DE INTERAÇÃO DO CANVAS (COM LÓGICA DE FLIP RESTAURADA) ---

function getDistance(touches: TouchList): number {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function getEventCoords(e: MouseEvent | TouchEvent): PointerCoords {
    if (e instanceof TouchEvent && e.touches.length) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
}

export function onPointerStart(e: MouseEvent | TouchEvent): void {
    if (e instanceof MouseEvent && e.button !== 0) return;
    if ((e.target as HTMLElement).closest('.action-btn, .edit-textarea')) return;

    // MODIFICADO: Resetando o estado de drag ao iniciar
    isDraggingCard = false;
    
    // Lógica de zoom com pinch (dois toques)
    if (e instanceof TouchEvent && e.touches.length === 2) {
        e.preventDefault();
        isZooming = true;
        isPanning = false; // Garante que não haja pan durante o zoom
        initialDistance = getDistance(e.touches);
        return;
    }

    const coords = getEventCoords(e);
    const targetElement = e.target as HTMLElement;
    activeCardElement = targetElement.closest('.flashcard');
    const resizeHandle = targetElement.closest('.resize-handle');

    if (resizeHandle && activeCardElement) {
        e.stopPropagation();
        isResizing = true;
        const cardId = parseInt(activeCardElement.dataset.id!); // Pega o ID
        const cardData = state.cards.find(c => c.id === cardId)!; // Pega os dados do card

        initialCardWidth = cardData.width;
        initialCardHeight = cardData.height;
        initialCardX = cardData.x; // Guarda a posição X inicial
        initialCardY = cardData.y; // Guarda a posição Y inicial
        panStartX = coords.x;
        panStartY = coords.y;
    } else if (activeCardElement) {
        const cardId = parseInt(activeCardElement.dataset.id!);
        const cardData = state.cards.find(c => c.id === cardId)!;

        // Guarda a posição inicial do card e do ponteiro para o drag
        initialCardX = cardData.x;
        initialCardY = cardData.y;
        panStartX = coords.x;
        panStartY = coords.y;

        // Lógica de offset não é mais necessária com este método
        // dragOffsetX = (coords.x - cardRect.left) / state.view.zoom;
        // dragOffsetY = (coords.y - cardRect.top) / state.view.zoom;

        activeCardElement.style.cursor = 'grabbing';
        activeCardElement.style.zIndex = '10';
    } else {
        isPanning = true;
        panStartX = coords.x;
        panStartY = coords.y;
    }

    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('touchmove', onPointerMove, { passive: false });
    document.addEventListener('mouseup', onPointerEnd);
    document.addEventListener('touchend', onPointerEnd);
}

function onPointerMove(e: MouseEvent | TouchEvent): void {
    if (e instanceof TouchEvent) e.preventDefault();

    if (isZooming && e instanceof TouchEvent && e.touches.length === 2) {
        const currentDistance = getDistance(e.touches);
        if (initialDistance > 0) {
            const scaleFactor = currentDistance / initialDistance;
            const newZoom = Math.max(0.5, Math.min(3, state.view.zoom * scaleFactor));
            state.view.zoom = newZoom;
            initialDistance = currentDistance; // Atualiza a distância inicial para o próximo movimento
            render();
        }
        return;
    }

    const coords = getEventCoords(e);

    if (isResizing && activeCardElement) {
        const dx = (coords.x - panStartX) / state.view.zoom;
        const dy = (coords.y - panStartY) / state.view.zoom;
        const cardId = parseInt(activeCardElement.dataset.id!);
        const cardData = state.cards.find(c => c.id === cardId);

        if (cardData) {
            // Lógica de altura é sempre a mesma
            cardData.height = Math.max(80, initialCardHeight + dy);

            // Lógica de largura depende do estado 'flipped'
            if (cardData.isFlipped) {
                // Se está flipado, o handle está à esquerda.
                // Diminuímos a largura e movemos a posição X para a direita.
                const newWidth = initialCardWidth - dx;
                if (newWidth >= 100) {
                    cardData.width = newWidth;
                    cardData.x = initialCardX + dx;
                }
            } else {
                // Comportamento normal, handle à direita.
                cardData.width = Math.max(100, initialCardWidth + dx);
            }
            render();
        }
    } else if (activeCardElement) {
        const dx = coords.x - panStartX;
        const dy = coords.y - panStartY;
        if (!isDraggingCard && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
            isDraggingCard = true; 
        }

        if (isDraggingCard) {
            // FÓRMULA DE ARRASTE CORRIGIDA
            const cardId = parseInt(activeCardElement.dataset.id!);
            const cardData = state.cards.find(c => c.id === cardId);
            if (cardData) {
                // A nova posição é a posição inicial do card (que precisamos guardar)
                // mais a variação do mouse convertida para o "espaço do mundo" (dividindo pelo zoom)
                // Usaremos as mesmas 'initialCardX/Y' do resize, mas vamos capturá-las no início do drag.
                cardData.x = initialCardX + dx / state.view.zoom;
                cardData.y = initialCardY + dy / state.view.zoom;
                render();
            }
        }
    } else if (isPanning) {
        const dx = coords.x - panStartX;
        const dy = coords.y - panStartY;
        state.view.x -= dx / state.view.zoom;
        state.view.y -= dy / state.view.zoom;
        panStartX = coords.x;
        panStartY = coords.y;
        render();
    }
}

function onPointerEnd(e: MouseEvent | TouchEvent): void {
    const targetElement = e.target as HTMLElement;
    const cardElement = targetElement.closest('.flashcard') as HTMLDivElement;

    // ADICIONADO: Lógica de flip do main.old.js, adaptada para TS e para o novo estado
    if (cardElement && !isDraggingCard && !isResizing && !isZooming) {
        const wasTouch = e.type === 'touchend';
        const currentTime = Date.now();

        // Lógica de Double Tap para Mobile
        if (wasTouch) {
            if (lastTap.target === cardElement && (currentTime - lastTap.time) < 300) {
                // É um double tap
                flipCard(cardElement);
                lastTap = { time: 0, target: null }; // Reseta o tap
            } else {
                // É o primeiro tap
                lastTap = { time: currentTime, target: cardElement };
            }
        } else {
            // Lógica de Single Click para Desktop
            flipCard(cardElement);
        }
    }

    if (activeCardElement) {
        activeCardElement.style.cursor = 'grab';
        activeCardElement.style.zIndex = '5';
    }

    // Reseta todos os estados
    isDraggingCard = false;
    isPanning = false;
    isResizing = false;
    isZooming = false;
    activeCardElement = null;
    initialDistance = 0;

    document.removeEventListener('mousemove', onPointerMove);
    document.removeEventListener('touchmove', onPointerMove);
    document.removeEventListener('mouseup', onPointerEnd);
    document.removeEventListener('touchend', onPointerEnd);
}

// ADICIONADO: Função auxiliar para virar o card
function flipCard(cardEl: HTMLDivElement) {
    const cardId = parseInt(cardEl.dataset.id!);
    const cardData = state.cards.find(c => c.id === cardId);
    if (cardData && !cardEl.dataset.editing) {
        cardData.isFlipped = !cardData.isFlipped;
        cardEl.classList.toggle('flipped');
    }
}


// --- ZOOM POR SCROLL DO MOUSE ---
export function initializeZoomControls(): void {
    canvasWrapper.addEventListener('wheel', (e: WheelEvent) => {
        e.preventDefault();
        const delta = -e.deltaY;
        const newZoom = Math.max(0.5, Math.min(3, state.view.zoom * (1 + delta * 0.001)));
        
        const wrapperRect = canvasWrapper.getBoundingClientRect();
        const mouseX = e.clientX - wrapperRect.left;
        const mouseY = e.clientY - wrapperRect.top;

        // Ajusta a posição da view para que o zoom seja centrado no mouse
        const oldZoom = state.view.zoom;
        state.view.x += (mouseX / oldZoom) - (mouseX / newZoom);
        state.view.y += (mouseY / oldZoom) - (mouseY / newZoom);
        state.view.zoom = newZoom;
        
        render();
    });
}
