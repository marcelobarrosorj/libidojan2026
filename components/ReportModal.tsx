
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, ShieldAlert, Check, Flag, MessageSquare, UserX, Info } from 'lucide-react';
import { moderationService, ReportReason } from '../services/moderationService';
import { cache } from '../services/authUtils';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUserName: string;
  chatContextId?: string;
}

const REASONS: { id: ReportReason; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'harassment', label: 'Assédio / Abuso', icon: <UserX size={18} />, desc: 'Comportamento insistente ou agressivo não solicitado.' },
    { id: 'spam', label: 'Spam / Divulgação', icon: <Flag size={18} />, desc: 'Venda de serviços, links externos ou mensagens em massa.' },
    { id: 'fake_profile', label: 'Perfil Fake / Catfish', icon: <ShieldAlert size={18} />, desc: 'Uso de fotos de terceiros ou informações falsas.' },
    { id: 'inappropriate_content', label: 'Conteúdo Impróprio', icon: <AlertCircle size={18} />, desc: 'Fotos ou conversas que violam as regras da comunidade.' },
    { id: 'other', label: 'Outro Motivo', icon: <Info size={18} />, desc: 'Algo que não se encaixa nas categorias acima.' },
];

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, reportedUserId, reportedUserName, chatContextId }) => {
  const [step, setStep] = useState<'reason' | 'details' | 'success'>('reason');
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason || !cache.userData) return;
    
    setLoading(true);
    const success = await moderationService.submitReport({
        reported_user_id: reportedUserId,
        reporter_user_id: cache.userData.id,
        reason: selectedReason,
        description: description,
        chat_context_id: chatContextId
    });

    if (success) {
        setStep('success');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="relative w-full max-w-md bg-slate-900 rounded-t-[32px] sm:rounded-[32px] overflow-hidden border border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <ShieldAlert className="text-amber-500" size={20} />
                <h2 className="text-sm font-black uppercase italic text-white tracking-widest">Denunciar Perfil</h2>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white"><X size={20} /></button>
          </div>

          <div className="p-6">
            {step === 'reason' && (
                <div className="space-y-3">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">
                        Por que você está denunciando <span className="text-white italic">{reportedUserName}</span>?
                    </p>
                    {REASONS.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => { setSelectedReason(r.id); setStep('details'); }}
                            className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/30 text-left transition-all group flex items-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-colors">
                                {r.icon}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-[11px] font-black text-white uppercase tracking-tighter">{r.label}</h4>
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-tight mt-0.5">{r.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {step === 'details' && (
                <div className="space-y-4">
                    <button onClick={() => setStep('reason')} className="text-[9px] text-amber-500 font-black uppercase tracking-widest hover:underline">← Voltar para motivos</button>
                    <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Descrição adicional (Opcional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descreva o ocorrido com mais detalhes..."
                            className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                    </div>
                    <button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="w-full h-14 bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processando...' : 'Enviar Denúncia'}
                        {!loading && <ShieldAlert size={20} />}
                    </button>
                </div>
            )}

            {step === 'success' && (
                <div className="py-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/30 mx-auto">
                        <Check size={40} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white uppercase italic">Denúncia Recebida</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 max-w-[280px] mx-auto leading-relaxed">
                            Nossa inteligência artificial e equipe de moderação revisarão este perfil em até 24 horas para garantir a segurança da comunidade Libido.
                        </p>
                    </div>
                    <button onClick={onClose} className="px-8 py-3 bg-white/5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-colors">Fechar</button>
                </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
