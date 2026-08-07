const fs = require('fs');
const path = 'src/components/PixCheckout.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
`import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';`,
`import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { isValidCPF, normalizeCPF } from '../utils/cpf';

function applyCpfMask(value: string) {
  const v = value.replace(/\\D/g, '').slice(0, 11);
  if (v.length <= 3) return v;
  if (v.length <= 6) return \`\${v.slice(0, 3)}.\${v.slice(3)}\`;
  if (v.length <= 9) return \`\${v.slice(0, 3)}.\${v.slice(3, 6)}.\${v.slice(6)}\`;
  return \`\${v.slice(0, 3)}.\${v.slice(3, 6)}.\${v.slice(6, 9)}-\${v.slice(9)}\`;
}`
);

// We need to change how the initial fetch happens. It should only happen when user submits CPF.
code = code.replace(
`  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && !pixData && !loading && !errorMsg) {
      const fetchPix = async () => {
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
              'Authorization': \`Bearer \${session.data.session.access_token}\`
            }
          });
          
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Erro ao gerar cobrança.');
          }
          const data = await res.json();
          setPixData(data);
        } catch (error: any) {
          console.error("Falha ao gerar PIX do backend:", error);
          setErrorMsg(error.message || 'Falha temporária. Tente novamente mais tarde.');
        } finally {
          setLoading(false);
        }
      };
      fetchPix();
    }
  }, [isOpen, pixData, loading, errorMsg]);`,
`  const [errorMsg, setErrorMsg] = useState('');
  const [cpf, setCpf] = useState('');
  const [isCpfValid, setIsCpfValid] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCpf('');
      setErrorMsg('');
      setPixData(null);
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
          'Authorization': \`Bearer \${session.data.session.access_token}\`
        },
        body: JSON.stringify({ customerTaxId: normalizeCPF(cpf) })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao gerar cobrança.');
      }
      const data = await res.json();
      setPixData(data);
      setCpf('');
    } catch (error: any) {
      console.error("Falha ao gerar PIX do backend:", error);
      setErrorMsg(error.message || 'Falha temporária. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };`
);

code = code.replace(
`  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-ig-card border border-ig-border rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative"
        >
          {/* Close Button */}
          <button onClick={onClose} className="absolute top-4 right-4 text-ig-secondary hover:text-white bg-ig-bg/50 p-2 rounded-full transition-colors z-10">
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 relative">
            <div className="text-center mb-6 mt-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-[#ffb300] to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Ative o Premium</h2>
              <p className="text-[#888] text-sm">
                Desbloqueie todo o poder do app
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#ffb300]" />
              </div>
            ) : errorMsg ? (
              <div className="text-center py-8">
                <p className="text-red-500 font-bold mb-4">{errorMsg}</p>
                <button 
                  onClick={() => { setErrorMsg(''); setPixData(null); }}
                  className="bg-white/10 px-6 py-2 rounded-xl text-white text-sm"
                >
                  Tentar novamente
                </button>
              </div>
            ) : pixData ? (`,
`  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-ig-card border border-ig-border rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative"
        >
          {/* Close Button */}
          <button onClick={onClose} className="absolute top-4 right-4 text-ig-secondary hover:text-white bg-ig-bg/50 p-2 rounded-full transition-colors z-10">
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 relative">
            <div className="text-center mb-6 mt-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-[#ffb300] to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Ative o Premium</h2>
              <p className="text-[#888] text-sm">
                Desbloqueie todo o poder do app
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#ffb300]" />
              </div>
            ) : errorMsg ? (
              <div className="text-center py-8">
                <p className="text-red-500 font-bold mb-4">{errorMsg}</p>
                <button 
                  onClick={() => { setErrorMsg(''); setPixData(null); }}
                  className="bg-white/10 px-6 py-2 rounded-xl text-white text-sm"
                >
                  Tentar novamente
                </button>
              </div>
            ) : !pixData ? (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">CPF do titular</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCpfChange}
                    className="w-full bg-black/50 border border-ig-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ffb300] transition-colors"
                  />
                  <p className="text-xs text-[#888] mt-2">Usado somente para processar o pagamento com segurança.</p>
                  {cpf.length > 13 && !isCpfValid && (
                    <p className="text-xs text-red-500 mt-1">CPF inválido</p>
                  )}
                </div>
                <button
                  onClick={handleGeneratePix}
                  disabled={!isCpfValid}
                  className="w-full bg-[#ffb300] text-black font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-500 transition-colors"
                >
                  Gerar Pix
                </button>
              </div>
            ) : pixData ? (`
);

fs.writeFileSync(path, code);
