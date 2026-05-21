
export enum UserType { HOMEM = 'Homem', MULHER = 'Mulher', CASAIS = 'Casais', GRUPO = 'Grupos' }
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
  MASCULINO = 'Masculino', 
  FEMININO = 'Feminino' 
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
  FETISH = 'Fetish',
  VOYEUR = 'Voyeur',
  EXIBICIONISMO = 'Exibicionismo',
  CUCKOLD = 'Cuckold',
  TROCA_TOTAL = 'Troca Total',
  PONTO_G = 'Ponto G'
}

export interface GalleryPhoto { 
  id: string; 
  url: string; 
  timestamp: string; 
  isBlurred?: boolean; 
}

export interface Moment {
  id: string;
  userId: string;
  nickname: string;
  avatar: string;
  imageUrl: string;
  timestamp: string;
  viewed: boolean;
}

export interface ProfileData {
  nickname: string;
  email?: string;
  password?: string;
  age?: number;
  biotype: Biotype;
  height?: number;
  sexualPreference?: SexualOrientation;
  gender?: Gender;
  lookingFor?: UserType[];
  city: string;
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

export enum MatrixValue { 
  YES = 'sim', 
  NO = 'nao', 
  MAYBE = 'talvez' 
}

export interface ConsentItem {
  id: string;
  label: string;
  value: MatrixValue;
}

export enum PresenceStatus { 
  ONLINE = 'online', 
  AWAY = 'away', 
  BUSY = 'busy', 
  OFFLINE = 'offline' 
}

export interface User {
  id: string; // Sempre UUID no banco ou ID fixo no Mock
  nickname: string;
  email?: string;
  age: number;
  plan: Plan;
  is_premium: boolean;
  avatar: string;
  type: UserType;
  city: string;
  lat: number;
  lon: number;
  gallery: { id: string; url: string; timestamp: string; isBlurred?: boolean }[];
  following?: string[];
  isGhostMode?: boolean;
  isOnline?: boolean;
  vouchScore?: number;
  bio?: string;
  gender?: string | Gender;
  sexualOrientation?: string | SexualOrientation;
  height?: number;
  biotype?: string | Biotype;
  
  // Backwards compatibility fields for components
  balance?: number;
  boosts_active?: number;
  trustLevel?: TrustLevel;
  lookingFor?: UserType[];
  location?: string;
  xp?: number;
  level?: number;
  verifiedAccount?: boolean;
  badges?: string[];
  boundaries?: string[];
  behaviors?: string[];
  braveryLevel?: number;
  updatedAt?: string;
  vibes?: Vibes[];
  bucketList?: string[];
  birthDate?: string;
  rsvps?: string[];
  vouches?: Vouch[];
  bookmarks?: string[];
  blockedUsers?: string[];
  matches?: string[];
  seenBy?: string[];
  bodyMods?: string[];
  bodyArt?: string[];
  bodyHair?: string;
  bondageExp?: string;
  bestMoments?: any[];
  bestFeature?: string;
  beveragePref?: string;
  bestTime?: string;
  busyMode?: boolean;
  bookingPolicy?: string;
  dailyProfileViews?: number;
  verificationScore?: number;
  verificationLevels?: {
    identity: boolean;
    photo: boolean;
    social: boolean;
    trust: boolean;
  };
  hasBlurredGallery?: boolean;
  totalLikes?: number;
  totalViews?: number;
  isSubscriber?: boolean;
  emailVerified?: boolean;
  consentMatrix?: ConsentItem[];
  isStealthMode?: boolean;
  prefersBlurredPhotos?: boolean;
  pushVerifiedRadar5k?: boolean;
  partner1?: ProfileData | any;
  partner2?: ProfileData | any;
  serialNumber?: string;
  lastMoment?: {
    imageUrl: string;
    timestamp: string;
  };
  status?: PresenceStatus;
  is_mock?: boolean;
  environment?: string;
  createdAt?: string;
}

export interface RadarProfile {
  id: string;
  name: string;
  avatar: string;
  lat: number;
  lon: number;
  city: string;
  distanceKm?: number;
  trustLevel?: TrustLevel;
  
  // Compatibility
  neighborhood?: string;
  bio?: string;
  category?: string;
  age?: number;
  isMock?: boolean;
  nickname?: string; // Some mocks use nickname
  vouchScore?: number;
  type?: UserType;
  location?: string;
  isGhostMode?: boolean;
  braveryLevel?: number;
}

export type Step = 'type' | 'details' | 'physical' | 'photo' | 'confirm';
export type ProfileType = 'man' | 'woman' | 'couple_fxm' | 'couple_mxm' | 'couple_fxf' | 'trans_man' | 'trans_woman';

export interface CoupleProfileData { 
  mainNickname: string; 
  email: string; 
  password?: string;
  city: string;
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
  distanceKm: number;
  trustLevel: TrustLevel;
  locationLabel?: string;
  bio?: string;
  category?: string;
  distanceLabel?: string;
  city?: string;
  neighborhood?: string;
  lat?: number;
  lon?: number;
  isMock?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  lat: number;
  lon: number;
  city: string;
  avatar: string;
  categories?: string[];
  category?: string;
  neighborhood?: string;
  bio?: string;
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
  audience?: string;
  isVerifiedPartner?: boolean;
}

export interface Venue {
  id: string;
  name: string;
  image: string;
  lat: number;
  lon: number;
  address?: string;
  checkInCount?: number;
  category?: string;
}

export interface CheckIn {
  userId: string;
  venueId: string;
  timestamp: string;
}

export interface HeatZone {
  id: string;
  x: number;
  y: number;
  intensity: number;
  color: 'pink' | 'amber';
}
