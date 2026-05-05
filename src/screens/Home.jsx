import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Trophy, MessageCircle, ArrowUpRight, MapPin, TrendingUp } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // TODO: remplacer par les vraies données depuis Supabase
  const stats = { winRate: 68, matches: 47, rank: '+2' };
  const nextMatch = {
    date: 'MAR 28 AVR',
    time: '19:00',
    opponent: 'CAMILLE D.',
    opponentLevel: '15/2',
    location: 'TC CESSON'
  };

  return (
    <div className="min-h-screen pb-24">
      <Header user={user} />

      <div className="px-5">
        {/* HERO - PROCHAIN MATCH */}
        <div className="relative overflow-hidden mb-2.5 rounded-2xl bg-tplus-black p-4">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-tplus-blue">PROCHAIN MATCH</p>
            <div className="px-2 py-0.5 rounded-full bg-tplus-blue">
              <p className="text-[9px] font-bold uppercase tracking-widest text-white">DANS 3J</p>
            </div>
          </div>
          <div className="flex items-baseline gap-3 mt-2">
            <p className="font-display text-2xl uppercase leading-none text-tplus-cream">{nextMatch.date}</p>
            <p className="font-display text-2xl uppercase leading-none text-tplus-blue">{nextMatch.time}</p>
          </div>
          <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-white/20">
            <div className="flex-1">
              <p className="text-[9px] font-bold uppercase text-white/50">TOI · 15/3</p>
              <p className="font-display text-xs uppercase text-tplus-cream">ALEX MARTIN</p>
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

        {/* STATS COMPACTES */}
        <div className="grid grid-cols-3 gap-2 mb-2.5">
          <div className="rounded-xl p-3 bg-white border border-gray-200">
            <div className="flex items-baseline gap-1">
              <p className="font-display text-2xl">{stats.winRate}</p>
              <p className="font-display text-sm text-tplus-blue">%</p>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 text-tplus-black/50">WIN RATE</p>
          </div>
          <div className="rounded-xl p-3 bg-white border border-gray-200">
            <p className="font-display text-2xl">{stats.matches}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 text-tplus-black/50">MATCHS</p>
          </div>
          <div className="rounded-xl p-3 bg-white border border-gray-200">
            <div className="flex items-baseline gap-1">
              <TrendingUp size={14} className="text-tplus-blue" />
              <p className="font-display text-2xl text-tplus-blue">{stats.rank}</p>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 text-tplus-black/50">RANK</p>
          </div>
        </div>

        {/* 4 QUICK ACTIONS */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => navigate('/partners')} className="relative overflow-hidden text-left rounded-2xl p-4 bg-tplus-blue min-h-[100px]">
            <Users size={22} color="#FFF" strokeWidth={2.5} />
            <p className="font-display text-sm uppercase mt-2 leading-tight text-white">PARTENAIRES</p>
            <div className="absolute bottom-2.5 right-2.5">
              <ArrowUpRight size={12} color="#FFF" strokeWidth={3} />
            </div>
          </button>
          <button onClick={() => navigate('/courts')} className="relative overflow-hidden text-left rounded-2xl p-4 bg-tplus-black min-h-[100px]">
            <Calendar size={22} color="#F4F4F2" strokeWidth={2.5} />
            <p className="font-display text-sm uppercase mt-2 leading-tight text-tplus-cream">RÉSERVER</p>
            <div className="absolute bottom-2.5 right-2.5">
              <ArrowUpRight size={12} color="#1E5FAF" strokeWidth={3} />
            </div>
          </button>
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
