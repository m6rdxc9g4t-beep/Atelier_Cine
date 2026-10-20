import { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import WatchPage from './pages/WatchPage.jsx';
import { LibraryProvider } from './hooks/useLibrary.jsx';
import { ProfilesProvider } from './hooks/useProfiles.jsx';
import { ThemeProvider } from './hooks/useTheme.jsx';
import { desktop } from './lib/desktop.js';

/** Raccourcis du menu de l'app Mac (⌘, ⌘1…⌘4) → navigation. */
function DesktopBridge() {
  const navigate = useNavigate();
  useEffect(() => desktop?.onNavigate((route) => navigate(route)), [navigate]);
  return desktop ? <div aria-hidden className="app-drag pointer-events-none fixed inset-x-0 top-0 z-[60] h-9" /> : null;
}

export default function App() {
  return (
    <ThemeProvider>
      <ProfilesProvider>
        <LibraryProvider>
          <DesktopBridge />
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="movies" element={<BrowsePage view="movies" />} />
              <Route path="shows" element={<BrowsePage view="shows" />} />
              <Route path="recent" element={<BrowsePage view="recent" />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="watch/:id" element={<WatchPage />} />
          </Routes>
        </LibraryProvider>
      </ProfilesProvider>
    </ThemeProvider>
  );
}
