
export const isDemoEnabled = import.meta.env.VITE_ENABLE_DEMO_CONTENT === 'true' || 
                             (import.meta.env.MODE !== 'production' && import.meta.env.VITE_ENABLE_DEMO_CONTENT !== 'false');

export const demoProfiles = [
  {
    id: 'demo:profile:001',
    user_id: 'demo:profile:001',
    nickname: 'Casal Beijo',
    name: 'Casal Beijo',
    bio: 'Testando a versão beta',
    photo_url: 'https://images.unsplash.com/photo-1598156172159-242147bab38d?q=80&w=300',
    role: 'Casal',
    status: 'active',
    plan: 'free',
    is_banned: false,
    is_deleted: false,
    photos: []
  },
  {
    id: 'demo:profile:002',
    user_id: 'demo:profile:002',
    nickname: 'João Solteiro',
    name: 'João',
    bio: 'Sempre em busca de novas conexões.',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=João',
    role: 'Solteiro',
    status: 'active',
    plan: 'free',
    is_banned: false,
    is_deleted: false,
    photos: []
  }
];

export const demoPosts = [
  {
    id: 'demo:post:001',
    userId: 'demo:profile:001',
    user_id: 'demo:profile:001',
    image: 'https://images.unsplash.com/photo-1598156172159-242147bab38d?q=80&w=300',
    text: 'Nossa primeira vez no aplicativo!',
    likes: 12,
    createdAt: Date.now(),
    isDemo: true
  },
  {
    id: 'demo:post:002',
    userId: 'demo:profile:002',
    user_id: 'demo:profile:002',
    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=300',
    text: 'Alguém afim de sair hoje?',
    likes: 5,
    createdAt: Date.now() - 3600000,
    isDemo: true
  }
];

export const isDemoId = (id: string) => typeof id === 'string' && id.startsWith('demo:');

export const demoGroups = [
  { id: 'demo:group:001', name: 'Casais Iniciantes', members: 89, desc: 'Espaço para quem está começando', vip: false },
  { id: 'demo:group:002', name: 'São Paulo Capital', members: 134, desc: 'Grupo regional de SP', vip: false },
  { id: 'demo:group:003', name: 'Fetichistas VIP', members: 56, desc: 'Discussões exclusivas para Premium', vip: true },
];

export const demoEvents = [
  { id: 'demo:event:001', type: 'Festa', title: 'Festa Secreta SP', name: 'Festa Secreta SP', date: 'Sex, 22 Nov', time: '23:00', location: 'Centro', attendees: 45, vip: true, desc: 'Local divulgado no dia.' },
  { id: 'demo:event:002', type: 'Encontro', title: 'Encontro Carioca', name: 'Encontro Carioca', date: 'Sáb, 23 Nov', time: '14:00', location: 'Copacabana', attendees: 112, vip: false, desc: 'Beach club privativo.' }
];

export const demoThreads = [
  { id: 'demo:thread:001', title: 'Regras da casa', author: 'Moderação', replies: 0, views: 120, pinned: true, vip: false },
  { id: 'demo:thread:002', title: 'Como iniciar no meio?', author: 'Iniciante99', replies: 14, views: 45, pinned: false, vip: false },
  { id: 'demo:thread:003', title: 'Resenhas de eventos fechados', author: 'VIP Member', replies: 8, views: 300, pinned: false, vip: true }
];
