
import React, { useState, useEffect, useRef } from 'react';
import { Plan, User } from '../types';
import { 
  Check, Star, 
  AlertTriangle, X, Loader2, Sparkles, Crown, Zap, ShieldAlert
} from 'lucide-react';
import { cache, saveUserData, showNotification, syncCaches, isPremiumUser } from '../services/authUtils';
import ActionButton from './common/ActionButton';
import LibidoIcon from './common/LibidoIcon';

const Subscription: React.FC<{ currentUser?: User | null }> = ({ currentUser }) => {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'pix_display' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Chave Pix oficial da Matriz Libido
  const PIX_KEY = 'libidoapp@gmail.com'; 
  const PIX_RECIPIENT = 'Libido App - Matriz 2026';
  const PLANS = [
    { 
      id: 'diario',
      name: 'Acesso 24h', 
      price: 'R$ 9,90', 
      cents: 990,
      period: 'por dia',
      desc: 'Perfil completo por 24 horas.', 
      features: ['Acesso total por 24h', 'Sem renovação automática'],
      color: 'border-emerald-500/20 bg-emerald-500/[0.02]'
    },
    { 
      id: 'mensal',
      name: 'Mensal', 
      price: 'R$ 49,90', 
      cents: 4990,
      period: 'por mês',
      desc: 'Flexibilidade total na rede.', 
      features: ['Alcance 15km', 'Mensagens limitadas'],
      color: 'border-white/5'
    },
    { 
      id: 'semestral',
      name: 'Semestral', 
      price: 'R$ 269,46', 
      cents: 26946,
      period: 'por semestre',
      desc: 'Economia de 10% (R$ 44,91/mês)', 
      features: ['Alcance 250km', 'Mensagens ilimitadas', 'Selo Silver'],
      recommended: true,
      color: 'border-pink/40 bg-pink/[0.02]'
    },
    { 
      id: 'anual',
      name: 'Anual', 
      price: 'R$ 479,04', 
      cents: 47904,
      period: 'por ano',
      desc: 'O melhor valor (R$ 39,92/mês)', 
      features: ['Tudo do semestral', 'Modo Ghost', 'Vibe Concierge'],
      color: 'border-amber-500/30 bg-amber-500/[0.02]'
    }
  ];

  // Garante que a tela não fique escura ao concluir o pagamento
  useEffect(() => {
    if (paymentStep === 'success') {
      document.body.classList.add('payment-success');
      document.body.classList.remove('is-hidden');
    } else {
      document.body.classList.remove('payment-success');
    }
    
    return () => {
      document.body.classList.remove('payment-success');
    };
  }, [paymentStep]);

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setPaymentStep('pix_display');
    document.body.classList.add('payment-active');
    document.body.classList.remove('is-hidden');
  };

  const closeCheckout = () => {
    setPaymentStep('idle');
    document.body.classList.remove('payment-active');
    document.body.classList.remove('payment-success');
    document.body.classList.remove('is-hidden');
  };

  const user = currentUser || cache.userData;
  const isPremium = isPremiumUser(user);

  // Sincroniza ao abrir para garantir status atualizado
  useEffect(() => {
    syncCaches();
  }, []);

  if (isPremium) {
    return (
      <div className="p-6 space-y-12 pb-32 animate-in fade-in bg-[#050505] min-h-screen flex flex-col items-center justify-center text-center">
        <div className="relative">
          <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.2)] animate-pulse">
            <Crown size={48} />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-pink p-1.5 rounded-full border border-black animate-bounce">
            <Sparkles size={16} className="text-white" />
          </div>
        </div>
        
        <div className="space-y-4 max-w-sm">
          <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter leading-none">MATRIZ LIBERADA</h2>
          <p className="text-[12px] text-amber-500 font-extrabold uppercase tracking-[0.3em] font-outfit">Sua assinatura está ativa</p>
          
          <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 mt-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
              <span className="text-[10px] text-slate-500 font-black uppercase">Plano Atual</span>
              <span className="text-[12px] text-white font-black uppercase italic">{user?.plan}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
              Você já usufrui de todos os privilégios VIP, incluindo alcance estendido, mensagens ilimitadas e visibilidade prioritária.
            </p>
          </div>
        </div>

        <div className="mt-8 opacity-20">
           <LibidoIcon size={50} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 pb-32 animate-in fade-in bg-[#050505] min-h-screen relative">
      <div className="space-y-2 text-center">
        <h2 className="text-4xl font-black font-outfit text-white tracking-tighter italic uppercase flex items-center justify-center gap-3">
            🚀 SELECIONE SEU <span className="text-pink">PLANO</span>
        </h2>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Upgrade Seguro v2.0</p>
      </div>

      <div className="space-y-6">
        {PLANS.map((p) => (
            <div 
                key={p.id} 
                onClick={() => handleSelectPlan(p)}
                className={`glass-card p-8 rounded-[3.5rem] border transition-all duration-500 relative overflow-hidden group cursor-pointer active:scale-95 ${p.color} ${selectedPlan?.id === p.id ? 'ring-2 ring-pink shadow-[0_0_40px_rgba(255,20,147,0.1)]' : ''}`}
            >
                {p.recommended && (
                    <div className="absolute top-0 right-0 bg-pink text-white text-[9px] font-black px-6 py-2.5 rounded-bl-[2rem] uppercase italic flex items-center gap-2 z-10">
                        <Star size={12} fill="currentColor" /> Favorito
                    </div>
                )}

                <div className="mb-4">
                    <h4 className="text-2xl font-black italic font-outfit uppercase text-white tracking-tighter">{p.name}</h4>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{p.desc}</p>
                </div>
                
                <div className="mb-6 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white font-outfit italic tracking-tighter">{p.price}</span>
                    {p.period && <span className="text-slate-500 text-[10px] font-black uppercase">{p.period}</span>}
                </div>

                <div className="space-y-3 mb-6">
                    {p.features.map(f => (
                        <div key={f} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-pink/10 flex items-center justify-center text-pink">
                                <Check size={12} strokeWidth={4} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f}</span>
                        </div>
                    ))}
                </div>
                
                <div className={`w-full py-4 rounded-2xl border flex items-center justify-center text-[10px] font-black uppercase transition-all ${selectedPlan?.id === p.id ? 'bg-pink text-white border-pink' : 'bg-white/5 border-white/5 text-slate-400 group-hover:text-pink'}`}>
                    {selectedPlan?.id === p.id ? 'PLANO SELECIONADO' : 'SELECIONAR ESTE PLANO'}
                </div>
            </div>
        ))}
      </div>

      {/* OVERLAY DE CHECKOUT */}
      {paymentStep !== 'idle' && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={closeCheckout} />
            
            <div className="relative w-full max-w-sm glass-card rounded-[3.5rem] p-8 border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300">
                <button onClick={closeCheckout} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white">
                    <X size={24} />
                </button>

                {paymentStep === 'pix_display' && (
                    <div className="space-y-8 py-4">
                        <div className="text-center space-y-2">
                             <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/20">
                                <LibidoIcon size={32} />
                             </div>
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Pagamento via Pix</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                Transfira o valor de <span className="text-white">{selectedPlan?.price}</span> para a chave abaixo e envie o comprovante.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/5 text-center relative group">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Destinatário</p>
                                <p className="text-white font-bold text-sm mb-4">{PIX_RECIPIENT}</p>

                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Chave Pix (E-mail)</p>
                                <p className="text-amber-500 font-mono font-bold text-lg break-all select-all">{PIX_KEY}</p>
                                
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(PIX_KEY);
                                        showNotification('Chave Pix copiada!', 'success');
                                    }}
                                    className="mt-4 w-full py-2 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase rounded-xl border border-amber-500/20 hover:bg-amber-500 hover:text-black transition-all"
                                >
                                    Copiar Chave Pix
                                </button>
                            </div>

                            <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 flex items-center gap-3">
                                <ShieldAlert size={18} className="text-amber-500 shrink-0" />
                                <p className="text-[9px] text-amber-500 font-bold uppercase leading-tight">
                                    Após o pagamento, sua Matriz será atualizada em até 1 hora útil após a confirmação.
                                </p>
                            </div>

                            <ActionButton 
                                label="Já realizei o pagamento" 
                                onClick={() => {
                                    showNotification('Notificação enviada! Aguarde a liberação.', 'info');
                                    setPaymentStep('idle');
                                }} 
                                className="bg-emerald-500 text-black border-none"
                            />
                        </div>
                    </div>
                )}

                {paymentStep === 'success' && (
                    <div className="py-10 text-center space-y-8 animate-in zoom-in-95">
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500 border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                            <Check size={64} strokeWidth={3} />
                        </div>
                        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">MATRIZ ATUALIZADA</h3>
                        <ActionButton label="Acessar VIP" onClick={closeCheckout} />
                    </div>
                )}

                {paymentStep === 'error' && (
                  <div className="py-10 text-center space-y-6">
                    <AlertTriangle size={48} className="text-rose-500 mx-auto" />
                    <h3 className="text-white font-black uppercase italic tracking-tighter">Falha no Pagamento</h3>
                    <p className="text-[10px] text-slate-500 uppercase">{errorMessage}</p>
                    <ActionButton label="Tentar Novamente" onClick={() => setPaymentStep('idle')} />
                  </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;
