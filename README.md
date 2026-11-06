# Atelier Ciné

Médiathèque personnelle façon plateforme de streaming : tes films et séries stockés sur un NAS ou un PC, parcourus dans une interface sobre où les affiches mènent, enrichis par une IA locale (Ollama).

> Étape 1 — squelette : arborescence, API de scan du NAS, prototype frontend (Accueil, Films, Séries, Récents, Paramètres, lecteur).

## App Mac

```bash
npm install            # la 1re fois (télécharge aussi Electron, ~100 Mo)
npm run app:install    # construit « Atelier_Cine.app », l'installe dans /Applications et la lance
```

- Ensuite, lance-la comme n'importe quelle app (Launchpad, Spotlight, Dock). Relance `npm run app:install` après un `git pull` pour mettre à jour.
- Le serveur est intégré à l'app : pas de terminal ni de navigateur.
- Tes dossiers se choisissent dans **Réglages… (⌘,) → Médiathèque → Ajouter un dossier…** (sélecteur du Finder, `/Volumes` pour un NAS).
- Données (index, profils, réglages) : `~/Library/Application Support/Atelier_Cine/`.
- Raccourcis : ⌘1 Accueil · ⌘2 Films · ⌘3 Séries · ⌘4 Récents · ⌘, Réglages.
- Pour développer l'app sans l'installer : `npm run app`.

## Démarrage rapide (navigateur)

```bash
npm install                     # installe frontend + backend (workspaces npm)
cp .env.example backend/.env    # optionnel : les dossiers se règlent aussi dans Paramètres
npm run sample -w backend       # (optionnel) crée une fausse médiathèque de test
npm run dev                     # API sur :4000 + interface sur http://localhost:5173
```

Sans backend (ou avec une médiathèque vide), l'interface affiche un **catalogue de démonstration** et un badge « Mode démo » (cliquable, il mène aux Paramètres). En démo, « Regarder » lit une bande-annonce d'exemple (`frontend/public/demo/`). Paramètres → *Catalogue de démonstration* : Automatique / Toujours / Jamais.

**Thème** : Système / Clair / Sombre dans Paramètres → *Apparence* (ou le menu de l'avatar) ; préférence commune à la suite Atelier, « Système » par défaut.

**Profils** : menu de l'avatar en haut à droite (changer, ajouter, gérer). Ils sont enregistrés par l'API dans `backend/data/profiles.json`, donc partagés entre appareils ; le profil actif est mémorisé par appareil.

Production locale : `npm run build && npm start` → tout est servi par Express sur http://localhost:4000.

Prérequis : Node.js ≥ 22.9. Optionnels : `ffprobe` (FFmpeg) pour la durée/résolution réelles (`SCAN_PROBE=true`), [Ollama](https://ollama.com) avec `ollama pull llama3`.

## Arborescence

```
atelier-cine/
├── package.json              # workspaces + scripts dev/build/start/scan
├── .env.example              # dossiers NAS, port, Ollama
├── desktop/                # app Mac (Electron)
│   ├── src/main.js           # fenêtre native, menu, serveur intégré, sélecteur de dossiers
│   ├── src/preload.cjs       # pont sécurisé window.atelier
│   ├── scripts/              # bundle.mjs (esbuild) · install-mac.mjs
│   └── resources/icon.png
├── backend/
│   ├── src/
│   │   ├── server.js         # démarrage + scan initial
│   │   ├── app.js            # Express : routes, CORS, erreurs, sert frontend/dist
│   │   ├── config.js         # lecture de l'environnement
│   │   ├── routes/           # library.js · stream.js · ai.js
│   │   ├── services/
│   │   │   ├── scanner.js    # parcours récursif fs/promises, films / séries / épisodes
│   │   │   ├── libraryStore.js # index en mémoire + data/library.json
│   │   │   ├── probe.js      # ffprobe (durée, 4K, HDR, pistes)
│   │   │   └── ollama.js     # statut + génération de résumés
│   │   ├── utils/            # filenameParser.js (titre, année, SxxEyy…) · ids.js
│   │   └── cli/              # scan.js · createSampleMedia.js
│   ├── test/                 # node --test
│   └── data/                 # index généré (ignoré par git)
└── frontend/
    ├── vite.config.js        # React + Tailwind v4, proxy /api → :4000
    └── src/
        ├── App.jsx           # routes
        ├── components/       # Sidebar, TopBar, HeroBanner, SpaceScene, Carousel, MediaCard,
        │                     # ContinueCard, DetailsModal, MetaLine, TitleTreatment…
        ├── pages/            # HomePage, BrowsePage, SettingsPage, WatchPage
        ├── hooks/useLibrary.jsx  # chargement API + repli démo
        ├── data/mockLibrary.js   # catalogue de démonstration
        └── lib/              # api.js, artwork.js (affiches SVG générées), format.js
```

## Charte graphique

Charte v2 « Linear » de la suite Atelier (règles complètes : `Atelier_Deploy/DESIGN.md`, résumé : `docs/SUITE.md` §1 d'Atelier_Projets) : structure **neutre gris froid** commune à toute la suite, en clair comme en sombre ; la couleur signature de Ciné, **magenta #cd3d83**, ne sert qu'à l'accent (bouton principal, sélection, focus, liens, barre de progression, icône de l'app). Plat au repos, traits de 1 px, police Inter 13 px. Les affiches et vignettes (le contenu) portent la couleur ; l'interface autour reste sobre.

- `frontend/src/brand/` : copies **verbatim** de `Atelier_Projets/design-system/brand/` (ne pas les éditer ici) — `atelier-brand.css` (jetons `--atelier-*`, marque, fenêtre « À propos »), `atelier-theme.js` (préférence de thème commune), police Inter (`inter-latin*-wght-normal.woff2`, `LICENSE-Inter.txt`).
- **Marque** : icône carrée en dégradé de la signature avec le glyphe Lucide `clapperboard` blanc, puis « Atelier Ciné ». Un clic ouvre « À propos ». Favicon (`frontend/public/favicon.svg`, `favicon-64.png`, `apple-touch-icon.png`) et icône de l'app Mac (`desktop/resources/icon.png`) = la même icône.
- **Thème** : Système / Clair / Sombre, dans Paramètres → *Apparence*, le menu de l'avatar ou le pied de la barre latérale. Préférence commune à la suite (`window.atelierTheme`) : cookie `atelier_theme` sur le VPS, sinon `localStorage` `atelier:theme` ; « Système » par défaut. `atelier-theme.js` est inséré tel quel dans `<head>` par `frontend/vite.config.js` (pas de flash) ; l'ancienne clé `atelier-cine-theme` est reprise une fois puis supprimée. Sur `<html data-atelier-app="cine">` : sombre = `class="dark" data-theme="dark"`, clair = `data-theme="light"`. `theme-color` et le fond de la fenêtre Mac suivent. La bannière de l'accueil et le lecteur vidéo restent sombres dans les deux thèmes.
- **Coquille** : barre latérale de 232 px (marque, navigation, thème), barre haute de 44 px avec le titre de la vue ; sur téléphone, barre d'onglets en bas.
- `frontend/src/index.css` : couleurs Tailwind branchées sur les jetons (`page`, `sidebar`, `surface`, `surface-2/3`, `field`, `fg`, `muted`, `faint`, `edge`, `edge-soft`, `line`, `brand`, `brand-hover`, `brand-ink`, `brand-soft`, `warn`, `down`), échelle de texte et rayons de la suite, composants `.btn`, `.input`, `.seg`, `.pop`, `.menu-item` — pas de couleur d'interface en dur dans les composants.
- Seuls les états anormaux sont colorés (`warn` : « Mode démo », dossier introuvable ; `down` : API injoignable, erreurs). Restent inchangés : affiches et décors générés, couleurs de profil.

## API

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/health` | état + dossiers configurés |
| GET | `/api/library` | catalogue (films, séries, `featuredId`, erreurs de scan) |
| GET | `/api/library/:id` | fiche complète (épisodes inclus pour une série) |
| POST | `/api/scan` | relance l'indexation |
| GET | `/api/stream/:id` | lecture vidéo avec requêtes Range |
| GET | `/api/artwork/:id/poster\|backdrop` | `poster.jpg` / `fanart.jpg` trouvés à côté des fichiers |
| GET | `/api/profiles` | profils de la maison + palette de couleurs |
| POST | `/api/profiles` | crée un profil `{ name, color? }` |
| PATCH | `/api/profiles/:id` | renomme / change la couleur |
| DELETE | `/api/profiles/:id` | supprime (jamais le dernier) |
| GET | `/api/settings` | dossiers médias + état de chacun |
| PUT | `/api/settings` | enregistre les dossiers `{ mediaDirs: { movies, shows } }` et relance le scan |
| GET | `/api/ai/status` | Ollama joignable ? modèles installés |
| POST | `/api/ai/summary/:id` | synopsis + genres + tags générés par Ollama |

## Organisation des dossiers attendue

```
Films/                              Series/
├── ORBIT (2024)/                   ├── Station Kepler/
│   ├── Orbit.2024.2160p.HDR.mkv    │   ├── poster.jpg
│   ├── Orbit.2024.2160p.HDR.fr.srt │   ├── Saison 1/
│   └── poster.jpg / fanart.jpg     │   │   └── Station.Kepler.S01E01.mkv
└── Ligne.de.Fuite.2021.1080p.mp4   │   └── Saison 2/ …
                                    └── Les.Veilleurs.S02E05.mkv   (fichier isolé → regroupé par titre)
```

Les dossiers système de NAS (`@eaDir`, `#recycle`, `$RECYCLE.BIN`…), les fichiers cachés et les extraits `sample` sont ignorés. Un NAS non monté ou un dossier sans droits ne bloque pas le scan : l'erreur est remontée dans `/api/library` et dans Paramètres.

## Workflow Git

```bash
git checkout -b feature/nom-de-la-fonctionnalite
git add . && git commit -m "feat(ui): ..."
```

## Prochaines étapes

1. Lecture des épisodes (choix saison/épisode) et sauvegarde de la progression → « Continuer la lecture » réel.
2. Transcodage FFmpeg à la volée pour les formats non lisibles par le navigateur (MKV/HEVC, DTS…), sous-titres `.srt` → WebVTT.
3. Enrichissement Ollama au scan (synopsis, genres, tags) avec cache.
4. Sélection quotidienne de 5 films + 5 séries.
