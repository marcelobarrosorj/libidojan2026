
import React from 'react';
import { PresenceStatus } from '../../types';

interface PresenceBadgeProps {
  status: PresenceStatus;
  showText?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PresenceBadge: React.FC<PresenceBadgeProps> = ({ 
  status, 
  showText = false, 
  className = "",
  size = 'md'
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case PresenceStatus.ONLINE:
        return { color: 'bg-green-500', text: 'Disponível', shadow: 'shadow-[0_0_10px_rgba(34,197,94,0.6)]', animate: 'animate-pulse' };
      case PresenceStatus.AWAY:
        return { color: 'bg-amber-500', text: 'Ausente', shadow: 'shadow-[0_0_8px_rgba(245,158,11,0.4)]', animate: '' };
      case PresenceStatus.BUSY:
        return { color: 'bg-red-500', text: 'Ocupado', shadow: 'shadow-[0_0_8px_rgba(239,68,68,0.4)]', animate: '' };
      case PresenceStatus.OFFLINE:
        return { color: 'bg-slate-600', text: 'Offline', shadow: '', animate: '' };
      default:
        return { color: 'bg-slate-600', text: 'Offline', shadow: '', animate: '' };
    }
  };

  const config = getStatusConfig();
  
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full ${config.color} border-2 border-slate-950 ${config.shadow} ${config.animate} transition-all duration-300`} />
      {showText && (
        <span className={`text-[10px] font-black uppercase tracking-widest ${status === PresenceStatus.ONLINE ? 'text-green-500' : 'text-slate-400'}`}>
          {config.text}
        </span>
      )}
    </div>
  );
};
