import React, { useState, useMemo } from 'react';
import { ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { isValidPinFormat, isWeakPin } from '../services/pinPolicy';
import { setUserPin } from '../services/pinService';
import ActionButton from './common/ActionButton';
import { log } from '../services/authUtils';

interface PinSetupProps {
  onDone: () => void;
}

export const PinSetup: React.FC<PinSetupProps> = ({ onDone }) => {
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // O botão agora fica habilitado assim que o formato básico está correto
  // Permitindo que o usuário clique e receba feedback de validação
  const canClick = useMemo(() => {
    return pin.length === 4 && confirm.length === 4 && !busy;
  }, [pin, confirm, busy]);

  const handleSubmit = async () => {
    if (!canClick) return;

    // Validações internas para feedback claro
    if (isWeakPin(pin)) {
      setError('Este PIN é muito comum. Escolha algo menos previsível.');
      return;
    }

    if (pin !== confirm) {
      setError('Os PINs digitados não coincidem.');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      log('info', '[PIN_SETUP] Tentando configurar novo PIN...');
      const result = await setUserPin(pin);
      
      if (result.ok) {
        log('info', '[PIN_SETUP] Sucesso. Prosseguindo...');
        onDone();
      } else {
        // Fix: Explicitly check for message property to satisfy TypeScript compiler
        setError('message' in result ? result.message : 'Erro ao configurar PIN');
      }
    } catch (e: any) {
      log('error', '[PIN_SETUP] Erro na criação do PIN', { error: e.message });
      setError(e.message || 'Erro inesperado ao configurar chave.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-pink/10 rounded-3xl flex items-center justify-center mx-auto text-pink mb-4">
          <ShieldCheck size={32} />
        </div>
        <h3 className="text-xl font-bold text-white font-outfit uppercase tracking-tight">Segurança Libido</h3>
        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Defina sua Chave de 4 dígitos</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Novo PIN</label>
            <input
              type="password"
              maxLength={4}
              inputMode="numeric"
              placeholder="••••"
              value={pin}
              onChange={(e) => {
                  setError(null);
                  setPin(e.target.value.replace(/\D/g, ''));
              }}
              className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-center text-white text-2xl tracking-[1em] focus:border-pink/50 outline-none transition-all"
            />
        </div>

        <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Confirme o PIN</label>
            <input
              type="password"
              maxLength={4}
              inputMode="numeric"
              placeholder="••••"
              value={confirm}
              onChange={(e) => {
                  setError(null);
                  setConfirm(e.target.value.replace(/\D/g, ''));
              }}
              className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-center text-white text-2xl tracking-[1em] focus:border-pink/50 outline-none transition-all"
            />
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <AlertCircle size={18} className="text-rose-500 shrink-0" />
          <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider leading-tight">{error}</p>
        </div>
      )}

      <div className="pt-2">
        <ActionButton
          label="Ativar Chave de Segurança"
          onClick={handleSubmit}
          disabled={!canClick}
          loading={busy}
          icon={<ArrowRight size={18} />}
        />
        <p className="text-[9px] text-slate-600 text-center mt-4 italic font-medium px-4">
          "Sua chave é armazenada localmente com criptografia de nível militar para sua total privacidade."
        </p>
      </div>
    </div>
  );
};

export default PinSetup;