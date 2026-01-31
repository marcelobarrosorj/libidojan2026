
import { PinHash } from './pinCrypto';

export interface PinStorageRecord {
  pinHash: PinHash;
  failedAttempts: number;
  lockoutUntilMs: number;
  pinSetAtIso: string;
}

const KEY = 'libido_pin_record_v2'; // Bumped version for modular structure

export function loadPinRecord(): PinStorageRecord | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PinStorageRecord;
  } catch {
    return null;
  }
}

export function savePinRecord(rec: PinStorageRecord): void {
  localStorage.setItem(KEY, JSON.stringify(rec));
}

export function clearPinRecord(): void {
  localStorage.removeItem(KEY);
}

export function hasPinConfigured(): boolean {
  return !!loadPinRecord();
}
