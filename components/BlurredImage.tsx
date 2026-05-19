import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Eye, ShieldAlert } from 'lucide-react';
import { isOwner } from '../services/authUtils';
import { useAuth } from '../hooks/useAuthContext';

interface BlurredImageProps {
  src: string;
  alt: string;
  isInitiallyBlurred?: boolean;
  canUnlock?: boolean;
  className?: string;
}

const BlurredImage: React.FC<BlurredImageProps> = ({ 
  src, 
  alt, 
  isInitiallyBlurred = false, 
  canUnlock = false,
  className = "" 
}) => {
  const { currentUser } = useAuth();
  const [isBlurred, setIsBlurred] = useState(isInitiallyBlurred);
  const ownerMode = isOwner(currentUser);

  // Sincroniza estado se a prop mudar
  useEffect(() => {
    // Super usuário tem visão térmica (bypass blur)
    if (ownerMode) {
      setIsBlurred(false);
    } else {
      setIsBlurred(isInitiallyBlurred);
    }
  }, [isInitiallyBlurred, ownerMode]);

  return (
    <div className={`relative overflow-hidden group ${className}`}>
      {/* Imagem Principal */}
      <img
        src={src || undefined}
        alt={alt}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover transition-all duration-700 ${isBlurred ? 'blur-2xl scale-110 grayscale brightness-50' : 'blur-0 scale-100'}`}
      />

      {/* Overlay de Auditoria (Visual para o Owner saber que está em modo God) */}
      {ownerMode && isInitiallyBlurred && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-rose-500/80 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-1 z-20">
          <ShieldAlert size={10} className="text-white animate-pulse" />
          <span className="text-[7px] font-black text-white uppercase tracking-tighter">Bypass Auditor</span>
        </div>
      )}

      {/* Overlay de Bloqueio (Não visível para o Owner) */}
      <AnimatePresence>
        {isBlurred && !ownerMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 mb-3 group-hover:scale-110 transition-transform">
              <Lock size={20} className="text-white fill-white/20" />
            </div>
            <p className="text-[10px] font-black text-white uppercase tracking-widest italic">Imagem Protegida</p>
            
            {canUnlock && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsBlurred(false);
                }}
                className="mt-4 px-4 py-2 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 hover:bg-amber-500 transition-colors"
              >
                <Eye size={12} />
                Revelar
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de Proteção Permanente */}
      {isInitiallyBlurred && !isBlurred && !ownerMode && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-1">
          <Eye size={10} className="text-emerald-500" />
          <span className="text-[7px] font-black text-emerald-500 uppercase tracking-tighter">Revelado</span>
        </div>
      )}
    </div>
  );
};

export default BlurredImage;
