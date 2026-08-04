# Poke DUO

Launcher pra rodar 2 contas do [Pokepixel Idle](https://pokepixel.nietore.com/play/) ao mesmo
tempo, cada uma no seu próprio perfil de navegador (Electron isola por `partition`, então
cookies/localStorage/sessão de cada conta ficam totalmente separados).

## Como rodar

Precisa do [Node.js](https://nodejs.org) instalado.

- Windows: dá dois cliques em `Abrir PokeDuo.vbs` (na primeira vez ele instala tudo sozinho).

## O que já funciona

- Tela dividida em 2, uma conta em cada metade, cada uma em perfil separado.
- Botão direito dentro do jogo maximiza o painel clicado (clica de novo pra voltar a dividir).
- `Ctrl+1` alterna tela cheia da conta 1, `Ctrl+2` da conta 2.
- Botão **👤 Contas**: guarda e-mail/senha das duas contas (criptografado no disco, só o seu
  Windows/keychain consegue ler) e liga o login automático por conta.

> A notificação de shiny foi removida por enquanto (o detector genérico estava disparando falso
> positivo com nick de jogador na tela/chat). Quando você quiser reativar, me passa como o jogo
> avisa um shiny de verdade (mensagem de rede, elemento que aparece na tela, etc.) que eu faço a
> detecção certa, sem gatilho por palavra solta.

## O que ainda precisa de ajuste fino (e por quê)

O login automático é um "chute educado" porque eu não tenho como abrir o jogo aqui pra ver o
HTML real — preciso da sua ajuda pra afinar:

O script procura um campo de senha, um campo de e-mail/usuário perto dele e um botão com texto
tipo "Entrar"/"Login" e clica sozinho. Se a tela de login do Pokepixel Idle for diferente disso
(por exemplo, login em etapas, captcha, ou os campos usam nomes fora do comum), me diga:
- Aperte `Ctrl+Shift+I` **dentro do jogo** (não vai abrir nada por padrão nessa versão — se quiser,
  me avise que eu adiciono esse atalho de novo, ele tava no launcher antigo) e no DevTools veja o
  HTML dos campos de e-mail/senha e do botão de entrar (aba **Elements**, clique com o botão
  direito no campo > **Inspecionar**).
- Me manda o trecho do HTML desses campos.

## Estrutura dos arquivos

- `main.js` — processo principal do Electron (janela, contas criptografadas, atalhos, notificação).
- `preload.js` — ponte seguríssima entre `main.js` e a interface (`index.html`).
- `index.html` — a interface: os 2 painéis, o modal de contas e o log de shiny.
