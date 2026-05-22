import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Lock, Unlock, AlertCircle, ShieldAlert, Fingerprint, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LibidoIcon from './common/LibidoIcon';
import { verifyUserPin, resetPinLocalOnly, isPinConfigured, setUnlockedWindow } from '../services/pinService';
import { isValidPinFormat } from '../services/pinPolicy';
import ActionButton from './common/ActionButton';
import { webAuthnService } from '../services/webAuthnService';
import { soundService } from '../services/soundService';

type Props = {
  onUnlocked: () => void;
  onRequireStrongLogin: () => void;
};

export function PinUnlock({ onUnlocked, onRequireStrongLogin }: Props) {
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Biometrics States
  const isBiometricsConfigured = useMemo(() => webAuthnService.isConfigured(), []);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const scanIntervalRef = useRef<any>(null);

  const pinDigits = useMemo(() => pin.split(''), [pin]);
  const canSubmit = useMemo(() => isValidPinFormat(pin) && !busy, [pin, busy]);

  useEffect(() => {
    // Se não houver PIN configurado, força login forte/redefinição
    if (!isPinConfigured()) {
      onRequireStrongLogin();
    } else {
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      
      // Auto-trigger biometrics on mount if configured
      if (isBiometricsConfigured) {
        setTimeout(() => {
          handleBiometricAuth();
        }, 600);
      }

      return () => clearTimeout(t);
    }
  }, []);

  async function handleBiometricAuth() {
    setMsg(null);
    try {
      const res = await webAuthnService.authenticateBiometrics();
      if (res.success) {
        if (res.mode === 'visual_fallback') {
          // Open the beautiful animated fall-back scanner for iframe context
          setIsScanning(true);
          setScanProgress(0);
          setScanSuccess(false);
          if (typeof soundService?.play === 'function') soundService.play('TAP');
        } else {
          // Real system biometrics succeeded!
          if (typeof soundService?.play === 'function') soundService.play('MATCH');
          setUnlockedWindow();
          onUnlocked();
        }
      }
    } catch (err: any) {
      setMsg(err.message || 'Falha na autenticação biométrica.');
    }
  }

  // Handle visual scanner holding state
  useEffect(() => {
    if (isHolding && !scanSuccess) {
      scanIntervalRef.current = setInterval(() => {
        setScanProgress(prev => {
          const next = prev + 3;
          if (next >= 100) {
            clearInterval(scanIntervalRef.current);
            handleBiometricsSuccess();
            return 100;
          }
          // Soft ticks during scan
          if (next % 15 === 0 && typeof soundService?.play === 'function') {
            soundService.play('TAP');
          }
          return next;
        });
      }, 30);
    } else {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      if (!scanSuccess) {
        setScanProgress(0);
      }
    }

    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [isHolding, scanSuccess]);

  const handleBiometricsSuccess = () => {
    setScanSuccess(true);
    setIsHolding(false);
    if (typeof soundService?.play === 'function') {
      soundService.play('MATCH');
    }
    setUnlockedWindow();
    setTimeout(() => {
      setIsScanning(false);
      onUnlocked();
    }, 1200);
  };

  async function handleUnlock() {
    if (pin.length < 4) return;
    
    // Explicit numeric check
    if (!isValidPinFormat(pin)) {
      setMsg('O PIN deve conter exatamente 4 dígitos numéricos.');
      setPin('');
      return;
    }

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
            setTimeout(() => inputRef.current?.focus(), 100);
            return;
          }
          if (res.reason === 'not_configured') {
            setMsg('PIN não configurado. Redefina o seu PIN.');
            setTimeout(onRequireStrongLogin, 2000);
            return;
          }
          if (res.reason === 'error' && 'message' in res) {
            setMsg(res.message);
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
    <div className="w-full max-w-sm glass-card rounded-[3rem] p-10 border-amber-500/10 shadow-2xl animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden min-h-[460px] flex flex-col justify-between">
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-between p-8"
          >
            <div className="text-center space-y-2 mt-4">
              <h3 className="text-amber-500 font-black text-xs uppercase tracking-[0.3em] italic">Biometria NoFake</h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Leitor biométrico de alta segurança</p>
            </div>

            <div className="flex flex-col items-center justify-center space-y-6 my-auto">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* Circular pulsing scanner rings */}
                <span className="absolute inset-0 rounded-full border border-amber-500/10 animate-ping" />
                <span className="absolute inset-2 rounded-full border border-amber-500/20" />
                <div className={`absolute inset-4 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                  scanSuccess ? 'border-emerald-500 bg-emerald-500/10' : 
                  isHolding ? 'border-amber-500 scale-105 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-amber-500/30 bg-slate-900/40'
                }`}>
                  <button
                    onMouseDown={() => setIsHolding(true)}
                    onMouseUp={() => setIsHolding(false)}
                    onMouseLeave={() => setIsHolding(false)}
                    onTouchStart={() => setIsHolding(true)}
                    onTouchEnd={() => setIsHolding(false)}
                    className="w-full h-full rounded-full flex items-center justify-center outline-none select-none cursor-pointer"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {scanSuccess ? (
                      <ShieldCheck size={48} className="text-emerald-500 animate-bounce" />
                    ) : (
                      <Fingerprint size={48} className={`transition-all duration-300 ${
                        isHolding ? 'text-amber-500 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'text-amber-500/40'
                      }`} />
                    )}
                  </button>
                </div>

                {/* Vertical Laser Scan Line */}
                {isHolding && !scanSuccess && (
                  <motion.div 
                    initial={{ top: '10%' }}
                    animate={{ top: '90%' }}
                    transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.2, ease: 'easeInOut' }}
                    className="absolute left-8 right-8 h-0.5 bg-amber-500 shadow-[0_0_10px_#f59e0b] z-10 pointer-events-none"
                  />
                )}
              </div>

              {/* Progress Bar & Instructions */}
              <div className="w-full max-w-[200px] text-center space-y-2">
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-75 ${scanSuccess ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {scanSuccess ? 'Desbloqueado' : isHolding ? `Escaneando... ${Math.round(scanProgress)}%` : 'Toque e segure o sensor'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsScanning(false)}
              className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors mb-2"
            >
              Cancelar e usar PIN
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col justify-between h-full space-y-8">
        <div>
          <div className="text-center space-y-4 mb-8 flex flex-col items-center">
            <LibidoIcon size={48} className="mb-2" />
            <div className="space-y-1">
              <h2 className="text-white font-black text-xs uppercase tracking-[0.3em]">Acesso Bloqueado</h2>
              <p className="text-[10px] text-amber-500/70 font-bold uppercase tracking-widest">Insira seu PIN para continuar</p>
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
                      pin.length === i ? 'border-amber-500 ring-2 ring-amber-500/20 scale-105 shadow-lg shadow-amber-500/10' : 
                      pinDigits[i] ? 'border-amber-500/50 scale-105' : 'border-amber-500/10'
                    }`}
                  >
                    {pinDigits[i] ? (
                      <div className="w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_100px_rgba(245,158,11,0.4)] animate-in zoom-in" />
                    ) : null}
                  </div>
                ))}
              </div>
              <input
                ref={inputRef}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPin(val);
                }}
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
                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider leading-tight">{msg}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <ActionButton
            label="Desbloquear"
            onClick={handleUnlock}
            disabled={!canSubmit}
            loading={busy}
            variant="amber"
            icon={<Unlock size={18} />}
          />

          {isBiometricsConfigured && (
            <button
              onClick={handleBiometricAuth}
              className="w-full h-11 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 rounded-2xl text-[10px] font-black text-amber-500 uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <Fingerprint size={16} />
              Acessar via Biometria
            </button>
          )}

          <button
            onClick={handleForgot}
            className="w-full py-2 text-[10px] font-black text-amber-500/60 uppercase tracking-widest hover:text-amber-400 transition-colors flex items-center justify-center gap-2"
          >
            <ShieldAlert size={14} />
            Esqueci meu PIN
          </button>
        </div>
      </div>

      <p className="text-[9px] text-slate-800 text-center mt-6 font-black uppercase tracking-[0.2em] pointer-events-none select-none">
        Libido Security Layer 2.2
      </p>
    </div>
  );
}
