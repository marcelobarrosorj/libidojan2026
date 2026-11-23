import React from 'react';
import { Trash2, Ban, X } from 'lucide-react';

export default function DeleteMessageModal({ isOpen, onClose, onDeleteForMe, onDeleteForEveryone, count = 1 }) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-neutral-950/95 border border-white/10 rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.85)] overflow-hidden p-6 text-white space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <Trash2 size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-neutral-100">
                Apagar {count > 1 ? `${count} mensagens` : 'mensagem'}
              </h3>
              <p className="text-[11px] text-neutral-400">Escolha como deseja remover</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => { onDeleteForMe(); onClose(); }}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-100 rounded-2xl font-medium transition-all border border-white/10 hover:border-white/20 text-left active:scale-[0.98]"
          >
            <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300 shrink-0">
              <Trash2 size={16} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide">Apagar para mim</div>
              <div className="text-[11px] text-neutral-400">Remove apenas da sua conversa</div>
            </div>
          </button>

          <button
            onClick={() => { onDeleteForEveryone(); onClose(); }}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 bg-gradient-to-r from-red-600/20 to-rose-600/15 hover:from-red-600/30 hover:to-rose-600/25 text-red-300 rounded-2xl font-medium transition-all border border-red-500/30 text-left active:scale-[0.98]"
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 shrink-0">
              <Ban size={16} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-red-300">Apagar para todos</div>
              <div className="text-[11px] text-red-300/70">Remove para ambos os participantes</div>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-transparent hover:bg-white/5 text-neutral-400 hover:text-white font-semibold rounded-2xl transition-all text-xs uppercase tracking-widest"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}