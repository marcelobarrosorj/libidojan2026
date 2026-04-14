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
  const [isLogin, setIsLogin] = useState(true); // true = login, false = registro

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;

      if (isLogin) {
        // Login
        result = await supabase.auth.signInWithPassword({ email, password });
      } else {
        // Registro
        result = await supabase.auth.signUp({ email, password });
      }

      if (result.error) {
        showNotification(result.error.message, 'error');
        return;
      }

      if (result.data.user) {
        // Cria ou atualiza perfil
        const newUser: User = {
          id: result.data.user.id,
          nickname: email.split('@')[0],
          email: email,
          age: 25,
          plan: Plan.FREE,
          is_premium: false,
          avatar: `https://picsum.photos/seed/${email}/400`,
          biotype: 'PADRAO',
          bio: 'Novo usuário na Libido 2026',
          gender: 'CIS',
          sexualOrientation: 'HETERO',
          type: UserType.HOMEM,
          height: 170,
          location: 'Brasil',
          xp: 100,
          level: 1,
          isOnline: true,
          verifiedAccount: false,
          gallery: [],
          following: [],
          lookingFor: [UserType.MULHER],
          trustLevel: TrustLevel.BRONZE,
          vibes: ['LIBERAL'],
          // preenche outros campos com defaults
        };

        saveUserData(newUser);
        setAuthFlag(true);
        setIsAuthenticated(true);
        setIsUnlocked(true);
        refreshSession(true);

        showNotification(isLogin ? 'Login realizado com sucesso!' : 'Conta criada! Bem-vindo.', 'success');
      }
    } catch (error: any) {
      showNotification(error.message || 'Erro ao processar', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-6xl font-black text-white text-center mb-2">LIBIDO</h1>
        <p className="text-center text-amber-500 mb-10">Matriz 2026</p>

        <div className="bg-zinc-900 rounded-3xl p-8">
          <div className="flex justify-center gap-4 mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`px-6 py-2 rounded-full ${isLogin ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
            >
              Entrar
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`px-6 py-2 rounded-full ${!isLogin ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full py-4 bg-red-600 rounded-2xl font-bold text-lg disabled:opacity-50"
            >
              {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-500 text-sm mt-8">
          Pagamento seguro • Protegido por Supabase
        </p>
      </div>
    </div>
  );
};

export default Auth;
