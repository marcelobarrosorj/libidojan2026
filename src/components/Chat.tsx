import React, { useState } from 'react';
import DeleteMessageModal from './DeleteMessageModal';

export function Chat() {
  const [mensagens, setMensagens] = useState([
    { id: 1, texto: 'Olá! Tudo bem?', remetente: 'eu' },
    { id: 2, texto: 'Tudo ótimo por aqui e com você?', remetente: 'outro' }
  ]);
  const [selecionadas, setSelecionadas] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleSelecao = (id: number) => {
    if (selecionadas.includes(id)) {
      setSelecionadas(selecionadas.filter(item => item !== id));
    } else {
      setSelecionadas([...selecionadas, id]);
    }
  };

  const apagarParaMim = () => {
    setMensagens(mensagens.filter(m => !selecionadas.includes(m.id)));
    setSelecionadas([]);
    setIsModalOpen(false);
  };

  const apagarParaTodos = () => {
    setMensagens(mensagens.filter(m => !selecionadas.includes(m.id)));
    setSelecionadas([]);
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white p-4 max-w-md mx-auto relative">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-neutral-800">
        <h2 className="font-bold text-lg text-neutral-100">Chat Libido App</h2>
        {selecionadas.length > 0 && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-red-500/30 transition-all flex items-center gap-1.5"
          >
            🗑️ Excluir ({selecionadas.length})
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-20">
        {mensagens.map((msg) => {
          const estaSelecionada = selecionadas.includes(msg.id);
          return (
            <div 
              key={msg.id} 
              className={`flex items-center gap-3 p-3 rounded-2xl transition-all border ${
                estaSelecionada ? 'bg-neutral-800/80 border-neutral-600' : 'bg-neutral-900/50 border-neutral-800/50'
              }`}
            >
              <input 
                type="checkbox"
                checked={estaSelecionada}
                onChange={() => toggleSelecao(msg.id)}
                className="w-4 h-4 accent-red-500 rounded cursor-pointer"
              />
              <div className="flex-1">
                <p className="text-sm text-neutral-200">{msg.texto}</p>
                <span className="text-[10px] text-neutral-500 uppercase">{msg.remetente}</span>
              </div>
            </div>
          );
        })}
      </div>

      <DeleteMessageModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDeleteForMe={apagarParaMim}
        onDeleteForEveryone={apagarParaTodos}
      />
    </div>
  );
}