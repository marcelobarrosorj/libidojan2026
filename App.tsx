import React, { useEffect, useMemo, useState } from 'react';

type Screen = 'login' | 'signup' | 'forgot' | 'profile' | 'feed' | 'radar' | 'chat' | 'assinatura' | 'settings';

type UserType = 'casal' | 'homem' | 'mulher' | 'outro';

type PaymentPlan = {
  label: string;
  price: string;
  href: string;
};

const AUTH_KEY = 'libido_auth_v2';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [authenticated, setAuthenticated] = useState(false);
  const [panicMode, setPanicMode] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');

  const [selectedUserType, setSelectedUserType] = useState<UserType>('casal');

  const paymentPlans: PaymentPlan[] = useMemo(
    () => [
      {
        label: 'Mensal',
        price: 'R$ 49,90',
        href: 'https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403',
      },
      {
        label: 'Semestral',
        price: 'R$ 269,46',
        href: 'https://buy.stripe.com/3cI6oHfaZcLFc5ZfiSbo404',
      },
      {
        label: 'Anual',
        price: 'R$ 479,04',
        href: 'https://buy.stripe.com/4gM4gz8MBeTNgmfdaKbo405',
      },
    ],
    []
  );

  useEffect(() => {
    const saved = localStorage.getItem(AUTH_KEY);
    if (saved === 'true') {
      setAuthenticated(true);
      setScreen('feed');
    }

    const handleBlur = () => setPanicMode(true);
    const handleFocus = () => setPanicMode(false);
    const handleVisibility = () => setPanicMode(document.hidden);

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (panicMode) {
      document.body.classList.add('is-hidden');
    } else {
      document.body.classList.remove('is-hidden');
    }
  }, [panicMode]);

  const login = () => {
    if (!loginEmail.trim() || !loginPassword.trim()) return;
    localStorage.setItem(AUTH_KEY, 'true');
    setAuthenticated(true);
    setScreen('feed');
  };

  const signup = () => {
    if (!signupEmail.trim() || !signupPassword.trim() || signupPassword !== signupConfirm) return;
    localStorage.setItem(AUTH_KEY, 'true');
    setAuthenticated(true);
    setScreen('profile');
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthenticated(false);
    setScreen('login');
    setLoginEmail('');
    setLoginPassword('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirm('');
  };

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="libido-shell">
      <header className="libido-header">
        <div className="libido-brand">
          <div className="libido-mark">L</div>
          <div>
            <div className="libido-title">LIBIDO</div>
            <div className="libido-subtitle">Midnight & Gold</div>
          </div>
        </div>

        <div className="libido-header-actions">
          <button className="libido-upgrade" onClick={() => setScreen('assinatura')}>
            UPGRADE
          </button>
          <button className="libido-icon-btn" onClick={() => setScreen('settings')}>
            ⚙
          </button>
        </div>
      </header>

      <main className="libido-content">{children}</main>

      <nav className="libido-bottom-nav">
        <NavItem active={screen === 'feed'} label="Feed" onClick={() => setScreen('feed')} />
        <NavItem active={screen === 'radar'} label="Radar" onClick={() => setScreen('radar')} />
        <NavItem active={screen === 'chat'} label="Chats" onClick={() => setScreen('chat')} />
        <NavItem active={screen === 'profile'} label="Perfil" onClick={() => setScreen('profile')} />
      </nav>
    </div>
  );

  const NavItem = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button className={`libido-nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="libido-nav-dot" />
      <span>{label}</span>
    </button>
  );

  if (!authenticated && screen !== 'login' && screen !== 'signup' && screen !== 'forgot') {
    setScreen('login');
  }

  return (
    <>
      <style>{`
        :root {
          --pink: #ff1493;
          --amber: #f59e0b;
          --dark: #050505;
          --card: rgba(255,255,255,0.05);
          --text: #ffffff;
          --muted: #9ca3af;
          --line: rgba(255,255,255,0.08);
        }

        * {
          box-sizing: border-box;
          -webkit-user-select: none;
          user-select: none;
          -webkit-user-drag: none;
        }

        body {
          margin: 0;
          background: var(--dark);
          color: var(--text);
          font-family: Inter, sans-serif;
          overflow-x: hidden;
        }

        body.is-hidden {
          filter: blur(40px) grayscale(1) brightness(0.1);
        }

        .libido-shell {
          min-height: 100dvh;
          max-width: 420px;
          margin: 0 auto;
          background: var(--dark);
          border-left: 1px solid rgba(255,255,255,0.06);
          border-right: 1px solid rgba(255,255,255,0.06);
          position: relative;
          overflow: hidden;
        }

        .libido-header {
          position: sticky;
          top: 0;
          z-index: 20;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 20px;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--line);
        }

        .libido-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .libido-mark {
          width: 36px;
          height: 36px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, var(--amber), #b45309);
          color: #000;
          font-weight: 900;
        }

        .libido-title {
          font-family: Outfit, sans-serif;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.03em;
        }

        .libido-subtitle {
          font-size: 12px;
          color: var(--muted);
        }

        .libido-header-actions {
          display: flex;
          gap: 10px;
        }

        .libido-upgrade {
          border: 0;
          border-radius: 999px;
          padding: 10px 14px;
          background: linear-gradient(135deg, var(--amber), #b45309);
          color: #000;
          font-weight: 900;
          font-size: 11px;
        }

        .libido-icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          border: 1px solid var(--line);
          background: rgba(255,255,255,0.05);
          color: var(--text);
        }

        .libido-content {
          padding: 20px;
          padding-bottom: 110px;
          min-height: calc(100dvh - 84px);
        }

        .libido-card {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 24px;
          padding: 20px;
          backdrop-filter: blur(16px);
          box-shadow: 0 18px 50px rgba(0,0,0,0.35);
        }

        .libido-h1 {
          font-family: Outfit, sans-serif;
          font-size: 30px;
          margin: 0 0 10px;
          letter-spacing: -0.03em;
        }

        .libido-p {
          margin: 0 0 16px;
          color: var(--muted);
          line-height: 1.5;
          font-size: 14px;
        }

        .libido-input {
          width: 100%;
          border: 1px solid var(--line);
          background: rgba(255,255,255,0.04);
          color: var(--text);
          padding: 14px 16px;
          border-radius: 16px;
          outline: none;
          margin-bottom: 12px;
          font-size: 15px;
        }

        .libido-btn-primary,
        .libido-btn-secondary {
          width: 100%;
          border: 0;
          border-radius: 16px;
          padding: 14px 16px;
          font-weight: 800;
          font-size: 15px;
        }

        .libido-btn-primary {
          background: linear-gradient(135deg, var(--pink), #b91c1c);
          color: white;
        }

        .libido-btn-secondary {
          margin-top: 12px;
          background: linear-gradient(135deg, var(--amber), #b45309);
          color: #000;
        }

        .libido-link {
          display: block;
          text-align: center;
          color: var(--muted);
          margin-top: 12px;
          font-size: 13px;
        }

        .libido-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 420px;
          display: flex;
          justify-content: space-around;
          gap: 8px;
          padding: 14px 10px 22px;
          background: rgba(10,10,10,0.95);
          border-top: 1px solid var(--line);
          backdrop-filter: blur(16px);
          z-index: 40;
        }

        .libido-nav-item {
          flex: 1;
          border: 0;
          background: transparent;
          color: var(--muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .libido-nav-item.active {
          color: var(--amber);
        }

        .libido-nav-dot {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--line);
        }

        .libido-nav-item.active .libido-nav-dot {
          background: var(--amber);
          box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.16);
        }

        .libido-payment-list {
          display: grid;
          gap: 12px;
        }

        .libido-payment {
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 16px;
          background: rgba(255,255,255,0.04);
          color: var(--text);
          text-align: left;
        }

        .libido-profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .libido-chip {
          padding: 12px;
          border-radius: 14px;
          border: 1px solid var(--line);
          background: rgba(255,255,255,0.04);
          color: var(--text);
        }
      `}</style>

      {!authenticated ? (
        <div className="libido-shell" style={{ minHeight: '100dvh' }}>
          <div style={{ padding: 20 }}>
            <div className="libido-card">
              <h1 className="libido-h1">Libido</h1>
              <p className="libido-p">Acesse sua conta ou crie uma nova.</p>

              {screen === 'login' && (
                <>
                  <input className="libido-input" placeholder="E-mail" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                  <input className="libido-input" placeholder="Senha" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                  <button className="libido-btn-primary" onClick={login}>Entrar</button>
                  <button className="libido-btn-secondary" onClick={() => setScreen('signup')}>Cadastro</button>
                  <button className="libido-link" onClick={() => setScreen('forgot')}>Esqueci a senha</button>
                </>
              )}

              {screen === 'signup' && (
                <>
                  <input className="libido-input" placeholder="E-mail" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
                  <input className="libido-input" placeholder="Senha" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
                  <input className="libido-input" placeholder="Confirmar senha" type="password" value={signupConfirm} onChange={(e) => setSignupConfirm(e.target.value)} />
                  <button className="libido-btn-primary" onClick={signup}>Criar conta</button>
                  <button className="libido-btn-secondary" onClick={() => setScreen('login')}>Voltar</button>
                </>
              )}

              {screen === 'forgot' && (
                <>
                  <p className="libido-p">Digite seu e-mail para receber instruções de redefinição.</p>
                  <input className="libido-input" placeholder="E-mail" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                  <button className="libido-btn-primary" onClick={() => setScreen('login')}>Enviar link</button>
                  <button className="libido-btn-secondary" onClick={() => setScreen('login')}>Voltar</button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <Shell>
          {screen === 'feed' && (
            <div className="libido-card">
              <h1 className="libido-h1">Feed</h1>
              <p className="libido-p">Aqui entra o conteúdo principal do app.</p>
            </div>
          )}

          {screen === 'radar' && (
            <div className="libido-card">
              <h1 className="libido-h1">Radar</h1>
              <p className="libido-p">Busca e descoberta com visual premium.</p>
            </div>
          )}

          {screen === 'chat' && (
            <div className="libido-card">
              <h1 className="libido-h1">Chats</h1>
              <p className="libido-p">Mensagens e conexões.</p>
            </div>
          )}

          {screen === 'profile' && (
            <div className="libido-card">
              <h1 className="libido-h1">Perfil</h1>
              <p className="libido-p">Selecione seu tipo de perfil.</p>
              <div className="libido-profile-grid">
                {(['casal', 'homem', 'mulher', 'outro'] as UserType[]).map((item) => (
                  <button key={item} className="libido-chip" onClick={() => setSelectedUserType(item)}>
                    {item}
                  </button>
                ))}
              </div>
              <button className="libido-btn-secondary" onClick={logout}>Sair</button>
            </div>
          )}

          {screen === 'assinatura' && (
            <div className="libido-card">
              <h1 className="libido-h1">Assinatura Premium</h1>
              <p className="libido-p">Os planos só ficam acionáveis após login.</p>
              <div className="libido-payment-list">
                {paymentPlans.map((plan) => (
                  <button key={plan.label} className="libido-payment" onClick={() => window.open(plan.href, '_blank', 'noopener,noreferrer')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{plan.label}</strong>
                      <span style={{ color: 'var(--amber)', fontWeight: 900 }}>{plan.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {screen === 'settings' && (
            <div className="libido-card">
              <h1 className="libido-h1">Configurações</h1>
              <p className="libido-p">Ajustes gerais do aplicativo.</p>
              <button className="libido-btn-secondary" onClick={logout}>Sair</button>
            </div>
          )}
        </Shell>
      )}
    </>
  );
}
