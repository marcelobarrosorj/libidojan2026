import { useState, useEffect } from "react";
import { Heart, MessageSquare, Lock, Star } from "lucide-react";
import { getFeedPosts, likePost } from "../services/posts";
import { getAllUsers, getUsersByIds } from "../services/users";
import { Post, User } from '../types';
import { ProtectedImage } from './ProtectedImage';
import { formatUserNumber } from '../utils/formatUserNumber';
import { isDemoEnabled, isDemoId } from '../demo';

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

  const [limit, setLimit] = useState(15);
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

  const handleLike = async (id: string) => {
    const post = posts.find(p => p.id === id);
    const currentLikes = post?.likes || 0;
    
    // Atualização otimista
    setLikes(prev => ({ ...prev, [id]: (prev[id] || currentLikes) + 1 }));
    
    // Chamada ao Supabase
    await likePost(id);
  };

  return (
    <div className="flex-1 flex flex-col p-5 bg-[var(--libido-bg)] text-[var(--libido-text)] overflow-y-auto no-scrollbar min-h-0">
      <div className="flex flex-col mb-6 mt-2">
  <div className="text-[var(--libido-accent)] text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Boa noite</div>
  <div className="flex justify-between items-center">
    <h1 className="text-3xl font-fraunces font-medium text-[var(--libido-text)]">Descobrir</h1>
    <button className="text-[var(--libido-muted)]"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="4" x2="14" y2="4"></line><line x1="10" y1="4" x2="3" y2="4"></line><line x1="21" y1="12" x2="12" y2="12"></line><line x1="8" y1="12" x2="3" y2="12"></line><line x1="21" y1="20" x2="16" y2="20"></line><line x1="12" y1="20" x2="3" y2="20"></line><line x1="14" y1="2" x2="14" y2="6"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="16" y1="18" x2="16" y2="22"></line></svg></button>
  </div>
</div>
      {/* Stories list */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar shrink-0">
        {posts.slice(0, 5).map(f => {
          const author = users.find(u => u.user_id === f.userId || u.id === f.userId);
          return (
            <div key={f.id} className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="w-16 h-16 rounded-full p-0.5 border-2 border-[var(--libido-accent)] shadow-[0_0_15px_rgba(255,179,0,0.2)]">
                <ProtectedImage currentUser={currentUser} src={(f as any).avatar || author?.photo_url || DEFAULT_AVATAR} alt="avatar" className="w-full h-full rounded-full border border-black" />
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
              {/* Header Post */}
              <div className={`flex items-center justify-between mb-4 ${isDemo ? 'mt-4' : ''}`}>
                <div className="flex items-center gap-3">
                  <ProtectedImage currentUser={currentUser} src={(post as any).avatar || author?.photo_url || DEFAULT_AVATAR} alt="avatar" className="w-9 h-9 rounded-full border border-[var(--libido-border)]" />
                  <div>
                    <h3 className="text-xs font-black uppercase text-[var(--libido-text)] tracking-widest flex items-center">{(post as any).nickname || author?.nickname || author?.name || "User"} {author?.userNumber ? <span className="text-[9px] opacity-50 ml-1">#{formatUserNumber(author.userNumber)}</span> : null}</h3>
                    <span className="text-[9px] text-[var(--libido-accent)] uppercase font-bold tracking-widest">{(post as any).role || (author as any)?.role || 'Membro'}</span>
                  
      </div>
                </div>
                <Star size={14} className="text-[var(--libido-accent)] fill-[var(--libido-accent)]" />
              </div>

              {/* Imagem do Post com paywall se necessário */}
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 border border-[var(--libido-border)]">
                <img 
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

              {/* Legenda */}
              <p className="text-xs text-[var(--libido-muted)] opacity-90 leading-relaxed font-medium mb-4">{post.text}</p>

              {/* Ações */}
              <div className="flex gap-4 items-center border-t border-[var(--libido-border)] pt-4">
                <button 
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[var(--libido-muted)] opacity-70 hover:text-red-500 transition-colors"
                >
                  <Heart size={16} className={likes[post.id] ? "fill-red-500 text-red-500" : ""} />
                  <span>{likes[post.id] || post.likes}</span>
                </button>

                <button 
                  onClick={() => !isPremium ? onShowPremiumModal?.() : console.log("comment click")}
                  className="flex items-center gap-1.5 text-xs font-bold text-[var(--libido-muted)] opacity-70 hover:text-blue-500 transition-colors"
                >
                  <MessageSquare size={16} />
                  <span>Comentar</span>
                </button>
              </div>
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
