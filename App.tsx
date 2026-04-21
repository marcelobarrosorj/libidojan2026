import React, { useEffect, useMemo, useState } from 'react';

type Screen = 'home' | 'login' | 'register' | 'dashboard';

type PaymentPlan = {
  label: string;
  price: string;
  href: string;
};

const AUTH_KEY = 'libido_auth_v1';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(AUTH_KEY);
    if (saved === 'true') {
      setIsAuthenticated(true);
      setScreen('dashboard');
    }
  }, []);

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

  const handleLogin = () => {
    if (!loginEmail.trim() || !loginPassword.trim()) return;
    localStorage.setItem(AUTH_KEY, 'true');
    setIsAuthenticated(true);
    setScreen('dashboard');
  };

  const handleRegister = () => {
    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) return;
    localStorage.setItem(AUTH_KEY, 'true');
    setIsAuthenticated(true);
    setScreen('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setScreen('home');
    setLoginEmail('');
    setLoginPassword('');
    setRegisterName('');
    setRegisterEmail('');
    setRegisterPassword('');
  };

  const openPayment = (href: string) => {
    if (!isAuthenticated) return;
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  if (screen === 'home') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.appTitle}>Libido</h1>
          <p style={styles.subtitle}>Acesse sua conta ou crie um novo cadastro.</p>

          <button onClick={() => setScreen('login')} style={styles.primaryButton}>
            Entrar
          </button>

          <button onClick={() => setScreen('register')} style={styles.secondaryButton}>
            Cadastro
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'login') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.sectionTitle}>Libido</h1>
          <p style={styles.subtitle}>Faça login para continuar.</p>

          <input
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            type="email"
            placeholder="E-mail"
            style={styles.input}
          />

          <input
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            type="password"
            placeholder="Senha"
            style={styles.input}
          />

          <button onClick={handleLogin} style={styles.primaryButton}>
            Entrar
          </button>

          <button onClick={() => setScreen('home')} style={styles.ghostButton}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'register') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.sectionTitle}>Libido</h1>
          <p style={styles.subtitle}>Crie sua conta para continuar.</p>

          <input
            value={registerName}
            onChange={(e) => setRegisterName(e.target.value)}
            type="text"
            placeholder="Nome"
            style={styles.input}
          />

          <input
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            type="email"
            placeholder="E-mail"
            style={styles.input}
          />

          <input
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            type="password"
            placeholder="Senha"
            style={styles.input}
          />

          <button onClick={handleRegister} style={styles.primaryButton}>
            Cadastrar
          </button>

          <button onClick={() => setScreen('home')} style={styles.ghostButton}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboardPage}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Libido</h1>
          <p style={styles.headerSubtitle}>Área autenticada</p>
        </div>

        <button onClick={handleLogout} style={styles.logoutButton}>
          Sair
        </button>
      </header>

      <main style={styles.dashboardContent}>
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Painel principal</h2>
          <p style={styles.subtitle}>
            Os botões de pagamento estão disponíveis somente após login.
          </p>

          <div style={styles.paymentGrid}>
            {paymentPlans.map((plan) => (
              <button
                key={plan.label}
                onClick={() => openPayment(plan.href)}
                style={styles.paymentButton}
                type="button"
              >
                <span>{plan.label}</span>
                <strong>{plan.price}</strong>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'linear-gradient(180deg, #0f172a 0%, #111827 100%)',
    color: '#e5e7eb',
  },
  dashboardPage: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0f172a 0%, #111827 100%)',
    color: '#e5e7eb',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '28px',
    borderRadius: '20px',
    background: 'rgba(17, 24, 39, 0.78)',
    border: '1px solid rgba(148, 163, 184, 0.16)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
    backdropFilter: 'blur(12px)',
  },
  appTitle: {
    margin: 0,
    fontSize: '34px',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: '#f8fafc',
    textAlign: 'center',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: '#f8fafc',
    textAlign: 'center',
  },
  subtitle: {
    margin: '10px 0 22px',
    fontSize: '14px',
    lineHeight: 1.6,
    color: '#cbd5e1',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: '12px',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    background: 'rgba(15, 23, 42, 0.7)',
    color: '#f8fafc',
    outline: 'none',
    fontSize: '15px',
  },
  primaryButton: {
    width: '100%',
    marginTop: '4px',
    padding: '14px 16px',
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
    color: '#f8fafc',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  secondaryButton: {
    width: '100%',
    marginTop: '12px',
    padding: '14px 16px',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: '12px',
    background: 'transparent',
    color: '#e2e8f0',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  ghostButton: {
    width: '100%',
    marginTop: '12px',
    padding: '12px 16px',
    border: 'none',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 24px',
    borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
    background: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(12px)',
  },
  headerTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 800,
    color: '#f8fafc',
  },
  headerSubtitle: {
    margin: '4px 0 0',
    fontSize: '13px',
    color: '#cbd5e1',
  },
  logoutButton: {
    padding: '10px 14px',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: '10px',
    background: 'rgba(15, 23, 42, 0.8)',
    color: '#f8fafc',
    cursor: 'pointer',
    fontWeight: 700,
  },
  dashboardContent: {
    display: 'flex',
    justifyContent: 'center',
    padding: '24px',
  },
  paymentGrid: {
    display: 'grid',
    gap: '12px',
    marginTop: '8px',
  },
  paymentButton: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '16px 18px',
    borderRadius: '14px',
    border: '1px solid rgba(148, 163, 184, 0.14)',
    background: 'linear-gradient(135deg, rgba(51,65,85,0.95) 0%, rgba(30,41,59,0.95) 100%)',
    color: '#f8fafc',
    cursor: 'pointer',
    fontSize: '15px',
  },
};
