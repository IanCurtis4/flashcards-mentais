# Mapa Mental com Flashcards (PWA)

Um aplicativo de mapa mental com flashcards que funciona offline, permitindo que você crie, conecte e estude seus cards de forma visual e interativa.

![Exemplo de uso do aplicativo de Mapa Mental com Flashcards](https://placehold.co/600x400/e2e8f0/4A5568?text=Exemplo+de+Uso+do+App)

## 🌟 Sobre o Projeto

Este é um Progressive Web App (PWA) de código aberto que combina a funcionalidade de mapas mentais com flashcards. A aplicação permite que os usuários criem "cards" com uma pergunta na frente e uma resposta no verso. Esses cards podem ser posicionados livremente em uma tela (canvas), redimensionados, conectados uns aos outros para criar um mapa mental e filtrados por tags.

O projeto foi construído com HTML, CSS (TailwindCSS) e JavaScript puros, sem a necessidade de frameworks, e utiliza um Service Worker para permitir o funcionamento offline.

## ✨ Funcionalidades

O aplicativo oferece uma gama de funcionalidades para ajudar nos seus estudos e organização de ideias:

* **Criação de Flashcards:** Adicione novos cards com uma pergunta (frente) e uma resposta (verso).
* **Tags para Organização:** Atribua tags aos seus cards (ex: `física`, `história`) para facilitar a categorização.
* **Mapa Mental Interativo:**
    * Arraste e posicione os cards livremente pela tela.
    * Redimensione os cards para dar mais ou menos destaque a certos tópicos.
    * Crie conexões visuais (linhas) entre os cards para representar relacionamentos.
* **Virar os Cards:** Clique em um card para virá-lo e ver a resposta.
* **Edição e Exclusão:** Edite o conteúdo de um card diretamente na tela ou remova-o.
* **Filtragem por Tags:** Visualize apenas os cards que pertencem a uma determinada tag.
* **Gerenciamento de Mapas:**
    * Salve o estado atual do seu mapa mental (posição dos cards, conexões, etc.) no armazenamento local do seu navegador.
    * Carregue mapas salvos anteriormente.
    * Delete mapas que não são mais necessários.
* **Funcionamento Offline:** Graças ao Service Worker, o aplicativo pode ser carregado e utilizado mesmo sem conexão com a internet após a primeira visita.
* **Instalação (PWA):** O aplicativo pode ser "instalado" no seu computador ou celular, funcionando como um aplicativo nativo.

## 🚀 Como Usar

Não é necessário instalar nada para usar a aplicação. Basta acessar o link onde o projeto está hospedado.

### Executando Localmente

Se você quiser executar o projeto em sua própria máquina, siga estes passos:

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
    ```

2.  **Abra o arquivo `index.html`:**
    Como o projeto é feito com tecnologias web front-end puras, você não precisa de um servidor complexo. No entanto, para que o Service Worker (`sw.js`) funcione corretamente (especialmente o cache de arquivos), é recomendado usar um servidor local simples.

    A maneira mais fácil é usar uma extensão como o **Live Server** no Visual Studio Code. Com ela instalada, basta clicar com o botão direito no arquivo `index.html` e selecionar "Open with Live Server".

    Se não estiver usando o VS Code, você pode iniciar um servidor simples com Python (se tiver o Python instalado):
    ```bash
    # No terminal, dentro da pasta do projeto
    python -m http.server
    ```
    Depois, abra seu navegador e acesse `http://localhost:8000`.

### Instalando o Aplicativo (PWA)

Após abrir a aplicação no seu navegador (como o Google Chrome), você verá um ícone no canto direito da barra de endereço para instalar o aplicativo.

1.  Clique no ícone de instalação.
2.  Confirme a instalação.
3.  O aplicativo será "instalado" no seu computador e um atalho será criado na sua área de trabalho ou menu de aplicativos. Agora você pode iniciá-lo como um programa normal, em sua própria janela.

## 🛠️ Como Funciona

O aplicativo é composto por três arquivos principais:

* `index.html`: Contém toda a estrutura (HTML), o estilo (CSS com TailwindCSS) e a lógica de interação (JavaScript) da aplicação.
    * **Gerenciamento de Estado:** Um objeto JavaScript `state` armazena a posição, o conteúdo, as conexões e outras propriedades dos cards.
    * **Renderização:** As funções de renderização leem o objeto `state` e desenham os cards e as conexões na tela.
    * **Interatividade:** Manipuladores de eventos (`event listeners`) capturam as ações do usuário (cliques, arrastar) para atualizar o estado e a interface.
    * **Persistência:** Os mapas são salvos no `localStorage` do navegador, permitindo que os dados persistam entre as sessões.

* `manifest.json`: É um arquivo de configuração que descreve o Progressive Web App. Ele informa ao navegador o nome do aplicativo, os ícones a serem usados, a cor do tema e como ele deve se comportar ao ser instalado.

* `sw.js` (Service Worker): É um script que o navegador executa em segundo plano. Neste projeto, ele é responsável por armazenar em cache os arquivos essenciais (`index.html`). Isso permite que o aplicativo seja carregado instantaneamente em visitas futuras e funcione mesmo quando o usuário estiver offline.

## 🤝 Contribuições

Este é um projeto de código aberto e contribuições são bem-vindas. Se você tiver ideias para novas funcionalidades, melhorias ou encontrar algum bug, sinta-se à vontade para abrir uma *Issue* ou enviar um *Pull Request*.

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente. Considere adicionar uma licença (como a [MIT License](https://opensource.org/licenses/MIT)) para deixar isso claro.
