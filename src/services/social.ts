import { supabase } from './supabase';

// ==================== AMIZADES ====================
// Amizade precisa de aceitacao mutua (estilo Facebook)

export const sendFriendRequest = async (requesterId: string, addresseeId: string) => {
  const { error } = await supabase
    .from('friendships')
    .insert({ requester_id: requesterId, addressee_id: addresseeId, status: 'pending' });
  if (error) throw error;
};

export const acceptFriendRequest = async (requesterId: string, addresseeId: string) => {
  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('requester_id', requesterId)
    .eq('addressee_id', addresseeId);
  if (error) throw error;
};

// Recusar remove o pedido (quem enviou pode enviar de novo depois)
export const rejectFriendRequest = async (requesterId: string, addresseeId: string) => {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('requester_id', requesterId)
    .eq('addressee_id', addresseeId);
  if (error) throw error;
};

// Remove a amizade em qualquer direcao
export const removeFriend = async (userId: string, friendId: string) => {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .or(`and(requester_id.eq.${userId},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${userId})`)
    .eq('status', 'accepted');
  if (error) throw error;
};

export const getFriends = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
  if (error) {
    console.error('Error fetching friends:', error);
    return [];
  }
  return (data || []).map((f: any) => (f.requester_id === userId ? f.addressee_id : f.requester_id));
};

// Pedidos de amizade recebidos e pendentes
export const getPendingRequests = async (userId: string) => {
  const { data, error } = await supabase
    .from('friendships')
    .select('requester_id, created_at')
    .eq('addressee_id', userId)
    .eq('status', 'pending');
  if (error) {
    console.error('Error fetching pending requests:', error);
    return [];
  }
  return data || [];
};

// Status entre dois usuarios: none | pending_sent | pending_received | friends
export const getFriendshipStatus = async (
  userId: string,
  otherId: string
): Promise<'none' | 'pending_sent' | 'pending_received' | 'friends'> => {
  const { data, error } = await supabase
    .from('friendships')
    .select('requester_id, status')
    .or(`and(requester_id.eq.${userId},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${userId})`);
  if (error || !data || data.length === 0) return 'none';
  const f: any = data[0];
  if (f.status === 'accepted') return 'friends';
  return f.requester_id === userId ? 'pending_sent' : 'pending_received';
};

// ==================== SEGUIR ====================
// Seguir e unilateral (estilo Instagram)

export const followUser = async (followerId: string, followingId: string) => {
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, following_id: followingId });
  if (error) throw error;
};

export const unfollowUser = async (followerId: string, followingId: string) => {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);
  if (error) throw error;
};

export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();
  if (error) return false;
  return !!data;
};

export const getFollowers = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('following_id', userId);
  if (error) {
    console.error('Error fetching followers:', error);
    return [];
  }
  return (data || []).map((f: any) => f.follower_id);
};

export const getFollowing = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);
  if (error) {
    console.error('Error fetching following:', error);
    return [];
  }
  return (data || []).map((f: any) => f.following_id);
};

// Resumo para exibir no perfil: X amigos, Y seguidores, Z seguindo
export const getSocialCounts = async (userId: string) => {
  const [friends, followers, following] = await Promise.all([
    getFriends(userId),
    getFollowers(userId),
    getFollowing(userId)
  ]);
  return {
    friends: friends.length,
    followers: followers.length,
    following: following.length
  };
};