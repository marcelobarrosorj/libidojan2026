import React, { useState, useEffect } from 'react';
import DeleteMessageModal from './DeleteMessageModal';

export function Chat() {
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [selecionadas, setSelecionadas] = useState<(string | number)[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('libido_chat_msgs');
      if (saved) {
        setMensagens(JSON.parse(saved));
      } else {
        setMensagens([
          { id: Date.now() - 10000, texto: 'Bem-vindo ao chat do Libido App!', remetente: 'Sistema' },
          { id: Date.now(), texto: 'Envie sua primeira mensagem.', remetente: 'Sistema' }
        ]);
      }
    } catch (e) {
      setMensagens([]);
    }
  }, []);

  const salvarMensagens = (novas: any[]) => {
    setMensagens(novas);
    try {
      localStorage.setItem('libido_chat_msgs', JSON.stringify(novas));
    } catch (e) {}
  };

  const enviarMensagem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim()) return;

    const nova = {
      id: Date.now(),
      texto: novaMensagem,
      remetente: 'Você'
    };

    const atualizadas = [...mensagens, nova];
    salvarMensagens(atualizadas);
    setNovaMensagem('');
  };

  const toggleSelecao = (id: number) => {
    if (selecionadas.some(x => String(x) === String(id))) {
      setSelecionadas(selecionadas.filter(item => item !== id));
    } else {
      setSelecionadas([...selecionadas, id]);
    }
  };

  const apagarParaMim = () => {
    const filtradas = mensagens.filter(m => !selecionadas.includes(m.id));
    salvarMensagens(filtradas);
    setSelecionadas([]);
    setIsModalOpen(false);
  };

  const apagarParaTodos = () => {
    const filtradas = mensagens.filter(m => !selecionadas.includes(m.id));
    salvarMensagens(filtradas);
    setSelecionadas([]);
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white p-4 max-w-md mx-auto relative justify-between">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-neutral-800">
        <div>
          <h2 className="font-bold text-base text-neutral-100">Chat Libido App</h2>
          <span className="text-xs text-neutral-400">Mensagens seguras</span>
        </div>
        {selecionadas.length > 0 && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-red-500/30 transition-all flex items-center gap-1.5 shadow-lg animate-pulse"
          >
            🗑️ Excluir ({selecionadas.length})
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4">
        {mensagens.length === 0 ? (
          <div className="text-center text-neutral-500 mt-20 text-sm">
            Nenhuma mensagem no momento. Comece a conversar abaixo!
          </div>
        ) : (
          mensagens.map((msg) => {
            const estaSelecionada = selecionadas.includes(msg.id);
            return (
              <div 
                key={msg.id} 
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all border ${
                  estaSelecionada ? 'bg-neutral-800/90 border-red-500/50 shadow-md' : 'bg-neutral-900/60 border-neutral-800/50 hover:border-neutral-700'
                }`}
              >
                <input 
                  type="checkbox"
                  checked={estaSelecionada}
                  onChange={() => toggleSelecao(msg.id)}
                  className="w-4 h-4 accent-red-500 rounded cursor-pointer"
                />
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm text-neutral-200 break-words">{msg.texto}</p>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider">{msg.remetente}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={enviarMensagem} className="mt-2 pt-2 border-t border-neutral-800 flex gap-2">
        <input 
          type="text"
          value={novaMensagem}
          onChange={(e) => setNovaMensagem(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-600"
        />
        <button 
          type="submit"
          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border border-neutral-700"
        >
          Enviar
        </button>
      </form>

      {isModalOpen && (
        <DeleteMessageModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onDeleteForMe={apagarParaMim}
          onDeleteForEveryone={apagarParaTodos}
        />
      )}
    </div>
  );
}

export default Chat;