import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

/** Coquille de l'app : barre latérale de 232 px (onglets en bas sur téléphone) + zone principale. */
export default function Layout() {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[var(--spacing-sidebar)_minmax(0,1fr)]">
      <Sidebar />
      <main className="min-w-0 pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
