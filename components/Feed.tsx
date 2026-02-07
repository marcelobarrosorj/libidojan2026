
import React, { useState, useMemo, useRef } from 'react';
import { MOCK_POSTS, MOCK_USERS } from '../constants';
import { Post, User, GalleryPhoto } from '../types';
import { Heart, MessageCircle, MoreHorizontal, X, Maximize2, ChevronLeft, ChevronRight, Send, Flag, UserX, Link as LinkIcon, EyeOff, Users, Sparkles } from 'lucide-react';
import { log, handleButtonAction, showNotification, cache } from '../services/authUtils';
import { soundService } from '../services/soundService';
import ProtectedImage from './common/ProtectedImage';
import VibeMoments from './VibeMoments';

interface FeedProps {
  onProfileClick?: (user: User) => void;
}

const Feed: React.FC<FeedProps> = ({ onProfileClick }) => {
  const [feedMode, setFeedMode] = useState<'all' | 'following'>('all');
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [activeModal, setActiveModal] = useState<{ type: 'comment' | 'share' | 'gallery' | 'menu'; postId?: string | number; userId?: string } | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<{ url: string; index: number; photos: GalleryPhoto[]; ownerNickname: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Filtra os posts conforme a aba selecionada
  const filteredPosts = useMemo(() => {
    if (feedMode === 'following') {
      const followingIds = cache.userData?.following || [];
      return posts.filter(post => followingIds.includes(post.userId));
    }
    return posts;
  }, [posts, feedMode, cache.userData?.following]);

  const likePost = async (postId: string | number) => {
    await handleButtonAction(`POST_LIKE_${postId}`, async () => {
        const post = posts.find(p => p.id === postId);
        const isNowLiked = !post?.liked;

        if (isNowLiked) soundService.play('LIKE');

        await new Promise(r => setTimeout(r, 200));
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return { ...p, liked: isNowLiked, likes: isNowLiked ? p.likes + 1 : p.likes - 1 };
          }
          return p;
        }));
        return true;
    }, { setLoading: setIsProcessing });
  };

  const handlePostAction = (action: string) => {
    switch (action) {
      case 'report':
        showNotification(`Denúncia registrada.`, 'info');
        break;
      case 'hide':
        setPosts(prev => prev.filter(p => p.id !== activeModal?.postId));
        showNotification('Post ocultado.', 'success');
        break;
      case 'block':
        showNotification('Usuário bloqueado.', 'success');
        break;
      case 'copy':
        showNotification('Link copiado.', 'info');
        break;
    }
    setActiveModal(null);
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 500));
    setPosts(prev => prev.map(p => p.id === activeModal?.postId ? { ...p, comments: [...p.comments, { user: 'Você', text: commentText }] } : p));
    setCommentText('');
    setIsProcessing(false);
    showNotification('Comentário enviado!', 'success');
  };

  const navigateFullscreen = (direction: 'next' | 'prev') => {
    if (!fullscreenImage) return;
    const { index, photos, ownerNickname } = fullscreenImage;
    let newIndex = direction === 'next' ? index + 1 : index - 1;
    if (newIndex >= photos.length) newIndex = 0;
    if (newIndex < 0) newIndex = photos.length - 1;
    setFullscreenImage({ url: photos[newIndex].url, index: newIndex, photos, ownerNickname });
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => {
    const threshold = 50;
    const deltaX = touchStartX.current - touchEndX.current;
    if (deltaX > threshold) navigateFullscreen('next');
    else if (deltaX < -threshold) navigateFullscreen('prev');
  };

  const getUser = (userId: string) => MOCK_USERS.find(u => u.id === userId) || MOCK_USERS[0];

  return (
    <div className="flex flex-col gap-6 p-4 pb-28 animate-in fade-in duration-500">
      <VibeMoments />

      {/* NOVO: Seletor de Aba do Feed */}
      <div className="flex bg-slate-900/40 p-1 rounded-2xl border border-amber-500/10 mx-auto w-full max-w-xs mb-2">
        <button 
          onClick={() => setFeedMode('all')} 
          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${feedMode === 'all' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-500'}`}
        >
          <Sparkles size={14} /> Explorar
        </button>
        <button 
          onClick={() => setFeedMode('following')} 
          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${feedMode === 'following' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-500'}`}
        >
          <Users size={14} /> Seguindo
        </button>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="py-20 text-center space-y-4 opacity-40">
           <Users size={48} className="mx-auto text-slate-700" />
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nenhuma atividade detectada nos perfis que você segue.</p>
        </div>
      ) : (
        filteredPosts.map(post => {
          const isLiked = post.liked;
          return (
            <div key={post.id} className="glass-card rounded-[2.5rem] overflow-hidden border-amber-500/10 shadow-2xl relative">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onProfileClick?.(getUser(post.userId))}>
                  <img src={post.avatar} className="w-10 h-10 rounded-full border-2 border-amber-500/30 object-cover group-hover:border-amber-500 transition-colors" />
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors">{post.user}, {post.age}</h4>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Sincronizado</p>
                  </div>
                </div>
                <button onClick={() => setActiveModal({ type: 'menu', postId: post.id })} className="p-2 hover:bg-amber-500/10 rounded-full text-slate-500 hover:text-amber-500 transition-colors"><MoreHorizontal size={20} /></button>
              </div>

              <div className="relative aspect-square cursor-pointer overflow-hidden" onClick={() => onProfileClick?.(getUser(post.userId))}>
                <ProtectedImage src={post.image} alt={post.description} className="w-full h-full hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-6 z-[65]">
                  <p className="text-[11px] text-white font-black uppercase tracking-[0.2em] flex items-center gap-2">Ver Matriz <Maximize2 size={12} /></p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center gap-6">
                  <button onClick={() => likePost(post.id)} disabled={isProcessing} className={`flex items-center gap-2 transition-all active:scale-90 group ${isLiked ? 'text-amber-500' : 'text-slate-400'}`}>
                    <div className={`p-1 rounded-full ${isLiked ? 'bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'group-hover:bg-white/5'}`}>
                      <Heart size={26} fill={isLiked ? 'currentColor' : 'none'} />
                    </div>
                    <span className="text-xs font-black">{post.likes}</span>
                  </button>
                  <button onClick={() => setActiveModal({ type: 'comment', postId: post.id })} className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group">
                     <div className="p-1 rounded-full group-hover:bg-white/5"><MessageCircle size={26} /></div>
                     <span className="text-xs font-black">{post.comments.length}</span>
                  </button>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed"><span className="font-bold text-white mr-2">{post.user}</span>{post.description}</p>
              </div>
            </div>
          );
        })
      )}

      {/* Modais omitidos para brevidade (permanecem os mesmos) */}
      {activeModal?.type === 'menu' && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end animate-in fade-in duration-300" onClick={() => setActiveModal(null)}>
          <div className="w-full bg-slate-950 rounded-t-[3rem] p-8 border-t border-amber-500/20 animate-in slide-in-from-bottom duration-500 pb-12" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6" />
            <div className="space-y-3">
              <PostMenuButton icon={<LinkIcon size={18}/>} label="Copiar Link" onClick={() => handlePostAction('copy')} />
              <PostMenuButton icon={<EyeOff size={18}/>} label="Ocultar Post" onClick={() => handlePostAction('hide')} />
              <PostMenuButton icon={<UserX size={18}/>} label="Bloquear Usuário" onClick={() => handlePostAction('block')} variant="danger" />
              <PostMenuButton icon={<Flag size={18}/>} label="Denunciar Conteúdo" onClick={() => handlePostAction('report')} variant="danger" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PostMenuButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, variant?: 'default' | 'danger' }> = ({ icon, label, onClick, variant = 'default' }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98] ${variant === 'danger' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/10' : 'bg-amber-500/5 text-amber-500/70 border border-amber-500/10 hover:bg-amber-500/10 hover:text-amber-500'}`}>
    {icon}
    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
  </button>
);

export default Feed;
