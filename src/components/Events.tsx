import { supabase } from '../services/supabase';
import { useState, useEffect } from 'react';
import { Calendar, Plus, MapPin, Clock } from 'lucide-react';

interface EventsProps {
  isPremium?: boolean;
  onShowPremiumModal?: () => void;
  userId?: string;
}

interface Evento {
  id: string;
  user_id: string;
  title: string;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  created_at: string;
}

export function Events({ isPremium, onShowPremiumModal, userId }: EventsProps) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [local, setLocal] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    setLoading(true);
    try {
      const { data: rows, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });
      if (!error && rows) setEventos(rows);
      else setEventos([]);
    } catch {
      setEventos([]);
    }
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const criar = async () => {
    if (!titulo.trim() || !userId || salvando) return;
    setSalvando(true);
    const { error } = await supabase
      .from('events')
      .insert({
        user_id: userId,
        title: titulo.trim(),
        event_date: data || null,
        event_time: hora || null,
        location: local.trim() || null
      });
    if (!error) {
      setTitulo(''); setData(''); setHora(''); setLocal('');
      setShowForm(false);
      await carregar();
    }
    setSalvando(false);
  };

  return (
    <div className="flex-1 flex flex-col p-5 bg-[var(--libido-bg)] text-[var(--libido-text)] overflow-y-auto no-scrollbar min-h-0 gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider italic font-fraunces font-medium">Eventos</h1>
          <p className="text-[9px] text-[var(--libido-muted)] opacity-50 font-bold uppercase tracking-widest mt-0.5">Encontros da comunidade</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="w-10 h-10 bg-[var(--libido-accent)] rounded-xl flex items-center justify-center text-black hover:opacity-90 shadow-lg shadow-[var(--libido-accent)]/10">
          <Plus size={16} />
        </button>
      </div>
      {showForm && (
        <div className="bg-[var(--libido-surface-2)]/60 border border-[var(--libido-border)] rounded-2xl p-3 flex flex-col gap-2">
          <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Nome do evento..." className="bg-[var(--libido-bg)] border border-[var(--libido-border)] rounded-xl px-3 py-2 text-xs text-[var(--libido-text)] outline-none focus:border-[var(--libido-accent)]" />
          <div className="flex gap-2">
            <input type="date" value={data} onChange={e => setData(e.target.value)} className="flex-1 bg-[var(--libido-bg)] border border-[var(--libido-border)] rounded-xl px-3 py-2 text-xs text-[var(--libido-text)] outline-none focus:border-[var(--libido-accent)]" />
            <input type="time" value={hora} onChange={e => setHora(e.target.value)} className="w-28 bg-[var(--libido-bg)] border border-[var(--libido-border)] rounded-xl px-3 py-2 text-xs text-[var(--libido-text)] outline-none focus:border-[var(--libido-accent)]" />
          </div>
          <input value={local} onChange={e => setLocal(e.target.value)} placeholder="Local..." className="bg-[var(--libido-bg)] border border-[var(--libido-border)] rounded-xl px-3 py-2 text-xs text-[var(--libido-text)] outline-none focus:border-[var(--libido-accent)]" />
          <button onClick={criar} disabled={salvando || !titulo.trim()} className="bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-black font-black text-[10px] px-4 py-2 rounded-xl uppercase tracking-widest disabled:opacity-40">
            {salvando ? 'Criando...' : 'Criar evento'}
          </button>
        </div>
      )}
      <div className="space-y-2">
        {loading && <p className="text-[var(--libido-muted)] text-xs opacity-60 text-center py-4">Carregando eventos...</p>}
        {!loading && eventos.length === 0 && (
          <div className="text-center py-10 px-4 bg-white/5 rounded-2xl border border-[var(--libido-border)]">
            <p className="text-[var(--libido-muted)] opacity-80 text-sm">Nenhum evento ainda.</p>
            <p className="text-[var(--libido-text)] font-semibold mt-2 text-sm">Toque no + para criar o primeiro.</p>
          </div>
        )}
        {eventos.map(ev => (
          <div key={ev.id} className="p-4 rounded-2xl border bg-[var(--libido-surface-2)]/60 border-[var(--libido-border)]">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--libido-accent)]/20 flex items-center justify-center shrink-0">
                <Calendar size={16} className="text-[var(--libido-accent)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-black text-[var(--libido-text)] truncate">{ev.title}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  {ev.event_date && <span className="text-[9px] text-[var(--libido-muted)] opacity-70 flex items-center gap-1"><Clock size={9} />{new Date(ev.event_date + 'T00:00:00').toLocaleDateString('pt-BR')}{ev.event_time ? ' - ' + ev.event_time : ''}</span>}
                  {ev.location && <span className="text-[9px] text-[var(--libido-muted)] opacity-70 flex items-center gap-1"><MapPin size={9} />{ev.location}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}