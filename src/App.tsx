import { LandingPage } from './components/LandingPage';
import { Partners } from './components/Partners';
import React, { useState, useEffect, useRef } from 'react';
import { getUserById, updateUserProfile } from './services/users';
import { supabase } from './services/supabase';
import { User } from './types';
import { login as signInWithEmail, register as signUpWithEmail, logout as signOutUser, getCurrentUser, resendVerification, resetPasswordForEmail, updatePassword } from './services/auth';
import { PinScreen } from './components/PinScreen';
import { AppCore } from './components/AppCore';
import { Onboarding } from './components/Onboarding';

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [showPartners, setShowPartners] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  
  const [pinVerified, setPinVerified] = useState(false);
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  
  const [pendingEmailVerification, setPendingEmailVerification] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState<'request' | 'update' | null>(null);

  const blurTimeoutRef = useRef<any>(null);

  useEffect(() => {
    // Check for password recovery hash
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode('update');
        setIsLogin(false);
        setShowLanding(false);
      }
    });

    const handleVisibilityChange = () => {
      const isSafeZone = document.body.classList.contains('navigating-out') || 
                         document.body.classList.contains('payment-active');
      
      if (document.hidden) {
        if (!isSafeZone) {
          blurTimeoutRef.current = setTimeout(() => {
            document.body.classList.add('is-hidden');
            setPinVerified(false);
          }, 60000); // 60 seconds grace period
        }
      } else {
        if (blurTimeoutRef.current) {
          clearTimeout(blurTimeoutRef.current);
          blurTimeoutRef.current = null;
        }
        document.body.classList.remove('is-hidden');
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    const handleProfileUpdate = async () => {
       try {
         const { data: { session } } = await supabase.auth.getSession();
         if (session?.user) {
            const profile = await getUserById(session.user.id);
            setSupabaseUser(profile);
         }
       } catch (err) {}
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    // Auth state listener
    const unsubscribe = getCurrentUser(async (currentUser) => {
      if (currentUser) {
        if (currentUser.emailVerified) {
          setUser(currentUser);
          setPendingEmailVerification(false);

          // Only load profile if email is verified to avoid useless queries
          setSupabaseLoading(true);
          try {
            const profile = await getUserById(currentUser.id);
            setSupabaseUser(profile);
            setShowLanding(false);
          } catch (err) {
            console.error(err);
          } finally {
            setSupabaseLoading(false);
            setLoading(false);
          }
        } else {
          setUser(currentUser); // It has session but not verified
          setLoading(false);
        }
      } else {
        setUser(null);
        setSupabaseUser(null);
        setLoading(false);
      }
    });

    // Handle hash fragment for email confirmation redirect
    if (window.location.hash.includes('type=signup') || window.location.hash.includes('access_token')) {
        // Let supabase handle it, then we clear hash
        setTimeout(() => {
            if (window.location.hash) {
                window.history.replaceState(null, '', window.location.pathname);
            }
        }, 1000);
    }

    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  // Cooldown effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOnboardingComplete = async () => {
    if (user) {
      setSupabaseLoading(true);
      try {
        const profile = await getUserById(user.id);
        setSupabaseUser(profile);
      } catch (err) {
        console.error("Erro ao recarregar perfil pós onboarding:", err);
      } finally {
        setSupabaseLoading(false);
      }
    }
  };

  const register = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setAuthLoading(true);
      setError("");
      setMsg("");
      const res = await signUpWithEmail(email, password);
      
      if (!res.session) {
        setPendingEmailVerification(true);
      } else {
        setUser({ id: res.user.id, email: res.user.email, emailVerified: res.user.emailVerified });
      }
    } catch (err: any) {
      setError(err.code || err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setAuthLoading(true);
      setError("");
      setMsg("");
      const res = await signInWithEmail(email, password);
      setUser({ id: res.user.id, email: res.user.email, emailVerified: res.user.emailVerified });
      setPendingEmailVerification(false);
    } catch (err: any) {
      setError(err.code || err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleConfirmCheck = async () => {
    if (password) {
      setAuthLoading(true);
      setError("");
      setMsg("");
      try {
        const res = await signInWithEmail(email, password);
        if (res.user.emailVerified) {
          setUser({ id: res.user.id, email: res.user.email, emailVerified: true });
          setPendingEmailVerification(false);
        } else {
           setMsg("O e-mail ainda não foi confirmado. Verifique sua caixa de entrada.");
        }
      } catch (err: any) {
        if (err.message.includes('Invalid login credentials')) {
           setError("E-mail ou senha incorretos.");
        } else if (err.message.includes('Email not confirmed')) {
           setMsg("O e-mail ainda não foi confirmado. Verifique sua caixa de entrada.");
        } else {
           setError(err.message);
        }
      } finally {
        setAuthLoading(false);
      }
    } else {
        // Fallback to login if password is lost
        setPendingEmailVerification(false);
        setIsLogin(true);
        setMsg("E-mail confirmado? Entre com sua senha para continuar.");
    }
  };

  const handleResendVerificationAction = async () => {
    if (resendCooldown > 0) return;
    try {
      setIsResending(true);
      setError("");
      setMsg("");
      await resendVerification(email || (user && user.email));
      setMsg("E-mail reenviado com sucesso!");
      setResendCooldown(60);
    } catch (err: any) {
      setError("Erro ao reenviar: " + err.message);
    } finally {
      setIsResending(false);
    }
  };

  const logout = async () => {
    if (user) {
      try {
        await updateUserProfile(user.id, { status: 'inactive' });
      } catch (err) {}
    }
    await signOutUser();
    setPinVerified(false);
    setUser(null);
    setSupabaseUser(null);
    setPendingEmailVerification(false);
    setShowLanding(true);
  };

  const handlePasswordRecoveryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError("");
    setMsg("");
    try {
      await resetPasswordForEmail(email);
      setMsg("Verifique sua caixa de entrada para o link de redefinição de senha.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePasswordRecoveryUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError("");
    try {
      await updatePassword(password);
      setMsg("Senha atualizada com sucesso. Conecte-se com sua nova senha.");
      setRecoveryMode(null);
      setIsLogin(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading || supabaseLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[var(--libido-bg)] text-[var(--libido-text)]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="font-fraunces font-bold text-3xl tracking-[0.2em] mb-4">
            LIBIDO<span className="text-[var(--libido-accent)] leading-none text-4xl -ml-1">.</span>
          </div>
          <div className="text-[10px] text-[var(--libido-muted)] tracking-widest uppercase mt-4">
            Iniciando Conexão Segura
          </div>
        </div>
      </div>
    );
  }

  if (pendingEmailVerification) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[var(--libido-bg)] text-[var(--libido-text)] px-6">
        <div className="max-w-md w-full bg-[var(--libido-surface-2)] p-8 rounded-3xl border border-[var(--libido-border)] text-center shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)]">
          <div className="font-fraunces font-bold text-2xl tracking-[0.2em] mb-8 text-[var(--libido-text)]">
            LIBIDO<span className="text-[var(--libido-accent)] leading-none text-3xl -ml-1">.</span>
          </div>
          
          <h2 className="text-xl font-medium mb-3 text-[var(--libido-text)]">Confirme seu E-mail</h2>
          
          <p className="text-sm text-[var(--libido-muted)] mb-6 leading-relaxed">
            Enviamos um link de confirmação para:<br/>
            <strong className="text-[var(--libido-accent)] font-mono text-xs mt-2 block">{email || (user && user.email)}</strong>
          </p>
          
          <p className="text-xs text-[var(--libido-muted)] mb-8 bg-black/20 p-4 rounded-xl border border-[var(--libido-border)]/50">
            Acesse sua caixa de entrada, clique no link de confirmação e volte aqui.
          </p>
          
          {error && <p className="text-red-400 text-xs mb-4 font-medium">{error}</p>}
          {msg && <p className="text-[var(--libido-accent)] text-xs mb-4 font-medium">{msg}</p>}

          <div className="flex flex-col gap-3">
             <button 
               onClick={handleConfirmCheck}
               disabled={authLoading}
               className="w-full bg-[var(--libido-accent)] text-black font-bold py-4 rounded-xl text-xs tracking-wider transition-all hover:bg-[var(--libido-accent-hover)] shadow-[0_0_20px_rgba(216,107,63,0.2)] disabled:opacity-50"
             >
               {authLoading ? 'VERIFICANDO...' : 'JÁ CONFIRMEI O E-MAIL'}
             </button>

             <button 
               onClick={handleResendVerificationAction}
               disabled={isResending || resendCooldown > 0}
               className="w-full bg-transparent border border-[var(--libido-border)] text-[var(--libido-text)] font-bold py-4 rounded-xl text-xs tracking-wider transition-all hover:bg-[var(--libido-surface)] disabled:opacity-50"
             >
               {isResending ? 'REENVIANDO...' : resendCooldown > 0 ? `AGUARDE ${resendCooldown}S` : 'REENVIAR E-MAIL'}
             </button>
             
             <button 
               onClick={() => { setPendingEmailVerification(false); logout(); }}
               className="mt-4 text-[10px] uppercase tracking-widest text-[var(--libido-muted)] hover:text-[var(--libido-text)] transition-colors"
             >
               Tentar outra conta
             </button>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    if (!supabaseUser) {
       return <Onboarding userId={user.id} onComplete={handleOnboardingComplete} />;
    }
    
    if (supabaseUser.status === 'banned') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[var(--libido-bg)] min-h-screen">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
             <span className="text-red-500 text-2xl font-black">X</span>
          </div>
          <h2 className="text-2xl font-black uppercase text-red-500 tracking-wider mb-2">Acesso Restrito</h2>
          <p className="text-sm text-[var(--libido-muted)] text-center max-w-sm mb-8 leading-relaxed">
            Esta conta foi suspensa permanentemente por violação grave das Regras da Comunidade.
          </p>
          <button 
             onClick={logout}
             className="bg-[var(--libido-surface-2)] border border-[var(--libido-border)] text-white font-bold py-3 px-8 rounded-xl text-sm"
          >
            Sair
          </button>
        </div>
      );
    }
    
    if (!pinVerified) {
      return (
        <PinScreen
          userId={supabaseUser.id || ''}
          mode={supabaseUser.pin ? 'verify' : 'create'}
          onSuccess={() => setPinVerified(true)}
        />
      );
    }

    return <AppCore onLogout={logout} userId={user.id} currentUser={supabaseUser} />;
  }

  if (showPartners) {
    return <Partners onBack={() => setShowPartners(false)} />;
  }

  if (showLanding && !recoveryMode) {
    return <LandingPage 
      onLoginClick={() => { setIsLogin(true); setShowLanding(false); setRecoveryMode(null); }} 
      onRegisterClick={() => { setIsLogin(false); setShowLanding(false); setRecoveryMode(null); }} 
      onPartnersClick={() => setShowPartners(true)}
    />;
  }

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-8 min-h-screen bg-[var(--libido-bg)] text-[var(--libido-text)]">
      <div className="w-full max-w-[360px] h-full flex flex-col">
        <div className="mb-12 mt-4 cursor-pointer" onClick={() => setShowLanding(true)}>
          <div className="font-fraunces font-bold text-xl tracking-[0.2em] text-[var(--libido-text)] flex items-center select-none">
            LIBIDO<span className="text-[var(--libido-accent)] leading-none text-3xl -ml-1">.</span>
          </div>
        </div>
        
        {recoveryMode === 'request' ? (
           <div className="flex flex-col mb-10">
             <div className="text-[var(--libido-accent)] text-[10px] font-bold tracking-[0.2em] uppercase mb-4">Recuperação</div>
             <h1 className="text-3xl font-fraunces font-medium text-[var(--libido-text)] leading-[1.1] mb-4">
               Esqueci minha senha
             </h1>
             <p className="text-[var(--libido-muted)] text-sm">
               Informe seu e-mail para receber um link de redefinição.
             </p>
           </div>
        ) : recoveryMode === 'update' ? (
           <div className="flex flex-col mb-10">
             <div className="text-[var(--libido-accent)] text-[10px] font-bold tracking-[0.2em] uppercase mb-4">Segurança</div>
             <h1 className="text-3xl font-fraunces font-medium text-[var(--libido-text)] leading-[1.1] mb-4">
               Nova senha
             </h1>
             <p className="text-[var(--libido-muted)] text-sm">
               Crie uma nova senha para sua conta.
             </p>
           </div>
        ) : (
          <div className="flex flex-col mb-10">
            <div className="text-[var(--libido-accent)] text-[10px] font-bold tracking-[0.2em] uppercase mb-4">Acesso Reservado</div>
            <h1 className="text-4xl font-fraunces font-medium text-[var(--libido-text)] leading-[1.1] mb-4">
              {isLogin ? 'Conecte-se ao que desperta você.' : 'Comece sua jornada discreta.'}
            </h1>
            <p className="text-[var(--libido-muted)] text-sm">
              {isLogin ? 'Seu espaço privado para descobrir, conversar e permanecer.' : 'Crie sua conta para acessar o ambiente.'}
            </p>
          </div>
        )}

        {msg && <p className="text-[var(--libido-accent)] text-xs text-center font-medium bg-[var(--libido-accent)]/10 py-3 px-4 rounded-xl border border-[var(--libido-accent)]/20 mb-4">{msg}</p>}
        {error && <p className="text-red-400 text-xs text-center font-medium bg-red-950/30 py-3 px-4 rounded-xl border border-red-900/50 mb-4">{error}</p>}

        {recoveryMode === 'request' ? (
            <form className="flex flex-col gap-5 w-full" onSubmit={handlePasswordRecoveryRequest}>
               <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--libido-muted)] ml-1">E-mail</label>
                 <input
                   type="email"
                   placeholder="voce@email.com"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full bg-[var(--libido-surface-2)] border border-[var(--libido-border)] text-[var(--libido-text)] rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-[var(--libido-accent)] transition-colors"
                 />
               </div>
               <button 
                 type="submit" 
                 disabled={authLoading}
                 className="w-full bg-[var(--libido-surface-2)] text-[var(--libido-text)] border border-[var(--libido-border)] font-bold py-4 mt-2 rounded-[16px] text-sm tracking-wide transition-all hover:bg-[var(--libido-surface)]"
               >
                 {authLoading ? 'Enviando...' : 'Enviar link de recuperação'}
               </button>
               <div className="text-center mt-4">
                 <button type="button" onClick={() => setRecoveryMode(null)} className="text-[11px] font-medium tracking-[0.1em] uppercase text-[var(--libido-muted)] hover:text-[var(--libido-text)]">
                    Voltar para Login
                 </button>
               </div>
            </form>
        ) : recoveryMode === 'update' ? (
            <form className="flex flex-col gap-5 w-full" onSubmit={handlePasswordRecoveryUpdate}>
               <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--libido-muted)] ml-1">Nova Senha</label>
                 <input
                   type="password"
                   placeholder="•••••••••"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full bg-[var(--libido-surface-2)] border border-[var(--libido-border)] text-[var(--libido-text)] rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-[var(--libido-accent)] transition-colors"
                 />
               </div>
               <button 
                 type="submit" 
                 disabled={authLoading}
                 className="w-full bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] font-bold py-4 mt-2 rounded-[16px] text-sm tracking-wide transition-all"
               >
                 {authLoading ? 'Salvando...' : 'Salvar Nova Senha'}
               </button>
            </form>
        ) : (
            <form className="flex flex-col gap-5 w-full" onSubmit={isLogin ? login : register}>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--libido-muted)] ml-1">E-mail</label>
                <input
                  type="email"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--libido-surface-2)] border border-[var(--libido-border)] text-[var(--libido-text)] rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-[var(--libido-accent)] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--libido-muted)]">Senha</label>
                  {isLogin && (
                    <button type="button" onClick={() => setRecoveryMode('request')} className="text-[9px] font-bold text-[var(--libido-accent)] hover:text-[var(--libido-accent-hover)] uppercase">Esqueci</button>
                  )}
                </div>
                <input
                  type="password"
                  placeholder="•••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--libido-surface-2)] border border-[var(--libido-border)] text-[var(--libido-text)] rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-[var(--libido-accent)] transition-colors"
                />
              </div>
              <button 
                type="submit" 
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] font-bold py-4 mt-2 rounded-[16px] text-sm tracking-wide transition-all shadow-[0_4px_20px_rgba(216,107,63,0.15)] hover:shadow-[0_4px_25px_rgba(216,107,63,0.25)] hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {authLoading ? 'AGUARDE...' : (isLogin ? 'ENTRAR AGORA →' : 'CRIAR CONTA →')}
              </button>
            </form>
        )}
        
        {!recoveryMode && (
          <div className="text-center mt-6">
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(""); setMsg(""); }} 
              className="text-[11px] font-medium tracking-[0.1em] uppercase text-[var(--libido-muted)] hover:text-[var(--libido-text)] transition-colors"
            >
              {isLogin ? 'CRIAR UMA CONTA DISCRETA' : 'JÁ TENHO UMA CONTA'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
