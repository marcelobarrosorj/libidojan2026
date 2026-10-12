import { Post, User } from '../types';
import { ProtectedImage } from './ProtectedImage';
import { Heart} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { toggleCurtida } from '../services/posts';
import { supabase } from '../services/supabase'; // CURTIDA-TOGGLE
import { PhotoGallery } from './PhotoGallery';

export function PostCard({ post, user, currentUser }: { post: Post; user?: User; currentUser?: User | null; key?: string | number }) {
  const [liked, setLiked] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const myIdPC = (currentUser as any)?.user_id || (currentUser as any)?.id; // CURTIDA-TOGGLE
  useEffect(() => {
    if (!myIdPC || !post?.id) return;
    supabase.from('post_likes').select('post_id').eq('post_id', post.id).eq('user_id', myIdPC).maybeSingle()
      .then(({ data }: any) => { if (data) setLiked(true); });
  }, [myIdPC, post?.id]);

  const handleLike = () => {
    if (!liked) {
      setLiked(v => !v);
      toggleCurtida(post.id).catch(console.error);
    } else {
      setLiked(false);
      toggleCurtida(post.id).catch(console.error); // CURTIDA-TOGGLE: descurtir persiste
    }
  };

  const currentGalleryPhotos = user?.photos || [post.image];

  return (
    <article className="bg-[var(--libido-bg)] border-b border-[var(--libido-border)]/60 pb-4 pt-2">
      {/* Header */}
      <div className="flex items-center px-4 py-3 gap-3">
        <div 
          onClick={() => setGalleryOpen(true)}
          className="w-8 h-8 rounded-full bg-[var(--libido-border)] shrink-0 overflow-hidden ring-1 ring-[var(--libido-border)]/50 cursor-pointer"
        >
          {user && <ProtectedImage currentUser={currentUser} src={user.photo_url} alt={user.name} className="w-full h-full" />}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-[var(--libido-text)] flex items-center gap-1.5 truncate">
            {user?.username}
            <span className="w-1 h-1 bg-[var(--libido-muted)] rounded-full"></span>
            <span className="text-xs text-[var(--libido-muted)] font-normal">Há pouco</span>
          </h2>
        </div>
      </div>

      {/* Image */}
      <div 
        className="w-full aspect-[4/5] sm:aspect-square bg-[#0a0a0a] overflow-hidden relative cursor-pointer"
        onClick={() => setGalleryOpen(true)}
      >
        <ProtectedImage currentUser={currentUser} src={post.image} alt="Post image" className="w-full h-full" />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <motion.button 
            whileTap={{ scale: 0.8 }}
            onClick={handleLike}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Heart className={`w-[26px] h-[26px] ${liked ? 'fill-red-500 text-red-500 line-through-none' : 'text-[var(--libido-text)]'}`} />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 space-y-1.5">
        <div className="text-[13px] font-semibold text-[var(--libido-text)]">
          {(post.likes || 0).toLocaleString()} curtidas
        </div>
        <div className="text-[13px] text-[var(--libido-text)] leading-snug">
          <span className="font-semibold mr-1.5">{user?.username}</span>
          <span>{post.text}</span>
        </div>
        <div className="text-[11px] text-[var(--libido-muted)] pt-0.5 font-medium cursor-pointer hover:text-[var(--libido-text)]">
          Ver todos os comentários
        </div>
      </div>

      {galleryOpen && (
        <PhotoGallery currentUser={currentUser} 
          photos={currentGalleryPhotos as string[]} 
          initialIndex={0} 
          onClose={() => setGalleryOpen(false)} 
        />
      )}
    </article>
  );
}

