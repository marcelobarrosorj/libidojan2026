export interface CoupleProfileData {
  // Campos reais Supabase
  maleNickname?: string;
  maleAge?: number | string;
  maleOrientation?: string;
  maleBiotype?: string;
  maleHeight?: number | string;
  femaleNickname?: string;
  femaleAge?: number | string;
  femaleOrientation?: string;
  femaleBiotype?: string;
  femaleHeight?: number | string;

  // Campos legados temporários
  maleName?: string;
  maleCharacteristics?: string;
  femaleName?: string;
  femaleCharacteristics?: string;
}

export interface CoupleProfile {
  coupleName: string;
  maleProfile: {
    nickname: string;
    age: number;
    characteristics?: string;
  };
  femaleProfile: {
    nickname: string;
    age: number;
    characteristics?: string;
  };
  sharedPhotos?: string[];
}

export interface User {
  userNumber?: number;
  user_number?: number;
  // Campos reais Supabase
  user_id?: string;
      nickname?: string;
  age?: string;
  gender?: string;
  relationship_status?: string;
  bio?: string;
  photo_url?: string;
  photos?: string[];
  height?: number;
  biotype?: string;
  sexual_orientation?: string;
  status?: string;
  pin?: string;
  plan?: string;
  couple_profile?: CoupleProfileData | any;

  // Campos legados temporários
  id?: string;
  name?: string;
  username?: string;
  sexualOrientation?: string;
  coupleProfile?: CoupleProfileData | any;
  userType?: 'single' | 'couple';
  gallery?: string[];
  preferences?: string;
  followers: number;
  following: number;
  isOnline: boolean;
  location: { x: number; y: number };
  premium?: boolean;
  email?: string;
  emailVerified?: boolean;
  radarUsedToday?: number;
  lastRadarReset?: number;
  visibilityScore?: number;
    isBanned?: boolean;
  isDeleted?: boolean;
  is_banned?: boolean;
  is_deleted?: boolean;
  is_online?: boolean;
  createdAt?: number;
}

export interface Post {
  id: string;
  userId: string;
  image: string;
  text: string;
  likes: number;
  createdAt: number;
}

export interface Message {
  id: string;
  from: string;
  to: string;
  text: string;
  createdAt: number;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface Report {
  id: string;
  reporterId: string;
  targetUserId: string;
  reason: string;
  timestamp: number;
  status: 'open' | 'reviewed' | 'resolved';
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetId: string;
  timestamp: number;
}
