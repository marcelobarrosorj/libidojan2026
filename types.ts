export enum UserType { HOMEM = 'Homem', MULHER = 'Mulher', CASAIS = 'Casais' }
export enum TrustLevel { BRONZE = 'Bronze', PRATA = 'Prata', OURO = 'Ouro' }
export enum Plan { FREE = 'Free', PREMIUM = 'Premium', GOLD = 'Gold' }
export enum TransactionType { SUBSCRIPTION = 'subscription', BOOST = 'boost', CREDITS = 'credits' }

export enum Biotype { 
  ATLETICO = 'Atlético', 
  CURVILINEO = 'Curvilíneo', 
  MAGRO = 'Magro', 
  PADRAO = 'Padrão', 
  PLUS_SIZE = 'Plus Size', 
  DEFINIDO = 'Definido' 
}

export enum Gender { 
  CIS = 'Cisgênero', 
  TRANS = 'Transgênero', 
  NB = 'Não-Binário' 
}

export enum SexualOrientation { 
  HETERO = 'Heterossexual', 
  BISSEXUAL = 'Bissexual', 
  HOMOSSEXUAL = 'Homossexual' 
}

export enum Vibes { 
  LIBERAL = 'Liberal', 
  SWING = 'Swing', 
  BDSM = 'BDSM', 
  FETISH = 'Fetish' 
}

export interface GalleryPhoto { 
  id: string; 
  url: string; 
  timestamp: string; 
  isBlurred?: boolean; 
}

export interface ProfileData {
  nickname: string;
  email?: string;
  age?: number;
  biotype: Biotype;
  height?: number;
  sexualPreference?: SexualOrientation;
  gender?: Gender;
  lookingFor?: UserType[];
  skinColor?: string;
  hairColor?: string;
  hairType?: string;
  eyeColor?: string;
}

export interface Vouch {
  id: string;
  fromUserId: string;
  toUserId: string;
  timestamp: string;
}

export interface User {
  id: string;
  nickname: string;
  email: string; 
  age: number;
  plan: Plan;
  balance: number;
  boosts_active: number;
  trustLevel: TrustLevel;
  is_premium: boolean;
  avatar: string;
  biotype: Biotype;
  bio: string;
  gender: Gender;
  sexualOrientation: SexualOrientation;
  type: UserType;
  lookingFor: UserType[];
  height: number;
  location: string;
  city?: string;
  neighborhood?: string;
  xp: number;
  level: number;
  isOnline: boolean;
  verifiedAccount: boolean;
  isGhostMode: boolean;
  gallery: GalleryPhoto[];
  badges: string[];
  boundaries: string[];
  behaviors: string[];
  braveryLevel: number;
  updatedAt?: string;
  vibes: Vibes[];
  bucketList: string[];
  lat: number;
  lon: number;
  birthDate: string;
  rsvps: string[];
  vouches: Vouch[];
  bookmarks: string[];
  blockedUsers: string[];
  matches: string[];
  seenBy: string[];
  bodyMods: string[];
  bodyHair: string;
  bodyArt: string[];
  bondageExp: string;
  bestMoments: string[];
  bestFeature: string;
  beveragePref: string;
  bestTime: string;
  busyMode: boolean;
  bookingPolicy: string;
  verificationScore: number;
  hasBlurredGallery: boolean;
}

export type Step = 'type' | 'details' | 'physical' | 'confirm';
export type ProfileType = 'man' | 'woman' | 'couple_fxm' | 'couple_mxm' | 'couple_fxf' | 'trans_man' | 'trans_woman';

export interface CoupleProfileData { 
  mainNickname: string; 
  email: string; 
  partner1: ProfileData; 
  partner2: ProfileData; 
  lookingFor: UserType[]; 
  customizeNicknames?: boolean;
}

export interface RegistrationPayload { 
  profileType: ProfileType; 
  data: ProfileData | CoupleProfileData; 
  acceptedTerms: boolean; 
}

export interface Post {
  id: string | number;
  userId: string;
  user: string;
  age: number;
  avatar: string;
  image: string;
  description: string;
  likes: number;
  comments: { user: string; text: string }[];
  shares: number;
  liked: boolean;
  timestamp: string;
}

export interface PartnerData {
  nickname: string;
  age: number;
  gender: Gender;
  sexualPreference: SexualOrientation;
  biotype: Biotype;
  height: number;
  skinColor: string;
  hairColor: string;
  hairType: string;
  lookingFor: UserType[];
}

export interface Shoutout {
  id: string;
  userId: string;
  text: string;
  type: string;
  timestamp: string;
}

export interface RadarResultItem {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
  category?: string;
  distanceKm: number;
  distanceLabel: string;
  locationLabel: string;
  city: string;
  neighborhood: string;
  lat: number;
  lon: number;
  trustLevel: TrustLevel;
  isLocked?: boolean;
  isMock?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  lat: number;
  lon: number;
  city: string;
  neighborhood: string;
  category: string;
  categories: string[];
  avatar: string;
  bio: string;
}

export interface RadarProfile {
  id: string;
  name: string;
  avatar: string;
  lat: number;
  lon: number;
  city: string;
  neighborhood: string;
  distanceKm?: number;
  distanceLabel?: string;
  locationLabel?: string;
  bio?: string;
  category?: string;
  isMock?: boolean;
  braveryLevel?: number;
  trustLevel?: TrustLevel;
  isGhostMode?: boolean;
  gallery?: GalleryPhoto[];
  currentShoutout?: {
    text: string;
    type: 'drink' | 'talk' | 'meet' | 'party';
  };
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  status: string;
  timestamp: string;
}

export interface EventItem {
  id: string;
  title: string;
  organizer: string;
  category: 'Festa' | 'Social' | 'Clube' | 'Parceiro';
  date: string;
  vibeScore: number;
  image: string;
  description: string;
  confirmedGuests?: { id: string; avatar: string; trust: TrustLevel }[];
  dressCode?: string;
  audience: string;
  isVerifiedPartner?: boolean;
}