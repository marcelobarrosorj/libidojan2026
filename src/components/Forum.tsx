import { supabase } from '../services/supabase';
import { useState, useEffect } from 'react';
import { ChevronRight, Plus, Send } from 'lucide-react';

interface ForumProps {
  isPremium?: boolean;
  onShowPremiumModal?: () => void;
  userId?: string;
}

interface Thread {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

interface Reply {
  id: string;
  content: string;
  created_at: string;
}

export function Forum({ isPremium, onShowPremiumModal, userId }: ForumProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [threadAberta, setThreadAberta] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [novaResposta, setNovaResposta] = useState('');
  const [enviando, setEnviando] = useState(false);

  const carregarThreads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('forum_threads')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setThreads(data);
      else setThreads([]);
    } catch {
      setThreads([]);
    }
    setLoading(false);
  };

  useEffect(() => { carregarThreads(); }, []);

  const criarTopico = async () => {
    if (!novoTitulo.trim() || !userId || salvando) return;
    setSalvando(true);
    const { error } = await supabase
      .from('forum_threads')
      .insert({ user_id: userId, title: novoTitulo.trim() });
    if (!error) {
      setNovoTitulo('');
      setShowForm(false);
      await carregarThreads();
    }
    setSalvando(false);
  };

  const abrirThread = async (t: Thread) => {
    setThreadAberta(t);
    setReplies([]);
    const { data } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('thread_id', t.id)
      .order('created_at', { ascending: true });
    if (data) setReplies(data);
  };

  const responder = async () => {
    if (!novaResposta.trim() || !userId || !threadAberta || enviando) return;
    setEnviando(true);
    const { error } = await supabase
      .from('forum_posts')
      .insert({ thread_id: threadAberta.id, user_id: userId, content: novaResposta.trim() });
    if (!error) {
      setNovaResposta('');
      await abrirThread(threadAberta);
    }
    setEnviando(false);
  };

  return (
    <div className="flex-1 flex flex-col p-5 bg-[var(--libido-bg)] text-[var(--libido-text)] overflow-y-auto no-scrollbar min-h-0 gap-4">
      {threadAberta ? (
        <>
          <div className="flex items-center gap-3">
            <button onClick={() => setThreadAberta(null)} className="w-9 h-9 rounded-xl border border-[var(--libido-border)] flex items-center justify-center hover:bg-white/5">
              <ChevronRight size={16} className="rotate-180" />
            </button>
            <h1 className="text-sm font-black uppercase tracking-wider truncate flex-1">{threadAberta.title}</h1>
          </div>
          <div className="space-y-2">
            {replies.length === 0 && (
              <p className="text-[var(--libido-muted)] text-xs opacity-60 py-4 text-center">Nenhuma resposta ainda. Seja o primeiro!</p>
            )}
            {replies.map(r => (
              <div key={r.id} className="bg-[var(--libido-surface-2)]/60 border border-[var(--libido-border)] rounded-2xl p-3">
                <p className="text-xs text-[var(--libido-text)]">{r.content}</p>
                <p className="text-[9px] text-[var(--libido-muted)] opacity-50 mt-1">{new Date(r.created_at).toLocaleString('pt-BR')}</p>
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-center gap-2 pt-2">
            <input
              value={novaResposta}
              onChange={e => setNovaResposta(e.target.value)}
              placeholder="Escreva sua resposta..."
              className="flex-1 bg-[var(--libido-surface-2)]/60 border border-[var(--libido-border)] rounded-xl px-3 py-2 text-xs text-[var(--libido-text)] outline-none focus:border-[var(--libido-accent)]"
            />
            <button onClick={responder} disabled={enviando || !novaResposta.trim()} className="w-10 h-10 bg-[var(--libido-accent)] rounded-xl flex items-center justify-center text-black disabled:opacity-40">
              <Send size={16} />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black uppercase tracking-wider italic font-fraunces font-medium">Fórum</h1>
              <p className="text-[9px] text-[var(--libido-muted)] opacity-50 font-bold uppercase tracking-widest mt-0.5">Discussões da Matriz</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="w-10 h-10 bg-[var(--libido-accent)] rounded-xl flex items-center justify-center text-black hover:opacity-90 shadow-lg shadow-[var(--libido-accent)]/10">
              <Plus size={16} />
            </button>
          </div>
          {showForm && (
            <div className="bg-[var(--libido-surface-2)]/60 border border-[var(--libido-border)] rounded-2xl p-3 flex flex-col gap-2">
              <input
                value={novoTitulo}
                onChange={e => setNovoTitulo(e.target.value)}
                placeholder="Titulo do topico..."
                className="bg-[var(--libido-bg)] border border-[var(--libido-border)] rounded-xl px-3 py-2 text-xs text-[var(--libido-text)] outline-none focus:border-[var(--libido-accent)]"
              />
              <button onClick={criarTopico} disabled={salvando || !novoTitulo.trim()} className="bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-black font-black text-[10px] px-4 py-2 rounded-xl uppercase tracking-widest disabled:opacity-40">
                {salvando ? 'Criando...' : 'Criar topico'}
              </button>
            </div>
          )}
          <div className="space-y-2">
            {loading && <p className="text-[var(--libido-muted)] text-xs opacity-60 text-center py-4">Carregando topicos...</p>}
            {!loading && threads.length === 0 && (
              <div className="text-center py-10 px-4 bg-white/5 rounded-2xl border border-[var(--libido-border)]">
                <p className="text-[var(--libido-muted)] opacity-80 text-sm">Nenhum topico ainda.</p>
                <p className="text-[var(--libido-text)] font-semibold mt-2 text-sm">Toque no + para criar o primeiro.</p>
              </div>
            )}
            {threads.map(thread => (
              <button
                key={thread.id}
                onClick={() => abrirThread(thread)}
                className="w-full text-left p-4 rounded-2xl border bg-[var(--libido-surface-2)]/60 border-[var(--libido-border)] hover:bg-white/5 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-black text-[var(--libido-text)] truncate">{thread.title}</h3>
                    <p className="text-[9px] text-[var(--libido-muted)] opacity-50 font-semibold mt-1">
                      {new Date(thread.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-[var(--libido-text)]/20 flex-shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}