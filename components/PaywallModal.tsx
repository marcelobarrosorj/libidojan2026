
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Check, Zap, Shield, X, Star } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: 'limit' | 'photos' | 'radar' | 'interaction';
}

const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, reason }) => {
  const titles = {
    limit: 'Limite Diário Atingido',
    photos: 'Galeria Exclusiva',
    radar: 'Radar Premium',
    interaction: 'Recurso para Assinantes'
  };

  const descriptions = {
    limit: 'Você já visualizou 2 perfis hoje. Assine o Premium para navegação ilimitada e encontros mais rápidos.',
    photos: 'Usuários Premium podem ver todas as fotos do perfil. Não perca nenhum detalhe!',
    radar: 'O radar completo com interações diretas é exclusivo para membros Ouro e Prata.',
    interaction: 'Para enviar mensagens, ver o telefone ou confirmar encontros, você precisa de uma assinatura ativa.'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="relative w-full max-w-md bg-slate-900 rounded-t-[32px] sm:rounded-[32px] overflow-hidden border border-white/10 shadow-2xl"
          >
            {/* Header com Gradiente */}
            <div className="relative h-48 bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 flex flex-col items-center justify-center text-white overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                {[...Array(20)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="absolute" 
                    size={Math.random() * 20} 
                    style={{ 
                      top: `${Math.random() * 100}%`, 
                      left: `${Math.random() * 100}%`,
                      opacity: Math.random()
                    }} 
                  />
                ))}
              </div>
              
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-4 border border-white/30"
              >
                <Crown size={40} className="text-white fill-white" />
              </motion.div>
              <h2 className="text-2xl font-black uppercase tracking-tighter italic">{titles[reason]}</h2>
            </div>

            <div className="p-8">
              <p className="text-slate-400 text-center text-sm leading-relaxed mb-8 font-medium">
                {descriptions[reason]}
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: <Zap size={18} />, text: 'Navegação Ilimitada' },
                  { icon: <Shield size={18} />, text: 'Verificação Prioritária' },
                  { icon: <Star size={18} />, text: 'Distintivo de Confiança' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-300">
                    <div className="text-amber-500">{item.icon}</div>
                    <span className="text-xs font-bold uppercase tracking-wider">{item.text}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => window.location.reload()} // Mock action
                className="w-full h-14 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Assinar Agora
                <Check size={20} />
              </button>

              <button 
                onClick={onClose}
                className="w-full py-4 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors"
              >
                Continuar limitado
              </button>
            </div>
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/70 transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaywallModal;
