
import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Lock, Eye, Scale, X } from 'lucide-react';
import LibidoIcon from './common/LibidoIcon';

type Props = {
  privacyUrl: string;
  termsUrl: string;
  onExit: () => void;
  onAccept: () => void;
};

export function TermsGate({ privacyUrl, termsUrl, onExit, onAccept }: Props) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center p-6 overflow-y-auto">
      {/* Background Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-96 h-96 bg-pink/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-lg glass-card rounded-[3.5rem] border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] p-8 md:p-12 space-y-8 animate-in zoom-in-95 duration-500">
        <div className="text-center space-y-4">
          <LibidoIcon size={64} glow className="mx-auto" />
          <div className="space-y-1">
            <h2 className="text-3xl font-black font-outfit text-white uppercase italic tracking-tighter leading-none">Acesso Restrito</h2>
            <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.4em]">Protocolo de Segurança Libido</p>
          </div>
        </div>

        <div className="space-y-6 text-slate-400">
          <div className="bg-amber-500/5 border-l-4 border-amber-500 p-5 rounded-r-3xl space-y-2">
            <h4 className="text-[11px] font-black text-white uppercase flex items-center gap-2">
              <ShieldAlert size={16} className="text-amber-500" /> Declaração de Maioridade
            </h4>
            <p className="text-[11px] font-medium leading-relaxed italic">
              Este ecossistema é destinado exclusivamente a adultos (18+). Ao prosseguir, você assume total responsabilidade legal sobre sua identidade.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <section className="space-y-2 px-2">
              <h3 className="font-black text-white uppercase text-[10px] tracking-widest flex items-center gap-2">
                <Eye size={12} className="text-pink" /> Privacidade & LGPD
              </h3>
              <p className="text-[10px] leading-relaxed">
                Operamos sob a Lei Geral de Proteção de Dados (13.709/18). Seus dados biométricos e conversas são criptografados. Nunca vendemos informações a terceiros.
              </p>
            </section>

            <section className="space-y-2 px-2">
              <h3 className="font-black text-white uppercase text-[10px] tracking-widest flex items-center gap-2">
                <Scale size={12} className="text-pink" /> Ética da Rede
              </h3>
              <ul className="text-[10px] space-y-1 font-bold list-none">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-pink rounded-full" /> Tolerância zero para assédio ou abusos.</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-pink rounded-full" /> Proibida captura de tela (Antiprint Ativo).</li>
              </ul>
            </section>
          </div>

          <p className="text-[9px] font-medium text-center border-t border-white/5 pt-4">
            Consulte nossos 
            <a href={termsUrl} target="_blank" rel="noreferrer" className="text-amber-500 font-black mx-1 hover:underline">Termos de Uso</a> 
            e 
            <a href={privacyUrl} target="_blank" rel="noreferrer" className="text-amber-500 font-black mx-1 hover:underline">Política de Privacidade</a>.
          </p>
        </div>

        <div className="pt-2">
          <label className="flex items-start gap-4 cursor-pointer group bg-white/5 p-4 rounded-3xl border border-white/5 hover:border-white/10 transition-all">
            <div className="relative flex items-center mt-0.5">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="peer h-6 w-6 cursor-pointer appearance-none rounded-xl border-2 border-white/10 checked:bg-amber-500 checked:border-amber-500 transition-all"
              />
              <CheckCircle2 className="absolute text-black h-4 w-4 left-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <span className="text-[10px] text-slate-400 font-black group-hover:text-white transition-colors uppercase tracking-widest leading-relaxed">
              Confirmo 18 anos+, aceito as regras da Matriz Libido e a política de tratamento de dados.
            </span>
          </label>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onExit}
            className="flex-1 py-5 rounded-[2rem] border border-white/5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all active:scale-95"
          >
            Sair
          </button>
          <button
            onClick={() => { if (checked) onAccept(); }}
            disabled={!checked}
            className={`flex-[2] py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest text-black transition-all active:scale-95 flex items-center justify-center gap-2 ${
              checked 
                ? 'bg-amber-500 shadow-xl shadow-amber-500/20' 
                : 'bg-slate-800 cursor-not-allowed text-slate-500'
            }`}
          >
            Entrar <Lock size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
