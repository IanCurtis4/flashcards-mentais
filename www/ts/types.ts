// types.ts

import { User } from "firebase/auth";

// Interface para as coordenadas de um ponteiro (mouse ou toque)
export interface PointerCoords {
    x: number;
    y: number;
}

// Interface para um card individual no mapa mental
export interface Card {
    id: number;
    pergunta: string;
    resposta: string;
    tags: string[];
    x: number;
    y: number;
    width: number;
    height: number;
    isFlipped: boolean;
}

// Interface para uma conexão entre dois cards
export interface Connection {
    from: number;
    to: number;
}

// Interface para o estado global da aplicação
export interface AppState {
    cards: Card[];
    connections: Connection[];
    nextCardId: number;
    activeFilter: string | null;
    view: {
        x: number;
        y: number;
        zoom: number; // Adicionado o zoom
    };
    currentUser: User | null;
    unsubscribeFromMaps: (() => void) | null;
}

// Interface para os dados de um mapa como são salvos no Firestore
export interface FirebaseMapData {
    id: string;
    name: string;
    state?: string; // O estado completo é salvo como uma string JSON
}