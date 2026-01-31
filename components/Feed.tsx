
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_POSTS, MOCK_USERS } from '../constants';
import { Post, User, GalleryPhoto } from '../types';
import { Heart, MessageCircle, MoreHorizontal, X, Maximize2, ChevronLeft, ChevronRight, Send, Flag, UserX, Link as LinkIcon, EyeOff } from 'lucide-react';
import { log, handleButtonAction, showNotification } from '../services/authUtils';
import { soundService } from '../services/soundService';
import ProtectedImage from './common/ProtectedImage';
import { CONFIG } from '../config';

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [activeModal, setActiveModal] = useState<{ type: 'comment' | 'share' | 'gallery' | 'menu'; postId?: string | number; userId?: string } | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<{ url: string; index: number; photos: GalleryPhoto[]; ownerNickname: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const likePost = async (postId: string | number) => {
    await handleButtonAction(`POST_LIKE_${postId}`, async () => {
        const post = posts.find(p => p.id === postId);
        const isNowLiked = !post?.liked;

        // GATILHO SONORO: Pop de interação (apenas se estiver curtindo)
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

  const openFullscreen = (index: number, photos: GalleryPhoto[], nickname: string) => {
    setFullscreenImage({ url: photos[index].url, index, photos, ownerNickname: nickname });
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
      {posts.map(post => {
        const isLiked = post.liked;
        return (
          <div key={post.id} className="glass-card rounded-[2.5rem] overflow-hidden border-slate-800/50 shadow-2xl relative">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveModal({ type: 'gallery', userId: post.userId })}>
                <img src={post.avatar} className="w-10 h-10 rounded-full border-2 border-amber-500/30 object-cover group-hover:border-amber-500 transition-colors" />
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors">{post.user}, {post.age}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sincronizado</p>
                </div>
              </div>
              <button onClick={() => setActiveModal({ type: 'menu', postId: post.id })} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors"><MoreHorizontal size={20} /></button>
            </div>

            <div className="relative aspect-square cursor-pointer overflow-hidden" onClick={() => setActiveModal({ type: 'gallery', userId: post.userId })}>
              <ProtectedImage src={post.image} alt={post.description} className="w-full h-full hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-6 z-[65]">
                <p className="text-[11px] text-white font-black uppercase tracking-[0.2em] flex items-center gap-2">Ver Galeria <Maximize2 size={12} /></p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-6">
                <button onClick={() => likePost(post.id)} disabled={isProcessing} className={`flex items-center gap-2 transition-all active:scale-90 group ${isLiked ? 'text-pink' : 'text-slate-400'}`}>
                  <div className={`p-1 rounded-full ${isLiked ? 'bg-pink/10 shadow-[0_0_15px_rgba(255,20,147,0.3)]' : 'group-hover:bg-white/5'}`}>
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
      })}

      {activeModal?.type === 'menu' && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end animate-in fade-in duration-300" onClick={() => setActiveModal(null)}>
          <div className="w-full glass-card rounded-t-[3rem] p-8 border-white/10 animate-in slide-in-from-bottom duration-500 pb-12" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6" />
            <div className="space-y-3">
              <PostMenuButton icon={<LinkIcon size={18}/>} label="Link" onClick={() => handlePostAction('copy')} />
              <PostMenuButton icon={<EyeOff size={18}/>} label="Ocultar" onClick={() => handlePostAction('hide')} />
              <PostMenuButton icon={<UserX size={18}/>} label="Bloquear" onClick={() => handlePostAction('block')} variant="danger" />
              <PostMenuButton icon={<Flag size={18}/>} label="Denunciar" onClick={() => handlePostAction('report')} variant="danger" />
            </div>
          </div>
        </div>
      )}

      {activeModal?.type === 'comment' && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-end animate-in fade-in">
          <div className="w-full glass-card rounded-t-[3rem] p-8 border-white/10 animate-in slide-in-from-bottom pb-12">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Comentários</h3>
              <button onClick={() => setActiveModal(null)} className="p-2 bg-white/5 rounded-full"><X size={20} className="text-slate-500" /></button>
            </div>
            <div className="space-y-4 max-h-[40vh] overflow-y-auto mb-6 px-2 scrollbar-hide">
              {posts.find(p => p.id === activeModal.postId)?.comments.map((c, i) => (
                <div key={i} className="bg-white/5 p-3 rounded-2xl border border-white/5">
                   <div className="font-black text-pink text-[9px] uppercase tracking-widest mb-1">{c.user}</div>
                   <div className="text-xs text-slate-300 leading-tight">{c.text}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={commentText} onChange={(e) => setCommentText(e.target.value)} className="flex-1 bg-slate-900 border border-white/5 rounded-2xl p-4 text-xs text-white outline-none focus:border-pink/50 transition-all" placeholder="Diga algo..." />
              <button onClick={addComment} disabled={!commentText.trim()} className="bg-pink text-white w-12 h-12 flex items-center justify-center rounded-2xl disabled:opacity-50"><Send size={20} /></button>
            </div>
          </div>
        </div>
      )}

      {activeModal?.type === 'gallery' && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col pt-20 animate-in slide-in-from-bottom-10">
          <button onClick={() => setActiveModal(null)} className="absolute top-8 right-8 p-3 bg-slate-900/50 hover:bg-slate-800 rounded-full text-white z-[110] border border-white/10"><X size={24} /></button>
          <div className="flex items-center gap-5 mb-8 px-6">
            <img src={getUser(activeModal.userId!).avatar} className="w-20 h-20 rounded-full border-4 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)] object-cover" />
            <div>
               <h3 className="text-3xl font-black text-white font-outfit uppercase italic tracking-tighter leading-none">{getUser(activeModal.userId!).nickname}, {getUser(activeModal.userId!).age}</h3>
               <span className="text-[10px] bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full font-black uppercase tracking-widest mt-2 inline-block">{getUser(activeModal.userId!).type}</span>
            </div>
          </div>
          <div className="gallery-grid overflow-y-auto pb-32 px-4 scrollbar-hide">
            {(getUser(activeModal.userId!).gallery || []).map((photo, index) => (
              <div key={photo.id} onClick={() => openFullscreen(index, getUser(activeModal.userId!).gallery || [], getUser(activeModal.userId!).nickname)} className="aspect-[3/4] rounded-[2.5rem] overflow-hidden glass-card group relative animate-in zoom-in-90 shadow-xl cursor-pointer">
                <ProtectedImage src={photo.url} alt="Galeria" isBlurred={photo.isBlurred} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              </div>
            ))}
          </div>
        </div>
      )}

      {fullscreenImage && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          <div className="absolute top-8 left-6 right-6 flex items-center justify-between z-[320]">
            <div className="space-y-1">
              <p className="text-white text-xs font-black uppercase tracking-widest">{fullscreenImage.ownerNickname}</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{fullscreenImage.index + 1} de {fullscreenImage.photos.length}</p>
            </div>
            <button onClick={() => setFullscreenImage(null)} className="p-3 bg-white/5 rounded-full text-white backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-colors"><X size={24} /></button>
          </div>

          <div className="absolute inset-y-0 left-4 flex items-center z-[315]">
            <button onClick={(e) => { e.stopPropagation(); navigateFullscreen('prev'); }} className="p-3 bg-black/20 hover:bg-black/40 text-white/50 hover:text-white rounded-full transition-all border border-white/5"><ChevronLeft size={32} /></button>
          </div>
          <div className="absolute inset-y-0 right-4 flex items-center z-[315]">
            <button onClick={(e) => { e.stopPropagation(); navigateFullscreen('next'); }} className="p-3 bg-black/20 hover:bg-black/40 text-white/50 hover:text-white rounded-full transition-all border border-white/5"><ChevronRight size={32} /></button>
          </div>

          <div className="w-full h-full flex items-center justify-center p-4">
            <ProtectedImage src={fullscreenImage.url} alt="Preview" className="max-w-full max-h-[85vh] rounded-3xl shadow-[0_0_100px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-500" />
          </div>

          <div className="absolute bottom-10 flex gap-2 z-[320]">
            {fullscreenImage.photos.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === fullscreenImage.index ? 'w-6 bg-pink' : 'w-1.5 bg-white/20'}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PostMenuButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, variant?: 'default' | 'danger' }> = ({ icon, label, onClick, variant = 'default' }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98] ${variant === 'danger' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/10' : 'bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10'}`}>
    {icon}
    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
  </button>
);

export default Feed;
