import React, { useState } from 'react';

type Screen = 'home' | 'login' | 'register' | 'dashboard';

type UserForm = {
  email: string;
  password: string;
};

type PaymentOption = {
  name: string;
  href: string;
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState<UserForm>({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState<UserForm>({ email: '', password: '' });
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  const paymentOptions: PaymentOption[] = [
    { name: 'Mensal', href: 'https://buy.stripe.com/cNi14n7Ix7rl6LF7Qqbo403' },
    { name: 'Semestral', href: 'https://buy.stripe.com/3cI6oHfaZcLFc5ZfiSbo404' },
    { name: 'Anual', href: 'https://buy.stripe.com/4gM4gz8MBeTNgmfdaKbo405' },
  ];

  const handleLogin = () => {
    if (!loginForm.email.trim() || !loginForm.password.trim()) return;
    setCurrentUserEmail(loginForm.email.trim());
    setIsAuthenticated(true);
    setScreen('dashboard');
  };

  const handleRegister = () => {
    if (!registerForm.email.trim() || !registerForm.password.trim()) return;
    setCurrentUserEmail(registerForm.email.trim());
    setIsAuthenticated(true);
    setScreen('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUserEmail('');
    setLoginForm({ email: '', password: '' });
    setRegisterForm({ email: '', password: '' });
    setScreen('home');
  };

  const Home = () => (
    <div style={styles.centerPage}>
      <div style={styles.card}>
        <h1 style={styles.title}>Libido 2026</h1>
        <p style={styles.subtitle}>Escolha uma opção para continuar</p>

        <button onClick={() => setScreen('login')} style={styles.primaryButton}>
          Entrar
        </button>

        <button onClick={() => setScreen('register')} style={styles.secondaryButton}>
          Cadastro
        </button>
      </div>
    </div>
  );

  const Login = () => (
    <div style={styles.centerPage}>
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Entrar</h2>

        <input
          type="email"
          placeholder="Email"
          value={loginForm.email}
          onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Senha"
          value={loginForm.password}
          onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
          style={styles.input}
        />

        <button onClick={handleLogin} style={styles.primaryButton}>
          Confirmar login
        </button>

        <button onClick={() => setScreen('home')} style={styles.linkButton}>
          Voltar
        </button>
      </div>
    </div>
  );

  const Register = () => (
    <div style={styles.centerPage}>
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Cadastro</h2>

        <input
          type="email"
          placeholder="Email"
          value={registerForm.email}
          onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Senha"
          value={registerForm.password}
          onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
          style={styles.input}
        />

        <button onClick={handleRegister} style={styles.primaryButton}>
          Criar conta
        </button>

        <button onClick={() => setScreen('home')} style={styles.linkButton}>
          Voltar
        </button>
      </div>
    </div>
  );

  const Dashboard = () => (
    <div style={styles.dashboardPage}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>LIBIDO</h1>
          <p style={styles.headerSubtitle}>Logado como {currentUserEmail}</p>
        </div>

        <button onClick={handleLogout} style={styles.logoutButton}>
          Sair
        </button>
      </header>

      <main style={styles.dashboardContent}>
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Painel principal</h2>
          <p style={styles.subtitle}>
            Os botões de pagamento ficam disponíveis somente após o login.
          </p>

          <div style={styles.paymentList}>
            {paymentOptions.map((option) => (
              <a
                key={option.name}
                href={isAuthenticated ? option.href : '#'}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!isAuthenticated}
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                  }
                }}
                style={{
                  ...styles.paymentButton,
                  pointerEvents: isAuthenticated ? 'auto' : 'none',
                  opacity: isAuthenticated ? 1 : 0.5,
                }}
              >
                {option.name}
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <>
      {screen === 'home' && <Home />}
      {screen === 'login' && <Login />}
      {screen === 'register' && <Register />}
      {screen === 'dashboard' && isAuthenticated && <Dashboard />}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  centerPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #050505 0%, #1a0033 100%)',
    padding: '20px',
    color: '#fff',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
    backdropFilter: 'blur(10px)',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '32px',
    fontWeight: 900,
    textAlign: 'center',
  },
  subtitle: {
    margin: '0 0 20px',
    fontSize: '14px',
    lineHeight: 1.5,
    textAlign: 'center',
    opacity: 0.9,
  },
  sectionTitle: {
    margin: '0 0 16px',
    fontSize: '24px',
    fontWeight: 800,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    marginBottom: '12px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(0,0,0,0.25)',
    color: '#fff',
    outline: 'none',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  primaryButton: {
    width: '100%',
    padding: '14px 16px',
    marginTop: '8px',
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #00ff88 0%, #ff00aa 100%)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  secondaryButton: {
    width: '100%',
    padding: '14px 16px',
    marginTop: '12px',
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #ffaa00 0%, #aa00ff 100%)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  linkButton: {
    width: '100%',
    padding: '12px 16px',
    marginTop: '8px',
    border: 'none',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  dashboardPage: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #050505 0%, #1a0033 100%)',
    color: '#fff',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '18px 20px',
    background: 'rgba(0,0,0,0.35)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(10px)',
  },
  headerTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 900,
  },
  headerSubtitle: {
    margin: '4px 0 0',
    fontSize: '13px',
    opacity: 0.85,
  },
  logoutButton: {
    padding: '10px 14px',
    border: 'none',
    borderRadius: '10px',
    background: '#222',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
  },
  dashboardContent: {
    padding: '20px',
    display: 'flex',
    justifyContent: 'center',
  },
  paymentList: {
    display: 'grid',
    gap: '12px',
    marginTop: '18px',
  },
  paymentButton: {
    display: 'block',
    padding: '16px',
    borderRadius: '14px',
    textAlign: 'center',
    textDecoration: 'none',
    fontWeight: 800,
    color: '#fff',
    background: 'linear-gradient(135deg, #00ff88 0%, #ff00aa 100%)',
    border: '1px solid rgba(255,255,255,0.12)',
  },
};
