
import { Venue, CheckIn } from '../types';

export const mockVenues: Venue[] = [
  {
    id: 'venue-1',
    name: 'Club Privè Matriz',
    address: 'Rua Augusta, 1234 - SP',
    category: 'Nightclub',
    image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=800',
    checkInCount: 42,
    lat: -23.5505,
    lon: -46.6333
  },
  {
    id: 'venue-2',
    name: 'Hotel Vibe Executive',
    address: 'Av. Paulista, 800 - SP',
    category: 'Hotel',
    image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&q=80&w=800',
    checkInCount: 15,
    lat: -23.5515,
    lon: -46.6343
  },
  {
    id: 'venue-4',
    name: 'Matriz Rio - Ipanema',
    address: 'Rua Garcia d\'Avila, 100 - RJ',
    category: 'Lounge',
    image: 'https://images.unsplash.com/photo-1574096079513-d8259312b785?auto=format&fit=crop&q=80&w=800',
    checkInCount: 67,
    lat: -22.9839,
    lon: -43.2102
  },
  {
    id: 'venue-5',
    name: 'Carioca Privè - Barra',
    address: 'Av. Lucio Costa, 3000 - RJ',
    category: 'Beach Club',
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&q=80&w=800',
    checkInCount: 124,
    lat: -23.0067,
    lon: -43.3444
  }
];

const CHECKIN_STORAGE_KEY = 'matriz_active_checkin';

export const venueService = {
  getVenues: async () => {
    return mockVenues;
  },

  checkIn: async (userId: string, venueId: string): Promise<CheckIn> => {
    const checkIn: CheckIn = {
      userId,
      venueId,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(checkIn));
    return checkIn;
  },

  checkOut: async () => {
    localStorage.removeItem(CHECKIN_STORAGE_KEY);
  },

  getCurrentCheckIn: (): CheckIn | null => {
    const saved = localStorage.getItem(CHECKIN_STORAGE_KEY);
    if (!saved) return null;
    try {
        return JSON.parse(saved);
    } catch {
        return null;
    }
  },

  getGuestsAtVenue: async (venueId: string) => {
    return []; 
  }
};
