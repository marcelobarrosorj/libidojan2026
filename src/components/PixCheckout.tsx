import { parseApiResponse } from '../utils/api';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Copy, CheckCircle2, X, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { isValidCPF, normalizeCPF } from '../utils/cpf';

function applyCpfMask(value: string) {
  const v = value.replace(/\D/g, '').slice(0, 11);
  if (v.length <= 3) return v;
  if (v.length <= 6) return `${v.slice(0, 3)}.${v.slice(3)}`;
  if (v.length <= 9) return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`;
  return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`;
}

interface PixCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  userId?: string;
}

export function PixCheckout({ isOpen, onClose, onUpgrade, userId }: PixCheckoutProps) {
  const [copied, setCopied] = useState(false);
  const [pixData, setPixData] = useState<{ paymentId: string, qrCodeImage: string, qrCodeText: string, amount: number, status: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [cpf, setCpf] = useState('');
  const [isCpfValid, setIsCpfValid] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('payment-active');
      const saved = sessionStorage.getItem('libido_pix_checkout');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.status === 'WAITING' || parsed.status === 'ACTIVE') {
             setPixData(parsed);
          } else {
             sessionStorage.removeItem('libido_pix_checkout');
          }
        } catch(e) {}
      }
    } else {
      document.body.classList.remove('payment-active');
      setCpf('');
      setErrorMsg('');
      // setPixData(null); // Keep it in case they close and reopen, or we can clear if not pending
    }
    return () => {
       document.body.classList.remove('payment-active');
    }
  }, [isOpen]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyCpfMask(e.target.value);
    setCpf(masked);
    setIsCpfValid(isValidCPF(masked));
  };

  const handleGeneratePix = async () => {
    if (!isCpfValid) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        setErrorMsg('Usuário não autenticado.');
        return;
      }
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: JSON.stringify({ customerTaxId: normalizeCPF(cpf) })
      });
      
      const data = await parseApiResponse(res);
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao gerar cobrança.');
      }
      setPixData(data);
      sessionStorage.setItem('libido_pix_checkout', JSON.stringify({ paymentId: data.paymentId, status: data.status }));
      setCpf('');
    } catch (error: any) {
      console.error("Falha ao gerar PIX do backend:", error);
      setErrorMsg(error.message || 'Falha temporária. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !pixData || pixData.status !== 'WAITING') return;

    const checkStatus = async () => {
      try {
        const session = await supabase.auth.getSession();
        if (!session.data.session) return;

        const res = await fetch(`/api/payment/status/${pixData.paymentId}`, {
          headers: {
            'Authorization': `Bearer ${session.data.session.access_token}`
          }
        });
        
        if (res.ok) {
          const data = await parseApiResponse(res);
          if (data.status === 'PAID') {
            setPixData(prev => {
              if (prev) {
                const newData = { ...prev, status: 'PAID' };
                sessionStorage.setItem('libido_pix_checkout', JSON.stringify({ paymentId: prev.paymentId, status: 'PAID' }));
                return newData;
              }
              return null;
            });
            setTimeout(() => {
              sessionStorage.removeItem('libido_pix_checkout');
              onUpgrade();
            }, 1500);
          } else if (data.status === 'CANCELED' || data.status === 'EXPIRED') {
            setPixData(prev => {
              if (prev) {
                const newData = { ...prev, status: data.status };
                sessionStorage.removeItem('libido_pix_checkout');
                return newData;
              }
              return null;
            });
            setErrorMsg('Pagamento expirado ou cancelado.');
          }
        }
      } catch (error) {
        console.error("Erro ao checar status do PIX:", error);
      }
    };

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [isOpen, pixData, onUpgrade]);

  const handleCopy = () => {
    if (pixData) {
      navigator.clipboard.writeText(pixData.qrCodeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[var(--libido-surface)] border border-[var(--libido-border)] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative"
        >
          {/* Close Button */}
          <button onClick={onClose} className="absolute top-4 right-4 text-[var(--libido-muted)] hover:text-[var(--libido-text)] bg-[var(--libido-surface-2)] p-2 rounded-full transition-colors z-10">
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 relative">
            <div className="text-center mb-6 mt-4">
              <div className="w-16 h-16 bg-[var(--libido-surface-2)] border border-[var(--libido-accent)]/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[0_0_15px_rgba(216,107,63,0.3)]">
                <Crown className="w-8 h-8 text-[var(--libido-text)]" />
              </div>
              <h2 className="text-2xl font-fraunces font-medium text-[var(--libido-text)] mb-2">Ative o Premium</h2>
              <p className="text-[var(--libido-muted)] text-sm">
                Desbloqueie todo o poder do app
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--libido-accent)]" />
              </div>
            ) : errorMsg ? (
              <div className="text-center py-8">
                <p className="text-red-500 font-bold mb-4">{errorMsg}</p>
                <button 
                  onClick={() => { setErrorMsg(''); setPixData(null); }}
                  className="bg-white/10 px-6 py-2 rounded-xl text-[var(--libido-text)] text-sm"
                >
                  Tentar novamente
                </button>
              </div>
            ) : !pixData ? (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--libido-text)] mb-1">CPF do titular</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCpfChange}
                    className="w-full bg-[var(--libido-surface-2)] border border-[var(--libido-border)] rounded-xl px-4 py-3 text-[var(--libido-text)] focus:outline-none focus:border-[var(--libido-accent)] transition-colors"
                  />
                  <p className="text-xs text-[var(--libido-muted)] mt-2">Usado somente para processar o pagamento com segurança.</p>
                  {cpf.length > 13 && !isCpfValid && (
                    <p className="text-xs text-red-500 mt-1">CPF inválido</p>
                  )}
                </div>
                <button
                  onClick={handleGeneratePix}
                  disabled={!isCpfValid}
                  className="w-full bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-500 transition-colors"
                >
                  Gerar Pix
                </button>
              </div>
            ) : pixData ? (
              pixData.status === 'PAID' ? (
                <div className="text-center py-8 flex flex-col items-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                  <p className="text-green-500 font-bold text-lg mb-2">Pagamento confirmado. Premium ativado.</p>
                  <p className="text-[var(--libido-muted)] opacity-70 text-sm">Redirecionando...</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-4 bg-white/5 p-4 rounded-2xl mb-4">
                    {pixData.qrCodeImage && <img src={pixData.qrCodeImage} alt="PIX QR Code" className="w-48 h-48 rounded-lg bg-white p-2" />}
                    {pixData.amount && <p className="text-[var(--libido-text)] font-bold">R$ {pixData.amount.toFixed(2).replace('.', ',')}</p>}
                    <p className="text-xs text-[var(--libido-accent)]">Aguardando pagamento...</p>
                    
                    {pixData.qrCodeText && (
                      <button 
                        onClick={handleCopy}
                        className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-semibold transition-colors mt-2"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Código Pix copiado' : 'Copiar código Pix'}
                      </button>
                    )}
                  </div>
                </>
              )
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
