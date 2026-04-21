import React, { useState, useEffect } from 'react';

type User = {
  id: string;
  email: string;
  password: string;
  profile?: 'casal' | 'homem' | 'mulher' | 'outro';
};

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
};

enum Screen {
  Login = 'login',
  Signup = 'signup',
  ForgotPassword = 'forgotPassword',
  Main = 'main',
  ProfileSelection = 'profileSelection',
}

const mockUsers: User[] = [
  { id: '1', email: 'user@example.com', password: 'password123', profile: 'homem' },
];

const PAYMENT_URL = 'https://pagamento.simulado.com';
const PAYMENT_BUTTON_URL = 'https://botao.pagamento.simulado.com';

function logAudit(action: string, details: string) {
  console.log(`[AUDITORIA] ${new Date().toISOString()} - ${action}: ${details}`);
}

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  });
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<User['profile']>('casal');

  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      const parsedAuth: AuthState = JSON.parse(storedAuth);
      setAuthState(parsedAuth);
      if (parsedAuth.isAuthenticated) {
        setCurrentScreen(Screen.Main);
      }
    }
  }, []);

  const saveSession = (state: AuthState) => {
    localStorage.setItem('auth', JSON.stringify(state));
    setAuthState(state);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const user = mockUsers.find((u) => u.email === email && u.password === password);
    if (user) {
      const newState = { isAuthenticated: true, user, loading: false, error: null };
      saveSession(newState);
      setCurrentScreen(Screen.Main);
      logAudit('LOGIN_SUCCESS', `Usuário ${user.email} logado com sucesso`);
    } else {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: 'Credenciais inválidas. Verifique seu email e senha.',
      }));
      logAudit('LOGIN_FAILURE', `Tentativa de login falhada para ${email}`);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setAuthState((prev) => ({ ...prev, error: 'As senhas não coincidem.' }));
      return;
    }
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newUser: User = { id: Date.now().toString(), email, password, profile: undefined };
    mockUsers.push(newUser);
    setAuthState((prev) => ({ ...prev, loading: false }));
    setCurrentScreen(Screen.ProfileSelection);
    logAudit('SIGNUP_SUCCESS', `Usuário ${email} cadastrado com sucesso`);
  };

  const handleProfileSelection = () => {
    if (authState.user) {
      authState.user.profile = selectedProfile;
      saveSession(authState);
      setCurrentScreen(Screen.Main);
      logAudit('PROFILE_SELECTED', `Perfil ${selectedProfile} selecionado para ${authState.user.email}`);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setAuthState((prev) => ({
      ...prev,
      loading: false,
      error: 'Instruções enviadas para seu email.',
    }));
    logAudit('FORGOT_PASSWORD', `Solicitação de redefinição para ${email}`);
  };

  const handleLogout = () => {
    saveSession({ isAuthenticated: false, user: null, loading: false, error: null });
    setCurrentScreen(Screen.Login);
    logAudit('LOGOUT', 'Usuário deslogado');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.Login:
        return (
          <div style={{ padding: '20px', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif', color: '#333' }}>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
              />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
              />
              {authState.error && <p style={{ color: 'red' }}>{authState.error}</p>}
              <button
                type="submit"
                disabled={authState.loading}
                style={{ padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', width: '100%' }}
              >
                {authState.loading ? 'Carregando...' : 'Entrar'}
              </button>
            </form>
            <button onClick={() => setCurrentScreen(Screen.Signup)} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#333' }}>
              Cadastrar-se
            </button>
            <button onClick={() => setCurrentScreen(Screen.ForgotPassword)} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#333' }}>
              Esqueci a senha
            </button>
          </div>
        );

      case Screen.Signup:
        return (
          <div style={{ padding: '20px', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif', color: '#333' }}>
            <h2>Cadastro</h2>
            <form onSubmit={handleSignup}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
              />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
              />
              <input
                type="password"
                placeholder="Confirmar Senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
              />
              {authState.error && <p style={{ color: 'red' }}>{authState.error}</p>}
              <button
                type="submit"
                disabled={authState.loading}
                style={{ padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', width: '100%' }}
              >
                {authState.loading ? 'Carregando...' : 'Cadastrar'}
              </button>
            </form>
            <button onClick={() => setCurrentScreen(Screen.Login)} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#333' }}>
              Voltar ao Login
            </button>
          </div>
        );

      case Screen.ForgotPassword:
        return (
          <div style={{ padding: '20px', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif', color: '#333' }}>
            <h2>Esqueci a Senha</h2>
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
              />
              {authState.error && <p style={{ color: 'green' }}>{authState.error}</p>}
              <button
                type="submit"
                disabled={authState.loading}
                style={{ padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', width: '100%' }}
              >
                {authState.loading ? 'Carregando...' : 'Enviar'}
              </button>
            </form>
            <button onClick={() => setCurrentScreen(Screen.Login)} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#333' }}>
              Voltar ao Login
            </button>
          </div>
        );

      case Screen.ProfileSelection:
        return (
          <div style={{ padding: '20px', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif', color: '#333' }}>
            <h2>Escolha seu Perfil</h2>
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value as User['profile'])}
              style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
            >
              <option value="casal">Casal</option>
              <option value="homem">Homem</option>
              <option value="mulher">Mulher</option>
              <option value="outro">Outro</option>
            </select>
            <button onClick={handleProfileSelection} style={{ padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', width: '100%' }}>
              Confirmar
            </button>
          </div>
        );

      case Screen.Main:
        return (
          <div style={{ padding: '20px', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif', color: '#333' }}>
            <h2>Bem-vindo, {authState.user?.email}!</h2>
            <p>Perfil: {authState.user?.profile}</p>
            {authState.isAuthenticated && (
              <div>
                <button
                  onClick={() => window.open(PAYMENT_URL, '_blank')}
                  style={{ padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', margin: '10px 0' }}
                >
                  Ir para Pagamento
                </button>
                <button
                  onClick={() => window.open(PAYMENT_BUTTON_URL, '_blank')}
                  style={{ padding: '10px', backgroundColor: '#333', color: 'white', border: 'none' }}
                >
                  Botão de Pagamento
                </button>
              </div>
            )}
            <button onClick={handleLogout} style={{ padding: '10px', backgroundColor: '#666', color: 'white', border: 'none', marginTop: '20px' }}>
              Sair
            </button>
          </div>
        );

      default:
        return <div>Tela não encontrada</div>;
    }
  };

  return <div>{renderScreen()}</div>;
};

// Comentário sobre causa raiz:
// A causa raiz do bug era um vínculo indevido entre os handlers de autenticação (login/cadastro) e as URLs de pagamento.
// Anteriormente, após login ou cadastro, o código redirecionava diretamente para telas de pagamento, o que violava a segurança e UX.
// Agora, corrigimos isso garantindo que login/cadastro redirecionem apenas para telas de autenticação ou dashboard principal,
// e o acesso a pagamento é condicional apenas se authenticated=true, nunca como fallback.

// Mudanças implementadas:
// - Separação clara de responsabilidades: handlers de auth não tocam em URLs de pagamento.
// - Validação real simulada para credenciais.
// - Mensagens de erro em português.
// - Estado de carregamento.
// - Redirecionamentos corretos: login -> main, cadastro -> profile selection -> main.
// - Acesso a pagamento apenas na tela main se autenticado.
// - Logs de auditoria para todas as ações.
// - UX elegante com paleta sóbria (tons de cinza).
// - Tipagens e enums para robustez.
// - Estado de sessão persistido em localStorage.

export default App;
