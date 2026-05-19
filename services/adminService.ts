import { supabase } from './supabase';

/**
 * Admin Service - Central de Auditoria Governamental
 * Bypass RLS and capture raw data for security and moderation.
 */

export interface AdminMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface AdminMedia {
  userId: string;
  userNickname: string;
  mediaUrl: string;
  isBlurred: boolean;
  createdAt: string;
}

export interface AdminReport {
  id: string;
  reporter_id: string;
  target_id: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

export const adminService = {
  /**
   * Fetches reported items for moderation.
   */
  async getReportedItems(): Promise<AdminReport[]> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[ADMIN] No reports table found or access denied, returning mock report for audit.');
        return [
          {
            id: 'rep-001',
            reporter_id: 'user-002',
            target_id: '65a8d3a4-24b1-47d6-aec4-6819710abae8',
            reason: 'Comportamento Suspeito',
            description: 'Usuário casalx está muito longe do radar padrão.',
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ];
      }

      return data || [];
    } catch (e) {
      return [];
    }
  },

  /**
   * Fetches the raw list of messages ordered by date.
   */
  async getRawMessages(limit = 100): Promise<AdminMessage[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[ADMIN] Error fetching raw messages:', error);
        return [];
      }

      return data || [];
    } catch (e) {
      console.error('[ADMIN] Critical failure fetching messages:', e);
      return [];
    }
  },

  /**
   * Captures all media from profiles to evaluate moderation.
   */
  async getRawMedia(): Promise<AdminMedia[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, data')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('[ADMIN] Error fetching raw media:', error);
        return [];
      }

      const allMedia: AdminMedia[] = [];

      (data || []).forEach(profile => {
        const profileData = typeof profile.data === 'string' ? JSON.parse(profile.data) : (profile.data || {});
        const gallery = profileData.gallery || [];
        const updatedAt = profileData.updatedAt || new Date().toISOString();

        gallery.forEach((photo: any) => {
          allMedia.push({
            userId: profile.id,
            userNickname: profile.nickname || 'Agente',
            mediaUrl: typeof photo === 'string' ? photo : photo.url,
            isBlurred: !!photo.isBlurred,
            createdAt: photo.createdAt || updatedAt
          });
        });
      });

      return allMedia.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      console.error('[ADMIN] Critical failure fetching media:', e);
      return [];
    }
  }
};
