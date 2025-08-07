/**
 * Service Worker para o aplicativo de Mapa Mental com Flashcards
 */

// Define o nome e a versão do cache. Mude a versão para forçar a atualização do cache.
const CACHE_NAME = 'mindmap-flashcards-cache-v1';

// Lista de arquivos essenciais para o funcionamento offline do aplicativo.
// Como seu app é um único arquivo HTML, só precisamos dele.
const urlsToCache = [
  './', // O diretório raiz
  'index.html' // O arquivo principal da aplicação
];

/**
 * Evento 'install': É disparado quando o Service Worker é instalado.
 * Ele abre o cache e armazena os arquivos listados em `urlsToCache`.
 */
self.addEventListener('install', event => {
  // O `waitUntil` garante que o service worker não será instalado até que o código dentro dele seja executado com sucesso.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto com sucesso.');
        // Adiciona todos os arquivos essenciais ao cache.
        return cache.addAll(urlsToCache);
      })
  );
});

/**
 * Evento 'fetch': É disparado para cada requisição feita pela página (ex: HTML, CSS, imagens).
 * Ele intercepta a requisição e tenta servir o arquivo do cache primeiro.
 */
self.addEventListener('fetch', event => {
  event.respondWith(
    // `caches.match()` verifica se a requisição já existe no cache.
    caches.match(event.request)
      .then(response => {
        // Se a resposta for encontrada no cache, a retorna.
        if (response) {
          return response;
        }
        // Se não encontrar no cache, faz a requisição à rede.
        return fetch(event.request);
      }
    )
  );
});

/**
 * Evento 'activate': É disparado quando o Service Worker é ativado.
 * É um bom lugar para limpar caches antigos e garantir que o app use a versão mais recente.
 */
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Se o nome do cache não estiver na nossa "whitelist", ele é deletado.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
