
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
  return 60 * 60_000;                             // 1h
}

export function isLocked(lockoutUntilMs: number): boolean {
  return Date.now() < lockoutUntilMs;
}

export function remainingLockMs(lockoutUntilMs: number): number {
  return Math.max(0, lockoutUntilMs - Date.now());
}
