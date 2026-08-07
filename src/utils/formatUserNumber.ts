export function formatUserNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '';
  const parsed = typeof num === 'string' ? parseInt(num, 10) : num;
  if (isNaN(parsed)) return '';
  return parsed.toString().padStart(6, '0');
}
