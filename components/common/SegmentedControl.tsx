
import React from 'react';
import { motion } from 'motion/react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: 'amber' | 'slate' | 'glass';
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ 
  tabs, 
  activeId, 
  onChange,
  variant = 'amber'
}) => {
  return (
    <div className="relative flex p-1 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 w-full">
      {tabs.map((tab) => {
        const isActive = activeId === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 px-4 z-10 transition-colors duration-300 ${
              isActive ? 'text-black' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-pill"
                className={`absolute inset-0 rounded-xl shadow-lg ${
                  variant === 'amber' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-slate-700 shadow-slate-900/50'
                }`}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-20 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
              {(tab.icon as any) && React.cloneElement(tab.icon as React.ReactElement, { size: 14 } as any)}
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
