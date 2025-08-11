# Flashcard Mind Map
Um aplicativo que combina mapas mentais com flashcards, permitindo criar, conectar e revisar cards de estudo de forma interativa. O projeto usa Capacitor para empacotamento como aplicativo Android.
![Exemplo de Uso](www/assets/icons/192.png)
## Pré-requisitos
- [Node.js](https://nodejs.org/) (v18 ou superior)
- [npm](https://www.npmjs.com/) (v9 ou superior)
- [Android Studio](https://developer.android.com/studio) (para builds Android)
- Java JDK 17
## Instalação
1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/flashcard-mind-map.git
cd flashcard-mind-map
```
2. Instale as dependências:
```bash
npm install
```
## Desenvolvimento
Para iniciar o servidor de desenvolvimento com hot-reload:
```bash
npm run dev
```
O aplicativo estará disponível em: `http://localhost:3000`
## Construindo para Produção
Para criar uma build otimizada:
```bash
npm run build
```
Os arquivos de produção serão gerados na pasta `dist`.
## Configuração para Android
### Adicionando suporte a Android
```bash
npx cap add android
```
### Sincronizando com o projeto Android
```bash
npm run build
npx cap sync
```
### Abrindo no Android Studio
```bash
npx cap open android
```
## Executando no Dispositivo
1. Conecte seu dispositivo Android via USB com depuração USB ativada.
2. No Android Studio:
   - Selecione seu dispositivo no menu de dispositivos.
   - Clique no botão "Run" (▶️).
3. Ou via linha de comando:
```bash
./gradlew installDebug
```
## Estrutura de Pastas
```
.
├── android/              # Projeto Android do Capacitor
├── dist/                 # Builds de produção
├── node_modules/         # Dependências
├── public/               # Arquivos públicos
│   ├── icons/            # Ícones do aplicativo
│   │   ├── 192.png
│   │   └── 512.png
│   └── vite.svg
├── src/                  # Código fonte
│   ├── assets/           
│   │   ├── fonts/        # Fontes customizadas
│   │   │   └── inter.css
│   │   ├── custom.css    # Estilos customizados
│   │   ├── index.html    # Página principal
│   │   ├── main.js       # Lógica principal
│   │   ├── manifest.json # Config PWA
│   │   ├── styles.css    # Estilos globais
│   │   └── sw.js         # Service Worker
├── .gitignore
├── capacitor.config.ts   # Configuração do Capacitor
├── package-lock.json
├── package.json
├── tailwind.config.js    # Config TailwindCSS
└── vite.config.js        # Config Vite
```
## Comandos Úteis
| Comando                | Descrição                                  |
|------------------------|--------------------------------------------|
| `npm run dev`          | Inicia servidor de desenvolvimento         |
| `npm run build`        | Cria build de produção                     |
| `npx cap sync`         | Sincroniza código com projetos nativos     |
| `npx cap open android` | Abre projeto Android no Android Studio     |
| `npx cap run android`  | Executa app no dispositivo/emulador conectado |
## Configuração do Capacitor
O arquivo `capacitor.config.ts` contém as configurações principais:
```typescript
import { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.example.flashcards',
  appName: 'Flashcard Mind Map',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    // Plugins adicionais podem ser configurados aqui
  },
};
export default config;
```
## Personalização
1. **Ícones**: Substitua os arquivos em `www/assets/icons/`
2. **Cores**: Modifique as variáveis em `www/assets/custom.css`
3. **Comportamento**: Edite os handlers em `src/main.js`
## Solução de Problemas Comuns
**Problema:** Erros ao executar `npx cap sync`  
**Solução:** Certifique-se que executou `npm run build` antes
**Problema:** Aplicativo não atualiza no dispositivo  
**Solução:** Execute sequência completa:
```bash
npm run build
npx cap sync
npx cap run android
```
**Problema:** Erros de estilo após instalação  
**Solução:** Recrie as classes Tailwind:
```bash
npm run build
```
## Contribuição
Contribuições são bem-vindas! Siga os passos:
1. Faça um fork do projeto
2. Crie sua branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request