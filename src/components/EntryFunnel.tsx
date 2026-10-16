import { useState } from 'react';
import { AppShell } from './AppShell';
import { Shield, Lock, Eye, AlertTriangle, ChevronDown, Flame, Zap } from 'lucide-react';

interface EntryFunnelProps {
  onComplete: () => void;
}

type FunnelStep = 'landing' | 'legal';

export function EntryFunnel({ onComplete }: EntryFunnelProps) {
  const [step, setStep] = useState<FunnelStep>('landing');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsConfirmed, setTermsConfirmed] = useState(false);
  const handleNext = () => {
    if (step === 'landing') {
      setStep('legal');
    } else if (step === 'legal') {
      if (ageConfirmed && termsConfirmed) {
        onComplete();
      }
    }
  };
  // LANDING-19: brilho neon com a cor de destaque do app
  const neon = { textShadow: '0 0 8px var(--libido-accent), 0 0 28px var(--libido-accent)' };
  return (
    <AppShell>
      <div className="flex-1 flex w-full h-full bg-[var(--libido-bg)] min-h-0 text-[var(--libido-text)] overflow-y-auto no-scrollbar">
        {step === 'landing' && (
          <div className="flex flex-col items-center w-full max-w-md mx-auto min-h-full px-6 py-8">
            <div className="w-full flex items-center justify-between gap-3 mb-10">
              <div className="flex items-center gap-2">
                <Flame size={20} className="text-[var(--libido-accent)]" />
                <span className="font-fraunces font-medium text-lg">Libido</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleNext} className="px-4 py-2 rounded-full border border-[var(--libido-border)] text-xs font-bold hover:border-[var(--libido-accent)]/40 transition-colors">Acessar</button>
                <button onClick={handleNext} className="px-4 py-2 rounded-full bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] text-xs font-black uppercase tracking-wide shadow-md shadow-[var(--libido-accent)]/20">Criar conta</button>
              </div>
            </div>
            <h1 className="text-3xl font-fraunces font-medium text-center leading-tight mb-3">
              Um espaço privado e seguro para conexões sociais
            </h1>
            <p className="text-[var(--libido-muted)] text-center text-sm mb-6">
              Discrição, segurança e controle total da sua experiência
            </p>
            <div className="w-full text-center mb-4">
              <p className="text-[22px] leading-snug font-black uppercase tracking-wide text-[var(--libido-accent)]" style={neon}>
                Cadastre-se e use 36 horas grátis
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--libido-muted)] mt-2">
                Acesso completo no primeiro cadastro - sem mensalidade
              </p>
            </div>
            <div className="flex flex-col items-center gap-0.5 mb-8 animate-bounce">
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--libido-muted)]">Deslize para descobrir</span>
              <ChevronDown size={18} className="text-[var(--libido-accent)]" />
            </div>
            <div className="w-full bg-[var(--libido-surface)] border border-[var(--libido-accent)]/30 rounded-2xl p-5 text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap size={16} className="text-[var(--libido-accent)]" />
                <p className="text-sm font-black uppercase tracking-wide" style={neon}>Sem mensalidade. Sem fidelidade.</p>
              </div>
              <p className="text-sm text-[var(--libido-muted)] leading-relaxed">
                Diária de <span className="font-black text-[var(--libido-text)]">R$ 9,90</span> - use 24 horas completas quando quiser, pagando só pelo dia via PIX.
              </p>
            </div>
            <div className="w-full mb-8">
              <p className="text-[9px] font-black text-[var(--libido-muted)] opacity-50 uppercase tracking-widest mb-3 text-center">Como funciona</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-[var(--libido-surface)] border border-[var(--libido-border)] p-4 rounded-xl">
                  <span className="w-7 h-7 rounded-full bg-[var(--libido-accent)]/10 border border-[var(--libido-accent)]/30 flex items-center justify-center text-xs font-black text-[var(--libido-accent)] shrink-0">1</span>
                  <span className="text-sm font-semibold">Crie sua conta e ganhe 36 horas grátis</span>
                </div>
                <div className="flex items-center gap-3 bg-[var(--libido-surface)] border border-[var(--libido-border)] p-4 rounded-xl">
                  <span className="w-7 h-7 rounded-full bg-[var(--libido-accent)]/10 border border-[var(--libido-accent)]/30 flex items-center justify-center text-xs font-black text-[var(--libido-accent)] shrink-0">2</span>
                  <span className="text-sm font-semibold">Explore o radar, o feed e o chat de quem está perto</span>
                </div>
                <div className="flex items-center gap-3 bg-[var(--libido-surface)] border border-[var(--libido-border)] p-4 rounded-xl">
                  <span className="w-7 h-7 rounded-full bg-[var(--libido-accent)]/10 border border-[var(--libido-accent)]/30 flex items-center justify-center text-xs font-black text-[var(--libido-accent)] shrink-0">3</span>
                  <span className="text-sm font-semibold">Continue com a diária quando quiser - sem mensalidade</span>
                </div>
              </div>
            </div>
            <div className="w-full flex flex-col gap-3 mb-8 md:hidden">
              <div className="flex items-center gap-3 bg-[var(--libido-surface)] border border-[var(--libido-border)] p-4 rounded-xl">
                <Shield className="w-5 h-5 text-[var(--libido-accent)] shrink-0" />
                <span className="text-sm font-semibold">Segurança de dados</span>
              </div>
              <div className="flex items-center gap-3 bg-[var(--libido-surface)] border border-[var(--libido-border)] p-4 rounded-xl">
                <Lock className="w-5 h-5 text-[var(--libido-accent)] shrink-0" />
                <span className="text-sm font-semibold">Privacidade avançada</span>
              </div>
              <div className="flex items-center gap-3 bg-[var(--libido-surface)] border border-[var(--libido-border)] p-4 rounded-xl">
                <Eye className="w-5 h-5 text-[var(--libido-accent)] shrink-0" />
                <span className="text-sm font-semibold">Controle de visibilidade</span>
              </div>
              <div className="flex items-center gap-3 bg-[var(--libido-surface)] border border-[var(--libido-border)] p-4 rounded-xl">
                <Shield className="w-5 h-5 text-[var(--libido-accent)] shrink-0" />
                <span className="text-sm font-semibold">Ambiente fechado e moderado</span>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-3 w-full mb-8">
              <div className="flex flex-col items-center justify-center gap-2 text-center bg-[var(--libido-surface)] border border-[var(--libido-border)] p-5 rounded-2xl">
                <Shield className="w-6 h-6 text-[var(--libido-accent)]" />
                <span className="text-sm font-medium">Segurança de dados</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 text-center bg-[var(--libido-surface)] border border-[var(--libido-border)] p-5 rounded-2xl">
                <Lock className="w-6 h-6 text-[var(--libido-accent)]" />
                <span className="text-sm font-medium">Privacidade avançada</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 text-center bg-[var(--libido-surface)] border border-[var(--libido-border)] p-5 rounded-2xl">
                <Eye className="w-6 h-6 text-[var(--libido-accent)]" />
                <span className="text-sm font-medium">Controle de visibilidade</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 text-center bg-[var(--libido-surface)] border border-[var(--libido-border)] p-5 rounded-2xl">
                <Shield className="w-6 h-6 text-[var(--libido-accent)]" />
                <span className="text-sm font-medium">Ambiente fechado e moderado</span>
              </div>
            </div>
            <div className="w-full flex flex-col gap-3 mt-auto pt-2">
              <button onClick={handleNext} className="w-full bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] font-black py-4 rounded-xl text-sm uppercase tracking-wider transition-opacity hover:opacity-90 shadow-lg shadow-[var(--libido-accent)]/20">
                Criar conta grátis
              </button>
              <button onClick={handleNext} className="w-full border border-[var(--libido-border)] bg-[var(--libido-surface)] text-[var(--libido-text)] font-bold py-4 rounded-xl text-sm transition-colors hover:border-[var(--libido-accent)]/40">
                Já tenho conta - Acessar
              </button>
              <p className="text-[10px] text-[var(--libido-muted)] text-center">
                Ao continuar, você confirma que tem 18 anos ou mais e aceita os termos de uso e privacidade.
              </p>
            </div>
          </div>
        )}
        {step === 'legal' && (
          <div className="flex flex-col p-6 w-full max-w-md mx-auto min-h-full justify-center">
             <div className="w-full bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="w-12 h-12 bg-red-500/10 flex items-center justify-center rounded-xl mb-6 border border-red-500/20">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <h2 className="text-2xl font-fraunces font-medium mb-6">Aviso Legal e Privacidade</h2>
                <div className="space-y-4 mb-8">
                  <p className="text-sm text-[var(--libido-text)]">
                    <strong className="text-[var(--libido-text)]">Classificação Etária:</strong><br />
                    Este aplicativo é destinado exclusivamente para maiores de 18 anos.
                  </p>
                  <p className="text-sm text-[var(--libido-text)]">
                    <strong className="text-[var(--libido-text)]">Proteção de Dados:</strong><br />
                    Seus dados são tratados conforme a LGPD (Lei Geral de Proteção de Dados).
                  </p>
                  <p className="text-sm text-[var(--libido-text)]">
                    <strong className="text-[var(--libido-text)]">Ambiente Monitorado:</strong><br />
                    Conteúdo e interações são protegidos e podem ser moderados para garantir a segurança da comunidade.
                  </p>
                </div>
                <div className="flex flex-col gap-4 mb-8">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${ageConfirmed ? 'bg-[var(--libido-accent)] border-[var(--libido-accent)]' : 'border-[var(--libido-border)] bg-[var(--libido-border)] group-hover:border-[var(--libido-accent)]/50'}`}>
                      {ageConfirmed && <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <input type="checkbox" className="hidden" checked={ageConfirmed} onChange={() => setAgeConfirmed(!ageConfirmed)} />
                    <span className="text-sm text-[var(--libido-muted)] select-none">Confirmo que tenho 18 anos ou mais</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${termsConfirmed ? 'bg-[var(--libido-accent)] border-[var(--libido-accent)]' : 'border-[var(--libido-border)] bg-[var(--libido-border)] group-hover:border-[var(--libido-accent)]/50'}`}>
                      {termsConfirmed && <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <input type="checkbox" className="hidden" checked={termsConfirmed} onChange={() => setTermsConfirmed(!termsConfirmed)} />
                    <span className="text-sm text-[var(--libido-muted)] select-none">Concordo com os termos de uso e privacidade</span>
                  </label>
                </div>
                <button
                  onClick={handleNext}
                  disabled={!ageConfirmed || !termsConfirmed}
                  className="w-full bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] font-bold py-4 rounded-xl text-sm transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-[var(--libido-accent)]/20 disabled:shadow-none"
                >
                  Continuar
                </button>
             </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
