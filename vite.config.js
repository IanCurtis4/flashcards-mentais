// vite.config.js
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  // 1. Define a raiz do projeto para a pasta 'www'
  // O Vite irá procurar o seu index.html aqui.
  root: 'www',

  // 2. Configura o PostCSS para usar o Tailwind CSS
  plugins: [
    tailwindcss(),
  ],
  
  // 3. Define as configurações de build
  build: {
    // Especifica o diretório de saída do build, relativo à raiz do projeto (não à pasta 'root')
    // O resultado será: /dist/
    outDir: '../dist',
    
    // Garante que o diretório de saída seja limpo antes de cada build
    emptyOutDir: true,
  },

  // 4. Define o diretório público
  // Por padrão, o Vite procura uma pasta 'public' dentro da pasta 'root' ('www/public').
  // Como sua pasta 'public' está na raiz do projeto, ajustamos o caminho.
  publicDir: '../public',
});