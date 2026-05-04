
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Check, Zap, Shield, X, Star } from 'lucide-react';
import PixCheckout from './PixCheckout';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
  reason: 'limit' | 'photos' | 'radar' | 'interaction';
}

const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, onUpgrade, reason }) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string, price: string }>({ name: 'Mensal', price: '49,90' });

  const plans = [
    { id: 'diario', name: 'Diário', price: '9,90', desc: 'Acesso 24h' },
    { id: 'mensal', name: 'Mensal', price: '49,90', desc: 'Mais popular', recommended: true },
    { id: 'semestral', name: 'Semestral', price: '269,46', desc: 'Economia 10%' },
    { id: 'anual', name: 'Anual', price: '479,04', desc: 'Melhor valor' }
  ];

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
            className="relative w-full max-w-md bg-slate-900 rounded-t-[32px] sm:rounded-[32px] overflow-hidden border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
          >
            {/* Header com Gradiente */}
            <div className="relative h-40 bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 flex flex-col items-center justify-center text-white overflow-hidden shrink-0">
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
                className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-2 border border-white/30"
              >
                <Crown size={32} className="text-white fill-white" />
              </motion.div>
              <h2 className="text-xl font-black uppercase tracking-tighter italic">{titles[reason]}</h2>
            </div>

            <div className="p-6">
              <p className="text-slate-400 text-center text-[10px] uppercase font-black tracking-widest leading-relaxed mb-6">
                {descriptions[reason]}
              </p>

              {/* Seleção de Planos */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan({ name: plan.name, price: plan.price })}
                    className={`relative p-4 rounded-2xl border transition-all text-left group ${
                      selectedPlan.name === plan.name 
                        ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                        : 'bg-white/5 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-2 -right-1 bg-rose-500 text-[6px] font-black uppercase px-2 py-0.5 rounded-full text-white tracking-tighter">
                        POPULAR
                      </div>
                    )}
                    <h4 className={`text-[10px] font-black uppercase italic tracking-tighter ${selectedPlan.name === plan.name ? 'text-amber-500' : 'text-white'}`}>
                      {plan.name}
                    </h4>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-black text-white italic leading-none">R${plan.price}</span>
                    </div>
                    <p className="text-[7px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      {plan.desc}
                    </p>
                  </button>
                ))}
              </div>

              <div className="space-y-4 mb-8 bg-black/20 p-4 rounded-2xl border border-white/5">
                {[
                  { icon: <Zap size={14} />, text: 'Navegação Ilimitada' },
                  { icon: <Shield size={14} />, text: 'Verificação Prioritária' },
                  { icon: <Star size={14} />, text: 'Distintivo de Confiança' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-300">
                    <div className="text-amber-500">{item.icon}</div>
                    <span className="text-[9px] font-black uppercase tracking-wider">{item.text}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowCheckout(true)}
                className="w-full h-14 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 flex flex-col items-center justify-center gap-0 shadow-[0_10px_30px_rgba(245,158,11,0.3)]"
              >
                <div className="flex items-center gap-2">
                  Assinar Agora <Check size={18} />
                </div>
                <span className="text-[8px] opacity-70">Pagamento via PIX</span>
              </button>

              <button 
                onClick={onClose}
                className="w-full py-4 text-slate-500 font-bold text-[9px] uppercase tracking-widest hover:text-white transition-colors"
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

          <PixCheckout 
            isOpen={showCheckout} 
            onClose={() => setShowCheckout(false)}
            planName={selectedPlan.name}
            amount={selectedPlan.price}
            onSuccess={() => {
                setShowCheckout(false);
                onUpgrade?.();
                onClose();
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaywallModal;
