
import { RadarProfile } from './types';
import { TrustLevel } from '../types';

const generateGallery = (id: string, count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${id}-img-${i}`,
    url: `https://picsum.photos/seed/${id}-${i}/800/1200`,
    timestamp: new Date().toISOString(),
    isBlurred: i > 0 
  }));
};

export const mockRadarProfiles: RadarProfile[] = [
  {
    id: 'm1', name: 'Ana & Bruno', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    serialNumber: '200001',
    lat: -22.9468, lon: -43.1829, city: 'Rio de Janeiro', neighborhood: 'Leblon',
    bio: 'Casal liberal em busca de novas experiências.', category: 'Casais',
    trustLevel: TrustLevel.OURO, braveryLevel: 9, gallery: generateGallery('m1', 4),
    currentShoutout: { text: "Buscando casal para drink!", type: 'drink' }
  },
  {
    id: 'm2', name: 'Carla', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    serialNumber: '200002',
    lat: -22.9568, lon: -43.1929, city: 'Rio de Janeiro', neighborhood: 'Ipanema',
    bio: 'Discreta e decidida.', category: 'Mulher',
    trustLevel: TrustLevel.PRATA, braveryLevel: 7, gallery: generateGallery('m2', 3),
    currentShoutout: { text: "A fim de um papo?", type: 'talk' }
  },
  {
    id: 'm3', name: 'Marcos', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    serialNumber: '200003',
    lat: -22.9668, lon: -43.1629, city: 'Rio de Janeiro', neighborhood: 'Copacabana',
    bio: 'Aproveitando o melhor do lifestyle.', category: 'Homem',
    trustLevel: TrustLevel.BRONZE, braveryLevel: 6, gallery: generateGallery('m3', 2)
  },
  {
    id: 'm4', name: 'Lia & Dan', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
    serialNumber: '200004',
    lat: -22.9768, lon: -43.1729, city: 'Rio de Janeiro', neighborhood: 'Barra',
    bio: 'Casal bi, amamos conhecer pessoas novas.', category: 'Casais',
    trustLevel: TrustLevel.OURO, braveryLevel: 10, gallery: generateGallery('m4', 5),
    currentShoutout: { text: "Alguém por perto?", type: 'meet' }
  },
  {
    id: 'm5', name: 'Julia', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
    serialNumber: '200005',
    lat: -22.9268, lon: -43.2329, city: 'Rio de Janeiro', neighborhood: 'Botafogo',
    bio: 'Curiosa e autêntica.', category: 'Mulher',
    trustLevel: TrustLevel.PRATA, braveryLevel: 8, gallery: generateGallery('m5', 3)
  },
  {
    id: 'm6', name: 'Tati & Fê', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    lat: -22.9168, lon: -43.1729, city: 'Rio de Janeiro', neighborhood: 'Flamengo',
    bio: 'Iniciantes no swing, buscando leveza.', category: 'Casais',
    trustLevel: TrustLevel.BRONZE, braveryLevel: 5, gallery: generateGallery('m6', 2)
  },
  {
    id: 'm7', name: 'Ricardo', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    lat: -22.9368, lon: -43.1829, city: 'Rio de Janeiro', neighborhood: 'Laranjeiras',
    bio: 'Single man em busca de casais.', category: 'Homem',
    trustLevel: TrustLevel.PRATA, braveryLevel: 8, gallery: generateGallery('m7', 3)
  },
  {
    id: 'm8', name: 'Gabi', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    lat: -22.9468, lon: -43.2429, city: 'Rio de Janeiro', neighborhood: 'Tijuca',
    bio: 'Vibe BDSM e exploração.', category: 'Mulher',
    trustLevel: TrustLevel.OURO, braveryLevel: 10, gallery: generateGallery('m8', 4),
    currentShoutout: { text: "Pronta para diversão!", type: 'party' }
  },
  {
    id: 'm9', name: 'Trisal RJ', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
    lat: -23.0168, lon: -43.4629, city: 'Rio de Janeiro', neighborhood: 'Recreio',
    bio: 'Três corações, uma só vibe.', category: 'Casais',
    trustLevel: TrustLevel.OURO, braveryLevel: 9, gallery: generateGallery('m9', 6)
  },
  {
    id: 'm10', name: 'Lucas', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400',
    lat: -22.9068, lon: -43.1629, city: 'Rio de Janeiro', neighborhood: 'Leme',
    bio: 'Discreto, focado em qualidade.', category: 'Homem',
    trustLevel: TrustLevel.BRONZE, braveryLevel: 4, gallery: generateGallery('m10', 2)
  },
  {
    id: 'm11', name: 'Bia & Léo', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400',
    lat: -22.9068, lon: -43.1029, city: 'Niterói', neighborhood: 'Icaraí',
    bio: 'Casal explorando.', category: 'Casais',
    trustLevel: TrustLevel.PRATA, braveryLevel: 7, gallery: generateGallery('m11', 3)
  },
  {
    id: 'm12', name: 'Sandra', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
    lat: -23.7168, lon: -46.5329, city: 'São Bernardo', neighborhood: 'Centro',
    bio: 'Curiosa por novas sensações.', category: 'Mulher',
    trustLevel: TrustLevel.BRONZE, braveryLevel: 6, gallery: generateGallery('m12', 2)
  },
  {
    id: 'm13', name: 'Hugo', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    lat: -23.4668, lon: -46.5329, city: 'Guarulhos', neighborhood: 'Maia',
    bio: 'Single educado e atlético.', category: 'Homem',
    trustLevel: TrustLevel.OURO, braveryLevel: 8, gallery: generateGallery('m13', 3)
  }
];
