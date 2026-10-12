import { UserPlus, Copy, Gift, Trophy } from 'lucide-react';
import { useState } from 'react';
import { resgatarConvitePremium } from '../services/premiumInvites'; // RESGATE-PREM

interface InvitesProps {
  currentUser?: any;
  userId?: string;
}

export function Invites({ currentUser, userId }: InvitesProps) {
  const [copied, setCopied] = useState(false);
  // RESGATE-PREM: campo para resgatar convite premium (cola ou vem do link /invite/CODIGO)
  const [codigoResgate, setCodigoResgate] = useState(() => {
    const m = window.location.pathname.match(/invite\/([A-Za-z0-9-]+)/) || window.location.search.match(/[?&]invite=([A-Za-z0-9-]+)/);
    return m ? m[1].toUpperCase() : '';
  });
  const [msgResgate, setMsgResgate] = useState('');
  const resgatar = async () => {
    const cod = (codigoResgate || '').trim().toUpperCase();
    if (!cod) { setMsgResgate('Cole o codigo do convite.'); return; }
    try {
      const r = await resgatarConvitePremium(cod, (userId || (currentUser as any)?.user_id) as any);
      setMsgResgate((r && r.mensagem) || (r && r.ok ? 'Premium ativado!' : 'Nao foi possivel resgatar.'));
      if (r && r.ok) setTimeout(() => window.location.reload(), 1500);
    } catch { setMsgResgate('Erro ao resgatar. Tente novamente.'); }
  };
  const inviteCode = `LIB-${(userId || 'XXXX').slice(0, 4).toUpperCase()}`;
  const inviteLink = `https://libidoapp.com.br/invite/${inviteCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(inviteLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col p-5 bg-[var(--libido-bg)] text-[var(--libido-text)] overflow-y-auto no-scrollbar min-h-0 gap-6">
      <div>
        <h1 className="text-xl font-black uppercase tracking-wider italic font-fraunces font-medium">Convites</h1>
        <div style={{ marginTop: 12, marginBottom: 12 }}>{/* RESGATE-PREM */}
          <input value={codigoResgate} onChange={e => setCodigoResgate(e.target.value)} placeholder="Cole o codigo do convite (LIB-PREM-XXXXXX)" style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1px solid var(--libido-border)', background: 'var(--libido-surface)', color: 'var(--libido-text)', fontSize: 13 }} />
          <button type="button" onClick={resgatar} style={{ marginTop: 8, width: '100%', padding: '12px', borderRadius: 12, background: 'var(--libido-accent)', color: 'var(--libido-text)', fontWeight: 800, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>Resgatar convite premium</button>
          {msgResgate && <p style={{ marginTop: 6, fontSize: 12, color: 'var(--libido-muted)' }}>{msgResgate}</p>}
        </div>
        <p className="text-[9px] text-[var(--libido-muted)] opacity-50 font-bold uppercase tracking-widest mt-0.5">Recrutamento</p>
      </div>

      <div className="bg-gradient-to-br from-[#12121a] to-[#1a1a2e] border border-[var(--libido-accent)]/20 rounded-3xl p-6 text-center relative overflow-hidden">
        <UserPlus size={32} className="text-[var(--libido-accent)] mx-auto mb-3" />
        <p className="text-[9px] font-black text-[var(--libido-muted)] opacity-50 uppercase tracking-widest mb-2">Seu Código de Operador</p>
        <p className="text-2xl font-fraunces font-medium text-[var(--libido-accent)] tracking-[0.3em] mb-4 font-mono">{inviteCode}</p>
        <button
          onClick={copyCode}
          className="flex items-center gap-2 mx-auto bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] font-black py-3 px-6 rounded-2xl text-[10px] uppercase tracking-widest hover:opacity-90 active:scale-95"
        >
          <Copy size={12} />
          {copied ? 'COPIADO!' : 'COPIAR LINK DE CONVITE'}
        </button>
      </div>

      <div className="bg-[var(--libido-surface-2)]/60 border border-[var(--libido-border)] p-4 rounded-2xl">
        <p className="text-[9px] font-black text-[var(--libido-muted)] opacity-50 uppercase tracking-widest mb-3">Estatísticas</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-black text-[var(--libido-text)]">0</p>
            <p className="text-[8px] text-[var(--libido-muted)] opacity-50 font-bold uppercase">Enviados</p>
          </div>
          <div>
            <p className="text-lg font-black text-[var(--libido-accent)]">0</p>
            <p className="text-[8px] text-[var(--libido-muted)] opacity-50 font-bold uppercase">Aceitos</p>
          </div>
          <div>
            <p className="text-lg font-black text-[var(--libido-text)]">0</p>
            <p className="text-[8px] text-[var(--libido-muted)] opacity-50 font-bold uppercase">Reputação</p>
          </div>
        </div>
      </div>
    </div>
  );
}
