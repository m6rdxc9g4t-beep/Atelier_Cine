import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import WatchPage from './pages/WatchPage.jsx';
import { LibraryProvider } from './hooks/useLibrary.jsx';

export default function App() {
  return (
    <LibraryProvider>
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
  );
}
