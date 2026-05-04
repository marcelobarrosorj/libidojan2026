import React from 'react';
import { motion } from 'motion/react';
import { Check, X, HelpCircle } from 'lucide-react';
import { ConsentItem, MatrixValue } from '../types';

interface ConsentMatrixProps {
  items: ConsentItem[];
  compact?: boolean;
}

const ConsentMatrix: React.FC<ConsentMatrixProps> = ({ items, compact = false }) => {
  const getIcon = (value: MatrixValue) => {
    switch (value) {
      case MatrixValue.YES: return <Check size={compact ? 12 : 16} className="text-emerald-500" />;
      case MatrixValue.NO: return <X size={compact ? 12 : 16} className="text-rose-500" />;
      case MatrixValue.MAYBE: return <HelpCircle size={compact ? 12 : 16} className="text-amber-500" />;
    }
  };

  const getBg = (value: MatrixValue) => {
    switch (value) {
      case MatrixValue.YES: return 'bg-emerald-500/10 border-emerald-500/20';
      case MatrixValue.NO: return 'bg-rose-500/10 border-rose-500/20';
      case MatrixValue.MAYBE: return 'bg-amber-500/10 border-amber-500/20';
    }
  };

  return (
    <div className={`grid ${compact ? 'grid-cols-2 gap-2' : 'grid-cols-1 gap-3'}`}>
      {items.map((item) => (
        <motion.div
          key={item.id}
          whileHover={{ scale: 1.02 }}
          className={`flex items-center justify-between p-3 rounded-xl border ${getBg(item.value)} transition-all`}
        >
          <span className={`font-bold uppercase tracking-widest ${compact ? 'text-[8px]' : 'text-[10px]'} text-slate-300`}>
            {item.label}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-black uppercase italic ${
              item.value === MatrixValue.YES ? 'text-emerald-500' : 
              item.value === MatrixValue.NO ? 'text-rose-500' : 'text-amber-500'
            }`}>
              {item.value}
            </span>
            {getIcon(item.value)}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ConsentMatrix;
