
export interface TermsAcceptance {
  timestamp: string | null;
  version: string | null;
  source: string | null;
}

export interface ShouldShowOpts {
  version: string;         // versão atual do aviso/termos
  maxAgeDays?: number;     // padrão: 30
}

const KEY_TS = 'terms_acceptance_timestamp';
const KEY_VER = 'terms_acceptance_version';
const KEY_SRC = 'terms_acceptance_source';

export function getTermsAcceptance(): TermsAcceptance {
  return {
    timestamp: localStorage.getItem(KEY_TS),
    version: localStorage.getItem(KEY_VER),
    source: localStorage.getItem(KEY_SRC),
  };
}

export function recordTermsAcceptance(version: string, source: string): void {
  localStorage.setItem(KEY_TS, new Date().toISOString());
  localStorage.setItem(KEY_VER, version);
  localStorage.setItem(KEY_SRC, source);
}

export function shouldShowTermsGate(now: Date, opts: ShouldShowOpts): boolean {
  const { version, maxAgeDays = 30 } = opts;
  const acceptance = getTermsAcceptance();

  // nunca aceitou
  if (!acceptance.timestamp) return true;

  // mudou versão
  if (acceptance.version !== version) return true;

  // venceu (30 dias)
  const last = new Date(acceptance.timestamp);
  if (Number.isNaN(last.getTime())) return true;

  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
  return now.getTime() - last.getTime() >= maxAgeMs;
}
