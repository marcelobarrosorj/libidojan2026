import { User } from '../types';
import { formatUserNumber } from '../utils/formatUserNumber';

interface SecurityWatermarkProps {
  currentUser?: User | null;
  local?: boolean;
}

export function SecurityWatermark({ currentUser, local = false }: SecurityWatermarkProps) {
  if (!currentUser) return null;

  const userNumber = formatUserNumber(currentUser.userNumber);
  const watermarkText = userNumber 
    ? `${currentUser.nickname || ''} • #${userNumber} • Libido App`
    : `${currentUser.nickname || ''} • Libido App`;

  if (local) {
    return (
      <div className="absolute inset-0 z-10 pointer-events-none opacity-20 overflow-hidden flex flex-wrap content-start justify-center" style={{ transform: 'rotate(-30deg) scale(1.5)', width: '200%', height: '200%', left: '-50%', top: '-50%' }}>
        {Array.from({ length: 40 }).map((_, i) => (
           <div key={i} className="text-[var(--libido-text)] font-black text-[10px] whitespace-nowrap p-3 uppercase tracking-widest">{watermarkText}</div>
        ))}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.03] overflow-hidden flex flex-wrap content-start justify-center" style={{ transform: 'rotate(-45deg) scale(2)', width: '200%', height: '200%', left: '-50%', top: '-50%' }}>
      {Array.from({ length: 200 }).map((_, i) => (
         <div key={i} className="text-[var(--libido-text)] font-black text-xs whitespace-nowrap p-4 uppercase tracking-widest">{watermarkText}</div>
      ))}
    </div>
  );
}
