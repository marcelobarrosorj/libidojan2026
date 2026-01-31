
import React, { useState, useEffect } from 'react';
import { Plan, Transaction, TrustLevel, TransactionType } from '../types';
import { 
  Crown, BadgeCheck, CreditCard, X, Lock, ShieldCheck, 
  Star, QrCode, ArrowRight, Loader2, Copy, CheckCircle2, 
  Sparkles, Wallet, Zap, Clock, TrendingUp, ChevronRight, Flame, Search
} from 'lucide-react';
import ActionButton from './common/ActionButton';
import { 
  log, syncCaches, saveUserData, cache, 
  handleButtonAction, showNotification, syncWithCloud 
} from '../services/authUtils';
import { 
  createPaymentIntent, PaymentIntent, verifyPaymentStatus 
} from '../services/paymentService';

const Store: React.FC = () => {
  const [activePlan, setActivePlan] = useState<Plan>(Plan.FREE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'browsing' | 'payment_method' | 'awaiting_payment' | 'verifying' | 'success'>('browsing');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('pix');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [currentIntent, setCurrentIntent] = useState<PaymentIntent | null>(null);
  const [timeLeft, setTimeLeft] = useState(1800); 

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => prev > 0 ? prev - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const buyItem = (item: any) => {
    setSelectedItem(item);
    setStep('payment_method');
  };

  const startVerification = async () => {
    if (!currentIntent) return;
    setStep('verifying');
    const isPaid = await verifyPaymentStatus(currentIntent.id);
    if (isPaid) {
        finalizePurchase();
    } else {
        setStep('awaiting_payment');
        showNotification('Aguardando PIX...', 'info');
    }
  };

  const finalizePurchase = async () => {
    const currentData: any = cache.userData || {};
    const isBoost = selectedItem.type === TransactionType.BOOST;
    
    const updatedData = { 
        ...currentData, 
        boosts_active: isBoost ? (currentData.boosts_active || 0) + (selectedItem.amount || 1) : currentData.boosts_active,
        updatedAt: new Date().toISOString()
    };

    saveUserData(updatedData);
    setStep('success');
  };

  const BOOSTS = [
    { name: '1 Sincronia', amount: 1, price: 'R$ 9,90', type: TransactionType.BOOST, icon: <Zap size={24} />, desc: '30 min no topo' },
    { name: '5 Sincronias', amount: 5, price: 'R$ 39,90', type: TransactionType.BOOST, icon: <TrendingUp size={24} />, desc: 'Poupe 20% agora', hot: true },
    { name: 'Matriz Master (20)', amount: 20, price: 'R$ 99,90', type: TransactionType.BOOST, icon: <Flame size={24} />, desc: 'Dominância Total', exclusive: true }
  ];

  return (
    <div className="p-6 space-y-8 pb-32 animate-in fade-in bg-[#050505] min-h-screen">
      <div className="space-y-1">
        <h2 className="text-4xl font-black font-outfit text-white tracking-tighter italic uppercase flex items-center gap-2">
            TURBO <span className="text-pink">RADAR</span>
        </h2>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Domine a visibilidade da Matriz</p>
      </div>

      <div className="bg-pink p-4 rounded-[2.5rem] flex items-center justify-between shadow-xl shadow-pink/20 border border-white/20">
          <div className="flex items-center gap-3">
              <div className="bg-black/20 p-2 rounded-2xl text-black animate-pulse"><Zap size={24} /></div>
              <div>
                  <p className="text-[10px] font-black text-black uppercase tracking-widest">Oferta Expira em</p>
                  <p className="text-xl font-black text-black font-outfit italic">{formatTime(timeLeft)}</p>
              </div>
          </div>
          <div className="text-right">
              <p className="text-[8px] font-black text-black/60 uppercase italic">Power Up</p>
              <p className="text-xs font-black text-black">+2 BOOSTS GRÁTIS</p>
          </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {BOOSTS.map(b => (
            <div key={b.name} onClick={() => buyItem(b)} className={`glass-card p-6 rounded-[3rem] border-white/5 relative overflow-hidden group active:scale-95 transition-all cursor-pointer ${b.exclusive ? 'ring-2 ring-pink/50 bg-pink/[0.03]' : 'hover:border-pink/30'}`}>
                {b.hot && (
                  <div className="absolute top-0 right-0 bg-pink text-black text-[9px] font-black px-6 py-2 rounded-bl-3xl shadow-lg uppercase tracking-tighter">
                    POPULAR
                  </div>
                )}
                
                <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 ${b.hot || b.exclusive ? 'bg-pink text-black shadow-lg shadow-pink/30' : 'bg-slate-900 text-pink border border-white/5'}`}>
                        {b.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-xl font-black italic font-outfit uppercase text-white truncate">{b.name}</h4>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none">{b.desc}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-black text-pink font-outfit italic">{b.price}</p>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {step !== 'browsing' && (
          <div className="fixed inset-0 z-[300] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in">
              <div className="w-full max-w-sm glass-card rounded-[3.5rem] p-10 space-y-8 relative overflow-hidden border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black text-white font-outfit italic uppercase tracking-tighter">Aumentar Sinal</h3>
                    <button onClick={() => setStep('browsing')} className="p-2 bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                </div>

                {step === 'payment_method' && (
                    <div className="space-y-8">
                        <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-2 text-center">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Itens: {selectedItem.name}</span>
                            <span className="text-3xl font-black text-pink uppercase italic font-outfit">{selectedItem.price}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setPaymentMethod('pix')} className={`p-8 rounded-[3rem] border flex flex-col items-center gap-3 transition-all ${paymentMethod === 'pix' ? 'bg-pink border-pink text-black shadow-xl shadow-pink/20' : 'bg-slate-900 border-white/5 text-slate-500'}`}>
                                <QrCode size={32} /> <span className="text-[10px] font-black uppercase tracking-widest">PIX</span>
                            </button>
                            <button onClick={() => setPaymentMethod('card')} className={`p-8 rounded-[3rem] border flex flex-col items-center gap-3 transition-all ${paymentMethod === 'card' ? 'bg-pink border-pink text-white shadow-xl shadow-pink/20' : 'bg-slate-900 border-white/5 text-slate-500'}`}>
                                <CreditCard size={32} /> <span className="text-[10px] font-black uppercase tracking-widest">CARTÃO</span>
                            </button>
                        </div>
                        <ActionButton label="PAGAR AGORA" onClick={async () => {
                             setIsProcessing(true);
                             try {
                                 const intent = await createPaymentIntent(selectedItem.name, paymentMethod);
                                 setCurrentIntent(intent);
                                 setStep('awaiting_payment');
                             } catch(e: any) {
                                 showNotification('Falha de Conexão com Gateway', 'error');
                             } finally {
                                 setIsProcessing(false);
                             }
                        }} loading={isProcessing} icon={<ArrowRight size={18} />} />
                    </div>
                )}

                {step === 'awaiting_payment' && currentIntent && (
                    <div className="text-center space-y-8 animate-in zoom-in-95">
                        <div className="bg-white p-6 rounded-[3rem] inline-block mx-auto shadow-2xl border-4 border-pink/20">
                            {currentIntent.qrCode && <img src={currentIntent.qrCode} className="w-52 h-52" alt="QR Code PIX" />}
                        </div>
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PIX Copia e Cola</p>
                            <button onClick={() => {
                                navigator.clipboard.writeText(currentIntent.pixKey || '');
                                showNotification('Código Copiado!', 'success');
                            }} className="w-full bg-slate-900 border border-white/5 rounded-2xl p-5 flex items-center justify-between group active:bg-slate-800 transition-all overflow-hidden">
                                <span className="text-[10px] text-slate-400 font-mono truncate mr-4">{currentIntent.pixKey || '---'}</span>
                                <Copy size={20} className="text-pink shrink-0" />
                            </button>
                        </div>
                        <ActionButton label="VERIFICAR AGORA" onClick={startVerification} icon={<Search size={18} />} />
                    </div>
                )}

                {step === 'verifying' && (
                    <div className="text-center space-y-12 py-10">
                        <div className="relative w-40 h-40 mx-auto">
                            <div className="absolute inset-0 border-[6px] border-pink/10 rounded-full" />
                            <div className="absolute inset-0 border-[6px] border-pink rounded-full animate-spin border-t-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Zap size={48} className="text-pink animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-2xl font-black text-white uppercase italic font-outfit tracking-tighter">SINCRONIZANDO...</h4>
                        </div>
                    </div>
                )}

                {step === 'success' && (
                    <div className="text-center space-y-8 py-4 animate-in zoom-in-95">
                        <div className="w-28 h-28 bg-green-500/10 rounded-[3rem] flex items-center justify-center mx-auto text-green-500 border border-green-500/20 shadow-2xl">
                            <CheckCircle2 size={64} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-white italic font-outfit uppercase tracking-tighter">TURBO ATIVADO</h3>
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-black italic">Você agora está no topo do radar.</p>
                        </div>
                        <ActionButton label="CONCLUIR" onClick={() => setStep('browsing')} icon={<ShieldCheck size={20} />} />
                    </div>
                )}
              </div>
          </div>
      )}
    </div>
  );
};

export default Store;
