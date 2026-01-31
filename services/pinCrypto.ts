
export interface PinHash {
  saltB64: string;
  iterations: number;
  hashB64: string;
  version: number;
}

const ALGO_VERSION = 1;
const ITERATIONS_DEFAULT = 100000;
const HASH_BITS = 256;

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

export async function createPinHash(pin: string): Promise<PinHash> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltB64 = bytesToB64(salt);
  const hashB64 = await derivePinHashB64(pin, saltB64, ITERATIONS_DEFAULT);
  return { saltB64, iterations: ITERATIONS_DEFAULT, hashB64, version: ALGO_VERSION };
}

async function derivePinHashB64(
  pin: string,
  saltB64: string,
  iterations: number
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

export async function verifyPin(pinAttempt: string, stored: PinHash): Promise<boolean> {
  if (stored.version !== ALGO_VERSION) {
    throw new Error('Versão de PIN incompatível.');
  }
  const computed = await derivePinHashB64(pinAttempt, stored.saltB64, stored.iterations);
  return computed === stored.hashB64;
}
