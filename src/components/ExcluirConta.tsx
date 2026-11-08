import { useState } from 'react'
import { supabase } from '../services/supabase'

const st: Record<string, React.CSSProperties> = {
  box: { marginTop: 24, paddingTop: 16, borderTop: '1px solid #2a2a2f' },
  btn: { width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #b3261e', background: 'transparent', color: '#e5484d', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 9999 },
  card: { width: '100%', maxWidth: 380, background: '#1b1b1f', borderRadius: 14, padding: 22, color: '#f2f2f3' },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #3a3a40', background: '#16161a', color: '#fff', marginTop: 10, boxSizing: 'border-box' }
}

export default function ExcluirConta() {
  const [aberto, setAberto] = useState(false)
  const [texto, setTexto] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const valido = texto.trim().toUpperCase() === 'EXCLUIR'

  async function confirmar() {
    if (!valido || carregando) return
    setCarregando(true)
    setErro(null)
    try {
      const { error } = await supabase.rpc('excluir_minha_conta')
      if (error) throw error
      try { await supabase.auth.signOut() } catch {}
      try { localStorage.clear(); sessionStorage.clear() } catch {}
      window.location.replace('/')
    } catch (e: any) {
      setErro(e?.message ?? 'Nao foi possivel excluir a conta agora.')
      setCarregando(false)
    }
  }

  return (
    <div style={st.box}>
      
      {aberto && (
        <div style={st.overlay} onClick={() => { if (!carregando) setAberto(false) }}>
          <div style={st.card} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Excluir conta permanentemente</h3>
            <p style={{ fontSize: 14, color: '#b3b3ba', lineHeight: 1.5 }}>
              Seu perfil, fotos, mensagens, curtidas, seguidores e todo o historico serao apagados.
              Esta acao nao pode ser desfeita.
            </p>
            <p style={{ fontSize: 13, color: '#8a8a92', marginBottom: 0 }}>
              Digite <b>EXCLUIR</b> para confirmar:
            </p>
            <input style={st.input} value={texto} placeholder="EXCLUIR" autoFocus
              onChange={e => setTexto(e.target.value)} />
            {erro && <p style={{ fontSize: 13, color: '#e5484d', marginTop: 10 }}>{erro}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="button" disabled={carregando} onClick={() => setAberto(false)}
                style={{ flex: 1, padding: '11px 0', borderRadius: 9, border: '1px solid #3a3a40', background: 'transparent', color: '#d4d4d8', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button type="button" disabled={!valido || carregando} onClick={confirmar}
                style={{ flex: 1, padding: '11px 0', borderRadius: 9, border: 'none', background: '#b3261e', color: '#fff', fontWeight: 700, cursor: valido ? 'pointer' : 'not-allowed', opacity: carregando ? 0.6 : 1 }}>
                {carregando ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    <footer className="mt-auto pt-10 pb-28 w-full flex justify-center relative z-0">
        <button data-footer-excluir="1" type="button" style={st.btn} onClick={() => setAberto(true)}>Excluir minha conta</button>
      </footer>
      </div>
  )
}