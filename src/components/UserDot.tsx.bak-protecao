import React from 'react';
import { User } from '../types';
import { motion } from 'motion/react';

interface UserDotProps {
  user: User & { tempDistance?: number };
  key?: string | number;
}

export function UserDot({ user }: UserDotProps) {
  // Map -1 to 1 into 10% to 90% space so dots don't bleed off screen easily
  const left = `${50 + (user.location.x * 40)}%`;
  const top = `${50 + (user.location.y * 40)}%`;

  return (
    <motion.div 
      className="absolute z-10 flex flex-col items-center gap-1 group cursor-pointer"
      style={{ left, top, x: '-50%', y: '-50%' }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", delay: Math.random() * 0.5 }}
    >
      <div className={`relative flex items-center justify-center ${user.plan === 'premium' ? 'ring-2 ring-offset-1 ring-offset-[var(--libido-bg)] ring-[var(--libido-accent)] rounded-full' : ''}`}>
        <div className="w-[32px] h-[32px] rounded-full bg-[var(--libido-surface)] shadow-lg z-20 overflow-hidden ring-1 ring-[var(--libido-border)] shadow-accent/20">
          <img src={user.photo_url} className="w-full h-full object-cover" />
        </div>
        {user.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-[10px] h-[10px] bg-green-500 rounded-full border-2 border-[var(--libido-surface)] z-30" />}
        <div className="absolute inset-[-4px] rounded-full border border-accent opacity-50 animate-dot-pulse z-10" style={{ animationDelay: `${Math.random() * 2}s` }}></div>
      </div>
      <div className="absolute top-[36px] px-2 py-1 bg-[var(--libido-bg)]/90 rounded-lg border border-[var(--libido-border)] text-[10px] font-bold text-[var(--libido-text)] whitespace-nowrap transition-all opacity-0 group-hover:opacity-100 group-hover:scale-110 shadow-lg pointer-events-none max-w-[120px] overflow-hidden text-ellipsis flex items-center gap-1">
        {user.plan === 'premium' && <div className="w-1.5 h-1.5 rounded-full bg-[var(--libido-accent)]" />}
        {user.name.length > 15 ? user.name.slice(0, 12) + '...' : user.name} • {((user.tempDistance || 0) * 1000).toFixed(0)}m
      </div>
    </motion.div>
  );
}

