import { Home, Users, Calendar, Trophy, MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const TABS = [
  { path: '/', icon: Home, label: 'HOME' },
  { path: '/partners', icon: Users, label: 'PLAY' },
  { path: '/courts', icon: Calendar, label: 'BOOK' },
  { path: '/tournaments', icon: Trophy, label: 'CUP' },
  { path: '/talk', icon: MessageCircle, label: 'TALK' }
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full px-4 pb-4 pt-2 z-40" style={{ maxWidth: '430px', background: 'linear-gradient(to top, #F4F4F2 70%, transparent)' }}>
      <div className="flex items-center justify-between p-1 rounded-full bg-tplus-black">
        {TABS.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center justify-center rounded-full transition-all"
              style={{
                background: isActive ? '#1E5FAF' : 'transparent',
                padding: isActive ? '7px 12px' : '7px',
                minHeight: '42px'
              }}
            >
              <Icon size={16} color={isActive ? '#FFF' : '#F4F4F2'} strokeWidth={2.5} />
              {isActive && <p className="text-[8px] font-bold uppercase tracking-widest mt-0.5 text-white">{label}</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
