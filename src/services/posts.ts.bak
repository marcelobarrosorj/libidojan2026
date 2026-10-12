import { supabase } from './supabase';
import { Post } from '../types';

const mapSupabaseToPost = (row: any): Post => ({
  id: String(row.id),
  userId: row.user_id,
  image: row.image,
  text: row.text,
  likes: row.likes ?? 0,
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
});

export const createPost = async (post: Post) => {
  try {
    const { error } = await supabase.from('posts').insert({
      user_id: post.userId,
      image: post.image,
      text: post.text,
      created_at: new Date(post.createdAt).toISOString()
    });
    
    if (error) throw error;
  } catch (err) {
    console.error('Error creating post in supabase:', err);
  }
};

import { isDemoEnabled, demoPosts } from '../demo/index';

export const getFeedPosts = (callback: (posts: Post[]) => void) => {
  let isSubscribed = true;
  
  if (isDemoEnabled) {
    // Quando a demonstração estiver ativada, mostrar somente os novos posts demonstrativos centralizados.
    // Nunca misture um post demo com chamadas reais ao Supabase.
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
      
      if (isSubscribed && data) {
        let finalPosts = data.map(mapSupabaseToPost);
        callback(finalPosts);
      }
    } catch (err) {
      console.error('Error fetching posts from supabase:', err);
    }
  };
  
  fetchPosts();
  
  const channel = supabase.channel('public:posts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
      fetchPosts();
    })
    .subscribe();
    
  return () => {
    isSubscribed = false;
    supabase.removeChannel(channel);
  };
};

import { isDemoId } from '../demo/index';
export const likePost = async (postId: string) => {
  if (isDemoId(postId)) return; // ações em posts de demonstração: somente estado local
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
