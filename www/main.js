// Adicione no topo do seu main.js, junto com as outras constantes
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

// --- ELEMENTOS DA DOM ---
const canvasWrapper = document.getElementById('canvas-wrapper');
const canvas = document.getElementById('canvas');
const connectorSvg = document.getElementById('connector-svg');
const addCardForm = document.getElementById('add-card-form');
const connectCardsForm = document.getElementById('connect-cards-form');
const fromCardSelect = document.getElementById('from-card');
const toCardSelect = document.getElementById('to-card');
const filterTagInput = document.getElementById('filter-tag-input');
const filterBtn = document.getElementById('filter-btn');
const clearFilterBtn = document.getElementById('clear-filter-btn');
const saveMapBtn = document.getElementById('save-map');
const loadMapBtn = document.getElementById('load-map');
const deleteMapBtn = document.getElementById('delete-map');
const mapNameInput = document.getElementById('map-name');
const loadMapSelect = document.getElementById('load-map-select');
const clearCanvasBtn = document.getElementById('clear-canvas');

// --- ÍCONES SVG ---
const icons = {
    delete: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>`,
    edit: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>`,
    save: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>`
};

// --- ESTADO DA APLICAÇÃO ---
let state = {
    cards: [],
    connections: [],
    nextCardId: 1,
    activeFilter: null,
    view: { x: 0, y: 0 }
};

const DRAG_THRESHOLD = 5; // Limiar de 5 pixels para diferenciar toque de arraste

// --- LÓGICA DE INTERAÇÃO (COM SUPORTE A TOQUE) ---
let isDraggingCard = false;
let isPanning = false;
let isResizing = false; // <-- NOSSA NOVA VARIÁVEL
let initialCardWidth, initialCardHeight; // <-- Guardar dimensões iniciais
let dragOffsetX, dragOffsetY;
let panStartX, panStartY;
let activeCard;
// Adicionar novas variáveis de estado
let initialCardX, initialCardY;
let isCardFlipped = false; // <-- Variável para controlar o estado de flip
let lastTap = { time: 0, target: null };
let tapTimeout;
let isTouchInteraction = false;

// --- Atualizar o sistema de eventos ---
function setupEventListeners() {
    canvas.addEventListener('mousedown', onPointerStart);
    canvas.addEventListener('touchstart', onPointerStart, { passive: false });
    
    //canvas.addEventListener('click', onPointerClick);
    canvas.addEventListener('touchend', onPointerEnd);
}

// --- Função unificada para início de interação ---
function onPointerStart(e) {
    // Determinar se é uma interação por toque
    isTouchInteraction = e.type === 'touchstart';
    
    // Chamar a lógica de drag/pan/resize existente
    onDragStart(e);
}

// --- Função para lidar com clicks/taps ---
function onPointerClick(e) {
    // Ignorar eventos de clique se for uma interação por toque
    if (isTouchInteraction) return;
    
    handleCardInteraction(e);
}

// --- Função para lidar com final de toque ---
function onPointerEnd(e) {
    if (isDraggingCard || isPanning || isResizing) return;
    
    const cardElement = e.target.closest('.flashcard');
    if (!cardElement) return;
    
    // Tentar detectar double-tap
    if (handleDoubleTap(e, cardElement)) {
        return;
    }
    
    // Se não foi double-tap, verificar botões
    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Verificar se tocou em botões de ação
    const deleteBtn = target.closest('.btn-delete');
    const editBtn = target.closest('.btn-edit');
    
    if (deleteBtn) {
        const cardEl = deleteBtn.closest('.flashcard');
        const cardId = parseInt(cardEl.dataset.id);
        deleteCard(cardId);
        return;
    }

    if (editBtn) {
        const cardEl = editBtn.closest('.flashcard');
        toggleEditMode(cardEl);
        return;
    }
}

// --- Função unificada para interações com cards ---
function handleCardInteraction(e) {
    // Ignorar em dispositivos touch
    if ('ontouchstart' in window) return;
    
    // Comportamento original para desktop
    const deleteBtn = e.target.closest('.btn-delete');
    const editBtn = e.target.closest('.btn-edit');
    const cardElement = e.target.closest('.flashcard');
    
    if (deleteBtn) {
        const cardEl = deleteBtn.closest('.flashcard');
        const cardId = parseInt(cardEl.dataset.id);
        deleteCard(cardId);
        return;
    }

    if (editBtn) {
        const cardEl = editBtn.closest('.flashcard');
        toggleEditMode(cardEl);
        return;
    }
    
    if (cardElement) {
        const cardId = parseInt(cardElement.dataset.id);
        const cardData = state.cards.find(c => c.id === cardId);
        
        if (cardData && !cardElement.dataset.editing) {
            cardData.isFlipped = !cardData.isFlipped;
            cardElement.classList.toggle('flipped');
        }
    }
}

// --- Atualizar a função handleDoubleTap ---
function handleDoubleTap(e, cardElement) {
    const currentTime = Date.now();
    const tapTarget = e.target;
    
    // Verificar se é o mesmo card e intervalo curto
    if (lastTap.target === tapTarget && (currentTime - lastTap.time) < 300) {
        clearTimeout(tapTimeout);
        lastTap = { time: 0, target: null };
        
        // Flipar o card
        const cardId = parseInt(cardElement.dataset.id);
        const cardData = state.cards.find(c => c.id === cardId);
        
        if (cardData && !cardElement.dataset.editing) {
            cardData.isFlipped = !cardData.isFlipped;
            cardElement.classList.toggle('flipped');
            
            // Feedback visual
            cardElement.classList.add('flip-animation');
            setTimeout(() => {
                cardElement.classList.remove('flip-animation');
            }, 100);
        }
        return true; // Double-tap detectado
    }
    
    // Primeiro toque
    lastTap = { time: currentTime, target: tapTarget };
    tapTimeout = setTimeout(() => {
        lastTap = { time: 0, target: null }; // Resetar após timeout
    }, 300);
    
    return false; // Não foi double-tap
}

// Função auxiliar para obter coordenadas de mouse ou toque
function getEventCoords(e) {
    if (e.touches && e.touches.length) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
}

function onDragStart(e) {
    if (e.type === 'mousedown' && e.button !== 0) return;
    if (e.target.closest('.action-btn, .edit-textarea')) return;
    if (e.type === 'touchstart' && (Date.now() - lastTap) < 350) {
        return; // Ignorar arrastes que acontecem logo após um double-tap
    }

    const coords = getEventCoords(e);
    const cardElement = e.target.closest('.flashcard');
    const resizeHandle = e.target.closest('.resize-handle');

    if (resizeHandle) {
        // --- INICIANDO O REDIMENSIONAMENTO ---
        e.stopPropagation(); // Impede o início do pan no canvas
        isResizing = true;
        activeCard = cardElement;
        const cardRect = activeCard.getBoundingClientRect();
        initialCardWidth = cardRect.width;
        initialCardHeight = cardRect.height;
        panStartX = coords.x; // Reutilizamos panStart para a posição inicial
        panStartY = coords.y;

        const cardId = parseInt(activeCard.dataset.id);
        const cardData = state.cards.find(c => c.id === cardId);
        
        if (cardData) {
            initialCardX = cardData.x;
            initialCardY = cardData.y;
            isCardFlipped = cardData.isFlipped;
            activeCard.classList.add('resizing');
        }

    } else if (cardElement) {
        // --- INICIANDO O ARRASTO DO CARD ---
        isDraggingCard = false;
        activeCard = cardElement;

        // GUARDA A POSIÇÃO INICIAL PARA O CÁLCULO DO THRESHOLD
        const cardRect = activeCard.getBoundingClientRect();
        dragOffsetX = coords.x - cardRect.left;
        dragOffsetY = coords.y - cardRect.top;
        panStartX = coords.x; // Usamos panStart para a posição inicial do dedo
        panStartY = coords.y; // Usamos panStart para a posição inicial do dedo

        activeCard.style.cursor = 'grabbing';
        activeCard.style.zIndex = 10;
    } else {
        // --- INICIANDO O PAN ---
        isPanning = true;
        panStartX = coords.x;
        panStartY = coords.y;
    }

    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchend', onDragEnd);
}

function onDragMove(e) {
    if (e.type === 'touchmove') e.preventDefault();
    const coords = getEventCoords(e);

    if (isResizing && activeCard) {
        const dx = coords.x - panStartX;
        const dy = coords.y - panStartY;
        const cardId = parseInt(activeCard.dataset.id);
        const cardData = state.cards.find(c => c.id === cardId);

        if (cardData) {
            let newWidth = Math.max(100, initialCardWidth);
            let newHeight = Math.max(80, initialCardHeight);
            let newX = cardData.x;
            let newY = cardData.y;

            if (isCardFlipped) {
                // Para cards flipados, invertemos a direção do resize no eixo X
                newWidth = Math.max(100, initialCardWidth - dx);
                newHeight = Math.max(80, initialCardHeight + dy);
                newX = initialCardX + dx; // Movemos o card para acompanhar o resize
            } else {
                newWidth = Math.max(100, initialCardWidth + dx);
                newHeight = Math.max(80, initialCardHeight + dy);
            }

            cardData.width = newWidth;
            cardData.height = newHeight;
            
            // Atualizamos a posição apenas para cards flipados
            if (isCardFlipped) {
                cardData.x = newX;
            }

            activeCard.style.width = `${newWidth}px`;
            activeCard.style.height = `${newHeight}px`;
            activeCard.style.left = `${cardData.x - state.view.x}px`;
            renderConnections();
        }
    } else if (activeCard) {
        const dx = coords.x - panStartX;
        const dy = coords.y - panStartY;

        // SÓ CONSIDERA "DRAG" SE O MOVIMENTO EXCEDER O LIMIAR
        if (!isDraggingCard && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
            isDraggingCard = true;
        }

        // A LÓGICA DE MOVER O CARD SÓ EXECUTA SE FOR UM ARRASTE DE FATO
        if (isDraggingCard) {
            const wrapperRect = canvasWrapper.getBoundingClientRect();
            let newX = coords.x - wrapperRect.left - dragOffsetX + state.view.x;
            let newY = coords.y - wrapperRect.top - dragOffsetY + state.view.y;

            const cardId = parseInt(activeCard.dataset.id);
            const cardData = state.cards.find(c => c.id === cardId);
            if (cardData) {
                cardData.x = newX;
                cardData.y = newY;
            }
            activeCard.style.left = `${cardData.x - state.view.x}px`;
            activeCard.style.top = `${cardData.y - state.view.y}px`;
            renderConnections();
        }

    } else if (isPanning) {
        // --- LÓGICA DE PAN (EXISTENTE) ---
        const dx = coords.x - panStartX;
        const dy = coords.y - panStartY;
        state.view.x -= dx;
        state.view.y -= dy;
        panStartX = coords.x;
        panStartY = coords.y;
        render();
    }
}

function onDragEnd(e) {
    if (activeCard) {
        activeCard.classList.remove('resizing');

        const cardId = parseInt(activeCard.dataset.id);
        const cardData = state.cards.find(c => c.id === cardId);
        
        if (cardData) {
            let cardRect = activeCard.getBoundingClientRect();
            initialCardWidth = cardRect.width;
            initialCardHeight = cardRect.height;
            initialCardX = cardData.x; // Capturamos a posição X inicial
            isCardFlipped = cardData.isFlipped; // Estado de flip
        }

        if (!isDraggingCard && !isResizing && !activeCard.dataset.editing) { // <-- Adicionado !isResizing
            if (cardData) {
                cardData.isFlipped = !cardData.isFlipped;
                activeCard.classList.toggle('flipped');
            }
        }
        activeCard.style.cursor = 'grab';
        activeCard.style.zIndex = 5;
        activeCard = null;
        renderConnections();
    }

    // Reseta todos os estados de interação
    isPanning = false;
    isDraggingCard = false;
    isResizing = false; // <-- RESETAR O NOSSO ESTADO
    isTouchInteraction = false; // Adicionar esta linha

    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('touchend', onDragEnd);
}

// Substituir o listener antigo pelos novos
canvasWrapper.addEventListener('mousedown', onDragStart);
canvasWrapper.addEventListener('touchstart', onDragStart);

// --- RENDERIZAÇÃO ---
function render() {
    renderCards();
    renderConnections();
    updateSelects();
    updateMapList();
    canvas.style.backgroundPosition = `${-state.view.x}px ${-state.view.y}px`;
}

function renderCards() {
    canvas.innerHTML = '';
    const filteredCards = state.activeFilter
        ? state.cards.filter(card => card.tags.includes(state.activeFilter))
        : state.cards;

    filteredCards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'flashcard';
        if (card.isFlipped) cardEl.classList.add('flipped');

        cardEl.dataset.id = card.id;
        cardEl.style.left = `${card.x - state.view.x}px`;
        cardEl.style.top = `${card.y - state.view.y}px`;
        cardEl.style.width = `${card.width}px`;
        cardEl.style.height = `${card.height}px`;

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
        </div>
            `;
        canvas.appendChild(cardEl);
    });
}

function renderConnections() {
    connectorSvg.innerHTML = '';
    const visibleCardIds = new Set(
        (state.activeFilter
            ? state.cards.filter(card => card.tags.includes(state.activeFilter))
            : state.cards
        ).map(c => c.id)
    );

    state.connections.forEach(conn => {
        if (visibleCardIds.has(conn.from) && visibleCardIds.has(conn.to)) {
            const fromCard = state.cards.find(c => c.id === conn.from);
            const toCard = state.cards.find(c => c.id === conn.to);

            if (fromCard && toCard) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

                const x1 = (fromCard.x + fromCard.width / 2) - state.view.x;
                const y1 = (fromCard.y + fromCard.height / 2) - state.view.y;
                const x2 = (toCard.x + toCard.width / 2) - state.view.x;
                const y2 = (toCard.y + toCard.height / 2) - state.view.y;

                line.setAttribute('x1', x1);
                line.setAttribute('y1', y1);
                line.setAttribute('x2', x2);
                line.setAttribute('y2', y2);
                line.setAttribute('stroke', '#4A5568');
                line.setAttribute('stroke-width', '2');
                connectorSvg.appendChild(line);
            }
        }
    });
}

function updateSelects() {
    fromCardSelect.innerHTML = '';
    toCardSelect.innerHTML = '';
    state.cards.forEach(card => {
        fromCardSelect.add(new Option(`Card #${card.id}`, card.id));
        toCardSelect.add(new Option(`Card #${card.id}`, card.id));
    });
}

// --- MANIPULAÇÃO DE EVENTOS DOS CONTROLES E CARDS ---
addCardForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pergunta = document.getElementById('pergunta').value;
    const resposta = document.getElementById('resposta').value;
    const tagsInput = document.getElementById('tags').value;
    const tags = tagsInput.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag);

    if (tags.length === 0) {
        alert('Por favor, adicione pelo menos uma tag.');
        return;
    }

    const newCard = {
        id: state.nextCardId++,
        pergunta,
        resposta,
        tags,
        x: (canvasWrapper.clientWidth / 2 - 100) + state.view.x,
        y: (canvasWrapper.clientHeight / 2 - 60) + state.view.y,
        width: 200,
        height: 120,
        isFlipped: false
    };

    state.cards.push(newCard);
    addCardForm.reset();
    render();
});

function deleteCard(cardId) {
    state.cards = state.cards.filter(c => c.id !== cardId);
    state.connections = state.connections.filter(c => c.from !== cardId && c.to !== cardId);
    render();
}

function toggleEditMode(cardEl) {
    const cardId = parseInt(cardEl.dataset.id);
    const cardData = state.cards.find(c => c.id === cardId);
    const isEditing = cardEl.dataset.editing === 'true';

    const frontContent = cardEl.querySelector('.card-content[data-face="front"]');
    const backContent = cardEl.querySelector('.card-content[data-face="back"]');
    const editBtns = cardEl.querySelectorAll('.btn-edit');

    if (isEditing) {
        // --- SALVAR MUDANÇAS ---
        const newPergunta = frontContent.querySelector('textarea').value;
        const newResposta = backContent.querySelector('textarea').value;

        cardData.pergunta = newPergunta;
        cardData.resposta = newResposta;

        cardEl.removeAttribute('data-editing');
        editBtns.forEach(btn => {
            btn.innerHTML = icons.edit;
            btn.title = "Editar Card";
        });

        frontContent.innerHTML = cardData.pergunta;
        backContent.innerHTML = cardData.resposta;

    } else {
        // --- ENTRAR NO MODO DE EDIÇÃO ---
        cardEl.classList.add('flip-animation');
        setTimeout(() => {
            cardEl.classList.remove('flip-animation');
        }, 100);
        cardEl.dataset.editing = 'true';
        editBtns.forEach(btn => {
            btn.innerHTML = icons.save;
            btn.title = "Salvar Mudanças";
        });

        frontContent.innerHTML = `<textarea class="edit-textarea">${cardData.pergunta}</textarea>`;
        backContent.innerHTML = `<textarea class="edit-textarea">${cardData.resposta}</textarea>`;

        cardEl.querySelectorAll('.edit-textarea').forEach(ta => {
            ta.addEventListener('mousedown', e => e.stopPropagation());
        });
    }
}

connectCardsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fromId = parseInt(fromCardSelect.value);
    const toId = parseInt(toCardSelect.value);

    if (fromId && toId && fromId !== toId) {
        const exists = state.connections.some(c => (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId));
        if (!exists) {
            state.connections.push({ from: fromId, to: toId });
            renderConnections();
        } else {
            alert('Essa conexão já existe.');
        }
    }
});

clearCanvasBtn.addEventListener('click', () => {
    state = { cards: [], connections: [], nextCardId: 1, activeFilter: null, view: { x: 0, y: 0 } };
    mapNameInput.value = '';
    filterTagInput.value = '';
    render();
});

filterBtn.addEventListener('click', () => {
    const filterValue = filterTagInput.value.trim().toLowerCase();
    if (filterValue) {
        state.activeFilter = filterValue;
        render();
    }
});

clearFilterBtn.addEventListener('click', () => {
    state.activeFilter = null;
    filterTagInput.value = '';
    render();
});

async function getSavedMaps() {
    try {
        const result = await Filesystem.readdir({
            path: '', // Lê a raiz do diretório de dados
            directory: Directory.Data // Diretório seguro para dados do app
        });
        // Retorna um objeto no mesmo formato que o original, para compatibilidade
        const maps = {};
        for (const fileName of result.files) {
            // Nossos arquivos são salvos como "nome_do_mapa.json"
            if (fileName.name.endsWith('.json')) {
                const mapName = fileName.name.replace('.json', '');
                // Aqui apenas listamos os nomes. O conteúdo será lido em loadMap.
                maps[mapName] = {};
            }
        }
        return maps;
    } catch (e) {
        // O diretório pode não existir na primeira execução.
        console.log("Nenhum mapa salvo encontrado.", e);
        return {};
    }
}

async function saveCurrentMap() {
    const name = mapNameInput.value.trim();
    if (!name) {
        alert('Por favor, dê um nome ao seu mapa.');
        return;
    }
    state.nextCardId = state.cards.length > 0 ? Math.max(...state.cards.map(c => c.id)) + 1 : 1;

    try {
        await Filesystem.writeFile({
            path: `${name}.json`,
            data: JSON.stringify(state),
            directory: Directory.Data,
            encoding: Encoding.UTF8,
        });
        alert(`Mapa "${name}" salvo com sucesso!`);
        updateMapList();
    } catch (e) {
        console.error('Erro ao salvar o mapa:', e);
        alert('Ocorreu um erro ao salvar o mapa.');
    }
}

async function loadMap() {
    const name = loadMapSelect.value;
    if (!name) return;

    try {
        const file = await Filesystem.readFile({
            path: `${name}.json`,
            directory: Directory.Data,
            encoding: Encoding.UTF8,
        });

        state = JSON.parse(file.data);
        // Garantir compatibilidade com mapas antigos
        state.activeFilter = state.activeFilter === undefined ? null : state.activeFilter;
        state.view = state.view === undefined ? { x: 0, y: 0 } : state.view;
        state.cards.forEach(c => {
            c.width = c.width || 200;
            c.height = c.height || 120;
        });

        mapNameInput.value = name;
        filterTagInput.value = state.activeFilter || '';
        render();
        alert(`Mapa "${name}" carregado.`);

    } catch (e) {
        console.error('Erro ao carregar o mapa:', e);
        alert('Ocorreu um erro ao carregar o mapa.');
    }
}

async function deleteMap() {
    const name = loadMapSelect.value;
    if (!name || !confirm(`Tem certeza que deseja deletar o mapa "${name}"?`)) return;

    try {
        await Filesystem.deleteFile({
            path: `${name}.json`,
            directory: Directory.Data,
        });
        alert(`Mapa "${name}" deletado.`);
        updateMapList();
    } catch (e) {
        console.error('Erro ao deletar o mapa:', e);
        alert('Ocorreu um erro ao deletar o mapa.');
    }
}

async function updateMapList() {
    const allMaps = await getSavedMaps(); // Agora é uma função assíncrona
    const mapNames = Object.keys(allMaps);
    loadMapSelect.innerHTML = '';
    if (mapNames.length === 0) {
        loadMapSelect.add(new Option('Nenhum mapa salvo', ''));
    } else {
        mapNames.forEach(name => {
            loadMapSelect.add(new Option(name, name));
        });
    }
}

// ATENÇÃO: Os event listeners agora devem chamar as versões `async`
saveMapBtn.addEventListener('click', saveCurrentMap);
loadMapBtn.addEventListener('click', loadMap);
deleteMapBtn.addEventListener('click', deleteMap);

document.addEventListener('DOMContentLoaded', () => {
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const controlsPanel = document.getElementById('controls');
    const canvasWrapper = document.getElementById('canvas-wrapper');

    setupEventListeners();

    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede que o clique se propague para o canvas
            controlsPanel.classList.toggle('active');
        });

        // Opcional: fechar o menu ao clicar fora dele
        canvasWrapper.addEventListener('click', () => {
            if (controlsPanel.classList.contains('active')) {
                controlsPanel.classList.remove('active');
            }
        });
    }
});

// E a inicialização também precisa ser adaptada
window.onload = async () => { // <--- Torne a função async
    render();
    await updateMapList(); // <--- Chame a nova updateMapList
};

window.onresize = () => {
    render();
};