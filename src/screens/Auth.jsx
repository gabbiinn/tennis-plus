import { useState } from 'react';
import { Wordmark } from '../components/Logo';
import { useAuth } from '../hooks/useAuth';
import { ArrowUpRight } from 'lucide-react';

export default function Auth() {
  const [mode, setMode] = useState('signin'); // 'signin' ou 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fn = mode === 'signin' ? signIn : signUp;
    const { error } = await fn(email, password);

    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-12 max-w-md mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <Wordmark height={48} />
        <p className="font-display text-xs uppercase tracking-[0.3em] mt-6 text-tplus-black/50">TOUT LE TENNIS, EN PLUS.</p>
        <p className="text-sm mt-4 max-w-xs text-tplus-black/60">L'app qui connecte joueurs, courts et tournois autour de toi.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          placeholder="EMAIL"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 font-body text-sm focus:outline-none focus:border-tplus-blue"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="MOT DE PASSE (6 CARACTÈRES MIN)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 font-body text-sm focus:outline-none focus:border-tplus-blue"
        />

        {error && (
          <div className="px-4 py-2 rounded-lg bg-red-50 border border-red-200">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-tplus-blue text-white disabled:opacity-50"
        >
          {loading ? '...' : mode === 'signin' ? 'SE CONNECTER' : 'CRÉER UN COMPTE'}
          <ArrowUpRight size={14} strokeWidth={3} />
        </button>

        <button
          type="button"
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
          className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-tplus-black/60"
        >
          {mode === 'signin' ? "PAS DE COMPTE ? S'INSCRIRE" : 'DÉJÀ UN COMPTE ? SE CONNECTER'}
        </button>
      </form>
    </div>
  );
}
