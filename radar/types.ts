
import { GalleryPhoto, TrustLevel } from '../types';

export interface RadarProfile {
  id: string;
  name: string;
  avatar: string; // Changed from optional to required to match global interface consistency
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

export interface VibeSpotCluster {
  venueName: string;
  userCount: number;
  active: boolean;
  lat: number;
  lon: number;
}

export interface ViewerLocation {
  lat: number;
  lon: number;
  city: string;
}
