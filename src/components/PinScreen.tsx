import React, { useState, useRef, useEffect } from 'react';
import { Shield, Lock } from 'lucide-react';
import { supabase } from '../services/supabase';

interface PinScreenProps {
  userId: string;
  mode: 'create' | 'verify';
  onSuccess: () => void;
}

export function PinScreen({ userId, mode, onSuccess }: PinScreenProps) {
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const confirmRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => {
    setTimeout(() => inputRefs[0].current?.focus(), 300);
  }, []);

  useEffect(() => {
    if (step === 'confirm') {
      setTimeout(() => confirmRefs[0].current?.focus(), 100);
    }
  }, [step]);

  const handleDigit = (index: number, value: string, isConfirm: boolean) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);

    if (isConfirm) {
      const newPin = [...confirmPin];
      newPin[index] = digit;
      setConfirmPin(newPin);
      setError('');

      if (digit && index < 3) {
        confirmRefs[index + 1].current?.focus();
      }

      if (digit && index === 3) {
        const fullConfirm = newPin.join('');
        const fullPin = pin.join('');

        if (mode === 'create') {
          if (fullConfirm === fullPin) {
            savePin(fullPin);
          } else {
            setError('Os PINs não coincidem. Tente novamente.');
            setConfirmPin(['', '', '', '']);
            setTimeout(() => confirmRefs[0].current?.focus(), 300);
          }
        } else {
          verifyPin(fullConfirm);
        }
      }
    } else {
      const newPin = [...pin];
      newPin[index] = digit;
      setPin(newPin);
      setError('');

      if (digit && index < 3) {
        inputRefs[index + 1].current?.focus();
      }

      if (digit && index === 3) {
        if (mode === 'create') {
          setTimeout(() => setStep('confirm'), 200);
        } else {
          verifyPin(newPin.join(''));
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent, isConfirm: boolean) => {
    if (e.key === 'Backspace') {
      const currentPin = isConfirm ? confirmPin : pin;
      const setter = isConfirm ? setConfirmPin : setPin;
      const refs = isConfirm ? confirmRefs : inputRefs;

      if (currentPin[index] === '' && index > 0) {
        refs[index - 1].current?.focus();
        const newPin = [...currentPin];
        newPin[index - 1] = '';
        setter(newPin);
      } else {
        const newPin = [...currentPin];
        newPin[index] = '';
        setter(newPin);
      }
    }
  };

  const savePin = async (pinCode: string) => {
    try {
      const { error: dbError } = await supabase
        .from('users')
        .update({ pin: pinCode })
        .eq('user_id', userId);

      if (dbError) throw dbError;
      onSuccess();
    } catch (err: any) {
      setError('Erro ao salvar PIN: ' + err.message);
    }
  };

  const verifyPin = async (pinCode: string) => {
    try {
      const { data, error: dbError } = await supabase
        .from('users')
        .select('pin')
        .eq('user_id', userId)
        .maybeSingle();

      if (dbError) throw dbError;

      if (data && data.pin === pinCode) {
        onSuccess();
      } else {
        setError('PIN incorreto. Tente novamente.');
        setPin(['', '', '', '']);
        setTimeout(() => inputRefs[0].current?.focus(), 300);
      }
    } catch (err: any) {
      setError('Erro ao verificar: ' + err.message);
    }
  };

  const renderPinBoxes = (values: string[], refs: React.RefObject<HTMLInputElement | null>[], isConfirm: boolean) => (
    <div className="flex gap-4 justify-center">
      {values.map((digit, idx) => (
        <input
          key={idx}
          ref={refs[idx]}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleDigit(idx, e.target.value, isConfirm)}
          onKeyDown={e => handleKeyDown(idx, e, isConfirm)}
          className={`w-16 h-20 text-center text-3xl font-black bg-[var(--libido-surface-2)] border-2 rounded-2xl focus:outline-none transition-all text-[var(--libido-text)] caret-transparent ${
            digit ? 'border-[var(--libido-accent)] shadow-[0_0_15px_rgba(255,179,0,0.15)]' : 'border-[var(--libido-border)] focus:border-[var(--libido-accent)]/50'
          }`}
          style={{ WebkitTextSecurity: 'disc' } as any}
        />
      ))}
    </div>
  );

  const isCreateMode = mode === 'create';
  const title = isCreateMode
    ? (step === 'enter' ? 'Crie seu PIN' : 'Confirme o PIN')
    : 'Digite seu PIN';
  const subtitle = isCreateMode
    ? (step === 'enter' ? 'Escolha 4 dígitos para proteger sua conta' : 'Digite novamente para confirmar')
    : 'Insira seu PIN de 4 dígitos para acessar';

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 bg-[var(--libido-bg)] text-[var(--libido-text)] min-h-screen">
      <div className="w-full max-w-xs flex flex-col items-center gap-6">
        <div className="w-20 h-20 bg-[var(--libido-accent)]/10 rounded-[1.8rem] flex items-center justify-center border border-[var(--libido-accent)]/20 shadow-[0_0_30px_rgba(255,179,0,0.1)] mb-2">
          {isCreateMode ? <Shield size={36} className="text-[var(--libido-accent)]" /> : <Lock size={36} className="text-[var(--libido-accent)]" />}
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-fraunces font-medium uppercase tracking-wider italic font-fraunces font-medium">{title}</h1>
          <p className="text-xs text-[var(--libido-muted)] opacity-60 mt-2 font-semibold">{subtitle}</p>
        </div>

        {step === 'enter' && renderPinBoxes(pin, inputRefs, false)}
        {step === 'confirm' && renderPinBoxes(confirmPin, confirmRefs, true)}

        {error && (
          <p className="text-red-400 text-[10px] font-black uppercase tracking-wider bg-red-500/10 py-3 px-4 rounded-2xl border border-red-500/20 text-center w-full">{error}</p>
        )}

        {step === 'confirm' && isCreateMode && (
          <button
            onClick={() => { setStep('enter'); setPin(['', '', '', '']); setConfirmPin(['', '', '', '']); }}
            className="text-[10px] text-[var(--libido-muted)] opacity-50 hover:text-[var(--libido-text)] font-bold uppercase tracking-widest"
          >
            Voltar e redefinir
          </button>
        )}
      </div>
    </div>
  );
}
