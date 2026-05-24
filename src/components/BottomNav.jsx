import { useState, useEffect } from 'react';
import { Home, Users, Calendar, Trophy, MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const TABS = [
  { path: '/', icon: Home, label: 'HOME' },
  { path: '/partners', icon: Users, label: 'PLAY' },
  { path: '/courts', icon: Calendar, label: 'BOOK', disabled: true },
  { path: '/tournaments', icon: Trophy, label: 'CUP' },
  { path: '/talk', icon: MessageCircle, label: 'TALK' }
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let channel = null;

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('destinataire_id', user.id)
        .eq('lu', false);

      setUnreadCount(count ?? 0);

      channel = supabase
        .channel('unread-messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `destinataire_id=eq.${user.id}` },
          (payload) => {
            if (payload.new.lu === false) setUnreadCount((prev) => prev + 1);
          }
        )
        .subscribe();
    }

    init();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const handleTabClick = (path, disabled) => {
    if (disabled) return;
    if (path === '/talk') setUnreadCount(0);
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full px-4 pb-4 pt-2 z-40" style={{ maxWidth: '430px', background: 'linear-gradient(to top, #F4F4F2 70%, transparent)' }}>
      <div className="flex items-center justify-between p-1 rounded-full bg-tplus-black">
        {TABS.map(({ path, icon: Icon, label, disabled }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => handleTabClick(path, disabled)}
              className="flex flex-col items-center justify-center rounded-full transition-all"
              style={{
                background: isActive ? '#1E5FAF' : 'transparent',
                padding: isActive ? '7px 12px' : '7px',
                minHeight: '42px',
                opacity: disabled ? 0.25 : 1,
                cursor: disabled ? 'default' : 'pointer',
              }}
            >
              <div className="relative">
                <Icon size={16} color={isActive ? '#FFF' : '#F4F4F2'} strokeWidth={2.5} />
                {path === '/talk' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                )}
              </div>
              {isActive && <p className="text-[8px] font-bold uppercase tracking-widest mt-0.5 text-white">{label}</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
