
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
    id: 'venue-3',
    name: 'Lounge Red Light',
    address: 'Vila Madalena - SP',
    category: 'Lounge',
    image: 'https://images.unsplash.com/photo-1574096079513-d8259312b785?auto=format&fit=crop&q=80&w=800',
    checkInCount: 28,
    lat: -23.5525,
    lon: -46.6353
  }
];

let activeCheckIn: CheckIn | null = null;

export const venueService = {
  getVenues: async () => {
    return mockVenues;
  },

  checkIn: async (userId: string, venueId: string): Promise<CheckIn> => {
    activeCheckIn = {
      userId,
      venueId,
      timestamp: new Date().toISOString()
    };
    return activeCheckIn;
  },

  checkOut: async () => {
    activeCheckIn = null;
  },

  getCurrentCheckIn: () => {
    return activeCheckIn;
  },

  getGuestsAtVenue: async (venueId: string) => {
    // In a real app, this would query the DB for users with active check-ins
    // For now, we simulate guests by filtering mock data
    return []; 
  }
};
