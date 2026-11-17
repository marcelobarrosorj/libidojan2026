import React from 'react';

export default function DeleteMessageModal({ isOpen, onClose, onDeleteForMe, onDeleteForEveryone }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-white space-y-4">
        
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-wide text-neutral-100">
            Gerenciar Mensagem
          </h3>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-neutral-400">
          O que deseja fazer com esta mensagem?
        </p>

        <div className="space-y-2 pt-2">
          <button
            onClick={() => { onDeleteForMe(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-neutral-800/60 hover:bg-neutral-800 text-neutral-200 rounded-xl font-medium transition-all border border-neutral-700/50 hover:border-neutral-600 text-left"
          >
            <span className="text-lg">🗑️</span>
            <div>
              <div className="text-sm font-semibold">Apagar para mim</div>
              <div className="text-xs text-neutral-400">A mensagem some apenas da sua visualização</div>
            </div>
          </button>

          <button
            onClick={() => { onDeleteForEveryone(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition-all border border-red-500/20 text-left"
          >
            <span className="text-lg">🚫</span>
            <div>
              <div className="text-sm font-semibold">Apagar para todos</div>
              <div className="text-xs text-red-400/70">Remove a mensagem para ambos os participantes</div>
            </div>
          </button>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 bg-transparent hover:bg-neutral-800/40 text-neutral-400 hover:text-white font-medium rounded-xl transition-all text-sm"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}