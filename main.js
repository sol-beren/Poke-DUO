const { app, BrowserWindow, ipcMain, safeStorage, Menu, shell, session, Notification, clipboard, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Instancia unica: abrir o app de novo so foca a janela ja aberta.
if (!app.requestSingleInstanceLock()) app.quit();

// Dominio do jogo. Os dois paineis ficam presos aqui: nada de popup, e navegar
// pra fora (por engano ou por algum link do jogo) abre no navegador normal do PC.
const GAME_URL = 'https://pokepixel.nietore.com/play/?ref=amigotreefee6d30495';
const GAME_HOST = 'pokepixel.nietore.com';
const abreFora = (url) => { if (/^https?:\/\//i.test(url)) shell.openExternal(url); };

app.on('web-contents-created', (_e, contents) => {
  if (contents.getType() !== 'webview') return;

  contents.setWindowOpenHandler(({ url }) => { abreFora(url); return { action: 'deny' }; });

  const guarda = (e, url) => {
    try {
      if (new URL(url).host !== GAME_HOST) { e.preventDefault(); abreFora(url); }
    } catch { e.preventDefault(); }
  };
  contents.on('will-navigate', guarda);
  contents.on('will-redirect', guarda);

  // se o processo do painel cair, recarrega sozinho depois de um tempinho
  contents.on('render-process-gone', (_ev, d) => {
    if (d.reason !== 'clean-exit') setTimeout(() => { try { contents.reload(); } catch {} }, 1500);
  });

  // clique direito no jogo (fora de campo editavel) = maximizar/voltar o painel clicado
  contents.on('context-menu', (_ev, params) => {
    if (params && params.isEditable) return;
    try { contents.hostWebContents && contents.hostWebContents.send('hotkey', 'ctx' + contents.id); } catch {}
  });

  // ESC dentro do webview (o foco do teclado fica preso la dentro, entao um
  // listener no documento principal nunca pegaria isso). Nao damos preventDefault,
  // entao o jogo continua recebendo o ESC normalmente tambem.
  // F12 dentro do webview abre o DevTools daquele painel (pra vc inspecionar o
  // elemento que quiser, ex: achar o seletor certo de algo pra esconder/ajustar).
  contents.on('before-input-event', (_ev, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'Escape') {
      try { contents.hostWebContents && contents.hostWebContents.send('hotkey', 'esc'); } catch {}
    } else if (input.key === 'F12') {
      try { contents.toggleDevTools(); } catch {}
    } else if (input.key === 'F5' && input.control) {
      // Ctrl+F5 = recarrega igual o Chrome, ignorando o cache (imagens/scripts velhos
      // guardados localmente). Isso NAO apaga cookies nem a sessao logada - so forca
      // o navegador a baixar os arquivos de novo em vez de usar a copia salva.
      try { contents.reloadIgnoringCache(); } catch {}
    } else if (input.control && input.key.toLowerCase() === 'h') {
      // Ctrl+H com o foco dentro do jogo: o teclado fica preso no webview
      // enquanto ele tem foco, entao precisa ser pego aqui e repassado pro
      // host - mesma logica do ESC acima.
      try { contents.hostWebContents && contents.hostWebContents.send('hotkey', 'toggleUI'); } catch {}
    } else if (input.control && input.key.toLowerCase() === 'b') {
      // Ctrl+B com o foco dentro do jogo: mesma ideia, mostra/esconde o
      // botaozinho de servidor (world-servers-fab) do canto do jogo.
      try { contents.hostWebContents && contents.hostWebContents.send('hotkey', 'toggleServerBtn'); } catch {}
    } else if (input.control && input.key === '1') {
      // Ctrl+1 / Ctrl+2 com o foco dentro do jogo (mesma logica de sempre:
      // o teclado fica preso no webview, entao precisa ser pego aqui e
      // repassado pro host - faltava isso, por isso so funcionava clicando
      // fora das instancias).
      try { contents.hostWebContents && contents.hostWebContents.send('hotkey', 'expand0'); } catch {}
    } else if (input.control && input.key === '2') {
      try { contents.hostWebContents && contents.hostWebContents.send('hotkey', 'expand1'); } catch {}
    }
  });
});

// ===== Contas salvas (email/senha), criptografadas em disco via DPAPI/keychain do SO =====
const credFile = () => path.join(app.getPath('userData'), 'contas.enc');

ipcMain.handle('creds:load', () => {
  let buf;
  try { buf = fs.readFileSync(credFile()); } catch { return null; }
  try {
    if (safeStorage.isEncryptionAvailable()) return JSON.parse(safeStorage.decryptString(buf));
    return JSON.parse(buf.toString('utf8'));
  } catch { return null; }
});

ipcMain.handle('creds:save', (_e, contas) => {
  const json = JSON.stringify(contas);
  const data = safeStorage.isEncryptionAvailable() ? safeStorage.encryptString(json) : Buffer.from(json, 'utf8');
  const f = credFile();
  fs.writeFileSync(f + '.tmp', data);
  fs.renameSync(f + '.tmp', f); // troca atomica: fechar o app no meio nao corrompe o arquivo
  return true;
});

// ===== Scripts estilo Tampermonkey (.user.js), guardados em texto simples em disco =====
// Diferente das contas (email/senha), o conteudo aqui e' so codigo - nao precisa
// de criptografia, so persistir entre aberturas do launcher.
const scriptsFile = () => path.join(app.getPath('userData'), 'scripts.json');

// Scripts que vem instalados por padrao (so na primeira vez, quando ainda nao
// existe scripts.json - se o usuario remover um deles depois, fica removido).
function carregarScriptsPadrao() {
  const pasta = path.join(__dirname, 'default-scripts');
  let arquivos = [];
  try { arquivos = fs.readdirSync(pasta).filter((f) => f.endsWith('.js')); } catch { return []; }

  return arquivos.map((arquivo) => {
    const codigo = fs.readFileSync(path.join(pasta, arquivo), 'utf8');
    const bloco = (codigo.match(/==UserScript==([\s\S]*?)==\/UserScript==/) || [])[1] || '';
    const pega = (tag) => (bloco.match(new RegExp('@' + tag + '\\s+(.+)')) || [])[1]?.trim();
    return {
      id: 'default-' + arquivo.replace(/\.user\.js$|\.js$/i, ''),
      nome: pega('name') || arquivo,
      descricao: pega('description') || '',
      codigo,
      ativo: true,
    };
  });
}

ipcMain.handle('scripts:load', () => {
  try { return JSON.parse(fs.readFileSync(scriptsFile(), 'utf8')); }
  catch {
    // primeira vez rodando (ainda nao existe scripts.json) - comeca com os padrao
    const padrao = carregarScriptsPadrao();
    try { fs.writeFileSync(scriptsFile(), JSON.stringify(padrao, null, 2)); } catch {}
    return padrao;
  }
});

ipcMain.handle('scripts:save', (_e, scripts) => {
  const f = scriptsFile();
  fs.writeFileSync(f + '.tmp', JSON.stringify(scripts, null, 2));
  fs.renameSync(f + '.tmp', f); // troca atomica, igual as contas
  return true;
});

// Abre o seletor de arquivo nativo do Windows pra importar um .user.js do disco
ipcMain.handle('scripts:importFile', async (e) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  const res = await dialog.showOpenDialog(win, {
    title: 'Importar script (.user.js)',
    filters: [{ name: 'Userscripts', extensions: ['user.js', 'js'] }, { name: 'Todos os arquivos', extensions: ['*'] }],
    properties: ['openFile'],
  });
  if (res.canceled || !res.filePaths[0]) return null;
  try {
    const codigo = fs.readFileSync(res.filePaths[0], 'utf8');
    const nomeArquivo = path.basename(res.filePaths[0]);
    return { nomeArquivo, codigo };
  } catch {
    return null;
  }
});

// Notificacao do sistema (usada pro aviso de shiny)
ipcMain.handle('notify', (_e, title, body) => {
  try { if (Notification.isSupported()) new Notification({ title, body }).show(); } catch {}
});

// Copia o codigo Pix (copia-e-cola) pra area de transferencia do SO
ipcMain.handle('clipboard:copy', (_e, texto) => {
  try { clipboard.writeText(String(texto)); return true; } catch { return false; }
});

// Botoes da barra de titulo customizada (a janela e' sem moldura nativa - "frame: false")
ipcMain.handle('win:minimize', (e) => { try { BrowserWindow.fromWebContents(e.sender)?.minimize(); } catch {} });
ipcMain.handle('win:maximize-toggle', (e) => {
  try {
    const w = BrowserWindow.fromWebContents(e.sender);
    if (!w) return;
    if (w.isMaximized()) w.unmaximize(); else w.maximize();
  } catch {}
});
ipcMain.handle('win:close', (e) => { try { BrowserWindow.fromWebContents(e.sender)?.close(); } catch {} });

app.whenReady().then(() => {
  try { app.setAppUserModelId('online.nietore.pokepixelduo'); } catch {}

  // nega pedidos de permissao dos jogos (mic, camera, localizacao, notificacao do site etc.)
  for (const nome of ['pp-conta1', 'pp-conta2']) {
    try { session.fromPartition('persist:' + nome).setPermissionRequestHandler((_wc, _p, cb) => cb(false)); } catch {}
  }

  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    show: false,
    frame: false, // sem moldura nativa do Windows: a topbar do app vira a barra de titulo (arrastavel),
                   // com botoes proprios de minimizar/maximizar/fechar. Isso tira de vez aquela faixa
                   // cinza do SO que sobrava no topo mesmo com o autoHideMenuBar.
    autoHideMenuBar: true,
    backgroundColor: '#0d1117',
    webPreferences: { webviewTag: true, preload: path.join(__dirname, 'preload.js') }
  });
  win.loadFile(path.join(__dirname, 'index.html'));

  // avisa a interface quando o estado maximizado muda (pra trocar o icone do botao)
  win.on('maximize', () => win.webContents.send('hotkey', 'winMaximized'));
  win.on('unmaximize', () => win.webContents.send('hotkey', 'winRestored'));

  // a janela principal so mostra o index.html: bloqueia navegacao dela
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file://')) { e.preventDefault(); abreFora(url); } });
  win.webContents.setWindowOpenHandler(({ url }) => { abreFora(url); return { action: 'deny' }; });

  win.once('ready-to-show', () => { win.show(); win.maximize(); });

  // Sem menu nativo nenhum: era esse Menu (com autoHideMenuBar) que fazia aparecer
  // aquela barra de atalhos fantasma ao apertar Alt sozinho.
  Menu.setApplicationMenu(null);

  // Ctrl+1 / Ctrl+2 expandem cada painel. Ctrl+H esconde/mostra a interface do
  // launcher (topbar + cabecalho de cada conta), deixando so os dois jogos na
  // tela - a janela ja fica maximizada (nao em tela cheia real), entao a barra
  // de tarefas do Windows continua visivel o tempo todo.
  win.webContents.on('before-input-event', (_ev, input) => {
    if (input.type !== 'keyDown' || !input.control) return;
    if (input.key === '1') win.webContents.send('hotkey', 'expand0');
    else if (input.key === '2') win.webContents.send('hotkey', 'expand1');
    else if (input.key.toLowerCase() === 'h') win.webContents.send('hotkey', 'toggleUI');
    else if (input.key.toLowerCase() === 'b') win.webContents.send('hotkey', 'toggleServerBtn');
  });

  app.on('second-instance', () => { win.show(); win.focus(); });
});

app.on('window-all-closed', () => app.quit());
