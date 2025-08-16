// maps.ts

import { collection, doc, setDoc, getDoc, deleteDoc, onSnapshot, query, where, getDocs, DocumentData, DocumentReference } from "firebase/firestore";
import { db } from './firebase';
import { state, render, clearCanvasState } from './canvas';
import { AppState, FirebaseMapData } from './types';
import { Dialog } from "@capacitor/dialog";
import { Toast } from "@capacitor/toast";

// --- REFERÊNCIAS AOS ELEMENTOS DO DOM ---
const mapNameInput = document.getElementById('map-name') as HTMLInputElement;
const loadMapSelect = document.getElementById('load-map-select') as HTMLSelectElement;
const filterTagInput = document.getElementById('filter-tag-input') as HTMLInputElement;

// Variável para controlar o auto-save
let autoSaveTimeout: NodeJS.Timeout | null = null;
const AUTO_SAVE_DELAY = 1000; // 1 segundo de delay para evitar saves excessivos

/**
 * Auto-save local: salva automaticamente no localStorage após mudanças
 */
export function triggerAutoSave(): void {
    // Clear do timeout anterior para evitar saves múltiplos
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }
    
    // Agenda o auto-save com delay
    autoSaveTimeout = setTimeout(() => {
        const currentMapName = mapNameInput.value.trim() || "$";
        
        // Garante que o nextCardId está atualizado
        state.nextCardId = state.cards.length > 0 ? Math.max(...state.cards.map(c => c.id)) + 1 : 1;
        
        const mapStateToSave: Omit<AppState, 'currentUser' | 'unsubscribeFromMaps'> = { ...state };
        
        // Salva localmente
        localStorage.setItem(`map_${currentMapName}`, JSON.stringify(mapStateToSave));
        
        // Atualiza a lista de mapas se necessário
        if (!state.currentUser) {
            updateMapList();
        }
        
        console.log(`Auto-save realizado para: ${currentMapName}`);
    }, AUTO_SAVE_DELAY);
}
/**
 * Ouve em tempo real as mudanças na coleção de mapas do usuário no Firestore.
 */
export function listenToFirestoreMaps(): void {
    if (!state.currentUser) return;

    const mapsCollectionRef = collection(db, 'users', state.currentUser.uid, 'maps');
    state.unsubscribeFromMaps = onSnapshot(mapsCollectionRef, (snapshot) => {
        const firestoreMaps: FirebaseMapData[] = [];
        snapshot.forEach(doc => {
            firestoreMaps.push({ id: doc.id, name: doc.data().name });
        });
        updateMapList(firestoreMaps);
    });
}

/**
 * Atualiza a lista de mapas disponíveis no select.
 * @param firestoreMaps - Lista de mapas vinda do Firestore (opcional).
 */
export async function updateMapList(firestoreMaps: FirebaseMapData[] | null = null): Promise<void> {
    let mapsToDisplay: FirebaseMapData[] = firestoreMaps || [];

    // Se estiver offline, tente carregar do armazenamento local (simulado com localStorage)
    if (!firestoreMaps) {
        const localMaps = getLocalSavedMaps();
        mapsToDisplay = Object.keys(localMaps).map(name => ({
            id: name, // Para mapas locais, o nome é o ID
            name: name
        }));
    }

    loadMapSelect.innerHTML = '';
    if (mapsToDisplay.length === 0) {
        loadMapSelect.add(new Option('Nenhum mapa salvo', ''));
    } else {
        mapsToDisplay.forEach(map => {
            loadMapSelect.add(new Option(map.name, map.id));
        });
    }
}

/**
 * Encontra um documento no Firestore pelo nome do mapa
 */
async function findMapByName(mapName: string): Promise<string | null> {
    if (!state.currentUser) return null;
    
    try {
        const mapsRef = collection(db, 'users', state.currentUser.uid, 'maps');
        const q = query(mapsRef, where('name', '==', mapName));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].id;
        }
    } catch (error) {
        console.error('Erro ao buscar mapa por nome:', error);
    }
    
    return null;
}

/**
 * Sincroniza o mapa atual com a nuvem (Firestore)
 * Substitui a função saveCurrentMap original
 */
export async function syncWithCloud(): Promise<void> {
    if (!state.currentUser) {
        Toast.show({text:'Você precisa estar logado para sincronizar com a nuvem.'});
        return;
    }
    
    const name = mapNameInput.value.trim();
    if (!name) {
        Toast.show({text:'Por favor, dê um nome ao seu mapa antes de sincronizar.'});
        return;
    }
    
    // Garante que o nextCardId está atualizado
    state.nextCardId = state.cards.length > 0 ? Math.max(...state.cards.map(c => c.id)) + 1 : 1;
    
    const mapStateToSave: Omit<AppState, 'currentUser' | 'unsubscribeFromMaps'> = { ...state };

    try {
        // Verifica se já existe um mapa com este nome
        const existingMapId = await findMapByName(name);
        let mapRef: 
            | DocumentReference<DocumentData, DocumentData> 
            | DocumentReference<{ name: string; state: string; }, DocumentData>;
        
        if (existingMapId) {
            // Sobrescreve o mapa existente
            mapRef = doc(db, 'users', state.currentUser.uid, 'maps', existingMapId);
            await setDoc(mapRef, {
                name: name,
                state: JSON.stringify(mapStateToSave)
            });
            Toast.show({text:`Mapa "${name}" atualizado na nuvem!`});
        } else {
            // Cria um novo mapa
            mapRef = doc(collection(db, 'users', state.currentUser.uid, 'maps'));
            await setDoc(mapRef, {
                name: name,
                state: JSON.stringify(mapStateToSave)
            });
            Toast.show({text: `Mapa "${name}" sincronizado com a nuvem!`});
        }
    } catch (e) {
        console.error('Erro ao sincronizar com a nuvem:', e);
        Toast.show({text: 'Ocorreu um erro ao sincronizar com a nuvem.'});
    }
}

/**
 * Salva o estado atual do canvas como um novo mapa.
 */
export async function saveCurrentMap(): Promise<void> {
    const name = mapNameInput.value.trim();
    if (!name) {
        Toast.show({text: 'Por favor, dê um nome ao seu mapa.'});
        return;
    }
    
    // Garante que o nextCardId está atualizado
    state.nextCardId = state.cards.length > 0 ? Math.max(...state.cards.map(c => c.id)) + 1 : 1;
    
    const mapStateToSave: Omit<AppState, 'currentUser' | 'unsubscribeFromMaps'> = { ...state };

    if (state.currentUser) {
        // Salvar no Firestore
        try {
            const mapRef = doc(collection(db, 'users', state.currentUser.uid, 'maps'));
            await setDoc(mapRef, {
                name: name,
                state: JSON.stringify(mapStateToSave)
            });
            Toast.show({text: `Mapa "${name}" salvo na nuvem!`});
        } catch (e) {
            console.error('Erro ao salvar no Firestore:', e);
            Toast.show({text: 'Ocorreu um erro ao salvar na nuvem.'});
        }
    } 
}

/**
 * Carrega um mapa selecionado para o canvas.
 */
export async function loadMap(): Promise<void> {
    const mapId = loadMapSelect.value;
    if (!mapId) return;

    if (state.currentUser) {
        // Carregar do Firestore
        try {
            const mapRef = doc(db, 'users', state.currentUser.uid, 'maps', mapId);
            const docSnap = await getDoc(mapRef);
            if (docSnap.exists()) {
                const mapData = docSnap.data() as FirebaseMapData;
                const loadedState: AppState = JSON.parse(mapData.state!);
                Object.assign(state, loadedState); // Atualiza o estado global
                mapNameInput.value = mapData.name;
                filterTagInput.value = state.activeFilter || '';
                render();
                triggerAutoSave(); // Garante que o estado atual seja salvo
                Toast.show({text: `Mapa "${mapData.name}" carregado da nuvem.`});
            }
        } catch (e) {
            console.error("Erro ao carregar mapa do Firestore:", e);
        }
    } else {
        // Carregar Localmente
        const mapName = loadMapSelect.options[loadMapSelect.selectedIndex].text;
        const localData = localStorage.getItem(`map_${mapName}`);
        if (localData) {
            const loadedState: AppState = JSON.parse(localData);
            Object.assign(state, loadedState);
            mapNameInput.value = mapName;
            filterTagInput.value = state.activeFilter || '';
            render();
            Toast.show({text: `Mapa "${mapName}" carregado localmente.`});
        }
    }
}

/**
 * Deleta um mapa selecionado.
 */
export async function deleteMap(): Promise<void> {
    const mapId = loadMapSelect.value;
    const mapName = loadMapSelect.options[loadMapSelect.selectedIndex].text;
    const confirmResult = await Dialog.confirm({
        okButtonTitle: "Sim", 
        cancelButtonTitle: "Não", 
        message: `Tem certeza que deseja deletar o mapa "${mapName}"?`
    });

    if (!mapId || !confirmResult.value) return;

    if (state.currentUser) {
        // Deletar do Firestore
        try {
            await deleteDoc(doc(db, 'users', state.currentUser.uid, 'maps', mapId));
            Toast.show({text: `Mapa "${mapName}" deletado da nuvem.`});
            // Também remove da versão local se existir
            localStorage.removeItem(`map_${mapName}`);
            clearCanvasState();
        } catch (e) {
            console.error("Erro ao deletar do Firestore:", e);
        }
    } else {
        // Deletar Localmente
        localStorage.removeItem(`map_${mapId}`);
        Toast.show({text: `Mapa "${mapName}" deletado localmente.`});
        clearCanvasState();
        updateMapList();
    }
}

// Função auxiliar para obter mapas salvos localmente
function getLocalSavedMaps(): Record<string, any> {
    const maps: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('map_')) {
            maps[key.replace('map_', '')] = {};
        }
    }
    return maps;
}
