# ✨ Poke DUO

**Launcher desktop para jogar 2 contas do [Pokepixel Idle](https://pokepixel.nietore.com/play/) ao mesmo tempo, lado a lado, na mesma janela.**

Cada conta roda no seu próprio perfil de navegador, completamente isolado (o Electron separa por `partition`), então cookies, sessão e login de uma conta nunca se misturam com os da outra. Feito pra quem joga com 2 contas em paralelo e cansou de precisar de duas janelas de navegador espalhadas pela tela, logando manualmente em cada uma toda vez.

![status](https://img.shields.io/badge/vers%C3%A3o-1.0.3-58a6ff) ![plataforma](https://img.shields.io/badge/plataforma-Windows-0d1117) ![feito com](https://img.shields.io/badge/feito%20com-Electron-2ea043)

---

## 📑 Índice

- [Como rodar](#-como-rodar)
- [Funcionalidades](#-funcionalidades)
- [Atalhos de teclado](#️-atalhos-de-teclado)
- [Estrutura dos arquivos](#-estrutura-dos-arquivos)
- [Histórico de mudanças](#-histórico-de-mudanças)
- [Ajuste fino do login automático](#-ajuste-fino-do-login-automático)
- [Segurança e privacidade](#-segurança-e-privacidade)
- [Agradecimentos](#-agradecimentos)

---

## 🚀 Como rodar

Precisa do [Node.js](https://nodejs.org) instalado (versão LTS).

- **Windows, do jeito mais simples:** dê dois cliques em `Abrir PokeDUO.vbs`. Na primeira vez ele
  instala tudo sozinho (aparece uma janelinha preta só nessa primeira vez) e depois abre o app
  sem nenhuma janela de terminal. Dica: clique direito nesse arquivo → **Enviar para** → **Área
  de trabalho (criar atalho)** pra deixar um atalho fixo.

---

## 🎮 Funcionalidades

### 🖥️ Duas contas, uma janela só
A tela é dividida em 2 painéis lado a lado, cada um logado numa conta diferente e totalmente
isolado da outra (sessão, cookies e login próprios). O nome do personagem de cada conta aparece
no cabecinho do painel dela, depois de configurado.

### 🔐 Contas salvas com login automático
O botão **👤 Contas** abre uma tela pra cadastrar e-mail, senha e nome do personagem de cada
conta. Os dados ficam **criptografados em disco** (usando o DPAPI do Windows / keychain do
sistema — só o seu usuário consegue descriptografar). Com "login automático" marcado numa conta,
o launcher tenta preencher e entrar sozinho sempre que a tela de login aparecer, seja na
abertura do app ou depois de um reload/reset.

O botão **▶ Logar as duas** força uma nova tentativa de login automático nos dois painéis, útil
se alguma sessão cair.

### 🔍 Zoom independente por painel
Cada painel tem seu próprio controle de zoom (**−** / **+**), do jeito que o Ctrl+scroll do
navegador funciona — o zoom escolhido é mantido mesmo depois de recarregar aquela conta.

### 🔲 Tela cheia de cada conta (`Ctrl+1` / `Ctrl+2`)
Expande o painel da conta 1 ou da conta 2 pra ocupar a janela inteira, escondendo o outro painel
temporariamente. Aperta de novo (ou `ESC`) pra voltar à divisão dos dois lado a lado. Também dá
pra fazer isso com o botão **⛶** de cada painel, ou clicando com o **botão direito** dentro do
próprio jogo (fora de campos de texto). Funciona tanto clicando fora das instâncias quanto com o
foco dentro de uma delas.

### 🙈 Modo tela cheia do launcher (`Ctrl+H`)
Esconde toda a interface do launcher (barra de cima e cabeçalho de cada conta), deixando só os
dois jogos ocupando a tela — sem tirar a barra de tarefas do Windows do lugar, então continua
fácil alternar pra outros programas. Uma linha bem fina aparece entre os dois painéis nesse modo
só pra deixar claro que são duas telas separadas. `ESC` ou `Ctrl+H` de novo trazem a interface de
volta.

### ⏻ Reset forçado por painel
Às vezes o site do jogo trava de um jeito que nem "recarregar" resolve, porque o processo
travado continua sendo o mesmo. O botão **⏻** de cada painel vai além do reload comum: destrói o
processo daquele painel por completo e cria um novo do zero, mantendo a mesma sessão salva (o
login não se perde) — resolve travamentos que um recarregar normal não resolve.

### 🧹 Esconde o que atrapalha, automaticamente
O launcher já limpa a tela do jogo sozinho, sem precisar fazer nada:
- Esconde o link/banner de Discord.
- Esconde o banner promocional do jogo.
- Esconde o botão de troca de servidor (`world-servers-fab`) no canto da tela — `Ctrl+B` mostra
  ou esconde ele de novo, alternando nos dois painéis ao mesmo tempo.

Tudo isso é feito só visualmente (mesma lógica de um bloqueador de anúncio, sem clicar em nada
sozinho) e continua escondido mesmo se o jogo recriar o elemento depois.

### 🧲 Barra de ícones do jogo, arrastável e redimensionável
A barra de ícones do topo do jogo (Inventário, Caçadas, Social, etc.) vem presa no site por
padrão. O launcher libera ela: segure **Alt e arraste** pra mover pra qualquer lugar da tela, ou
**Alt + roda do mouse** pra aumentar/diminuir o tamanho dela. Sem o Alt, os botões continuam
funcionando normalmente. A posição e o tamanho escolhidos ficam salvos por conta, então não
precisa reajustar toda vez que abrir o jogo.

### 🪟 Janela sem moldura do Windows
A janela não usa mais a barra de título nativa do Windows — a própria barra de cima do app faz
esse papel (dá pra arrastar a janela por ela, e dar 2 cliques pra maximizar/restaurar), com
botões próprios de minimizar, maximizar e fechar no canto direito.

### 🧩 Outros detalhes
- Instância única: abrir o app de novo só foca a janela já aberta, não abre uma segunda.
- Qualquer link/navegação que tente sair do domínio do jogo abre no navegador normal do PC, em
  vez de virar uma aba/popup dentro do launcher.
- `F12` dentro de um painel abre o DevTools daquele painel específico (útil pra inspecionar
  elementos e passar seletores, caso algo precise de ajuste).
- `Ctrl+F5` dentro (ou fora, com foco na barra) de um painel recarrega ignorando o cache, sem
  apagar cookies/login.
- Se o processo de um painel cair sozinho (crash), ele recarrega automaticamente depois de um
  tempinho.
- Nenhuma permissão de câmera, microfone, localização ou notificação do site é concedida
  automaticamente.

  ### ☕ Doação via Pix
Botão **☕ Doar um café** abre um QR Code e o código Pix copia-e-cola, pra quem quiser apoiar o
projeto.

---

## ⌨️ Atalhos de teclado

| Atalho | O que faz |
|---|---|
| `Ctrl+1` | Tela cheia da conta 1 (aperta de novo pra voltar) |
| `Ctrl+2` | Tela cheia da conta 2 (aperta de novo pra voltar) |
| `Ctrl+H` | Modo tela cheia do launcher (esconde a interface, só os jogos) |
| `Ctrl+B` | Mostra/esconde o botão de troca de servidor do jogo |
| `Ctrl+F5` | Recarrega ignorando o cache (sem deslogar) |
| `Esc` | Sai do modo tela cheia do launcher e/ou volta à divisão dos painéis |
| `F12` (dentro do painel) | Abre o DevTools daquele painel |
| Botão direito (dentro do jogo) | Expande/restaura o painel clicado |

---

## 📁 Estrutura dos arquivos

- `main.js` — processo principal do Electron: cria a janela, guarda as contas criptografadas,
  trata todos os atalhos de teclado (inclusive os que acontecem com o foco dentro do jogo),
  notificações e os botões da barra de título customizada.
- `preload.js` — ponte segura (context bridge) entre `main.js` e a interface (`index.html`).
- `index.html` — toda a interface: os 2 painéis, zoom, modal de contas, modal de doação e a
  lógica de esconder elementos do jogo.
- `Abrir PokeDUO.vbs` — atalho pra abrir o app no Windows sem precisar de terminal.

---

## 🧭 Histórico de mudanças

### v1.0.4
- Barra de ícones do jogo agora pode ser arrastada (`Alt` + arrastar) e redimensionada
  (`Alt` + roda do mouse) pra qualquer lugar da tela, sem afetar os cliques normais nos botões.
  Posição e tamanho ficam salvos por conta.

### v1.0.3
- Corrigido: `Ctrl+1` / `Ctrl+2` não funcionavam com o foco dentro de um painel (só funcionavam
  clicando na área entre os painéis) — agora funcionam em qualquer situação.
- Adicionado número da versão ao lado do nome do app na barra de cima.

### v1.0.2
- Adicionado o botão de **reset forçado (⏻)** por painel, pra destravar quando um recarregar
  normal não resolve.
- Adicionada uma linha fina de divisão entre os dois painéis no modo tela cheia do launcher.
- Esconder automaticamente o botão de troca de servidor do jogo, com `Ctrl+B` pra alternar.

### v1.0.1
- Janela sem moldura nativa do Windows: barra de título customizada (arrastável, com botões
  próprios de minimizar/maximizar/fechar).
- Corrigido: modo tela cheia do launcher ainda deixava uma faixa da moldura do Windows visível.
- `Esc` agora também sai do modo tela cheia do launcher, além de voltar à divisão dos painéis.

### v1.0.0
- Primeira versão: 2 contas lado a lado, perfis isolados, contas salvas e criptografadas com
  login automático, zoom por painel, tela cheia por conta (`Ctrl+1`/`Ctrl+2`), modo tela cheia do
  launcher (`Ctrl+H`), esconder banner/Discord do jogo automaticamente, botão de doação via Pix.

---

## 🔧 Ajuste fino do login automático

O script de login automático é um "chute educado": ele procura um campo de senha, um campo de
e-mail/usuário perto dele e um botão com texto tipo "Entrar"/"Login", e clica sozinho. Se a tela
de login do Pokepixel Idle mudar de formato (login em etapas, captcha, campos com nomes fora do
comum), aperte `F12` dentro do jogo, vá na aba **Elements**, clique com o botão direito no campo
de e-mail ou senha → **Inspecionar**, e envie o trecho do HTML pra o script ser ajustado certinho.

---

## 🔒 Segurança e privacidade

- E-mail e senha das contas ficam salvos **só no seu computador**, criptografados via DPAPI
  (Windows) ou keychain do sistema — nunca são enviados pra nenhum servidor além do próprio jogo.
- O launcher não pede nem concede permissões de câmera, microfone, localização ou notificações
  do site.
- Toda navegação que sai do domínio do jogo é bloqueada dentro do app e redirecionada pro
  navegador padrão do sistema.

---

## 💜 Agradecimentos

Um obrigado especial ao **SOUFOKA**, cujo projeto **PokeGrid** foi a base usada pra construir esse
launcher.
