
import { createPinHash, verifyPin } from './pinCrypto';
import { isValidPinFormat, isWeakPin, nextLockoutMs, isLocked, remainingLockMs } from './pinPolicy';
import { loadPinRecord, savePinRecord, clearPinRecord, hasPinConfigured, type PinStorageRecord } from './pinStorage';

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: 'locked'; remainingMs: number }
  | { ok: false; reason: 'invalid' }
  | { ok: false; reason: 'not_configured' }
  | { ok: false; reason: 'error'; message: string };

const UNLOCK_UNTIL_KEY = 'crs_unlock_until_ms';
const DEFAULT_UNLOCK_WINDOW_MS = 30 * 60 * 1000; // 30 minutos

/**
 * Define que o app está desbloqueado para a sessão atual.
 */
export function setUnlockedWindow(ms: number = DEFAULT_UNLOCK_WINDOW_MS): void {
  sessionStorage.setItem(UNLOCK_UNTIL_KEY, String(Date.now() + ms));
}

/**
 * Verifica se o app ainda está dentro da janela de desbloqueio da sessão.
 */
export function isUnlockedWindowValid(): boolean {
  const raw = sessionStorage.getItem(UNLOCK_UNTIL_KEY);
  if (!raw) return false;
  const until = Number(raw);
  if (!Number.isFinite(until)) return false;
  return Date.now() < until;
}

/**
 * Remove a confiança da sessão (ex: no logout).
 */
export function clearUnlockedWindow(): void {
  sessionStorage.removeItem(UNLOCK_UNTIL_KEY);
}

export async function setUserPin(pin: string): Promise<{ ok: true } | { ok: false; message: string }> {
  // Check for crypto availability
  if (!window.crypto || !window.crypto.subtle) {
    return { ok: false, message: 'Criptografia indisponível no navegador atual.' };
  }

  if (!isValidPinFormat(pin)) return { ok: false, message: 'PIN deve ter 4 dígitos.' };
  if (isWeakPin(pin)) return { ok: false, message: 'PIN muito fraco. Evite sequências e repetidos.' };

  try {
    const pinHash = await createPinHash(pin);
    const rec: PinStorageRecord = {
      pinHash,
      failedAttempts: 0,
      lockoutUntilMs: 0,
      pinSetAtIso: new Date().toISOString(),
    };
    savePinRecord(rec);
    // Ao configurar, já abrimos a janela de confiança imediatamente
    setUnlockedWindow();
    return { ok: true };
  } catch (err: any) {
    console.error('[PIN_SERVICE] Error generating hash:', err);
    return { ok: false, message: err.message || 'Erro ao gerar hash de segurança.' };
  }
}

export async function verifyUserPin(pinAttempt: string): Promise<VerifyResult> {
  const rec = loadPinRecord();
  if (!rec) return { ok: false, reason: 'not_configured' };

  if (isLocked(rec.lockoutUntilMs)) {
    return { ok: false, reason: 'locked', remainingMs: remainingLockMs(rec.lockoutUntilMs) };
  }

  if (!isValidPinFormat(pinAttempt)) return { ok: false, reason: 'invalid' };

  try {
    const ok = await verifyPin(pinAttempt, rec.pinHash);
    if (ok) {
      rec.failedAttempts = 0;
      rec.lockoutUntilMs = 0;
      savePinRecord(rec);
      setUnlockedWindow();
      return { ok: true };
    }

    rec.failedAttempts += 1;
    const lockMs = nextLockoutMs(rec.failedAttempts);
    rec.lockoutUntilMs = lockMs ? Date.now() + lockMs : 0;
    savePinRecord(rec);

    return { ok: false, reason: 'invalid' };
  } catch (e: any) {
    return { ok: false, reason: 'error', message: e?.message || 'Erro ao validar PIN' };
  }
}

export function resetPinLocalOnly(): void {
  clearPinRecord();
  clearUnlockedWindow();
}

export function isPinConfigured(): boolean {
  return hasPinConfigured();
}
