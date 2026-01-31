import React, { useState } from 'react';
import { useAuth } from '../App';
import { RegistrationFlow } from './RegistrationFlow';
import { PinSetup } from './PinSetup';
import { saveUserData, setAuthFlag } from '../services/authUtils';
import { User, Plan, TrustLevel, UserType, Biotype, Gender, SexualOrientation, Vibes } from '../types';

export const Auth: React.FC = () => {
  const { setIsAuthenticated, setIsUnlocked, refreshSession } = useAuth();
  const [view, setView] = useState<'landing' | 'register' | 'pin'>('landing');
  const [regData, setRegData] = useState<any>(null);

  const handleRegistrationComplete = (payload: any) => {
    setRegData(payload);
    setView('pin');
  };

  const handlePinDone = () => {
    const data = regData.data;
    const nickname = data.nickname || data.mainNickname || 'Anon';
    const email = data.email || 'contato@libido.app';

    // Construção do objeto de usuário inicial para persistência com campos da Matriz B
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

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
        <div className="mb-12 relative group">
          <div className="absolute inset-0 bg-pink/20 blur-[100px] rounded-full group-hover:bg-pink/30 transition-all duration-1000" />
          <h1 className="text-8xl font-black text-white italic relative tracking-tighter leading-none select-none">
            LIBIDO
          </h1>
          <p className="text-slate-500 uppercase tracking-[0.5em] text-[10px] mt-4 font-black">Matriz Lifestyle 2026</p>
        </div>
        
        <div className="w-full max-w-xs space-y-4 relative z-10">
          <button 
            onClick={() => setView('register')}
            className="w-full py-5 gradient-libido rounded-[2rem] font-black text-white uppercase tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95"
          >
            Criar Nova Conta
          </button>
          <button 
            className="w-full py-5 bg-slate-900 border border-white/5 rounded-[2rem] font-black text-slate-500 uppercase tracking-widest text-[10px] hover:text-white transition-all shadow-xl"
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

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 animate-in zoom-in-95 duration-500">
      <PinSetup onDone={handlePinDone} />
    </div>
  );
};

export default Auth;