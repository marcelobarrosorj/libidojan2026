import { supabase } from './supabase';
import { calcularIdade } from './idade';
import { User } from '../types';
import { isDemoEnabled, demoProfiles, isDemoId } from '../demo/index';

const JANELA_ONLINE_MS = 10 * 60 * 1000; // 10 minutos para evitar queda entre heartbeats
const onlineDeVerdade = (data: any): boolean => {
  const online = data.is_online === true || data.isOnline === true;
  if (!online) return false;
  const ts = data.last_seen || data.updated_at;
  if (!ts) return true;
  return (Date.now() - new Date(ts).getTime()) < JANELA_ONLINE_MS;
};

export const usuarioTemFotoValida = (u: any): boolean => {
  if (!u) return false;
  const url = String(u.photo_url || u.avatar || '').trim();
  if (url !== '' && !url.includes('dicebear.com') && !url.includes('unsplash.com')) return true;
  if (Array.isArray(u.photos) && u.photos.some((f: any) => String(f || '').trim() !== '')) return true;
  if (Array.isArray(u.gallery) && u.gallery.some((f: any) => String(f || '').trim() !== '')) return true;
  return false;
};

export const mapSupabaseToUser = (data: any): User => {
  const idadeCalc = calcularIdade(data.birth_date);
  if (idadeCalc != null) data.age = idadeCalc;
  const galeria = Array.isArray(data.photos) ? data.photos : (Array.isArray(data.gallery) ? data.gallery : []);
  const fotoPrincipal = data.photo_url || data.avatar || (galeria.length > 0 ? galeria[0] : '');
  return {
    ...data,
    id: data.user_id || data.id,
    user_id: data.user_id || data.id,
    userNumber: data.user_number,
    user_number: data.user_number,
    nickname: data.nickname || data.name || '',
    name: data.nickname || data.name || '',
    username: data.nickname || data.name || '',
    sexualOrientation: data.sexual_orientation || data.sexualOrientation,
    sexual_orientation: data.sexual_orientation || data.sexualOrientation,
    coupleProfile: data.couple_profile || data.coupleProfile,
    couple_profile: data.couple_profile || data.coupleProfile,
    gallery: galeria,
    photos: galeria,
    photo_url: fotoPrincipal,
    relationship_status: data.relationship_status || data.relationshipStatus,
    isBanned: data.is_banned || data.isBanned || false,
    is_banned: data.is_banned || data.isBanned || false,
    isDeleted: data.is_deleted || data.isDeleted || false,
    is_deleted: data.is_deleted || data.isDeleted || false,
    createdAt: data.created_at ? new Date(data.created_at).getTime() : (data.createdAt || Date.now()),
    followers: data.followers || 0,
    following: data.following || 0,
    isOnline: onlineDeVerdade(data),
    updated_at: data.updated_at || data.last_seen || null,
    location: data.location || { x: 0, y: 0 },
    radarUsedToday: data.radar_used_today || data.radarUsedToday || 0,
    visibilityScore: data.visibility_score || data.visibilityScore || 100,
    role: data.role || undefined,
  } as User;
};

export const mapUserToSupabase = (user: Partial<User>): any => {
  const result: any = { ...user };
  if (user.id !== undefined && user.user_id === undefined) result.user_id = user.id;
  if (user.name !== undefined && user.nickname === undefined) result.nickname = user.name;
  if (user.username !== undefined && result.nickname === undefined) result.nickname = user.username;
  if (user.sexualOrientation !== undefined) result.sexual_orientation = user.sexualOrientation;
  if (user.coupleProfile !== undefined) result.couple_profile = user.coupleProfile;
  if (user.gallery !== undefined) result.photos = user.gallery;
  if (user.isBanned !== undefined) result.is_banned = user.isBanned;
  if (user.isDeleted !== undefined) result.is_deleted = user.isDeleted;
  if (user.createdAt !== undefined) result.created_at = new Date(user.createdAt).toISOString();
  if (user.isOnline !== undefined) result.is_online = user.isOnline;

  delete result.premium;
  delete result.plan;
  delete result.premium_until;
  delete result.id;
  delete result.userNumber;
  delete result.user_number;
  delete result.name;
  delete result.username;
  delete result.sexualOrientation;
  delete result.coupleProfile;
  delete result.gallery;
  delete result.isBanned;
  delete result.isDeleted;
  delete result.createdAt;
  delete result.isOnline;

  return result;
};

export const createUserProfile = async (user: User) => {
  const supaUser = mapUserToSupabase(user);
  supaUser.premium = true;
  supaUser.plan = 'premium';
  supaUser.premium_until = new Date(Date.now() + 36 * 3600000).toISOString();
  const { error } = await supabase
    .from('users')
    .upsert(supaUser, { onConflict: 'user_id', ignoreDuplicates: true });
  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  if (isDemoId(userId)) {
    return demoProfiles.find(u => u.id === userId) as unknown as User || null;
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching user by id:', error);
    }
    return null;
  }

  if (!data) return null;

  try {
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (!roleError && roleData && roleData.role) {
      data.role = roleData.role;
      if (
        roleData.role === 'owner' ||
        roleData.role === 'admin' ||
        roleData.role === 'moderator'
      ) {
        data.plan = roleData.role;
      }
    }
  } catch {}

  return mapSupabaseToUser(data);
};

export const updateUserProfile = async (userId: string, data: Partial<User>) => {
  if (isDemoId(userId)) return;
  const updateData = mapUserToSupabase(data);
  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('user_id', userId);
  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
  try {
    await (supabase as any)
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', userId);
  } catch {}
};

export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*');
  if (error) {
    console.error('Error fetching all users:', error);
    return isDemoEnabled ? (demoProfiles as unknown as User[]) : [];
  }
  const realUsers = (data || []).map(mapSupabaseToUser).filter(usuarioTemFotoValida);
  if (!isDemoEnabled) return realUsers;

  const validDemos = (demoProfiles as unknown as User[]).filter(u => isDemoId(u.id || ''));
  const map = new Map<string, User>();
  realUsers.forEach(u => { if (u.id) map.set(u.id, u); });
  validDemos.forEach(u => { if (u.id && !map.has(u.id)) map.set(u.id, u); });
  return Array.from(map.values());
};

export const getActiveUsersOriginal = async (currentUserId: string): Promise<User[]> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .neq('user_id', currentUserId)
    .eq('status', 'active');
  if (error) {
    console.error('Error fetching active users:', error);
    return isDemoEnabled ? (demoProfiles as unknown as User[]) : [];
  }
  const realUsers = (data || []).map(mapSupabaseToUser).filter(usuarioTemFotoValida);
  if (!isDemoEnabled) return realUsers;

  const validDemos = (demoProfiles as unknown as User[]).filter(u => isDemoId(u.id || ''));
  const map = new Map<string, User>();
  realUsers.forEach(u => { if (u.id) map.set(u.id, u); });
  validDemos.forEach(u => { if (u.id && !map.has(u.id)) map.set(u.id, u); });
  return Array.from(map.values());
};

export const deleteUserProfile = async (userId: string) => {
  if (isDemoId(userId)) return;
  try {
    const { data: listaArquivos } = await supabase.storage.from('photos').list(userId);
    if (listaArquivos && listaArquivos.length > 0) {
      const caminhos = listaArquivos.map((f: any) => `${userId}/${f.name}`);
      await supabase.storage.from('photos').remove(caminhos);
    }
  } catch {}

  try { await (supabase as any).from('posts').delete().eq('user_id', userId); } catch {}
  try { await (supabase as any).from('post_comments').delete().eq('user_id', userId); } catch {}
  try { await (supabase as any).from('post_likes').delete().eq('user_id', userId); } catch {}
  try { await (supabase as any).from('follows').delete().or(`follower_id.eq.${userId},following_id.eq.${userId}`); } catch {}
  try { await (supabase as any).from('profile_visits').delete().or(`visitor_id.eq.${userId},visited_id.eq.${userId}`); } catch {}
  try { await (supabase as any).from('messages').delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`); } catch {}
  try { await (supabase as any).from('push_subscriptions').delete().eq('user_id', userId); } catch {}
  try { await (supabase as any).from('user_profiles').delete().eq('user_id', userId); } catch {}

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('user_id', userId);

  try {
    await supabase.rpc('excluir_minha_conta');
  } catch {}

  if (error) {
    console.error('Error deleting user profile:', error);
    throw error;
  }
};

export const getUsersByIds = async (userIds: string[]): Promise<User[]> => {
  if (!userIds.length) return [];
  const realIds = userIds.filter(id => !isDemoId(id));
  const demoUsers = isDemoEnabled ? (demoProfiles as unknown as User[]).filter(u => userIds.includes(u.id!) && isDemoId(u.id!)) : [];
  if (!realIds.length) return demoUsers;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .in('user_id', realIds);
  if (error) {
    console.error('Error fetching users by ids:', error);
    return demoUsers;
  }
  const realUsers = (data || []).map(mapSupabaseToUser).filter(usuarioTemFotoValida);

  const map = new Map<string, User>();
  realUsers.forEach(u => { if (u.id) map.set(u.id, u); });
  demoUsers.forEach(u => { if (u.id && !map.has(u.id)) map.set(u.id, u); });
  return Array.from(map.values());
};

export async function getActiveUsers(...args: any[]): Promise<any> {
  const res: any = await (getActiveUsersOriginal as any)(...args);
  const comIdade = (u: any) => {
    const ic = calcularIdade(u.birth_date);
    return (ic !== null && ic !== undefined) ? { ...u, age: ic } : u;
  };
  const filtrar = (lista: any[]) => lista.filter((u: any) => usuarioTemFotoValida(u)).map((u: any) => comIdade(u));
  if (Array.isArray(res)) { return filtrar(res); }
  if (res && Array.isArray(res.data)) { return { ...res, data: filtrar(res.data) }; }
  if (res && Array.isArray(res.users)) { return { ...res, users: filtrar(res.users) }; }
  return res;
}