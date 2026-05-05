import { Calendar, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Monogram } from './Logo';

export default function Header({ user, location: userLocation = 'RENNES · THABOR' }) {
  const navigate = useNavigate();
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'JOUEUR';

  return (
    <div className="px-5 pt-10 pb-3 flex items-center justify-between">
      <button onClick={() => navigate('/profile')} className="flex items-center gap-2.5">
        <Monogram size={36} />
        <div className="text-left">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-tplus-black/50">📍 {userLocation}</p>
          <h1 className="font-display text-xl mt-0.5 uppercase">{userName}</h1>
        </div>
      </button>
      <div className="flex gap-2">
        <button onClick={() => navigate('/agenda')} className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-tplus-black relative">
          <Calendar size={14} />
        </button>
        <button className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-tplus-black">
          <Bell size={14} />
        </button>
      </div>
    </div>
  );
}
