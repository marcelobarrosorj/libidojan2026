import { useState } from 'react';
import { AppShell } from './AppShell';
import { Shield, Lock, Eye, AlertTriangle } from 'lucide-react';

interface EntryFunnelProps {
  onComplete: () => void;
}

type FunnelStep = 'landing' | 'legal';

export function EntryFunnel({ onComplete }: EntryFunnelProps) {
  const [step, setStep] = useState<FunnelStep>('landing');
  
  // Legal checkboxes state
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

  return (
    <AppShell>
      <div className="flex-1 flex w-full h-full bg-[var(--libido-bg)] min-h-0 text-[var(--libido-text)] overflow-y-auto no-scrollbar">
        {step === 'landing' && (
          <div className="flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto min-h-full">
            <div className="w-16 h-16 bg-[var(--libido-accent)]/10 flex items-center justify-center rounded-2xl mb-8 border border-[var(--libido-accent)]/20">
              <Lock className="w-8 h-8 text-[var(--libido-accent)]" />
            </div>
            
            <h1 className="text-3xl font-fraunces font-medium text-center mb-4 leading-tight">
              Um espaço privado e seguro para conexões sociais
            </h1>
            
            <p className="text-[var(--libido-muted)] text-center mb-10 text-sm">
              Discrição, segurança e controle total da sua experiência
            </p>

            <div className="w-full flex md:hidden flex-col gap-5 mb-12">
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
            
            <div className="hidden md:grid grid-cols-2 gap-4 w-full mb-12">
              <div className="flex flex-col items-center justify-center gap-2 text-center bg-[var(--libido-surface)] border border-[var(--libido-border)] p-6 rounded-2xl">
                <Shield className="w-6 h-6 text-[var(--libido-accent)]" />
                <span className="text-sm font-medium">Segurança de dados</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 text-center bg-[var(--libido-surface)] border border-[var(--libido-border)] p-6 rounded-2xl">
                <Lock className="w-6 h-6 text-[var(--libido-accent)]" />
                <span className="text-sm font-medium">Privacidade avançada</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 text-center bg-[var(--libido-surface)] border border-[var(--libido-border)] p-6 rounded-2xl">
                <Eye className="w-6 h-6 text-[var(--libido-accent)]" />
                <span className="text-sm font-medium">Controle de visibilidade</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 text-center bg-[var(--libido-surface)] border border-[var(--libido-border)] p-6 rounded-2xl">
                <Shield className="w-6 h-6 text-[var(--libido-accent)]" />
                <span className="text-sm font-medium">Ambiente fechado e moderado</span>
              </div>
            </div>

            <button 
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] font-bold py-4 rounded-xl text-sm transition-opacity hover:opacity-90 shadow-lg shadow-[var(--libido-accent)]/20"
            >
              Entrar no App
            </button>
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
                    <strong className="text-[var(--libido-text)]">🔞 Classificação Etária:</strong><br/>
                    Este aplicativo é destinado exclusivamente para maiores de 18 anos.
                  </p>
                  <p className="text-sm text-[var(--libido-text)]">
                    <strong className="text-[var(--libido-text)]">🛡️ Proteção de Dados:</strong><br/>
                    Seus dados são tratados conforme a LGPD (Lei Geral de Proteção de Dados).
                  </p>
                  <p className="text-sm text-[var(--libido-text)]">
                    <strong className="text-[var(--libido-text)]">🔒 Ambiente Monitorado:</strong><br/>
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
