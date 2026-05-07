import { useState } from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
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

export default function App() {
  const { user, loading } = useAuth();
  const [onboardingFait, setOnboardingFait] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tplus-cream">
        <div className="font-display text-xl">CHARGEMENT...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (!onboardingFait) {
    return <OnboardingScreen onTermine={() => setOnboardingFait(true)} />;
  }

  return (
    <div className="mx-auto bg-tplus-cream min-h-screen relative" style={{ maxWidth: '430px' }}>
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