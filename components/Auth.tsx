
import React, { useState } from 'react';
import { useAuth } from '../App';
import { RegistrationFlow } from './RegistrationFlow';
import { PinSetup } from './PinSetup';
import { PinUnlock } from './PinUnlock';
import { supabase } from '../services/supabase';
import { saveUserData, setAuthFlag, getUserData, showNotification } from '../services/authUtils';
import { User, Plan, TrustLevel, UserType, Biotype, Gender, SexualOrientation, Vibes } from '../types';

export const Auth: React.FC = () => {
  const { setIsAuthenticated, setIsUnlocked, refreshSession } = useAuth();
  const [view, setView] = useState<'landing' | 'register' | 'pin' | 'unlock' | 'login' | 'forgot_password'>('landing');
  const [regData, setRegData] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegistrationComplete = (payload: any) => {
    setRegData(payload);
    setView('pin');
  };

  const handleAccessExisting = () => {
    setView('login');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Preencha todos os campos.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (authError) throw authError;

      if (data.user) {
        // Busca perfil completo no banco
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('data')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw new Error('Perfil não encontrado no servidor.');

        const userData = profile.data as User;
        saveUserData(userData);
        setView('unlock');
      }
    } catch (e: any) {
      console.error('[AUTH_ERROR]', e);
      setError(e.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Informe seu e-mail para recuperação.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin
      });

      if (resetError) throw resetError;

      showNotification('Link de recuperação enviado para seu e-mail.', 'success');
      setView('login');
    } catch (e: any) {
      setError(e.message || 'Erro ao solicitar recuperação.');
    } finally {
      setLoading(false);
    }
  };

  const handlePinDone = () => {
    const data = regData.data;
    const nickname = data.nickname || data.mainNickname || 'Anon';
    const email = data.email || 'contato@libido.app';

    // Adding following: [] to satisfy User type
    const newUser: User = {
      id: `u-${Date.now()}`,
      nickname,
      email,
      age: data.age || 18,
      plan: Plan.FREE,
      balance: 0,
      boosts_active: 0,
      trustLevel: TrustLevel.BRONZE,
      is_premium: false,
      avatar: `https://picsum.photos/seed/${nickname}/400`,
      biotype: data.biotype || Biotype.PADRAO,
      bio: 'Novo explorador na Matriz Libido 2026.',
      gender: data.gender || Gender.CIS,
      sexualOrientation: data.sexualPreference || SexualOrientation.HETERO,
      type: UserType.HOMEM,
      lookingFor: data.lookingFor || [UserType.MULHER],
      height: data.height || 170,
      location: 'São Paulo, SP',
      xp: 100,
      level: 1,
      isOnline: true,
      verifiedAccount: false,
      isGhostMode: false,
      gallery: [],
      badges: ['Iniciante'],
      boundaries: [],
      behaviors: [],
      braveryLevel: 5,
      updatedAt: new Date().toISOString(),
      vibes: [Vibes.LIBERAL],
      bucketList: [],
      lat: -23.5505,
      lon: -46.6333,
      birthDate: '2000-01-01',
      rsvps: [],
      vouches: [],
      bookmarks: [],
      blockedUsers: [],
      matches: [],
      following: [],
      seenBy: [],
      bodyMods: [],
      bodyHair: 'Naturais',
      bodyArt: [],
      bondageExp: 'Nenhuma',
      bestMoments: [],
      bestFeature: 'Olhar',
      beveragePref: 'Drinks',
      bestTime: 'Noite',
      busyMode: false,
      bookingPolicy: 'A combinar',
      verificationScore: 0,
      hasBlurredGallery: false
    };

    saveUserData(newUser);
    setAuthFlag(true);
    setIsAuthenticated(true);
    setIsUnlocked(true);
    refreshSession(true);
  };

  const handleUnlocked = () => {
    setAuthFlag(true);
    setIsAuthenticated(true);
    setIsUnlocked(true);
    refreshSession(true);
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
        <header className="mb-12 text-center">
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Acessar Matriz</h2>
            <p className="text-amber-500 uppercase tracking-widest text-[10px] mt-2 font-black">Identificação Requerida</p>
        </header>

        <div className="w-full max-w-xs space-y-6">
            <div className="space-y-4">
                <input 
                    type="email" 
                    placeholder="E-MAIL" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl p-5 text-white font-black tracking-widest text-xs focus:border-amber-500 transition-all outline-none"
                />
                <input 
                    type="password" 
                    placeholder="SENHA" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl p-5 text-white font-black tracking-widest text-xs focus:border-amber-500 transition-all outline-none"
                />
            </div>

            {error && (
                <p className="text-rose-500 text-[10px] uppercase font-black tracking-widest text-center animate-bounce">{error}</p>
            )}

            <button 
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-5 gradient-libido rounded-[2rem] font-black text-white uppercase tracking-widest shadow-2xl disabled:opacity-50"
            >
                {loading ? 'Sincronizando...' : 'Entrar'}
            </button>

            <div className="flex flex-col gap-4 text-center mt-6">
                <button 
                    onClick={() => { setError(null); setView('forgot_password'); }}
                    className="text-[10px] text-amber-500/60 uppercase font-black tracking-widest hover:text-amber-500 transition-colors"
                >
                    Esqueci minha senha
                </button>
                <button 
                    onClick={() => { setError(null); setView('landing'); }}
                    className="text-[10px] text-slate-500 uppercase font-black tracking-widest hover:text-white transition-colors"
                >
                    Voltar
                </button>
            </div>
        </div>
      </div>
    );
  }

  if (view === 'forgot_password') {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
        <header className="mb-12 text-center">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Recuperar Acesso</h2>
            <p className="text-amber-500 uppercase tracking-widest text-[10px] mt-2 font-black">Fluxo de Segurança</p>
        </header>

        <div className="w-full max-w-xs space-y-6">
            <div className="space-y-4">
                <input 
                    type="email" 
                    placeholder="SEU E-MAIL CADASTRADO" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl p-5 text-white font-black tracking-widest text-xs focus:border-amber-500 transition-all outline-none"
                />
            </div>

            {error && (
                <p className="text-rose-500 text-[10px] uppercase font-black tracking-widest text-center animate-bounce">{error}</p>
            )}

            <button 
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full py-5 bg-amber-500 rounded-[2rem] font-black text-black uppercase tracking-widest shadow-2xl disabled:opacity-50"
            >
                {loading ? 'Enviando...' : 'Solicitar Link'}
            </button>

            <button 
                onClick={() => { setError(null); setView('login'); }}
                className="w-full text-center text-[10px] text-slate-500 uppercase font-black tracking-widest hover:text-white transition-colors mt-4"
            >
                Cancelar
            </button>
        </div>
      </div>
    );
  }
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
        <div className="mb-12 relative group">
          <div className="absolute inset-0 bg-amber-500/20 blur-[100px] rounded-full group-hover:bg-amber-500/30 transition-all duration-1000" />
          <h1 className="text-8xl font-black text-white italic relative tracking-tighter leading-none select-none">
            LIBIDO
          </h1>
          <p className="text-amber-500 uppercase tracking-[0.5em] text-[10px] mt-4 font-black">Matriz Lifestyle 2026</p>
        </div>
        
        <div className="w-full max-w-xs space-y-4 relative z-10">
          <button 
            onClick={() => setView('register')}
            className="w-full py-5 gradient-libido rounded-[2rem] font-black text-white uppercase tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95"
          >
            Criar Nova Conta
          </button>
          <button 
            onClick={handleAccessExisting}
            className="w-full py-5 bg-slate-900 border border-amber-500/10 rounded-[2rem] font-black text-slate-400 uppercase tracking-widest text-[10px] hover:text-white transition-all shadow-xl"
          >
            Acessar Existente
          </button>
        </div>

        <footer className="mt-24 text-slate-800 text-[8px] uppercase font-black tracking-[0.4em] select-none">
          Ambiente Criptografado & Verificado
        </footer>
      </div>
    );
  }

  if (view === 'register') {
    return (
      <div className="h-screen w-full">
        <RegistrationFlow onComplete={handleRegistrationComplete} onCancel={() => setView('landing')} />
      </div>
    );
  }

  if (view === 'unlock') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 animate-in zoom-in-95 duration-500">
        <PinUnlock onUnlocked={handleUnlocked} onRequireStrongLogin={() => setView('landing')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 animate-in zoom-in-95 duration-500">
      <PinSetup onDone={handlePinDone} />
    </div>
  );
};

export default Auth;
