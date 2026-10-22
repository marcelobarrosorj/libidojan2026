import { supabase } from './supabase';
import { Post } from '../types';
import { isDemoEnabled, demoPosts, isDemoId } from '../demo/index';

const mapSupabaseToPost = (row: any): Post => ({
  id: String(row.id),
  userId: row.user_id,
  image: row.image,
  text: row.text,
  likes: row.likes ?? 0,
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
});

export const createPost = async (post: Post) => {
  const { error } = await supabase.from('posts').insert({
    user_id: post.userId,
    image: post.image || null,
    text: post.text,
    created_at: new Date(post.createdAt).toISOString()
  });
  if (error) throw error;
};

export const getFeedPosts = (callback: (posts: Post[]) => void) => {
  let isSubscribed = true;
  if (isDemoEnabled) {
    callback([...demoPosts] as Post[]);
    return () => { isSubscribed = false; };
  }

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (!isSubscribed || !data) return;

      // FEED-AVATAR: busca o perfil dos autores e cola o avatar no post.
      // Antes o avatar dependia do array users estar carregado no Feed,
      // e quando nao estava o post caia no DiceBear.
      const ids = Array.from(new Set(data.map((p: any) => p.user_id).filter(Boolean)));
      const mapaAvatar: Record<string, string> = {};
      if (ids.length > 0) {
        const { data: perfis } = await supabase
          .from('user_profiles')
          .select('user_id, photo_url, photos')
          .in('user_id', ids);
        (perfis || []).forEach((u: any) => {
          const foto = u.photo_url || (Array.isArray(u.photos) && u.photos[0]) || "";
          if (foto) mapaAvatar[u.user_id] = foto;
        });
      }

      if (!isSubscribed) return;

      // FEED-DEDUP: garante id unico antes de entregar a lista.
      const vistos = new Set<string>();
      const finalPosts: any[] = [];
      for (const p of data.map(mapSupabaseToPost)) {
        if (vistos.has(p.id)) continue;
        vistos.add(p.id);
        finalPosts.push({ ...p, avatar: mapaAvatar[p.userId] || "" });
      }

      callback(finalPosts);
    } catch (err) {
      console.error('Error fetching posts from supabase:', err);
    }
  };

  fetchPosts();
  const channel = supabase.channel('public:posts')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => {
      fetchPosts();
    })
    .subscribe();
  return () => {
    isSubscribed = false;
    supabase.removeChannel(channel);
  };
}

export const likePost = async (postId: string) => {
  if (isDemoId(postId)) return;
  try {
    const { error } = await supabase.rpc('increment_likes', { post_id: postId });
    if (error) {
      const { data: post } = await supabase.from('posts').select('likes').eq('id', postId).single();
      if (post) {
        await supabase.from('posts').update({ likes: (post.likes || 0) + 1 }).eq('id', postId);
      }
    }
  } catch (err) {
    console.error('Error liking post in supabase:', err);
  }
};

// FEED-DELETE: o autor pode excluir o proprio post a qualquer momento
export async function excluirPost(postId: string): Promise<boolean> {
  const { error } = await (supabase as any).from('posts').delete().eq('id', postId);
  if (error) { console.error('FEED-DELETE falhou', error); return false; }
  return true;
}

// CURTIDA-TOGGLE: curtir/descurtir de verdade (um like por usuario, alternavel)
export const getMinhasCurtidas = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', userId);
  if (error) return [];
  return (data || []).map((r: any) => r.post_id);
};

export const toggleCurtida = async (postId: string) => {
  try {
    const { data: sess } = await supabase.auth.getSession();
    const uid = (sess as any)?.user?.id || (sess as any)?.session?.user?.id;
    if (!uid) return;
    const { data: existente } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('post_id', postId)
      .eq('user_id', uid)
      .maybeSingle();
    if (existente) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', uid);
      const { error: eRpc } = await supabase.rpc('curtir_post', { p_post_id: postId, p_delta: -1 });
      if (eRpc) {
        const { data: post } = await supabase.from('posts').select('likes').eq('id', postId).maybeSingle();
        const novo = Math.max(0, ((post as any)?.likes || 0) - 1);
        await supabase.from('posts').update({ likes: novo }).eq('id', postId);
      }
    } else {
      const { error: eIns } = await supabase.from('post_likes').insert({ post_id: postId, user_id: uid });
      if (!eIns) {
        const { error: eRpc2 } = await supabase.rpc('curtir_post', { p_post_id: postId, p_delta: 1 });
        if (eRpc2) {
          const { data: post } = await supabase.from('posts').select('likes').eq('id', postId).maybeSingle();
          const novo = ((post as any)?.likes || 0) + 1;
          await supabase.from('posts').update({ likes: novo }).eq('id', postId);
        }
      }
    }
  } catch (eT) {}
};

// COMENTARIOS-FEED: sistema de comentarios dos posts do feed
export const getComentarios = async (postId: string): Promise<any[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error || !data) { console.error('COMENTARIOS-LEITURA-ERRO:', error); return []; } // COMENTARIO-ERRO-VISIVEL
    return data as any[];
  } catch { return []; }
};
export const adicionarComentario = async (postId: string, userId: string, texto: string): Promise<any | null> => {
  try {
    const { data, error } = await (supabase as any)
      .from('post_comments')
      .insert({ post_id: postId, user_id: userId, texto })
      .select()
      .single();
    if (error || !data) { console.error('COMENTARIO-GRAVACAO-ERRO:', error); return null; } // COMENTARIO-ERRO-VISIVEL
    return data;
  } catch { return null; }
};
export const excluirComentario = async (id: string): Promise<boolean> => {
  try {
    const { error } = await (supabase as any)
      .from('post_comments')
      .delete()
      .eq('id', id);
    return !error;
  } catch { return false; }
};

