/**
 * Atelier_Ciné — application Mac.
 * Lance l'API Express dans le processus principal, puis ouvre une fenêtre native
 * qui affiche l'interface compilée (frontend/dist) servie par cette API.
 */
import { app, BrowserWindow, Menu, dialog, ipcMain, shell } from 'electron';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const isMac = process.platform === 'darwin';
const PREFERRED_PORT = 47321; // port fixe : le navigateur intégré garde ses préférences (profil actif…) d'un lancement à l'autre

// ---------------------------------------------------------------------------
// Environnement du backend — à définir AVANT de charger le backend (lu à l'import).
// Données : ~/Library/Application Support/Atelier_Ciné/
// ---------------------------------------------------------------------------
app.setName('Atelier_Ciné');
app.setPath('userData', path.join(app.getPath('appData'), 'Atelier_Ciné')); // explicite, quel que soit le lanceur
const userData = app.getPath('userData');
const envFile = path.join(userData, 'atelier-cine.env');
process.env.ATELIER_RUNTIME = 'desktop';
process.env.ATELIER_DATA_DIR = path.join(userData, 'data');
process.env.ATELIER_ENV_FILE = envFile;
process.env.ATELIER_FRONTEND_DIST = app.isPackaged
  ? path.join(process.resourcesPath, 'frontend')
  : path.resolve(here, '..', '..', 'frontend', 'dist');
if (existsSync(envFile)) process.loadEnvFile(envFile); // réglages avancés optionnels (Ollama, profondeur de scan…)

let mainWindow = null;
let server = null;
let baseUrl = null;

// Une seule instance : relancer l'app ramène la fenêtre existante au premier plan.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });
  app.whenReady().then(boot);
}

async function startBackend() {
  const { startServer } = await import('../../backend/src/start.js');
  try {
    return await startServer({ port: PREFERRED_PORT, host: '127.0.0.1', quiet: app.isPackaged });
  } catch (err) {
    if (err.code !== 'EADDRINUSE') throw err;
    return startServer({ port: 0, host: '127.0.0.1', quiet: app.isPackaged });
  }
}

async function boot() {
  try {
    ({ server, url: baseUrl } = await startBackend());
  } catch (err) {
    dialog.showErrorBox('Atelier_Ciné ne peut pas démarrer', `Le serveur interne n'a pas pu se lancer :\n${err.message}`);
    app.quit();
    return;
  }
  Menu.setApplicationMenu(buildMenu());
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 600,
    show: false,
    title: 'Atelier_Ciné',
    backgroundColor: '#0f1015',
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 18, y: 18 },
    webPreferences: {
      preload: path.join(here, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => (mainWindow = null));

  // Liens externes → navigateur par défaut ; l'app ne quitte jamais son serveur interne.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(baseUrl)) {
      event.preventDefault();
      if (/^https?:/.test(url)) shell.openExternal(url);
    }
  });

  mainWindow.loadURL(baseUrl);
}

const navigate = (route) => mainWindow?.webContents.send('atelier:navigate', route);

// Sélecteur de dossier natif pour Paramètres → Dossiers
ipcMain.handle('atelier:pick-folder', async (event, title) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const defaultPath = isMac && existsSync('/Volumes') ? '/Volumes' : app.getPath('home');
  const res = await dialog.showOpenDialog(win, {
    title: typeof title === 'string' ? title : 'Choisir un dossier',
    buttonLabel: 'Choisir',
    defaultPath,
    properties: ['openDirectory', 'treatPackageAsDirectory'],
  });
  return res.canceled ? null : res.filePaths[0];
});

ipcMain.handle('atelier:open-data-folder', () => shell.openPath(process.env.ATELIER_DATA_DIR));

function buildMenu() {
  /** @type {Electron.MenuItemConstructorOptions[]} */
  const template = [
    ...(isMac
      ? [
          {
            label: 'Atelier_Ciné',
            submenu: [
              { role: 'about', label: 'À propos d’Atelier_Ciné' },
              { type: 'separator' },
              { label: 'Réglages…', accelerator: 'Cmd+,', click: () => navigate('/settings') },
              { type: 'separator' },
              { role: 'services', label: 'Services' },
              { type: 'separator' },
              { role: 'hide', label: 'Masquer Atelier_Ciné' },
              { role: 'hideOthers', label: 'Masquer les autres' },
              { role: 'unhide', label: 'Tout afficher' },
              { type: 'separator' },
              { role: 'quit', label: 'Quitter Atelier_Ciné' },
            ],
          },
        ]
      : []),
    {
      label: 'Édition',
      submenu: [
        { role: 'undo', label: 'Annuler' },
        { role: 'redo', label: 'Rétablir' },
        { type: 'separator' },
        { role: 'cut', label: 'Couper' },
        { role: 'copy', label: 'Copier' },
        { role: 'paste', label: 'Coller' },
        { role: 'selectAll', label: 'Tout sélectionner' },
      ],
    },
    {
      label: 'Présentation',
      submenu: [
        { label: 'Accueil', accelerator: 'CmdOrCtrl+1', click: () => navigate('/') },
        { label: 'Films', accelerator: 'CmdOrCtrl+2', click: () => navigate('/movies') },
        { label: 'Séries', accelerator: 'CmdOrCtrl+3', click: () => navigate('/shows') },
        { label: 'Récents', accelerator: 'CmdOrCtrl+4', click: () => navigate('/recent') },
        { type: 'separator' },
        { role: 'reload', label: 'Recharger' },
        ...(app.isPackaged ? [] : [{ role: 'toggleDevTools', label: 'Outils de développement' }]),
        { type: 'separator' },
        { role: 'resetZoom', label: 'Taille réelle' },
        { role: 'zoomIn', label: 'Zoom avant' },
        { role: 'zoomOut', label: 'Zoom arrière' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Plein écran' },
      ],
    },
    {
      label: 'Fenêtre',
      submenu: [
        { role: 'minimize', label: 'Réduire' },
        { role: 'zoom', label: 'Agrandir' },
        ...(isMac ? [{ type: 'separator' }, { role: 'front', label: 'Tout ramener au premier plan' }] : [{ role: 'close', label: 'Fermer' }]),
      ],
    },
  ];
  return Menu.buildFromTemplate(template);
}

app.on('window-all-closed', () => {
  if (!isMac) app.quit(); // sur Mac, l'app reste dans le Dock comme les apps natives
});

app.on('before-quit', () => server?.close());
