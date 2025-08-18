# Flashcards Mentais 🧠

Um aplicativo de flashcards interativo que funciona no navegador e no celular, com interface de arrastar e soltar para criar mapas mentais visuais.

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** (versão 16 ou superior) - [Download aqui](https://nodejs.org/)
- **npm** (vem junto com o Node.js)
- Para celular: **Android Studio** (para gerar APK) - [Download aqui](https://developer.android.com/studio)

## 🚀 Como rodar o projeto

### 1. Instalação inicial

Primeiro, baixe as dependências do projeto:

```bash
npm install
```

### 2. Modo Desenvolvimento (Web)

Para rodar o app no navegador durante o desenvolvimento:

```bash
npm run dev
```

Isso vai:
- Iniciar um servidor local na porta 5173
- Abrir automaticamente em `http://localhost:5173`
- Recarregar automaticamente quando você modificar arquivos
- Mostrar erros e logs no terminal

**Perfeito para**: Desenvolver novas funcionalidades, testar no computador, debug.

### 3. Modo "App Nativo" no Windows

Se você está no Windows, pode usar o arquivo `launch.bat` para simular um app nativo:

**Duplo clique no `launch.bat`** ou execute:

```bash
launch.bat
```

O que acontece:
- ✅ Inicia automaticamente o servidor de desenvolvimento
- ✅ Abre o Edge/Chrome em modo "app" (sem barras do navegador)
- ✅ Cria um atalho na área de trabalho
- ✅ Fica parecendo um app instalado no Windows
- ✅ Modo kiosk (tela cheia, sem distrações)

**Perfeito para**: Usar como se fosse um programa instalado no Windows.

## 📱 Testando no Celular

### Opção 1: Via rede local (mais fácil)

1. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

2. **Encontre o IP do seu computador:**
   - Windows: `ipconfig` no cmd, procure por "IPv4"
   - Mac/Linux: `ifconfig` no terminal
   - Exemplo: `192.168.1.100`

3. **No celular:**
   - Conecte na mesma rede Wi-Fi
   - Abra o navegador
   - Digite: `http://SEU_IP:5173`
   - Exemplo: `http://192.168.1.100:5173`

**Perfeito para**: Testes rápidos, desenvolvimento, ver como fica no celular.

### Opção 2: Gerando APK (app real)

Para criar um arquivo APK que pode ser instalado no Android:

#### Passo 1: Build do projeto
```bash
npm run build
```
Isso cria uma versão otimizada na pasta `dist/`

#### Passo 2: Sincronizar com Capacitor
```bash
npx cap add android
npx cap sync android
```

#### Passo 3: Abrir no Android Studio
```bash
npx cap open android
```

#### Passo 4: Gerar APK
No Android Studio:
1. Clique no botão  
2. Clique em **Build** > **Generate App Bundles or APKs** > **Generate APKs**
3. Espere a compilação terminar
4. Clique em **locate** quando aparecer a notificação
5. O APK estará em `android/app/build/outputs/apk/debug/`

#### Passo 5: Instalar no celular
- Envie o arquivo APK para seu celular (WhatsApp, email, cabo USB)
- No celular, permita "Fontes desconhecidas" nas configurações
- Toque no arquivo APK para instalar

**Perfeito para**: Distribuir para outras pessoas, teste em múltiplos dispositivos, experiência completa de app.

## 🔧 Comandos Úteis

### Desenvolvimento diário
```bash
# Rodar em modo desenvolvimento (mais usado)
npm run dev

# Fazer build para produção
npm run build

# Visualizar o build localmente
npm run preview
```

### Para celular
```bash
# Sincronizar mudanças com o app mobile
npx cap sync android

# Abrir projeto no Android Studio
npx cap open android

# Ver logs do app no celular
npx cap run android -l
```

### Limpeza e manutenção
```bash
# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Limpar build anterior
rm -rf dist
```

## 🗂️ Estrutura do Projeto

```
flashcards-mentais/
├── node_modules           # Bibliotecas usadas pelo app
├── src                    # Arquivos-fontes do app (nesse caso, os estilos base pré-compilados do Tailwind)
├── www/                   # Código fonte principal
│   ├── index.html         # Página principal
│   ├── assets/            # Pasta de ícones, fontes, etc.
│   ├── styles.css         # Estilos CSS compilados do Tailwind
│   ├── custom.css         # Estilos CSS customizados
│   ├── manifest.json      # Arquivo de manifesto web
│   └── ts/                # Pasta com a lógica do app
│       ├── main.ts        # Código TypeScript principal
│       ├── canvas.ts      # Lógica do canvas interativo
│       ├── auth.ts        # Lógica de autenticação do aplicativo
│       ├── firebase.ts    # Configuração do firebase
│       ├── maps.ts        # Lógica de criação, deleção e gravação de mapas
│       ├── events.ts      # Lógica de eventos do app (clique, toque, zoom, etc.)
│       └── types.ts       # Arquivo de tipos (para uso interno)
├── public/                # Arquivos estáticos (ícones, imagens)
├── dist/                  # Build de produção (criado automaticamente)
├── android/               # Projeto Android (criado pelo Capacitor)
├── launch.bat             # Launcher para Windows
├── package.json           # Dependências do projeto
├── capacitor.config.ts    # Configuração do Capacitor
└── vite.config.js         # Configuração do Vite
```

## 🐛 Solucionando Problemas

### "npm não é reconhecido"
- Instale o Node.js
- Reinicie o terminal/cmd

### "Porta 5173 já está em uso"
- Termine outros processos do Vite: `Ctrl+C` nos terminais abertos
- Ou mude a porta: `npm run dev -- --port 3000`

### APK não instala no celular
- Verifique se "Fontes desconhecidas" está habilitado
- Tente enviar por outro método (cabo USB em vez de WhatsApp)
- Certifique-se que fez o build antes: `npm run build`

### App não conecta no celular via IP
- Verifique se está na mesma rede Wi-Fi
- Teste o IP no navegador do próprio computador primeiro
- Desative firewall temporariamente

### Mudanças não aparecem no APK
- Sempre faça `npm run build` antes de `npx cap sync android`
- No Android Studio, limpe o projeto: **Build** > **Clean Project**

## 🔥 Configurando seu próprio Firebase

Se você quiser usar sua própria base de dados Firebase (recomendado para produção):

### Passo 1: Criar projeto no Firebase Console

1. **Acesse** [console.firebase.google.com](https://console.firebase.google.com)
2. **Clique** em "Criar um projeto"
3. **Nome do projeto**: `meu-flashcards-app` (ou qualquer nome)
4. **Ative** Google Analytics (opcional)
5. **Aguarde** a criação do projeto

### Passo 2: Configurar Firestore Database

1. **No painel lateral**: Clique em "Firestore Database"
2. **Clique** em "Criar banco de dados"
3. **Modo**: Escolha "Começar no modo de teste" (por enquanto)
4. **Local**: Escolha uma região próxima (ex: `southamerica-east1`)
5. **Aguarde** a criação

### Passo 3: Configurar Authentication

1. **No painel lateral**: Clique em "Authentication"
2. **Aba "Sign-in method"**: 
   - Clique em "Google"
   - **Ative** o provedor Google
   - **Email de suporte**: seu-email@gmail.com
   - **Clique** em "Salvar"

### Passo 4: Registrar app Web

1. **Na visão geral do projeto**: Clique no ícone **`</>`** (Web)
2. **Nome do app**: `Flashcards Web`
3. **Marque**: "Também configurar o Firebase Hosting" (opcional)
4. **Clique** em "Registrar app"
5. **COPIE** o código de configuração que aparece:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key-aqui",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

### Passo 5: Registrar app Android

1. **Na visão geral do projeto**: Clique no ícone **Android**
2. **Nome do pacote Android**: `com.seuapp.id` (mesmo do `capacitor.config.ts`)
3. **Nome do app**: `Flashcards Android`
4. **Certificado SHA-1**: Deixe em branco por enquanto (para desenvolvimento)
5. **Clique** em "Registrar app"
6. **BAIXE** o arquivo `google-services.json`

### Passo 6: Atualizar seu código

1. **Substitua** o conteúdo do `www/firebase.ts`:

```typescript
// firebase.ts

import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { Capacitor } from '@capacitor/core';

// SUA configuração do Firebase (cole aqui os dados do Passo 4)
const firebaseConfig = {
    apiKey: "SUA-API-KEY-AQUI",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456",
    measurementId: "G-XXXXXXXXXX"
};

// Inicializa o Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

// Configuração específica para Electron
if (Capacitor.getPlatform() === 'electron') {
    auth.settings.appVerificationDisabledForTesting = true;
}
```

2. **Coloque** o arquivo `google-services.json` em `android/app/`.
### Passo 7: Configurar regras do Firestore

1. **No Firebase Console** > "Firestore Database" > "Regras"
2. **Substitua** por estas regras básicas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite leitura/escrita apenas para usuários autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. **Clique** em "Publicar"

### Passo 9: Testar a configuração

1. **Rode** o projeto: `npm run dev`
2. **Tente** fazer login com Google
3. **Verifique** se os dados aparecem no Firestore Console

### Passo 10: Para produção (opcional)

**Configurar domínio personalizado:**
1. Firebase Console > "Hosting"
2. Adicionar domínio personalizado
3. Atualizar DNS conforme instruções

**Configurar SHA-1 para APK de produção:**
1. Gerar keystore: `keytool -genkey -v -keystore release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000`
2. Extrair SHA-1: `keytool -list -v -keystore release-key.keystore -alias my-key-alias`
3. Adicionar no Firebase Console > "Configurações do projeto" > "Seus apps" > Android

## O que está faltando para o Android?

**Para facilitar a visualização das pastas do projeto, siga essas instruções:**

1. Abra seu Android Studio
2. Vá até o canto superior esquerdo da tela, e ache esse menu: 
![Primeiro passo](/docs/pastas-android-primeiro-passo.png)
3. Abra o menu, e clique na opção `Project`: 
![Segundo passo](/docs/pastas-android-segundo-passo.png)

### 1. **Implementar dependências do Firebase no Android**
   - É necessário adicionar a dependência do Firebase e do plugin do Google Services no build.gradle.
   No arquivo `android/build.gradle`:
   ```gradle
   buildscript {
      dependencies {
         // Adicione esta linha
         classpath 'com.google.gms:google-services:4.4.1'
      }
   }
   ```
   E no `android/app/build.gradle`:
   ```gradle
   apply plugin: 'com.android.application'
   // Adicione no final do arquivo:
   apply plugin: 'com.google.gms.google-services'

   dependencies {
      // Adicione estas dependências
      implementation platform('com.google.firebase:firebase-bom:34.1.0')
      implementation 'com.google.firebase:firebase-auth'
      implementation 'com.google.firebase:firebase-firestore'
   }
   ```
### 2. **Permissões no AndroidManifest.xml**:
   - Verificar se as permissões necessárias (como internet) estão presentes.
   Em `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <application>
      <!-- Adicione estas permissões -->
      <uses-permission android:name="android.permission.INTERNET"/>
      <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
      
      <!-- Adicione dentro de <application> -->
      <meta-data
         android:name="com.google.android.gms.version"
         android:value="@integer/google_play_services_version" />
   </application>
   ```
### 3. **Configuração do OAuth no Android**:
   - Para autenticação com Google, é necessário configurar o fingerprint SHA-1 no Firebase.
   - Para desenvolvimento, você pode usar o debug keystore. O Capacitor usa um keystore padrão para debug.
   Como obter o SHA-1 do debug keystore?
   
   No Linux:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
   No Windows:
   ```cmd
   keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

   E adicionar esse SHA-1 no Firebase Console, no app Android.
### 4. **Configuração de strings.xml para o Firebase** (não é mais necessário se usar google-services.json):
   Em `android/app/src/main/res/values/strings.xml`:
   ```xml
   <resources>
      <!-- Adicione seu ID de cliente web do Firebase -->
      <string name="server_client_id">SEU_CLIENT_ID_DO_FIREBASE</string>
   </resources>
   ```
   O client_id deve ser o mesmo do client_id dessa área do `google-services.json`:
   ```json
   "services": {
        "appinvite_service": {
          "other_platform_oauth_client": [
            {
              "client_id": "190585744647-6fbgbkfn4fk299348bl5utpvisf9e7q1.apps.googleusercontent.com",
              "client_type": 3
            }
          ]
        }
      }
   ```
### 5. **Atualizar o capacitor.config.ts**:
   - O `appId` deve ser o mesmo que o registrado no Firebase para Android (o package name).
   No exemplo, está `com.seuapp.id`. Você deve alterar para o seu próprio, por exemplo: `com.example.flashcards`.
   E também, no Firebase, ao registrar o app Android, usar o mesmo package name.

### Resumo do que deve ser feito em um novo fork:
1. **Alterar o `appId` no `capacitor.config.ts`** para o package name desejado (ex: `com.example.flashcards`).
2. **Registrar o app no Firebase Console** para Android, usando o mesmo package name.
3. **Baixar o `google-services.json`** e colocar em `android/app/`.
4. **Configurar o `build.gradle`** (tanto no nível do projeto quanto no módulo app) para incluir o plugin do Google Services.
5. **Adicionar as dependências do Firebase** no `app/build.gradle`.
6. **Adicionar a permissão de internet** no `AndroidManifest.xml` (se já não estiver).
7. 
7. **Adicionar o SHA-1 do debug keystore** no Firebase Console para o app Android.
8. **Sincronizar o projeto** no Android Studio (Gradle Sync).
9. **Testar** o app.

## ⚠️ Segurança Importante

- **NUNCA** commite arquivos com chaves reais no Git público
- **Use** variáveis de ambiente para produção
- **Configure** regras restritivas no Firestore
- **Ative** App Check para proteção adicional

## 💡 Dicas

- **Use `npm run dev`** para desenvolvimento diário
- **Use `launch.bat`** para demonstrações no Windows  
- **Teste no celular via IP** antes de gerar APK
- **Faça backup** antes de updates grandes
- **Commite frequentemente** se usando Git
- **Teste sempre** a configuração Firebase em modo privado/incógnito

## 🆘 Precisa de Ajuda?

1. Verifique se todos os pré-requisitos estão instalados
2. Tente os comandos de limpeza acima
3. Consulte os logs de erro no terminal
4. Pesquise o erro específico no Google

---

## Responsáveis:

- PO e idealizadora: **Marina Micas Jardim** 
  [GitHub](https://github.com/marinamicas) | [LinkedIn](https://www.linkedin.com/in/marinamicas/) 
- Desenvolvedor: **João Pedro Maione Ribeiro**
  [GitHub](https://github.com/IanCurtis4) | [LinkedIn](https://www.linkedin.com/in/jo%C3%A3o-pedro-maione-ribeiro/)

**Desenvolvido com ❤️ usando Vite + TypeScript + Capacitor**