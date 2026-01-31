
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

// Mocks consolidados em São Paulo para referência de proximidade.
export const mockRadarProfiles: RadarProfile[] = [
  {
    id: 'm1', name: 'Ana & Bruno', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    lat: -23.5595, lon: -46.6533, city: 'São Paulo', neighborhood: 'Jardins',
    bio: 'Casal liberal em busca de novas experiências.', category: 'Casais',
    trustLevel: TrustLevel.OURO, braveryLevel: 9, gallery: generateGallery('m1', 4),
    currentShoutout: { text: "Buscando casal para drink!", type: 'drink' }
  },
  {
    id: 'm2', name: 'Carla', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    lat: -23.5650, lon: -46.6510, city: 'São Paulo', neighborhood: 'Paulista',
    bio: 'Discreta e decidida.', category: 'Mulher',
    trustLevel: TrustLevel.PRATA, braveryLevel: 7, gallery: generateGallery('m2', 3),
    currentShoutout: { text: "A fim de um papo?", type: 'talk' }
  },
  {
    id: 'm3', name: 'Marcos', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    lat: -23.5400, lon: -46.6300, city: 'São Paulo', neighborhood: 'Centro',
    bio: 'Aproveitando o melhor do lifestyle.', category: 'Homem',
    trustLevel: TrustLevel.BRONZE, braveryLevel: 6, gallery: generateGallery('m3', 2)
  },
  {
    id: 'm4', name: 'Lia & Dan', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
    lat: -23.5800, lon: -46.6800, city: 'São Paulo', neighborhood: 'Itaim Bibi',
    bio: 'Casal bi, amamos conhecer pessoas novas.', category: 'Casais',
    trustLevel: TrustLevel.OURO, braveryLevel: 10, gallery: generateGallery('m4', 5),
    currentShoutout: { text: "Alguém por perto?", type: 'meet' }
  },
  {
    id: 'm5', name: 'Julia', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
    lat: -23.6000, lon: -46.6600, city: 'São Paulo', neighborhood: 'Moema',
    bio: 'Curiosa e autêntica.', category: 'Mulher',
    trustLevel: TrustLevel.PRATA, braveryLevel: 8, gallery: generateGallery('m5', 3)
  },
  {
    id: 'm6', name: 'Tati & Fê', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    lat: -23.5200, lon: -46.7000, city: 'São Paulo', neighborhood: 'Lapa',
    bio: 'Iniciantes no swing, buscando leveza.', category: 'Casais',
    trustLevel: TrustLevel.BRONZE, braveryLevel: 5, gallery: generateGallery('m6', 2)
  },
  {
    id: 'm7', name: 'Ricardo', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    lat: -23.4800, lon: -46.6000, city: 'São Paulo', neighborhood: 'Santana',
    bio: 'Single man em busca de casais.', category: 'Homem',
    trustLevel: TrustLevel.PRATA, braveryLevel: 8, gallery: generateGallery('m7', 3)
  },
  {
    id: 'm8', name: 'Gabi', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    lat: -23.6200, lon: -46.7000, city: 'São Paulo', neighborhood: 'Morumbi',
    bio: 'Vibe BDSM e exploração.', category: 'Mulher',
    trustLevel: TrustLevel.OURO, braveryLevel: 10, gallery: generateGallery('m8', 4),
    currentShoutout: { text: "Pronta para diversão!", type: 'party' }
  },
  {
    id: 'm9', name: 'Trisal SP', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
    lat: -23.5500, lon: -46.7200, city: 'São Paulo', neighborhood: 'Butantã',
    bio: 'Três corações, uma só vibe.', category: 'Casais',
    trustLevel: TrustLevel.OURO, braveryLevel: 9, gallery: generateGallery('m9', 6)
  },
  {
    id: 'm10', name: 'Lucas', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400',
    lat: -23.5000, lon: -46.6500, city: 'São Paulo', neighborhood: 'Casa Verde',
    bio: 'Discreto, focado em qualidade.', category: 'Homem',
    trustLevel: TrustLevel.BRONZE, braveryLevel: 4, gallery: generateGallery('m10', 2)
  },
  {
    id: 'm11', name: 'Bia & Léo', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400',
    lat: -23.6500, lon: -46.5300, city: 'Santo André', neighborhood: 'Bairro Jardim',
    bio: 'Casal do ABC explorando.', category: 'Casais',
    trustLevel: TrustLevel.PRATA, braveryLevel: 7, gallery: generateGallery('m11', 3)
  },
  {
    id: 'm12', name: 'Sandra', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
    lat: -23.6800, lon: -46.5500, city: 'São Bernardo', neighborhood: 'Centro',
    bio: 'Curiosa por novas sensações.', category: 'Mulher',
    trustLevel: TrustLevel.BRONZE, braveryLevel: 6, gallery: generateGallery('m12', 2)
  },
  {
    id: 'm13', name: 'Hugo', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    lat: -23.4500, lon: -46.5300, city: 'Guarulhos', neighborhood: 'Maia',
    bio: 'Single educado e atlético.', category: 'Homem',
    trustLevel: TrustLevel.OURO, braveryLevel: 8, gallery: generateGallery('m13', 3)
  },
  {
    id: 'm14', name: 'Casal Alpha', avatar: 'https://images.unsplash.com/photo-1516195851888-6f1a981a8a2a?w=400',
    lat: -23.4900, lon: -46.8400, city: 'Barueri', neighborhood: 'Alphaville',
    bio: 'Requinte e prazer em Alphaville.', category: 'Casais',
    trustLevel: TrustLevel.OURO, braveryLevel: 10, gallery: generateGallery('m14', 4)
  },
  {
    id: 'm15', name: 'Nina', avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
    lat: -23.5700, lon: -46.6400, city: 'São Paulo', neighborhood: 'Paraíso',
    bio: 'Ménage lover.', category: 'Mulher',
    trustLevel: TrustLevel.PRATA, braveryLevel: 9, gallery: generateGallery('m15', 3)
  },
  {
    id: 'm26', name: 'Paola & Gui', avatar: 'https://images.unsplash.com/photo-1516575334481-f85287c2c82d?w=400',
    lat: -23.5510, lon: -46.6340, city: 'São Paulo', neighborhood: 'Centro',
    bio: 'Apenas alguns metros de você.', category: 'Casais',
    trustLevel: TrustLevel.OURO, braveryLevel: 10, gallery: generateGallery('m26', 4)
  },
  {
    id: 'm27', name: 'Victória', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    lat: -23.5520, lon: -46.6350, city: 'São Paulo', neighborhood: 'Bela Vista',
    bio: 'Trans e orgulhosa.', category: 'Mulher',
    trustLevel: TrustLevel.PRATA, braveryLevel: 8, gallery: generateGallery('m27', 3)
  },
  {
    id: 'm28', name: 'Duo Safira', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    lat: -23.5550, lon: -46.6600, city: 'São Paulo', neighborhood: 'Jardins',
    bio: 'Mistério e paixão.', category: 'Casais',
    trustLevel: TrustLevel.OURO, braveryLevel: 9, gallery: generateGallery('m28', 5)
  },
  {
    id: 'm29', name: 'Thiago', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    lat: -23.5480, lon: -46.6300, city: 'São Paulo', neighborhood: 'República',
    bio: 'Focado em casais.', category: 'Homem',
    trustLevel: TrustLevel.BRONZE, braveryLevel: 7, gallery: generateGallery('m29', 2)
  },
  {
    id: 'm30', name: 'Bibi & Jhow', avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400',
    lat: -23.5900, lon: -46.6750, city: 'São Paulo', neighborhood: 'Vila Olímpia',
    bio: 'Vamos explorar?', category: 'Casais',
    trustLevel: TrustLevel.PRATA, braveryLevel: 6, gallery: generateGallery('m30', 3)
  },
  {
    id: 'm31', name: 'Luna', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    lat: -23.5350, lon: -46.6420, city: 'São Paulo', neighborhood: 'Higienópolis',
    bio: 'Desejos ocultos.', category: 'Mulher',
    trustLevel: TrustLevel.OURO, braveryLevel: 10, gallery: generateGallery('m31', 4)
  }
];
