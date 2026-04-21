
import React, { useState, useEffect, useRef } from 'react';
import { Plan } from '../types';
import { 
  CreditCard, Check, Star, ArrowRight, 
  AlertTriangle, ShieldCheck, X, Loader2, Sparkles, Crown, Zap, ShieldAlert
} from 'lucide-react';
import { cache, saveUserData, showNotification } from '../services/authUtils';
import ActionButton from './common/ActionButton';
import { createPaymentIntent } from '../services/paymentService';

// Chave pública fornecida
const STRIPE_PUBLIC_KEY = 'pk_live_51RsspgEqSklIuetZT3UOXocxXkYCTYKTznCnN6ciw1r6sghZmfkZD8gEzZ0tIUXwjdUDVaGIRxr9ZkCN5d5LeX7H00ZRa4BkE6';

const Subscription: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'card_input' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const stripeRef = useRef<any>(null);
  const elementsRef = useRef<any>(null);
  const cardRef = useRef<any>(null);

  const PLANS = [
    { 
      id: 'mensal',
      name: 'Assinar Plano Mensal', 
      price: 'R$ 49,90/mês', 
      cents: 4990,
      desc: 'Flexibilidade total na rede.', 
      features: ['Alcance 15km', 'Mensagens limitadas'],
      color: 'border-white/5'
    },
    { 
      id: 'semestral',
      name: 'Assinar Plano Semestral', 
      price: 'R$ 269,46', 
      cents: 26946,
      period: '6 meses',
      desc: 'Economia de 10% (R$ 44,91/mês)', 
      features: ['Alcance 250km', 'Mensagens ilimitadas', 'Selo Silver'],
      recommended: true,
      color: 'border-pink/40 bg-pink/[0.02]'
    },
    { 
      id: 'anual',
      name: 'Assinar Plano Anual', 
      price: 'R$ 479,04', 
      cents: 47904,
      period: '12 meses',
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

  useEffect(() => {
    if (paymentStep === 'card_input' && !cardRef.current) {
        // @ts-ignore
        stripeRef.current = window.Stripe(STRIPE_PUBLIC_KEY);
        elementsRef.current = stripeRef.current.elements();
        
        const style = {
            base: {
                color: '#ffffff',
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                '::placeholder': { color: '#475569' },
                iconColor: '#ff1493'
            },
            invalid: {
                color: '#ef4444',
                iconColor: '#ef4444'
            }
        };

        cardRef.current = elementsRef.current.create('card', { style, hidePostalCode: true });
        cardRef.current.mount('#stripe-card-element');
        
        cardRef.current.on('change', (event: any) => {
            if (event.error) setErrorMessage(event.error.message);
            else setErrorMessage('');
        });
    }
  }, [paymentStep]);

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setPaymentStep('card_input');
    document.body.classList.add('payment-active');
    document.body.classList.remove('is-hidden');
  };

  const processStripePayment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setErrorMessage('');

    try {
        const intent = await createPaymentIntent(selectedPlan.name, 'card');
        const result = await stripeRef.current.confirmCardPayment(intent.clientSecret, {
            payment_method: {
                card: cardRef.current,
                billing_details: {
                    name: cache.userData?.nickname || 'Membro Libido',
                    email: `${cache.userData?.nickname}@libido.app`
                }
            }
        });

        if (result.error) {
            setErrorMessage(result.error.message);
            setPaymentStep('error');
        } else {
            if (result.paymentIntent.status === 'succeeded') {
                finalizeSubscription();
            }
        }
    } catch (err: any) {
        setErrorMessage('Erro de conectividade com o gateway.');
        setPaymentStep('error');
    } finally {
        setIsProcessing(false);
    }
  };

  const finalizeSubscription = () => {
    const userData = cache.userData;
    if (userData) {
        const newPlan = selectedPlan.id === 'mensal' ? Plan.PREMIUM : Plan.GOLD;
        saveUserData({ ...userData, plan: newPlan, is_premium: true });
        setPaymentStep('success');
        showNotification('Sua Matriz foi elevada com sucesso!', 'success');
    }
  };

  const closeCheckout = () => {
    setPaymentStep('idle');
    document.body.classList.remove('payment-active');
    document.body.classList.remove('payment-success');
    document.body.classList.remove('is-hidden');
  };

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

      {/* OVERLAY DE CHECKOUT STRIPE */}
      {paymentStep !== 'idle' && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => !isProcessing && closeCheckout()} />
            
            <div className="relative w-full max-w-sm glass-card rounded-[3.5rem] p-8 border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300">
                <button onClick={closeCheckout} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white" disabled={isProcessing}>
                    <X size={24} />
                </button>

                {paymentStep === 'card_input' && (
                    <div className="space-y-8 py-4">
                        <div className="text-center space-y-1">
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Checkout Seguro</h3>
                            <p className="text-[10px] text-pink font-black uppercase tracking-widest">{selectedPlan?.name}</p>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/5 shadow-inner">
                                <div id="stripe-card-element" className="p-2" />
                            </div>

                            {errorMessage && (
                                <div className="bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 flex items-center gap-3">
                                    <AlertTriangle size={18} className="text-rose-500 shrink-0" />
                                    <p className="text-[10px] text-rose-500 font-bold uppercase">{errorMessage}</p>
                                </div>
                            )}

                            <ActionButton 
                                label={`Assinar Agora - ${selectedPlan?.price}`} 
                                onClick={processStripePayment} 
                                loading={isProcessing} 
                                icon={<ShieldCheck size={18} />} 
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
                    <ActionButton label="Tentar Novamente" onClick={() => setPaymentStep('card_input')} />
                  </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;
