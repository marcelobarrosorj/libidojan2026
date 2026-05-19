
import React from 'react';
import { motion } from 'motion/react';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  tabs: TabItem[];
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, tabs, className = "" }) => {
  return (
    <div className={`flex bg-slate-900/50 p-1 rounded-2xl border border-white/5 ${className}`}>
      {tabs.map((tab) => {
        const isActive = value === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onValueChange(tab.id)}
            className={`relative p-2 px-4 rounded-xl transition-all flex items-center gap-2 ${
              isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
            title={tab.label}
          >
            {isActive && (
              <motion.div
                layoutId="radar-tabs-active"
                className="absolute inset-0 bg-pink rounded-xl shadow-lg"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon && React.isValidElement(tab.icon) 
                ? React.cloneElement(tab.icon as React.ReactElement<any>, { size: 18 }) 
                : tab.icon}
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
                {tab.label}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
};
