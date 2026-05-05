import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, User as UserIcon, Shield, Hash, Mail } from 'lucide-react';
import { searchProfiles } from '../services/repo';
import { RadarProfile } from '../types';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProfile: (id: string) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onSelectProfile }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RadarProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        const data = await searchProfiles(query);
        setResults(data);
        setIsSearching(false);
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
              <input 
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="BUSCAR POR ID, NICK OU EMAIL..."
                className="w-full bg-slate-900/50 border-2 border-amber-500/30 rounded-2xl py-4 pl-12 pr-4 text-white font-black text-[12px] tracking-widest uppercase focus:border-amber-500 focus:outline-none transition-all placeholder:text-slate-600"
              />
            </div>
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center h-40 gap-4">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full"
                />
                <span className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase">Consultando Matriz...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">
                  {results.length} PERFIS ENCONTRADOS
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {results.map((profile) => (
                    <motion.button
                      key={profile.id}
                      onClick={() => {
                        onSelectProfile(profile.id);
                        onClose();
                      }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                      className="w-full flex items-center gap-4 p-4 rounded-3xl bg-slate-900/40 border border-white/5 text-left transition-all group"
                    >
                      <div className="relative">
                        <img 
                          src={profile.avatar} 
                          alt={profile.name}
                          className="w-14 h-14 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all border border-white/10"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-black border border-white/20 flex items-center justify-center">
                          <Shield size={10} className="text-amber-500" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-black font-mono text-amber-500 uppercase tracking-widest">#{profile.serialNumber || '000000'}</span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-black uppercase tracking-tighter">{profile.category}</span>
                        </div>
                        <h4 className="text-base font-black text-white italic tracking-tight truncate uppercase">{profile.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                           <div className="flex items-center gap-1">
                             <Mail size={10} className="text-slate-600" />
                             <span className="text-[9px] text-slate-500 font-medium truncate max-w-[150px]">{profile.bio || 'Sem bio definida'}</span>
                           </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/5 group-hover:bg-amber-500 transition-colors">
                        <UserIcon size={16} className="text-slate-400 group-hover:text-black" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : query.length >= 2 ? (
              <div className="flex flex-col items-center justify-center h-60 text-center px-10">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mb-4">
                  <Hash size={30} className="text-slate-800" />
                </div>
                <h3 className="text-white font-black uppercase italic tracking-widest mb-2">Zero Resultados</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">
                  Não encontramos nenhum agente com os parâmetros "{query}" na camada atual.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 opacity-20">
                <Search size={64} className="text-slate-500 mb-4" />
                <p className="text-[10px] font-black text-slate-500 tracking-[0.4em] uppercase">Aguardando entrada de dados</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
