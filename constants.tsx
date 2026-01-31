
import { User, UserType, Vibes, Plan, Post, Biotype, Gender, SexualOrientation, TrustLevel } from './types';

// Adding missing properties (lat, lon, birthDate, rsvps) to match the User interface requirements
export const MOCK_CURRENT_USER: User = {
  id: 'me',
  nickname: 'User_Libido',
  email: 'marcelo@libido.app',
  age: 28,
  plan: Plan.GOLD,
  balance: 500,
  boosts_active: 2,
  is_premium: true,
  trustLevel: TrustLevel.OURO,
  avatar: 'https://picsum.photos/seed/me/400/400',
  biotype: Biotype.ATLETICO,
  bio: 'Proprietário da Matriz Libido. Explorando conexões seguras.',
  gender: Gender.CIS,
  sexualOrientation: SexualOrientation.HETERO,
  type: UserType.HOMEM,
  lookingFor: [UserType.MULHER, UserType.CASAIS],
  height: 182,
  vibes: [Vibes.LIBERAL, Vibes.SWING],
  location: 'São Paulo, SP',
  xp: 1500,
  level: 3,
  isOnline: true,
  verifiedAccount: true,
  verificationScore: 100,
  isGhostMode: false,
  hasBlurredGallery: false,
  gallery: [
    { id: '1', url: 'https://picsum.photos/seed/me1/800/800', timestamp: '2026-01-01' }
  ],
  vouches: [],
  badges: ['Pioneiro', 'Staff'],
  bookmarks: [],
  blockedUsers: [],
  matches: [],
  seenBy: [],
  boundaries: ['Sem envolvimento emocional'],
  behaviors: ['Curioso', 'Aberto'],
  bodyMods: [],
  bodyHair: 'Aparado',
  bodyArt: [],
  bondageExp: 'Iniciante',
  bucketList: [],
  bestMoments: [],
  bestFeature: 'Olhar',
  beveragePref: 'Gin',
  bestTime: 'Noite',
  braveryLevel: 8,
  busyMode: false,
  bookingPolicy: 'A combinar',
  lat: -23.5505,
  lon: -46.6333,
  birthDate: '1995-01-01',
  rsvps: []
};

export const MOCK_USERS: User[] = [
  {
    ...MOCK_CURRENT_USER,
    id: 'user-1',
    nickname: 'Ana & Bruno',
    email: 'anaebruno@lifestyle.com',
    age: 26,
    type: UserType.CASAIS,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    trustLevel: TrustLevel.OURO
  },
  {
    ...MOCK_CURRENT_USER,
    id: 'user-3',
    nickname: 'Carla',
    email: 'carla.lib@gmail.com',
    age: 27,
    type: UserType.MULHER,
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    trustLevel: TrustLevel.PRATA
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: "post-1",
    userId: 'user-1',
    user: 'Ana & Bruno',
    age: 26,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800',
    description: 'Vibes de sábado à noite 🥂✨ #casalliberal #lifestyle',
    likes: 124,
    comments: [{ user: 'Bruno', text: 'Incrível!' }],
    shares: 12,
    liked: false,
    timestamp: '2026-01-03T20:00:00Z'
  }
];
