// Pont minimal et sûr entre l'interface web et l'app Mac (contextIsolation + sandbox).
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('atelier', {
  desktop: true,
  platform: process.platform,
  /** Ouvre le sélecteur de dossier natif ; renvoie le chemin choisi ou null. */
  pickFolder: (title) => ipcRenderer.invoke('atelier:pick-folder', title),
  /** Ouvre le dossier de données de l'app dans le Finder. */
  openDataFolder: () => ipcRenderer.invoke('atelier:open-data-folder'),
  /** Préférence de thème ('light' | 'dark' | 'system') : fond de la fenêtre native, mémorisé pour le prochain démarrage. */
  setTheme: (preference) => ipcRenderer.send('atelier:set-theme', preference),
  /** Navigation déclenchée par le menu (⌘, ⌘1…). Renvoie une fonction de désabonnement. */
  onNavigate: (callback) => {
    const handler = (_event, route) => callback(route);
    ipcRenderer.on('atelier:navigate', handler);
    return () => ipcRenderer.removeListener('atelier:navigate', handler);
  },
});
