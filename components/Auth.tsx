import React, { useState } from 'react';
import { useAuth } from '../App';
import { supabase } from '../services/supabase';
import { saveUserData, setAuthFlag, showNotification } from '../services/authUtils';
import { User, Plan, TrustLevel, UserType } from '../types';

export const Auth: React.FC = () => {
  const { setIsAuthenticated, setIsUnlocked, refreshSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        showNotification(error.message, 'error');
        return;
      }

      if (data.user) {
        // Cria perfil básico se não existir
        const newUser: User = {
          id: data.user.id,
          nickname: email.split('@')[0],
          email: email,
          age: 25,
          plan: Plan.GOLD,           // Força GOLD para sua conta
          is_premium: true,          // Força premium
          avatar: `https://picsum.photos/seed/${email}/400`,
          biotype: 'PADRAO',
          bio: 'Usuário Libido 2026',
          gender: 'CIS',
          sexualOrientation: 'HETERO',
          type: UserType.HOMEM,
          height: 170,
          location: 'Brasil',
          xp: 100,
          level: 1,
          isOnline: true,
          verifiedAccount: true,
          gallery: [],
          following: [],
          lookingFor: [UserType.MULHER],
          trustLevel: TrustLevel.OURO,
          vibes: ['LIBERAL'],
          balance: 0,
          boosts_active: 0,
          boundaries: [],
          behaviors: [],
          bucketList: [],
          bestMoments: [],
          bestFeature: 'Olhar',
          beveragePref: 'Drinks',
          bestTime: 'Noite',
          braveryLevel: 8,
          busyMode: false,
          bookingPolicy: 'A combinar',
          verificationScore: 100,
          hasBlurredGallery: false,
          lat: -22.9068,
          lon: -43.1729,
          birthDate: '1995-01-01',
          rsvps: [],
          vouches: [],
          bookmarks: [],
          blockedUsers: [],
          matches: [],
          bodyMods: [],
          bodyHair: 'Naturais',
          bodyArt: [],
          bondageExp: 'Iniciante',
        };

        saveUserData(newUser);
        setAuthFlag(true);
        setIsAuthenticated(true);
        setIsUnlocked(true);
        refreshSession(true);

        showNotification('Login realizado com sucesso! Bem-vindo de volta.', 'success');
      }
    } catch (error: any) {
      showNotification('Erro ao fazer login: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-12">
        <h1 className="text-8xl font-black text-white italic">LIBIDO</h1>
        <p className="text-amber-500 mt-4">Matriz 2026</p>
      </div>

      {!showLoginForm ? (
        <div className="w-full max-w-xs space-y-4">
          <button
            onClick={() => setShowLoginForm(true)}
            className="w-full py-5 bg-red-600 rounded-2xl font-black text-white text-lg hover:bg-red-700 transition-all"
          >
            Entrar com Email e Senha
          </button>

          <button
            onClick={() => {/* futuro registro */}}
            className="w-full py-5 bg-zinc-800 border border-zinc-700 rounded-2xl font-black text-zinc-400 text-lg hover:text-white transition-all"
          >
            Criar Nova Conta
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-white">Entrar na sua conta</h2>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
              required
            />
            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-red-600 rounded-2xl font-bold text-lg disabled:opacity-50 hover:bg-red-700 transition-all"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <button
              type="button"
              onClick={() => setShowLoginForm(false)}
              className="w-full py-3 text-zinc-400 hover:text-white transition-all"
            >
              Voltar
            </button>
          </form>
        </div>
      )}

      <p className="mt-12 text-zinc-600 text-xs">
        Pagamento já realizado • Use o mesmo email do Stripe
      </p>
    </div>
  );
};

export default Auth;
