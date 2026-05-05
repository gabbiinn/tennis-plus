import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import BottomNav from './components/BottomNav';
import Auth from './screens/Auth';
import Home from './screens/Home';
import PlaceholderScreen from './screens/PlaceholderScreen';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tplus-cream">
        <div className="font-display text-xl">CHARGEMENT...</div>
      </div>
    );
  }

  // Pas connecté → écran d'auth
  if (!user) {
    return <Auth />;
  }

  // Connecté → l'app
  return (
    <div className="mx-auto bg-tplus-cream min-h-screen relative" style={{ maxWidth: '430px' }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/partners" element={<PlaceholderScreen title="PARTENAIRES" description="Recherche et matching de partenaires de jeu. Voir le design dans le proto et utiliser supabase.from('users').select() avec filtres niveau + distance." />} />
        <Route path="/courts" element={<PlaceholderScreen title="RÉSERVER" description="Liste/carte des clubs avec créneaux disponibles. Tables : clubs + bookings." />} />
        <Route path="/tournaments" element={<PlaceholderScreen title="TOURNOIS" description="Liste des tournois avec inscription. Tables : tournaments + tournament_registrations." />} />
        <Route path="/talk" element={<PlaceholderScreen title="MESSAGES" description="Liste des conversations + chat 1-1. Tables : conversations + messages. Utiliser Supabase Realtime pour le live." />} />
        <Route path="/profile" element={<PlaceholderScreen title="PROFIL" description="Stats, badges, derniers matchs. Table : users + matches." />} />
        <Route path="/agenda" element={<PlaceholderScreen title="AGENDA" description="Tous les événements à venir : matchs, réservations, tournois." />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <BottomNav />
    </div>
  );
}
