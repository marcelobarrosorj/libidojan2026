import { useState, useEffect, useRef } from "react";
import { Heart, MessageSquare, Lock, Star, ImagePlus } from "lucide-react";
import { getFeedPosts, toggleCurtida, getMinhasCurtidas, createPost, getComentarios, adicionarComentario, excluirComentario } from "../services/posts"; // COMENTARIOS-FEED
import { uploadPhoto } from "../services/uploadPhoto";
import { getAllUsers, getUsersByIds } from "../services/users";
import { Post, User } from '../types';
import { ProtectedImage } from './ProtectedImage';
import { formatUserNumber } from '../utils/formatUserNumber';
import { isDemoEnabled, isDemoId } from '../demo';
import { excluirPost } from '../services/posts'; // FEED-DELETE

interface FeedProps {
  currentUser?: User | null;
  isPremium?: boolean;
  onShowPremiumModal?: () => void;
  navigate?: (tab: string, params?: any) => void;
}

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback';
const DEFAULT_POST_IMAGE = 'https://images.unsplash.com/photo-1598156172159-242147bab38d?q=80&w=300';

export function Feed({ isPremium, onShowPremiumModal, navigate, currentUser }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [curtidos, setCurtidos] = useState<Record<string, boolean>>({}); // CURTIDA-TOGGLE
  const [limit, setLimit] = useState(15);
  const [novoTexto, setNovoTexto] = useState('');
  const [novoArquivo, setNovoArquivo] = useState<File | null>(null);
  const [publicando, setPublicando] = useState(false);
  const inputArquivo = useRef<HTMLInputElement>(null);
  // COMENTARIOS-FEED: estado dos comentarios por post
  const [comentariosAbertos, setComentariosAbertos] = useState<Record<string, boolean>>({});
  const [comentarios, setComentarios] = useState<Record<string, any[]>>({});
  const [novoComentario, setNovoComentario] = useState<Record<string, string>>({});
  const [carregandoComentarios, setCarregandoComentarios] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubscribe = getFeedPosts(async (fetchedPosts) => {
      setPosts(fetchedPosts);
      const uniqueUserIds = new Set<string>();
      fetchedPosts.forEach(p => {
        if (p.userId) uniqueUserIds.add(p.userId);
      });
      if (uniqueUserIds.size > 0) {
        const newUsers = await getUsersByIds(Array.from(uniqueUserIds));
        setUsers(newUsers);
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [limit]);

  // CURTIDA-TOGGLE: carrega as curtidas do proprio usuario ao abrir o feed
  useEffect(() => {
    const uidCurt = (currentUser as any)?.user_id || (currentUser as any)?.id;
    if (!uidCurt) return;
    getMinhasCurtidas(uidCurt).then((ids: string[]) => {
      const mapa: Record<string, boolean> = {};
      (ids || []).forEach((pid) => { mapa[pid] = true; });
      setCurtidos(mapa);
    }).catch(() => {});
  }, [currentUser]);
  const handleLike = async (id: string) => {
    const post = posts.find(p => p.id === id);
    const currentLikes = post?.likes || 0;
    const jaCurtido = !!curtidos[id]; // CURTIDA-TOGGLE
    setCurtidos(prev => ({ ...prev, [id]: !jaCurtido }));
    setLikes(prev => ({ ...prev, [id]: Math.max(0, (prev[id] ?? currentLikes) + (jaCurtido ? -1 : 1)) }));
    await toggleCurtida(id);
  };

  // COMENTARIOS-FEED: abrir/fechar painel e carregar comentarios do post
  const toggleComentarios = async (postId: string) => {
    const aberto = !!comentariosAbertos[postId];
    setComentariosAbertos(prev => ({ ...prev, [postId]: !aberto }));
    if (!aberto && !comentarios[postId]) {
      setCarregandoComentarios(prev => ({ ...prev, [postId]: true }));
      try {
        const lista: any[] = await getComentarios(postId);
        const ids = Array.from(new Set((lista || []).map((cm: any) => cm.user_id).filter(Boolean)));
        const mapa: Record<string, string> = {};
        if (ids.length > 0) {
          try {
            const us = await getUsersByIds(ids);
            (us || []).forEach((u: any) => { mapa[u.user_id || u.id] = u.nickname || u.name || 'Usuario'; });
          } catch {}
        }
        setComentarios(prev => ({ ...prev, [postId]: (lista || []).map((cm: any) => ({ ...cm, nickname: mapa[cm.user_id] || 'Usuario' })) }));
      } catch {}
      setCarregandoComentarios(prev => ({ ...prev, [postId]: false }));
    }
  };
  // COMENTARIOS-FEED: enviar novo comentario
  const enviarComentario = async (postId: string) => {
    const uid = (currentUser as any)?.user_id || (currentUser as any)?.id;
    if (!uid) { alert('Entre na sua conta para comentar.'); return; }
    const texto = (novoComentario[postId] || '').trim();
    if (!texto) return;
    try {
      const novo: any = await adicionarComentario(postId, uid, texto);
      if (novo) {
        const meuNome = (currentUser as any)?.nickname || (currentUser as any)?.name || 'Usuario';
        setComentarios(prev => ({ ...prev, [postId]: [...(prev[postId] || []), { ...novo, nickname: meuNome }] }));
        setNovoComentario(prev => ({ ...prev, [postId]: '' }));
      } else {
        alert('Nao foi possivel comentar. Rode o SQL do relatorio no Supabase e tente de novo.');
      }
    } catch (e) {
      console.error('Erro ao comentar:', e);
      alert('Erro ao comentar. Tente novamente.');
    }
  };
  const handlePublicar = async () => {
    if (publicando) return;
    const texto = novoTexto.trim();
    if (!texto && !novoArquivo) return;
    const userId = (currentUser as any)?.user_id || (currentUser as any)?.id;
    if (!userId) {
      alert('Entre na sua conta para publicar.');
      return;
    }
    setPublicando(true);
    try {
      let imagem = '';
      if (novoArquivo) {
        const res: any = await uploadPhoto(novoArquivo, userId);
        imagem = typeof res === 'string' ? res : (res?.url || res?.publicUrl || res?.data?.publicUrl || '');
      }
      const novoPost: Post = {
        id: '',
        userId,
        image: imagem,
        text: texto,
        likes: 0,
        createdAt: Date.now(),
      };
      await createPost(novoPost);
      setPosts(prev => [{ ...novoPost, id: 'local-' + Date.now() }, ...prev]);
      setNovoTexto('');
      setNovoArquivo(null);
      if (inputArquivo.current) inputArquivo.current.value = '';
    } catch (e) {
      console.error('Erro ao publicar:', e);
      alert('Erro ao publicar. Tente novamente.');
    } finally {
      setPublicando(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-5 bg-[var(--libido-bg)] text-[var(--libido-text)] overflow-y-auto no-scrollbar min-h-0">
      <div className="flex flex-col mb-6 mt-2">
        <div className="text-[var(--libido-accent)] text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Boa noite</div>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-fraunces font-medium text-[var(--libido-text)]">Descobrir</h1>
        </div>
      </div>

      {/* Criar publicacao */}
      <div className="bg-[var(--libido-surface-2)]/60 border border-[var(--libido-border)] rounded-[2rem] p-4 mb-6 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <ProtectedImage currentUser={currentUser} src={(currentUser as any)?.photo_url || DEFAULT_AVATAR} alt="avatar" className="w-9 h-9 rounded-full border border-[var(--libido-border)]" />
          <input
            value={novoTexto}
            onChange={e => setNovoTexto(e.target.value)}
            placeholder="Compartilhe algo..."
            maxLength={500}
            className="flex-1 bg-[var(--libido-bg)] border border-[var(--libido-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--libido-text)] placeholder:text-[var(--libido-muted)] outline-none focus:border-[var(--libido-accent)]"
          />
        </div>
        {novoArquivo && (
          <div className="flex items-center justify-between bg-[var(--libido-bg)] border border-[var(--libido-border)] rounded-xl px-3 py-2 mb-3">
            <span className="text-xs text-[var(--libido-muted)] truncate">{novoArquivo.name}</span>
            <button onClick={() => { setNovoArquivo(null); if (inputArquivo.current) inputArquivo.current.value = ''; }} className="text-xs text-red-400 font-bold">Remover</button>
          </div>
        )}
        <div className="flex items-center justify-between">
          <button onClick={() => inputArquivo.current?.click()} className="flex items-center gap-1.5 text-xs font-bold text-[var(--libido-muted)] hover:text-[var(--libido-accent)] transition-colors">
            <ImagePlus size={16} /> Foto
          </button>
          <input ref={inputArquivo} type="file" accept="image/*" className="hidden" onChange={e => setNovoArquivo(e.target.files?.[0] || null)} />
          <button
            onClick={handlePublicar}
            disabled={publicando || (!novoTexto.trim() && !novoArquivo)}
            className="bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] font-black text-[10px] px-6 py-2 rounded-xl uppercase tracking-widest disabled:opacity-40 active:scale-95 transition-all"
          >
            {publicando ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>
      {/* Stories list */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar shrink-0">
        {posts.slice(0, 5).map(f => {
          const author = users.find(u => u.user_id === f.userId || u.id === f.userId);
          return (
            <div key={f.id} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer" onClick={() => author && navigate?.('viewprofile', { user: author })} style={{ position: 'relative' }}>
              {f.userId === currentUser?.user_id && (
                <button
                  onClick={async () => {
                    if (confirm('Excluir este post?')) {
                      const okDel = await excluirPost(f.id);
                      if (okDel) setPosts((prev: any[]) => prev.filter((p: any) => p.id !== f.id));
                    }
                  }}
                  style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, fontSize: 15, lineHeight: 1, cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  aria-label='Excluir post'
                >
                  x
                </button>
              )}{/* FEED-DELETE */}
              <div className="relative w-16 h-16 rounded-full p-0.5 border-2 border-[var(--libido-accent)] shadow-[0_0_15px_rgba(255,179,0,0.2)]">
                <ProtectedImage currentUser={currentUser} src={(f as any).avatar || author?.photo_url || DEFAULT_AVATAR} alt="avatar" className="w-full h-full rounded-full border border-black" />
                {author && <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--libido-bg)] ${author.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />}
              </div>
              <span className="text-[10px] font-black text-[var(--libido-muted)] opacity-70 truncate max-w-[80px] tracking-wider uppercase">{(f as any).nickname || author?.nickname || author?.name || "User"} {author?.userNumber ? `#${formatUserNumber(author.userNumber)}` : ""}</span>
            </div>
          );
        })}
      </div>
      <div className="h-[1px] bg-white/5 my-4"></div>
      {/* Lista de Posts */}
      <div className="space-y-6">
        {posts.length === 0 && !isDemoEnabled && (
          <div className="text-center py-10 px-4 bg-white/5 rounded-2xl border border-[var(--libido-border)]">
            <p className="text-[var(--libido-muted)] opacity-80 text-sm">Ainda não há publicações por aqui.</p>
            <p className="text-[var(--libido-text)] font-semibold mt-2 text-sm">Seja a primeira pessoa a compartilhar algo.</p>
          </div>
        )}
        {posts.map(post => {
          const author = users.find(u => u.user_id === post.userId || u.id === post.userId);
          const isDemo = isDemoId(post.id);
          return (
            <div key={post.id} className="bg-[var(--libido-surface-2)]/60 backdrop-blur-xl border border-[var(--libido-border)] rounded-[2rem] p-5 shadow-2xl relative overflow-hidden">
              {isDemo && (
                 <div className="absolute top-0 left-0 w-full bg-[var(--libido-accent)]/20 text-center py-1">
                   <span className="text-[9px] font-black tracking-widest uppercase text-[var(--libido-accent)]">Conteúdo de demonstração</span>
                 </div>
              )}
              <div className={`flex items-center justify-between mb-4 ${isDemo ? 'mt-4' : ''}`}>
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => author && navigate?.('viewprofile', { user: author })}>
                  <div className="relative shrink-0">
                    <ProtectedImage currentUser={currentUser} src={(post as any).avatar || author?.photo_url || DEFAULT_AVATAR} alt="avatar" className="w-9 h-9 rounded-full border border-[var(--libido-border)]" />
                    {author && <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--libido-bg)] ${author.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />}
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-[var(--libido-text)] tracking-widest flex items-center">{(post as any).nickname || author?.nickname || author?.name || "User"} {author?.userNumber ? <span className="text-[9px] opacity-50 ml-1">#{formatUserNumber(author.userNumber)}</span> : null}{author && (((author as any).createdAt) || 0) >= Date.now() - 604800000 && <span className="text-[8px] font-black uppercase tracking-wider bg-[var(--libido-accent)]/20 text-[var(--libido-accent)] px-1.5 py-0.5 rounded-full ml-1">NOVO</span>}</h3>
                    <span className="text-[9px] text-[var(--libido-accent)] uppercase font-bold tracking-widest">{(post as any).role || (author as any)?.role || 'Membro'}</span>
                  </div>
                </div>
                <Star size={14} className="text-[var(--libido-accent)] fill-[var(--libido-accent)]" />
              </div>
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 border border-[var(--libido-border)]">
                <ProtectedImage
                  currentUser={currentUser}
                  src={post.image || DEFAULT_POST_IMAGE}
                  alt="post content"
                  className={`w-full h-full object-cover transition-all duration-700 ${!isPremium && post.id !== posts[0]?.id ? 'blur-2xl scale-105 pointer-events-none' : ''}`}
                />
                {!isPremium && post.id !== posts[0]?.id && (
                  <div className="absolute inset-0 flex flex-col justify-center items-center p-6 bg-black/60 backdrop-blur-sm text-center">
                    <Lock size={20} className="text-[var(--libido-accent)] mb-2" />
                    <h4 className="text-xs font-black uppercase text-[var(--libido-text)] tracking-wider">Conteúdo Oculto</h4>
                    <p className="text-[var(--libido-muted)] opacity-60 text-[9px] mt-1 font-semibold leading-relaxed px-4">
                      Assine o plano Premium para liberar todas as galerias de posts secretos do Libido.
                    </p>
                    <button
                      onClick={onShowPremiumModal}
                      className="mt-4 bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] font-black text-[9px] px-6 py-2.5 rounded-xl uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[var(--libido-accent)]/10"
                    >
                      Desbloquear
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-[var(--libido-muted)] opacity-90 leading-relaxed font-medium mb-4">{post.text}</p>
              <div className="flex gap-4 items-center border-t border-[var(--libido-border)] pt-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[var(--libido-muted)] opacity-70 hover:text-red-500 transition-colors"
                >
                  <Heart size={16} className={curtidos[post.id] ? "fill-red-500 text-red-500" : ""} />
                  <span>{likes[post.id] || post.likes}</span>
                </button>
                <button
                  onClick={() => toggleComentarios(post.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[var(--libido-muted)] opacity-70 hover:text-blue-500 transition-colors"
                >
                  <MessageSquare size={16} />
                  <span>Comentar</span>
                </button>
              </div>
              {comentariosAbertos[post.id] && (
                <div className="mt-4 pt-4 border-t border-[var(--libido-border)]">
                  {carregandoComentarios[post.id] && (
                    <p className="text-[10px] text-[var(--libido-muted)] mb-2">Carregando comentarios...</p>
                  )}
                  {(comentarios[post.id] || []).length === 0 && !carregandoComentarios[post.id] && (
                    <p className="text-[10px] text-[var(--libido-muted)] mb-2">Nenhum comentario ainda. Seja o primeiro!</p>
                  )}
                  {(comentarios[post.id] || []).map((cm: any) => (
                    <div key={cm.id} className="flex items-start justify-between gap-2 mb-2 bg-[var(--libido-bg)] border border-[var(--libido-border)] rounded-xl px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wider text-[var(--libido-accent)]">{(cm as any).nickname || "Usuario"}</p>
                        <p className="text-xs text-[var(--libido-text)] break-words">{cm.texto}</p>
                      </div>
                      {cm.user_id === ((currentUser as any)?.user_id || (currentUser as any)?.id) && (
                        <button
                          onClick={async () => {
                            const okDel = await excluirComentario(cm.id);
                            if (okDel) setComentarios(prev => ({ ...prev, [post.id]: (prev[post.id] || []).filter((x: any) => x.id !== cm.id) }));
                          }}
                          className="text-[10px] text-red-400 font-bold shrink-0"
                        >
                          x
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      value={novoComentario[post.id] || ""}
                      onChange={e => setNovoComentario(prev => ({ ...prev, [post.id]: e.target.value }))}
                      placeholder="Escreva um comentario..."
                      maxLength={300}
                      className="flex-1 bg-[var(--libido-bg)] border border-[var(--libido-border)] rounded-xl px-3 py-2 text-xs text-[var(--libido-text)] placeholder:text-[var(--libido-muted)] outline-none focus:border-[var(--libido-accent)]"
                    />
                    <button
                      onClick={() => enviarComentario(post.id)}
                      className="bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] font-black text-[10px] px-4 py-2 rounded-xl uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {posts.length >= limit && (
          <button
            onClick={() => setLimit(l => l + 15)}
            className="w-full py-4 text-xs font-bold text-[var(--libido-muted)] opacity-70 bg-white/5 rounded-2xl hover:bg-white/10"
          >
            Carregar Mais
          </button>
        )}
      </div>
    </div>
  );
}

