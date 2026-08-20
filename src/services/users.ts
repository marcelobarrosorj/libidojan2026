import { supabase } from './supabase';
import { User } from '../types';
import { isDemoEnabled, demoProfiles, isDemoId } from '../demo/index';



export const mapSupabaseToUser = (data: any): User => {
  return {
    ...data,
    id: data.user_id || data.id,
    user_id: data.user_id || data.id,
    userNumber: data.user_number,
    user_number: data.user_number,
    nickname: data.nickname || data.name || '',
    name: data.nickname || data.name || '',
    username: data.nickname || data.name || '',
    pin: data.pin,
    sexualOrientation: data.sexual_orientation || data.sexualOrientation,
    sexual_orientation: data.sexual_orientation || data.sexualOrientation,
    coupleProfile: data.couple_profile || data.coupleProfile,
    couple_profile: data.couple_profile || data.coupleProfile,
    gallery: data.photos || data.gallery || [],
    photos: data.photos || data.gallery || [],
    photo_url: data.photo_url || data.avatar || '',
    relationship_status: data.relationship_status || data.relationshipStatus,
    isBanned: data.is_banned || data.isBanned || false,
    is_banned: data.is_banned || data.isBanned || false,
    isDeleted: data.is_deleted || data.isDeleted || false,
    is_deleted: data.is_deleted || data.isDeleted || false,
    createdAt: data.created_at ? new Date(data.created_at).getTime() : (data.createdAt || Date.now()),
    followers: data.followers || 0,
    following: data.following || 0,
    isOnline: data.is_online || data.isOnline || false,
    location: data.location || { x: 0, y: 0 },
    radarUsedToday: data.radar_used_today || data.radarUsedToday || 0,
    visibilityScore: data.visibility_score || data.visibilityScore || 100,
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
};

export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*');
  if (error) {
    console.error('Error fetching all users:', error);
    return isDemoEnabled ? (demoProfiles as unknown as User[]) : [];
  }
  const realUsers = (data || []).map(mapSupabaseToUser);
  if (!isDemoEnabled) return realUsers;
  const validDemos = (demoProfiles as unknown as User[]).filter(u => isDemoId(u.id || ''));
  const map = new Map<string, User>();
  realUsers.forEach(u => { if (u.id) map.set(u.id, u); });
  validDemos.forEach(u => { if (u.id && !map.has(u.id)) map.set(u.id, u); });
  return Array.from(map.values());
};

export const getActiveUsers = async (currentUserId: string): Promise<User[]> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .neq('user_id', currentUserId)
    .eq('status', 'active');
  if (error) {
    console.error('Error fetching active users:', error);
    return isDemoEnabled ? (demoProfiles as unknown as User[]) : [];
  }
  const realUsers = (data || []).map(mapSupabaseToUser);
  if (!isDemoEnabled) return realUsers;
  const validDemos = (demoProfiles as unknown as User[]).filter(u => isDemoId(u.id || ''));
  const map = new Map<string, User>();
  realUsers.forEach(u => { if (u.id) map.set(u.id, u); });
  validDemos.forEach(u => { if (u.id && !map.has(u.id)) map.set(u.id, u); });
  return Array.from(map.values());
};

export const deleteUserProfile = async (userId: string) => {
  if (isDemoId(userId)) return;
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('user_id', userId);
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
  const realUsers = (data || []).map(mapSupabaseToUser);
  
  const map = new Map<string, User>();
  realUsers.forEach(u => { if (u.id) map.set(u.id, u); });
  demoUsers.forEach(u => { if (u.id && !map.has(u.id)) map.set(u.id, u); });
  return Array.from(map.values());
};