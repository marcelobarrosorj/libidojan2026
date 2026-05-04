
import React, { useState } from 'react';
import { Mail, Check, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../services/supabase';
import { showNotification } from '../services/authUtils';

interface VerificationBannerProps {
  email: string;
}

export default function VerificationBanner({ email }: VerificationBannerProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const resendEmail = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (error) throw error;
      setSent(true);
      showNotification('Link de confirmação enviado para seu e-mail!', 'success');
    } catch (e: any) {
      showNotification(e.message || 'Falha ao enviar e-mail', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-4 mb-4 p-4 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)] animate-in slide-in-from-bottom duration-500">
      <div className="flex gap-4">
        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-amber-500/20">
          <Mail size={24} className="text-amber-500" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="text-xs font-black text-white italic uppercase tracking-tighter">Confirme sua Identidade</h3>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
            Sua conta está limitada. Verifique seu e-mail <span className="text-white">({email})</span> para liberar todas as funções.
          </p>
        </div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <button 
          onClick={resendEmail}
          disabled={loading || sent}
          className="flex-1 h-10 bg-amber-500 rounded-xl text-black text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : sent ? <Check size={14} /> : 'Reenviar Link'}
          {!loading && !sent && <ArrowRight size={14} />}
        </button>
        <div className="px-3 flex items-center justify-center bg-white/5 rounded-xl border border-white/5">
           <AlertCircle size={14} className="text-slate-500" />
        </div>
      </div>
      
      <p className="mt-3 text-[7px] text-slate-600 font-bold uppercase text-center tracking-tighter">
        Não recebeu? Verifique sua pasta de SPAM ou Lixo Eletrônico.
      </p>
    </div>
  );
}
