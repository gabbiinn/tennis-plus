import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';

// Écran générique placeholder pour les écrans à coder
export default function PlaceholderScreen({ title, description }) {
  const { user } = useAuth();
  return (
    <div className="min-h-screen pb-24">
      <Header user={user} />
      <div className="px-5">
        <div className="mb-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-tplus-black/50">À DÉVELOPPER</p>
          <h2 className="font-display text-2xl uppercase mt-0.5">{title}</h2>
        </div>
        <div className="rounded-2xl p-6 bg-white border border-gray-200 text-center">
          <p className="text-3xl mb-2">🚧</p>
          <p className="font-display text-sm uppercase mb-2">À CODER</p>
          <p className="text-xs text-tplus-black/60">{description}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-4 text-tplus-blue">
            → Voir tennis-plus-app.jsx pour le design final
          </p>
        </div>
      </div>
    </div>
  );
}
