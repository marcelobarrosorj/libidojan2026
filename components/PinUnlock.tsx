
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Lock, Unlock, AlertCircle, ShieldAlert } from 'lucide-react';
import { verifyUserPin, resetPinLocalOnly } from '../services/pinService';
import { isValidPinFormat } from '../services/pinPolicy';
import ActionButton from './common/ActionButton';

type Props = {
  onUnlocked: () => void;
  onRequireStrongLogin: () => void;
};

export function PinUnlock({ onUnlocked, onRequireStrongLogin }: Props) {
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pinDigits = useMemo(() => pin.split(''), [pin]);
  const canSubmit = useMemo(() => isValidPinFormat(pin) && !busy, [pin, busy]);

  // Foco inicial garantido com pequeno delay para mobile
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  async function handleUnlock() {
    if (pin.length < 4) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await verifyUserPin(pin);
      if (res.ok) {
        onUnlocked();
        return;
      }
      if (res.ok === false) {
        if ('reason' in res) {
          if (res.reason === 'locked' && 'remainingMs' in res) {
            setMsg(`Muitas tentativas. Bloqueado por ${Math.ceil(res.remainingMs / 1000)}s.`);
            setPin('');
            return;
          }
          if (res.reason === 'invalid') {
            setMsg('PIN incorreto.');
            setPin('');
            // Pequeno delay para forçar refoco caso o teclado tenha fechado
            setTimeout(() => inputRef.current?.focus(), 100);
            return;
          }
        }
      }
      setMsg('Falha ao validar PIN.');
    } catch (err: any) {
      setMsg(err.message || 'Erro inesperado.');
    } finally {
      setBusy(false);
    }
  }

  // Auto-envio ao completar 4 dígitos
  useEffect(() => {
    if (pin.length === 4 && !busy) {
      handleUnlock();
    }
  }, [pin]);

  function handleForgot() {
    resetPinLocalOnly();
    onRequireStrongLogin();
  }

  return (
    <div className="w-full max-w-sm glass-card rounded-[3rem] p-10 border-white/5 shadow-2xl animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
      <div className="text-center space-y-4 mb-8">
        <div className="w-16 h-16 bg-pink/10 rounded-[1.5rem] flex items-center justify-center mx-auto text-pink shadow-[0_0_20px_rgba(255,20,147,0.15)]">
          <Lock size={32} />
        </div>
        <div className="space-y-1">
          <h2 className="text-white font-black text-xs uppercase tracking-[0.3em]">Acesso Bloqueado</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Insira seu PIN para continuar</p>
        </div>
      </div>

      <div className="space-y-8">
        <div 
          className="space-y-4 relative h-16 cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="flex justify-between gap-3 px-2">
            {[0, 1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`flex-1 aspect-square bg-slate-900/60 border rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  pin.length === i ? 'border-pink ring-2 ring-pink/20 scale-105' : 
                  pinDigits[i] ? 'border-pink/50 scale-105' : 'border-white/5'
                }`}
              >
                {pinDigits[i] ? (
                  <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white] animate-in zoom-in" />
                ) : null}
              </div>
            ))}
          </div>
          <input
            ref={inputRef}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            type="password"
            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer caret-transparent"
            style={{ fontSize: '16px' }}
          />
        </div>

        {msg && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
            <AlertCircle size={18} className="text-rose-500 shrink-0" />
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">{msg}</p>
          </div>
        )}

        <div className="space-y-4 pt-4">
          <ActionButton
            label="Desbloquear"
            onClick={handleUnlock}
            disabled={!canSubmit}
            loading={busy}
            icon={<Unlock size={20} />}
          />

          <button
            onClick={handleForgot}
            className="w-full py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <ShieldAlert size={14} />
            Esqueci meu PIN
          </button>
        </div>
      </div>

      <p className="text-[9px] text-slate-700 text-center mt-8 font-black uppercase tracking-[0.2em]">
        Libido Security Layer 2.0
      </p>
    </div>
  );
}
