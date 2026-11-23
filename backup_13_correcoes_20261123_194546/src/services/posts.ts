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
  // CREATE-POST-FEED-EVENT: atualiza o feed imediatamente apos criar post
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('feedUpdated'));
  }
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

      const ids = Array.from(new Set(data.map((p: any) => p.user_id).filter(Boolean)));
      const mapaAvatar: Record<string, string> = {};
      const usuariosComFoto = new Set<string>();

      if (ids.length > 0) {
        const { data: perfis } = await supabase
          .from('user_profiles')
          .select('user_id, photo_url, photos')
          .in('user_id', ids);
        (perfis || []).forEach((u: any) => {
          const foto = u.photo_url || (Array.isArray(u.photos) && u.photos[0]) || "";
          if (foto && String(foto).trim() !== '') {
            mapaAvatar[u.user_id] = foto;
            usuariosComFoto.add(u.user_id);
          }
        });
      }

      if (!isSubscribed) return;

      const vistos = new Set<string>();
      const finalPosts: any[] = [];
      for (const p of data.map(mapSupabaseToPost)) {
        if (vistos.has(p.id)) continue;
        // Proibido exibir posts de usuarios sem foto
        if (!usuariosComFoto.has(p.userId)) continue;
        vistos.add(p.id);
        finalPosts.push({ ...p, avatar: mapaAvatar[p.userId] || "" });
      }

      callback(finalPosts);
    } catch (err) {
      console.error('Error fetching posts from supabase:', err);
    }
  };

  fetchPosts();
  const handleFeedRefresh = () => { fetchPosts(); };
  if (typeof window !== 'undefined') {
    window.addEventListener('feedUpdated', handleFeedRefresh);
  }

  const channel = supabase.channel('public:posts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
      fetchPosts();
    })
    .subscribe();
  return () => {
    isSubscribed = false;
    if (typeof window !== 'undefined') {
      window.removeEventListener('feedUpdated', handleFeedRefresh);
    }
    supabase.removeChannel(channel);
  };
};

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

// FEED-DELETE: exclui o post do feed (e atualiza a tela imediatamente)
export async function excluirPost(postId: string): Promise<boolean> {
  try {
    const { data: postAtual } = await (supabase as any).from('posts').select('user_id, image').eq('id', postId).maybeSingle();
    const { error } = await (supabase as any).from('posts').delete().eq('id', postId);
    if (error) {
      console.error('FEED-DELETE falhou', error);
      return false;
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('feedUpdated'));
    }
    return true;
  } catch (e) {
    console.error('FEED-DELETE erro:', e);
    return false;
  }
}

// GALERIA->FEED SYNC: ao excluir foto da galeria, exclui todos os posts do feed com aquela foto
export async function excluirPostPorFoto(userId: string, imageUrl: string): Promise<boolean> {
  if (!userId || !imageUrl) return false;
  try {
    const { error } = await (supabase as any)
      .from('posts')
      .delete()
      .eq('user_id', userId)
      .eq('image', imageUrl);
    if (error) {
      console.error('GALERIA-FEED-DELETE falhou:', error);
      return false;
    }
    // Tenta remover do Storage caso seja do bucket photos
    try {
      const marcador = '/object/public/photos/';
      const idx = imageUrl.indexOf(marcador);
      if (idx !== -1) {
        const storagePath = decodeURIComponent(imageUrl.substring(idx + marcador.length));
        await supabase.storage.from('photos').remove([storagePath]);
      }
    } catch (e) { console.error(e); }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('feedUpdated'));
    }
    return true;
  } catch (e) {
    console.error('GALERIA-FEED-DELETE erro:', e);
    return false;
  }
}

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
  } catch (eT) { console.error(eT); }
};

export const getComentarios = async (postId: string): Promise<any[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error || !data) { console.error('COMENTARIOS-LEITURA-ERRO:', error); return []; }
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
    if (error || !data) { console.error('COMENTARIO-GRAVACAO-ERRO:', error); return null; }
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
// GALERIA->FEED SYNC: garante que uma foto exista na tabela posts sem duplicar
export async function garantirPostDaFoto(
  userId: string,
  imageUrl: string,
  text = ''
): Promise<boolean> {
  const uid = String(userId || '').trim();
  const img = String(imageUrl || '').trim();
  if (!uid || !img) return false;
  if (img.includes('dicebear.com') || img.includes('photo-1534528741775')) return false;

  try {
    const { data: existentes, error: errCheck } = await supabase
      .from('posts')
      .select('id')
      .eq('user_id', uid)
      .eq('image', img)
      .limit(1);

    if (!errCheck && Array.isArray(existentes) && existentes.length > 0) {
      return true;
    }

    const { error: errInsert } = await supabase.from('posts').insert({
      user_id: uid,
      image: img,
      text: text || '',
      created_at: new Date().toISOString()
    });

    if (errInsert) {
      console.error('GALERIA-FEED-SYNC insert falhou:', errInsert);
      return false;
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('feedUpdated'));
    }
    return true;
  } catch (e) {
    console.error('GALERIA-FEED-SYNC erro:', e);
    return false;
  }
}

// GALERIA->FEED SYNC: reconcilia todas as fotos da galeria com a tabela posts
export async function sincronizarGaleriaComFeed(
  userId: string,
  photos?: string[] | null,
  photoUrl?: string | null
): Promise<number> {
  const uid = String(userId || '').trim();
  if (!uid) return 0;

  const candidatas = Array.from(
    new Set(
      [...(Array.isArray(photos) ? photos : []), photoUrl || '']
        .map((u) => String(u || '').trim())
        .filter((u) => u.length > 0 && !u.includes('dicebear.com') && !u.includes('photo-1534528741775'))
    )
  );

  if (candidatas.length === 0) return 0;

  try {
    const { data: postsExistentes, error } = await supabase
      .from('posts')
      .select('image')
      .eq('user_id', uid);

    if (error) {
      console.error('SYNC-GALERIA leitura posts falhou:', error);
      return 0;
    }

    const imagensNoFeed = new Set(
      (postsExistentes || []).map((p: any) => String(p.image || '').trim()).filter(Boolean)
    );

    const faltantes = candidatas.filter((img) => !imagensNoFeed.has(img));
    if (faltantes.length === 0) return 0;

    let criadas = 0;
    for (const img of faltantes) {
      const ok = await garantirPostDaFoto(uid, img, '');
      if (ok) criadas++;
    }

    if (criadas > 0 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('feedUpdated'));
    }
    return criadas;
  } catch (e) {
    console.error('SYNC-GALERIA erro:', e);
    return 0;
  }
}