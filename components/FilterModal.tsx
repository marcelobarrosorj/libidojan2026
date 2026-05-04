
import React, { useState } from 'react';
import { X, Filter, Target, Crown, ShieldCheck } from 'lucide-react';
import { Button, Checkbox } from './common/RegistrationUI';
import { UserType } from '../types';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  currentFilters: FilterState;
}

export interface FilterState {
  types: UserType[];
  minTrust: number;
  maxDistance: number;
}

export default function FilterModal({ isOpen, onClose, onApply, currentFilters }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>(currentFilters);

  if (!isOpen) return null;

  const toggleType = (type: UserType) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in">
      <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]">
        <div className="p-8 pb-4 flex justify-between items-start border-b border-white/5">
           <div>
             <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center gap-2">
               <Filter size={20} className="text-amber-500" /> Filtros
             </h2>
             <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Refine seu alcance na Matriz</p>
           </div>
           <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-white">
             <X size={20} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
            <section className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">O que você busca</h4>
                <div className="grid grid-cols-1 gap-2">
                    <Checkbox 
                        label="CASAIS" 
                        checked={filters.types.includes(UserType.CASAIS)} 
                        onChange={() => toggleType(UserType.CASAIS)} 
                    />
                    <Checkbox 
                        label="MULHERES" 
                        checked={filters.types.includes(UserType.MULHER)} 
                        onChange={() => toggleType(UserType.MULHER)} 
                    />
                    <Checkbox 
                        label="HOMENS" 
                        checked={filters.types.includes(UserType.HOMEM)} 
                        onChange={() => toggleType(UserType.HOMEM)} 
                    />
                    <Checkbox 
                        label="GRUPOS" 
                        checked={filters.types.includes(UserType.GRUPO)} 
                        onChange={() => toggleType(UserType.GRUPO)} 
                    />
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Trust Mínimo (NoFake)</h4>
                    <span className="text-xs font-black text-white italic">{filters.minTrust}%</span>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="10"
                    value={filters.minTrust}
                    onChange={(e) => setFilters(prev => ({ ...prev, minTrust: Number(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
            </section>

            <section className="space-y-6">
                <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Distância Máxima</h4>
                    <span className="text-xs font-black text-white italic">{filters.maxDistance} km</span>
                </div>
                <input 
                    type="range" 
                    min="1" 
                    max="500" 
                    value={filters.maxDistance}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: Number(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
            </section>
        </div>

        <div className="p-8 pt-4 border-t border-white/5 bg-slate-950/50">
            <Button onClick={() => {
                onApply(filters);
                onClose();
            }}>
                Aplicar Filtros
            </Button>
        </div>
      </div>
    </div>
  );
}
