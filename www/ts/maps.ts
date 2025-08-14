// maps.ts

import { collection, doc, setDoc, getDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from './firebase';
import { state, render, clearCanvasState } from './canvas';
import { AppState, FirebaseMapData } from './types';

// --- REFERÊNCIAS AOS ELEMENTOS DO DOM ---
const mapNameInput = document.getElementById('map-name') as HTMLInputElement;
const loadMapSelect = document.getElementById('load-map-select') as HTMLSelectElement;
const filterTagInput = document.getElementById('filter-tag-input') as HTMLInputElement;

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
    if (!firestoreMaps && !state.currentUser) {
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
 * Salva o estado atual do canvas como um novo mapa.
 */
export async function saveCurrentMap(): Promise<void> {
    const name = mapNameInput.value.trim();
    if (!name) {
        alert('Por favor, dê um nome ao seu mapa.');
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
            alert(`Mapa "${name}" salvo na nuvem!`);
        } catch (e) {
            console.error('Erro ao salvar no Firestore:', e);
            alert('Ocorreu um erro ao salvar na nuvem.');
        }
    } else {
        // Salvar Localmente
        localStorage.setItem(`map_${name}`, JSON.stringify(mapStateToSave));
        alert(`Mapa "${name}" salvo localmente!`);
        updateMapList();
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
                alert(`Mapa "${mapData.name}" carregado da nuvem.`);
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
            alert(`Mapa "${mapName}" carregado localmente.`);
        }
    }
}

/**
 * Deleta um mapa selecionado.
 */
export async function deleteMap(): Promise<void> {
    const mapId = loadMapSelect.value;
    const mapName = loadMapSelect.options[loadMapSelect.selectedIndex].text;
    if (!mapId || !confirm(`Tem certeza que deseja deletar o mapa "${mapName}"?`)) return;

    if (state.currentUser) {
        // Deletar do Firestore
        try {
            await deleteDoc(doc(db, 'users', state.currentUser.uid, 'maps', mapId));
            alert(`Mapa "${mapName}" deletado da nuvem.`);
            clearCanvasState();
        } catch (e) {
            console.error("Erro ao deletar do Firestore:", e);
        }
    } else {
        // Deletar Localmente
        localStorage.removeItem(`map_${mapId}`);
        alert(`Mapa "${mapName}" deletado localmente.`);
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
