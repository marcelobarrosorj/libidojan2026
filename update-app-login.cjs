const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetRegex = /<div className="flex-1 flex flex-col justify-center items-center[\s\S]+?<\/div>\s*<\/div>\s*\);\s*}/;

const newLogin = `<div className="flex-1 flex flex-col items-center px-5 py-8 min-h-screen bg-[var(--libido-bg)] text-[var(--libido-text)]">
      <div className="w-full max-w-[360px] h-full flex flex-col">
        <div className="mb-12 mt-4">
          <div className="font-fraunces font-bold text-xl tracking-[0.2em] text-[var(--libido-text)] flex items-center select-none">
            LIBIDO<span className="text-[var(--libido-accent)] leading-none text-3xl -ml-1">.</span>
          </div>
        </div>
        
        <div className="flex flex-col mb-10">
          <div className="text-[var(--libido-accent)] text-[10px] font-bold tracking-[0.2em] uppercase mb-4">Acesso Reservado</div>
          <h1 className="text-4xl font-fraunces font-medium text-[var(--libido-text)] leading-[1.1] mb-4">
            {isLogin ? 'Conecte-se ao que desperta você.' : 'Comece sua jornada discreta.'}
          </h1>
          <p className="text-[var(--libido-muted)] text-sm">
            {isLogin ? 'Seu espaço privado para descobrir, conversar e permanecer.' : 'Crie sua conta para acessar o ambiente.'}
          </p>
        </div>

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
            <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--libido-muted)] ml-1">Senha</label>
            <input
              type="password"
              placeholder="•••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--libido-surface-2)] border border-[var(--libido-border)] text-[var(--libido-text)] rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-[var(--libido-accent)] transition-colors"
            />
          </div>
          {error && <p className="text-red-400 text-xs text-center font-medium bg-red-950/30 py-3 rounded-xl border border-red-900/50">{error}</p>}
          <button 
            type="submit" 
            disabled={authLoading}
            className="w-full bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] font-bold py-4 mt-2 rounded-[16px] text-sm tracking-wide transition-all shadow-[0_4px_20px_rgba(216,107,63,0.15)] hover:shadow-[0_4px_25px_rgba(216,107,63,0.25)] hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center gap-2"
          >
            {authLoading ? 'AGUARDE...' : (isLogin ? 'ENTRAR AGORA →' : 'CRIAR CONTA →')}
          </button>
        </form>
        <div className="text-center mt-6">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(""); }} 
            className="text-[11px] font-medium tracking-[0.1em] uppercase text-[var(--libido-muted)] hover:text-[var(--libido-text)] transition-colors"
          >
            {isLogin ? 'CRIAR UMA CONTA DISCRETA' : 'JÁ TENHO UMA CONTA'}
          </button>
        </div>
      </div>
    </div>
  );
}`;

content = content.replace(targetRegex, newLogin);
fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log("App.tsx login updated");
