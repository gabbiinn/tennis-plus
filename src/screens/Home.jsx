import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Trophy, MessageCircle, ArrowUpRight, MapPin } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profil, setProfil] = useState(null);
  const [stats, setStats] = useState({ winRate: null, matches: 0 });
  const [nextMatch, setNextMatch] = useState(null);

  useEffect(() => {
    const charger = async () => {
      if (!user) return;

      const { data: profilData } = await supabase
        .from("profils")
        .select("secteurs, serie, nom")
        .eq("id", user.id)
        .single();
      if (profilData) setProfil(profilData);

      const { data: matchesData } = await supabase
        .from("matches")
        .select("*, player1:player1_id(nom, serie), player2:player2_id(nom, serie), club:club_id(name)")
        .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`);

      if (matchesData) {
        const played = matchesData.filter(m => m.winner_id !== null);
        const wins = played.filter(m => m.winner_id === user.id).length;
        const winRate = played.length > 0 ? Math.round((wins / played.length) * 100) : null;
        setStats({ winRate, matches: matchesData.length });

        const now = new Date().toISOString();
        const futur = matchesData
          .filter(m => m.scheduled_at && m.scheduled_at > now && ['proposed', 'confirmed'].includes(m.status))
          .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

        if (futur.length > 0) {
          const m = futur[0];
          const opponent = m.player1_id === user.id ? m.player1 : m.player2;
          const date = new Date(m.scheduled_at);
          setNextMatch({
            date: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase(),
            time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            opponent: opponent?.nom?.toUpperCase() || 'ADVERSAIRE',
            opponentLevel: opponent?.serie || '?',
            location: m.club?.name?.toUpperCase() || 'LIEU À CONFIRMER',
          });
        }
      }
    };
    charger();
  }, [user]);

  const locationLabel = profil?.secteurs?.[0]?.toUpperCase() || 'RENNES';

  return (
    <div className="min-h-screen pb-24">
      <Header user={user} location={locationLabel} />

      <div className="px-5">
        {nextMatch ? (
          <div className="relative overflow-hidden mb-2.5 rounded-2xl bg-tplus-black p-4">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-tplus-blue">PROCHAIN MATCH</p>
              <div className="px-2 py-0.5 rounded-full bg-tplus-blue">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white">À VENIR</p>
              </div>
            </div>
            <div className="flex items-baseline gap-3 mt-2">
              <p className="font-display text-2xl uppercase leading-none text-tplus-cream">{nextMatch.date}</p>
              <p className="font-display text-2xl uppercase leading-none text-tplus-blue">{nextMatch.time}</p>
            </div>
            <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-white/20">
              <div className="flex-1">
                <p className="text-[9px] font-bold uppercase text-white/50">TOI · {profil?.serie || '?'}</p>
                <p className="font-display text-xs uppercase text-tplus-cream">
                  {profil?.nom?.toUpperCase() || user?.email?.split('@')[0]?.toUpperCase()}
                </p>
              </div>
              <p className="font-display text-base text-tplus-blue">VS</p>
              <div className="flex-1 text-right">
                <p className="text-[9px] font-bold uppercase text-white/50">{nextMatch.opponentLevel}</p>
                <p className="font-display text-xs uppercase text-tplus-cream">{nextMatch.opponent}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2.5">
              <div className="flex items-center gap-1">
                <MapPin size={10} className="text-tplus-blue" />
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/70">{nextMatch.location}</p>
              </div>
              <button onClick={() => navigate('/talk')} className="px-3 py-1.5 rounded-full font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 bg-tplus-blue text-white">
                DÉTAILS <ArrowUpRight size={10} strokeWidth={3} />
              </button>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden mb-2.5 rounded-2xl bg-tplus-black p-5 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-tplus-blue mb-2">PROCHAIN MATCH</p>
            <p className="font-display text-sm uppercase text-tplus-cream/50 mb-3">Aucun match prévu</p>
            <button onClick={() => navigate('/partners')} className="px-4 py-2 rounded-full font-bold text-[9px] uppercase tracking-wider bg-tplus-blue text-white">
              TROUVER UN PARTENAIRE →
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 mb-2.5">
          <div className="rounded-xl p-3 bg-white border border-gray-200">
            <div className="flex items-baseline gap-1">
              <p className="font-display text-2xl">{stats.winRate !== null ? stats.winRate : '—'}</p>
              {stats.winRate !== null && <p className="font-display text-sm text-tplus-blue">%</p>}
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 text-tplus-black/50">WIN RATE</p>
          </div>
          <div className="rounded-xl p-3 bg-white border border-gray-200">
            <p className="font-display text-2xl">{stats.matches}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 text-tplus-black/50">MATCHS</p>
          </div>
          <div className="rounded-xl p-3 bg-white border border-gray-200">
            <p className="font-display text-xl text-tplus-blue leading-tight pt-1">{profil?.serie || '—'}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 text-tplus-black/50">SÉRIE</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => navigate('/partners')} className="relative overflow-hidden text-left rounded-2xl p-4 bg-tplus-blue min-h-[100px]">
            <Users size={22} color="#FFF" strokeWidth={2.5} />
            <p className="font-display text-sm uppercase mt-2 leading-tight text-white">PARTENAIRES</p>
            <div className="absolute bottom-2.5 right-2.5">
              <ArrowUpRight size={12} color="#FFF" strokeWidth={3} />
            </div>
          </button>
          <div className="relative overflow-hidden text-left rounded-2xl p-4 bg-tplus-black min-h-[100px] opacity-30">
            <Calendar size={22} color="#F4F4F2" strokeWidth={2.5} />
            <p className="font-display text-sm uppercase mt-2 leading-tight text-tplus-cream">RÉSERVER</p>
            <p className="text-[8px] font-bold uppercase tracking-wider text-white/50 mt-1">BIENTÔT</p>
          </div>
          <button onClick={() => navigate('/tournaments')} className="relative overflow-hidden text-left rounded-2xl p-4 bg-tplus-clay min-h-[100px]">
            <Trophy size={22} color="#FFF" strokeWidth={2.5} />
            <p className="font-display text-sm uppercase mt-2 leading-tight text-white">TOURNOIS</p>
            <div className="absolute bottom-2.5 right-2.5">
              <ArrowUpRight size={12} color="#FFF" strokeWidth={3} />
            </div>
          </button>
          <button onClick={() => navigate('/talk')} className="relative overflow-hidden text-left rounded-2xl p-4 bg-white border-2 border-tplus-black min-h-[100px]">
            <MessageCircle size={22} color="#0A0A0A" strokeWidth={2.5} />
            <p className="font-display text-sm uppercase mt-2 leading-tight">MESSAGES</p>
            <div className="absolute bottom-2.5 right-2.5">
              <ArrowUpRight size={12} color="#0A0A0A" strokeWidth={3} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
