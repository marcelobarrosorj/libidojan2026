export function isUserOnline(u: any): boolean {
  if (!u) return false;
  if (u.isOnline === true || u.is_online === true || u.online === true) return true;
  const raw = u.last_seen || u.lastSeen || u.last_active || u.updated_at || u.updatedAt;
  if (!raw) return false;
  const ms = typeof raw === 'number' ? raw : new Date(raw).getTime();
  if (isNaN(ms)) return false;
  return (Date.now() - ms) <= 5 * 60 * 1000;
}

export function formatarTempoOffline(u: any): string {
  if (isUserOnline(u)) return 'Online agora';
  const raw = u?.last_seen || u?.lastSeen || u?.last_active || u?.updated_at || u?.updatedAt;
  if (!raw) return 'Offline';
  const ms = typeof raw === 'number' ? raw : new Date(raw).getTime();
  if (isNaN(ms)) return 'Offline';

  const diffMs = Math.max(0, Date.now() - ms);
  const horas = Math.floor(diffMs / 3600000);
  const dias = Math.floor(diffMs / 86400000);

  if (horas < 24) {
    const h = Math.max(1, horas);
    return h === 1 ? 'último login há 1 hora' : `último login há ${h} horas`;
  }
  return dias === 1 ? 'há 1 dia' : `há ${dias} dias`;
}