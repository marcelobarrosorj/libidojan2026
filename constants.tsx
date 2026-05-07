
import { User, UserType, Vibes, Plan, Post, Biotype, Gender, SexualOrientation, TrustLevel, Moment } from './types';

export const MOCK_CURRENT_USER: User = {
  id: 'me',
  serialNumber: '000001',
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
  gender: Gender.MASCULINO,
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
  following: [],
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
  isSubscriber: false,
  dailyProfileViews: 0,
  birthDate: '1995-01-01',
  rsvps: [],
  consentMatrix: [
    { id: 'soft', label: 'Soft Swing', value: 'sim' as any },
    { id: 'total', label: 'Troca Total', value: 'talvez' as any },
    { id: 'menage', label: 'Ménage', value: 'sim' as any }
  ],
  vouchScore: 98,
  isStealthMode: false,
  prefersBlurredPhotos: true
};

export const MOCK_USERS: User[] = [
  {
    ...MOCK_CURRENT_USER,
    id: 'user-1',
    serialNumber: '000010',
    nickname: 'Ana & Bruno',
    email: 'anaebruno@lifestyle.com',
    age: 26,
    type: UserType.CASAIS,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    trustLevel: TrustLevel.OURO,
    following: [],
    lat: -23.5617,
    lon: -46.6623,
    consentMatrix: [
      { id: 'soft', label: 'Soft Swing', value: 'sim' as any },
      { id: 'total', label: 'Troca Total', value: 'sim' as any },
      { id: 'menage', label: 'Ménage', value: 'sim' as any }
    ],
    vouchScore: 95
  },
  {
    ...MOCK_CURRENT_USER,
    id: 'user-3',
    serialNumber: '000011',
    nickname: 'Carla',
    email: 'carla.lib@gmail.com',
    age: 27,
    type: UserType.MULHER,
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    trustLevel: TrustLevel.PRATA,
    following: [],
    lat: -23.5855,
    lon: -46.6765,
    consentMatrix: [
      { id: 'soft', label: 'Soft Swing', value: 'sim' as any },
      { id: 'total', label: 'Troca Total', value: 'nao' as any },
      { id: 'menage', label: 'Ménage', value: 'talvez' as any }
    ],
    vouchScore: 88
  },
  {
    ...MOCK_CURRENT_USER,
    id: 'user-4',
    serialNumber: '000012',
    nickname: 'Gabi',
    age: 24,
    type: UserType.MULHER,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    trustLevel: TrustLevel.BRONZE,
    following: [],
    lat: -23.5433,
    lon: -46.6433,
    consentMatrix: [
      { id: 'soft', label: 'Soft Swing', value: 'sim' as any },
      { id: 'total', label: 'Troca Total', value: 'nao' as any },
      { id: 'menage', label: 'Ménage', value: 'sim' as any }
    ],
    vouchScore: 75
  },
  {
    ...MOCK_CURRENT_USER,
    id: 'user-5',
    serialNumber: '000013',
    nickname: 'Lia & Dan',
    age: 29,
    type: UserType.CASAIS,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
    trustLevel: TrustLevel.OURO,
    following: [],
    lat: -23.6001,
    lon: -46.6722,
    consentMatrix: [
      { id: 'soft', label: 'Soft Swing', value: 'sim' as any },
      { id: 'total', label: 'Troca Total', value: 'sim' as any },
      { id: 'menage', label: 'Ménage', value: 'sim' as any }
    ],
    vouchScore: 92
  }
];

export const MOCK_MOMENTS: Moment[] = [
  {
    id: 'm1',
    userId: 'user-1',
    nickname: 'Ana & Bruno',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
    timestamp: '1h atrás',
    viewed: false
  },
  {
    id: 'm2',
    userId: 'user-3',
    nickname: 'Carla',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800',
    timestamp: '4h atrás',
    viewed: false
  },
  {
    id: 'm3',
    userId: 'm8',
    nickname: 'Gabi',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    imageUrl: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a2?w=800',
    timestamp: '30min atrás',
    viewed: false
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
  },
  {
    id: "post-2",
    userId: 'user-3',
    user: 'Carla',
    age: 27,
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
    description: 'Explorando novas conexões no radar hoje. Quem mais por aqui? 😈🖤 #singlewoman #lifestyle',
    likes: 89,
    comments: [{ user: 'Matriz', text: 'Vibe absurda!' }],
    shares: 5,
    liked: true,
    timestamp: '2026-01-04T10:30:00Z'
  },
  {
    id: "post-3",
    userId: 'm4',
    user: 'Lia & Dan',
    age: 29,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    description: 'Noite de festa secreta em SP. Simplesmente inesquecível! 🔥🔞 #swingparty #vibe',
    likes: 210,
    comments: [{ user: 'Ana', text: 'Estávamos lá! Foi top!' }],
    shares: 24,
    liked: false,
    timestamp: '2026-01-04T02:00:00Z'
  },
  {
    id: "post-4",
    userId: 'm8',
    user: 'Gabi',
    age: 24,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800',
    description: 'O mistério é o que me move. Pronta para o próximo encontro? 🍷✨ #bdsm #powerplay',
    likes: 156,
    comments: [],
    shares: 8,
    liked: false,
    timestamp: '2026-01-04T18:45:00Z'
  },
  {
    id: "post-5",
    userId: 'm26',
    user: 'Paola & Gui',
    age: 31,
    avatar: 'https://images.unsplash.com/photo-1516575334481-f85287c2c82d?w=400',
    image: 'https://images.unsplash.com/photo-1516195851888-6f1a981a8a2a?w=800',
    description: 'Sunset e drinks antes do The Circle. A vida liberal é arte! 🌅🥂 #lifestyle #casalvip',
    likes: 312,
    comments: [{ user: 'Admin', text: 'Elegância pura!' }],
    shares: 45,
    liked: false,
    timestamp: '2026-01-04T17:00:00Z'
  }
];
