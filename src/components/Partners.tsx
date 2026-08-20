import React, { useState } from 'react';
import { submitPartnerRequest } from '../services/partners';
import { Briefcase, Send, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export function Partners() {
  const [formData, setFormData] = useState({
    name_business: '',
    responsible_name: '',
    whatsapp: '',
    instagram: '',
    city: '',
    event_type: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await submitPartnerRequest(formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao enviar sua solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[var(--libido-bg)] min-h-full">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-fraunces font-medium text-[var(--libido-text)] mb-2">Solicitação Enviada!</h2>
        <p className="text-[var(--libido-muted)] text-sm mb-6">
          Nossa equipe de parcerias entrará em contato com você em breve pelo WhatsApp.
        </p>
        <button
          onClick={() => { 
            setSuccess(false); 
            setFormData({ name_business: '', responsible_name: '', whatsapp: '', instagram: '', city: '', event_type: '', message: '' }); 
          }}
          className="bg-white/10 px-6 py-3 rounded-xl text-[var(--libido-text)] text-sm font-bold hover:bg-white/20 transition-colors"
        >
          Enviar nova solicitação
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--libido-bg)] text-[var(--libido-text)] overflow-y-auto no-scrollbar pb-20">
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[var(--libido-surface-2)] border border-[var(--libido-accent)]/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(216,107,63,0.2)]">
            <Briefcase className="w-6 h-6 text-[var(--libido-accent)]" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider italic font-fraunces text-[var(--libido-text)]">Parceiros</h1>
            <p className="text-[10px] text-[var(--libido-accent)] font-bold uppercase tracking-widest mt-0.5">B2B Business</p>
          </div>
        </div>
        
        <p className="text-[var(--libido-muted)] text-sm leading-relaxed mb-8 border-l-2 border-[var(--libido-accent)] pl-3">
          Faça parte do Clube Libido e divulgue sua casa ou evento para uma comunidade adulta premium.
        </p>

        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--libido-muted)] mb-1.5 ml-1">Nome da Casa / Evento</label>
            <input 
              required 
              name="name_business" 
              value={formData.name_business} 
              onChange={handleChange} 
              className="w-full bg-[var(--libido-surface-2)] border border-[var(--libido-border)] rounded-xl px-4 py-3 text-[var(--libido-text)] focus:outline-none focus:border-[var(--libido-accent)] transition-colors placeholder:text-white/20" 
              placeholder="Ex: Club 69" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--libido-muted)] mb-1.5 ml-1">Responsável</label>
            <input 
              required 
              name="responsible_name" 
              value={formData.responsible_name} 
              onChange={handleChange} 
              className="w-full bg-[var(--libido-surface-2)] border border-[var(--libido-border)] rounded-xl px-4 py-3 text-[var(--libido-text)] focus:outline-none focus:border-[var(--libido-accent)] transition-colors placeholder:text-white/20" 
              placeholder="Seu nome completo" 
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--libido-muted)] mb-1.5 ml-1">WhatsApp</label>
              <input 
                required 
                type="tel" 
                name="whatsapp" 
                value={formData.whatsapp} 
                onChange={handleChange} 
                className="w-full bg-[var(--libido-surface-2)] border border-[var(--libido-border)] rounded-xl px-4 py-3 text-[var(--libido-text)] focus:outline-none focus:border-[var(--libido-accent)] transition-colors placeholder:text-white/20" 
                placeholder="(11) 99999-9999" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--libido-muted)] mb-1.5 ml-1">Instagram</label>
              <input 
                name="instagram" 
                value={formData.instagram} 
                onChange={handleChange} 
                className="w-full bg-[var(--libido-surface-2)] border border-[var(--libido-border)] rounded-xl px-4 py-3 text-[var(--libido-text)] focus:outline-none focus:border-[var(--libido-accent)] transition-colors placeholder:text-white/20" 
                placeholder="@perfil" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--libido-muted)] mb-1.5 ml-1">Cidade</label>
              <input 
                required 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                className="w-full bg-[var(--libido-surface-2)] border border-[var(--libido-border)] rounded-xl px-4 py-3 text-[var(--libido-text)] focus:outline-none focus:border-[var(--libido-accent)] transition-colors placeholder:text-white/20" 
                placeholder="Ex: São Paulo - SP" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--libido-muted)] mb-1.5 ml-1">Tipo</label>
              <input 
                required 
                name="event_type" 
                value={formData.event_type} 
                onChange={handleChange} 
                className="w-full bg-[var(--libido-surface-2)] border border-[var(--libido-border)] rounded-xl px-4 py-3 text-[var(--libido-text)] focus:outline-none focus:border-[var(--libido-accent)] transition-colors placeholder:text-white/20" 
                placeholder="Ex: Casa de Swing" 
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--libido-muted)] mb-1.5 ml-1">Observações</label>
            <textarea 
              name="message" 
              value={formData.message} 
              onChange={handleChange} 
              rows={4} 
              className="w-full bg-[var(--libido-surface-2)] border border-[var(--libido-border)] rounded-xl px-4 py-3 text-[var(--libido-text)] focus:outline-none focus:border-[var(--libido-accent)] transition-colors placeholder:text-white/20 resize-none" 
              placeholder="Conte-nos um pouco sobre a sua proposta..."
            ></textarea>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-black font-black uppercase tracking-wider py-4 rounded-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-lg"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Enviar Solicitação
                <Send className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}