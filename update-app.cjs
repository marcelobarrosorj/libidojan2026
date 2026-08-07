const fs = require('fs');

const appTsx = `import { LandingPage } from './components/LandingPage';
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
      setMsg("Link de recuperação enviado para seu e-mail.");
    } catch(err: any) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePasswordRecoveryUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError("");
    setMsg("");
    try {
      await updatePassword(password);
      setMsg("Senha atualizada com sucesso! Faça login.");
      setRecoveryMode(null);
      setIsLogin(true);
      setPassword("");
    } catch(err: any) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading || supabaseLoading) {
    return (
      <div className="w-full h-screen bg-[var(--libido-bg)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--libido-border)] border-t-[var(--libido-accent)] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle email verification screen
  if (pendingEmailVerification || (user && !user.emailVerified)) {
    return (
      <div className="flex flex-col justify-center items-center px-6 gap-6 w-full h-screen text-center bg-[var(--libido-bg)] text-[var(--libido-text)]">
        <div className="w-16 h-16 bg-[var(--libido-accent)]/10 rounded-[1.8rem] flex items-center justify-center border border-[var(--libido-accent)]/20 shadow-[0_0_20px_rgba(255,179,0,0.1)]">
          <svg className="w-8 h-8 text-[var(--libido-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </div>
        <h1 className="text-2xl font-fraunces font-medium uppercase tracking-wider italic">Confirme seu E-mail</h1>
        <p className="text-[var(--libido-muted)] opacity-60 text-xs max-w-sm px-4 leading-relaxed font-semibold">
          Enviamos um link de verificação para <strong className="text-[var(--libido-text)]">{email || (user?.email)}</strong>. 
          Verifique sua caixa de entrada, clique no link e então confirme abaixo.
        </p>
        
        {msg && <p className="text-[var(--libido-accent)] text-xs text-center font-medium bg-[var(--libido-accent)]/10 py-3 px-4 rounded-xl border border-[var(--libido-accent)]/20">{msg}</p>}
        {error && <p className="text-red-400 text-xs text-center font-medium bg-red-950/30 py-3 px-4 rounded-xl border border-red-900/50">{error}</p>}

        <div className="flex flex-col gap-3 mt-6 w-full max-w-xs">
          <button 
            onClick={handleConfirmCheck}
            disabled={authLoading}
            className="bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg shadow-[var(--libido-accent)]/10 active:scale-95 disabled:opacity-50"
          >
            {authLoading ? 'Verificando...' : 'Já confirmei'}
          </button>
          <button 
            onClick={handleResendVerificationAction}
            disabled={isResending || resendCooldown > 0}
            className="bg-white/5 text-[var(--libido-text)] border border-[var(--libido-border)] font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {isResending ? 'Enviando...' : resendCooldown > 0 ? \`Aguarde \${resendCooldown}s\` : 'Reenviar e-mail'}
          </button>
          <button onClick={logout} className="text-[var(--libido-muted)] opacity-50 text-xs font-bold uppercase tracking-widest mt-6 hover:text-[var(--libido-text)]">
            Sair ou usar outra conta
          </button>
        </div>
      </div>
    );
  }

  // Handle normal app flow
  if (user) {
    if (supabaseUser && supabaseUser.is_banned) {
      return (
        <div className="flex flex-col justify-center items-center px-6 gap-6 w-full h-screen text-center bg-[var(--libido-bg)] text-[var(--libido-text)]">
           <h1 className="text-2xl font-fraunces text-red-500">Conta Suspensa</h1>
           <p className="text-[var(--libido-muted)]">Esta conta foi suspensa por violação das Regras da Comunidade.</p>
           <button onClick={logout} className="bg-white/10 text-white px-6 py-3 rounded-xl mt-4">Sair</button>
        </div>
      );
    }
    if (supabaseUser && supabaseUser.is_deleted) {
      return (
        <div className="flex flex-col justify-center items-center px-6 gap-6 w-full h-screen text-center bg-[var(--libido-bg)] text-[var(--libido-text)]">
           <h1 className="text-2xl font-fraunces">Conta Excluída</h1>
           <button onClick={logout} className="bg-white/10 text-white px-6 py-3 rounded-xl mt-4">Sair</button>
        </div>
      );
    }
    if (supabaseUser === null || !supabaseUser.nickname) { 
      return <Onboarding userId={user.id} onComplete={handleOnboardingComplete} />;
    }
    if (supabaseUser && !pinVerified) {
      const hasPin = supabaseUser.pin && supabaseUser.pin.length === 4 && supabaseUser.pin !== 'premium';
      return (
        <PinScreen
          userId={user.id}
          mode={hasPin ? 'verify' : 'create'}
          onSuccess={() => setPinVerified(true)}
        />
      );
    }
    return <AppCore onLogout={logout} userId={user.id} currentUser={supabaseUser} />;
  }

  if (showLanding && !recoveryMode) {
    return <LandingPage 
      onLoginClick={() => { setIsLogin(true); setShowLanding(false); setRecoveryMode(null); }} 
      onRegisterClick={() => { setIsLogin(false); setShowLanding(false); setRecoveryMode(null); }} 
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
`;
fs.writeFileSync('src/App.tsx', appTsx, 'utf8');
console.log('App.tsx rewritten.');
