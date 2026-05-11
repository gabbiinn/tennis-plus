import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import { getCouleurSaison, getNomSaison } from './utils/saison';
import BottomNav from './components/BottomNav';
import Auth from './screens/Auth';
import Home from './screens/Home';
import PlaceholderScreen from './screens/PlaceholderScreen';
import PartenairesScreen from './screens/PartenairesScreen';
import ReserverScreen from './screens/ReserverScreen';
import MessagesScreen from './screens/MessagesScreen';
import TournoisScreen from './screens/TournoisScreen';
import ProfilScreen from './screens/ProfilScreen';
import OnboardingScreen from './screens/OnboardingScreen';

export const couleurSaison = getCouleurSaison();
export const nomSaison = getNomSaison();

export default function App() {
  const { user, loading } = useAuth();
  const [profilExiste, setProfilExiste] = useState(null);

  useEffect(() => {
    if (!user) return;
    const verifierProfil = async () => {
      const { data } = await supabase.from("profils").select("id").eq("id", user.id).single();
      setProfilExiste(!!data);
    };
    verifierProfil();
  }, [user]);

  useEffect(() => {
    document.documentElement.style.setProperty('--couleur-saison', couleurSaison);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', couleurSaison);
  }, []);

  if (loading || (user && profilExiste === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: couleurSaison }}>
        <div className="text-white font-black text-2xl" style={{ fontFamily: "Archivo Black, sans-serif" }}>TENNIS+</div>
      </div>
    );
  }

  if (!user) return <Auth />;

  if (!profilExiste) {
    return <OnboardingScreen user={user} onTermine={() => setProfilExiste(true)} />;
  }

  return (
    <div className="mx-auto bg-gray-50 min-h-screen relative" style={{ maxWidth: '430px' }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/partners" element={<PartenairesScreen />} />
        <Route path="/courts" element={<ReserverScreen />} />
        <Route path="/talk" element={<MessagesScreen />} />
        <Route path="/tournaments" element={<TournoisScreen />} />
        <Route path="/profile" element={<ProfilScreen />} />
        <Route path="/agenda" element={<PlaceholderScreen title="AGENDA" description="Tes events." />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <BottomNav />
    </div>
  );
}