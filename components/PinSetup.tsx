
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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

  // Referência para o campo de confirmação para permitir o foco automático
  const confirmInputRef = useRef<HTMLInputElement>(null);

  const canClick = useMemo(() => {
    return pin.length === 4 && confirm.length === 4 && !busy;
  }, [pin, confirm, busy]);

  // Monitora o preenchimento do primeiro PIN para pular para o próximo campo
  useEffect(() => {
    if (pin.length === 4) {
      confirmInputRef.current?.focus();
    }
  }, [pin]);

  const handleSubmit = useCallback(async () => {
    // Validação explícita para 4 dígitos numéricos
    if (!isValidPinFormat(pin)) {
      setError('O PIN deve conter exatamente 4 dígitos numéricos.');
      return;
    }

    if (pin.length !== 4 || confirm.length !== 4 || busy) return;

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
        setError('message' in result ? result.message : 'Erro ao configurar PIN');
      }
    } catch (e: any) {
      log('error', '[PIN_SETUP] Erro na criação do PIN', { error: e.message });
      setError(e.message || 'Erro inesperado ao configurar chave.');
    } finally {
      setBusy(false);
    }
  }, [pin, confirm, busy, onDone]);

  useEffect(() => {
    if (pin.length === 4 && confirm.length === 4 && !busy) {
      const timer = setTimeout(() => {
        handleSubmit();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [pin, confirm, busy, handleSubmit]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full max-w-sm">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto text-amber-500 mb-4 shadow-lg shadow-amber-500/10">
          <ShieldCheck size={32} />
        </div>
        <h3 className="text-xl font-bold text-white font-outfit uppercase tracking-tight">Segurança Libido</h3>
        <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Defina sua Chave de 4 dígitos</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
            <label className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest ml-2">Novo PIN</label>
            <input
              type="password"
              autoFocus
              maxLength={4}
              inputMode="numeric"
              placeholder="••••"
              value={pin}
              onChange={(e) => {
                  setError(null);
                  setPin(e.target.value.replace(/\D/g, ''));
              }}
              className="w-full bg-slate-900 border-2 border-amber-500/20 rounded-2xl py-5 px-6 text-center text-white text-2xl tracking-[1em] focus:border-amber-500 outline-none transition-all shadow-inner"
            />
        </div>

        <div className="space-y-2">
            <label className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest ml-2">Confirme o PIN</label>
            <input
              ref={confirmInputRef}
              type="password"
              maxLength={4}
              inputMode="numeric"
              placeholder="••••"
              value={confirm}
              onChange={(e) => {
                  setError(null);
                  setConfirm(e.target.value.replace(/\D/g, ''));
              }}
              className="w-full bg-slate-900 border-2 border-amber-500/20 rounded-2xl py-5 px-6 text-center text-white text-2xl tracking-[1em] focus:border-amber-500 outline-none transition-all shadow-inner"
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
          variant="amber"
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
