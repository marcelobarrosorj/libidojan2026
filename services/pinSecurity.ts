
export interface PinHash {
  saltB64: string;
  iterations: number;
  hashB64: string;
  version: number;
}

export interface PinStorageRecord {
  pinHash: PinHash;
  failedAttempts: number;
  lockoutUntilMs: number;
  pinSetAtIso: string;
}

const STORAGE_KEY = 'libido_pin_record_v1';
const ALGO_VERSION = 1;
const ITERATIONS_DEFAULT = 100000;
const HASH_BITS = 256;

// --- Helper Functions ---

function bytesToB64(bytes: Uint8Array): string {
  let s = '';
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s);
}

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// --- Storage Logic ---

export function loadPinRecord(): PinStorageRecord | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PinStorageRecord;
  } catch {
    return null;
  }
}

export function savePinRecord(rec: PinStorageRecord): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rec));
}

export function clearPinRecord(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasPinConfigured(): boolean {
  return !!loadPinRecord();
}

// --- Crypto Logic ---

export async function generateSaltB64(): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return bytesToB64(salt);
}

export async function derivePinHashB64(
  pin: string,
  saltB64: string,
  iterations: number = ITERATIONS_DEFAULT
): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: b64ToBytes(saltB64),
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    HASH_BITS
  );

  return bytesToB64(new Uint8Array(derivedBits));
}

export async function createPinHash(pin: string): Promise<PinHash> {
  const saltB64 = await generateSaltB64();
  const hashB64 = await derivePinHashB64(pin, saltB64, ITERATIONS_DEFAULT);
  return { saltB64, iterations: ITERATIONS_DEFAULT, hashB64, version: ALGO_VERSION };
}

export async function verifyPin(pinAttempt: string, stored: PinHash): Promise<boolean> {
  if (stored.version !== ALGO_VERSION) {
    throw new Error('Versão de PIN incompatível. Redefina o PIN.');
  }
  const computed = await derivePinHashB64(pinAttempt, stored.saltB64, stored.iterations);
  return computed === stored.hashB64;
}

// --- Validation and Lockout Logic ---

export function isValidPinFormat(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export function isWeakPin(pin: string): boolean {
  const blocked = new Set(['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234', '4321', '2580']);
  if (blocked.has(pin)) return true;

  const d = pin.split('').map((x) => Number(x));
  const inc = d[1] === d[0] + 1 && d[2] === d[1] + 1 && d[3] === d[2] + 1;
  const dec = d[1] === d[0] - 1 && d[2] === d[1] - 1 && d[3] === d[2] - 1;
  return inc || dec;
}

export function nextLockoutMs(failedAttempts: number): number {
  if (failedAttempts <= 4) return 0;
  if (failedAttempts === 5) return 30_000;        // 30s
  if (failedAttempts <= 7) return 2 * 60_000;     // 2min
  if (failedAttempts <= 9) return 10 * 60_000;    // 10min
  return 60 * 60_000;                              // 1h
}

export function isLocked(lockoutUntilMs: number): boolean {
  return Date.now() < lockoutUntilMs;
}

export function remainingLockMs(lockoutUntilMs: number): number {
  return Math.max(0, lockoutUntilMs - Date.now());
}
