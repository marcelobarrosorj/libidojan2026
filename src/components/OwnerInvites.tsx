// OWNER-INVITES: painel do dono para gerar convites premium dentro do app.
// So aparece para quem tem role/plan owner ou admin. Codigos de uso unico.
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export function OwnerInvites() {
  const [ehDono, setEhDono] = useState<boolean | null>(null);
  const [duracao, setDuracao] = useState<string>('24h');
  const [link, setLink] = useState('');
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    (supabase as any).auth.getUser().then(async ({ data }: any) => {
      const uid = data?.user?.id;
      if (!uid) { setEhDono(false); return; }
      const { data: u } = await (supabase as any)
        .from('users')
        .select('role, plan')
        .eq('user_id', uid)
        .maybeSingle();
      setEhDono(!!u && (u.role === 'owner' || u.role === 'admin' || u.plan === 'owner' || u.plan === 'admin'));
    });
  }, []);

  if (ehDono === null || !ehDono) return null;

  const gerar = async () => {
    setGerando(true); setLink(''); setCopiado(false);
    try {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ234569';
      let suf = '';
      for (let i = 0; i < 6; i++) suf += chars[Math.floor(Math.random() * chars.length)];
      const code = 'LIB-PREM-' + suf;
      const horas = duracao === '24h' ? 24 : duracao === '7d' ? 168 : null;
      const { error } = await (supabase as any)
        .from('premium_invite_codes')
        .insert({ code, duration_hours: horas, max_uses: 1 });
      if (error) throw error;
      setLink('https://libidoapp.com.br/invite/' + code);
    } catch (eG) {
      alert('Erro ao gerar convite. Tente novamente.');
    } finally {
      setGerando(false);
    }
  };

  const copiar = async () => {
    try { await navigator.clipboard.writeText(link); setCopiado(true); } catch (eC) {}
  };

  const btnBase: any = { flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer' };
  const estiloBtn = (v: string) => ({
    ...btnBase,
    border: duracao === v ? '1.5px solid #a855f7' : '1px solid rgba(255,255,255,0.15)',
    background: duracao === v ? 'rgba(168,85,247,0.15)' : 'transparent',
  });

  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, marginBottom: 12 }}>
      <div style={{ fontWeight: 800, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Convites Premium (Dono)</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button onClick={() => setDuracao('eterno')} style={estiloBtn('eterno')}>Eterno</button>
        <button onClick={() => setDuracao('24h')} style={estiloBtn('24h')}>24 horas</button>
        <button onClick={() => setDuracao('7d')} style={estiloBtn('7d')}>7 dias</button>
      </div>
      <button onClick={gerar} disabled={gerando} style={{ width: '100%', padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 800, background: 'linear-gradient(90deg,#a855f7,#ec4899)', color: '#fff', border: 'none', cursor: 'pointer' }}>
        {gerando ? 'GERANDO...' : 'GERAR LINK DE CONVITE'}
      </button>
      {link && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4, wordBreak: 'break-all' }}>{link}</div>
          <button onClick={copiar} style={{ width: '100%', padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer' }}>
            {copiado ? 'COPIADO!' : 'COPIAR LINK'}
          </button>
        </div>
      )}
    </div>
  );
}