
/// <reference types="google.maps" />
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Plus, Loader2, X } from 'lucide-react';
import { useMapsLibrary, APIProvider } from '@vis.gl/react-google-maps';
import { Venue } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface VenueDiscoveryProps {
  userLocation: { lat: number; lon: number } | null;
  onSelect: (venue: Venue) => void;
  onClose: () => void;
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY.length > 20;

// Marcello: Protocolo de Contingência (Dados de Emergência Offline)
const MOCK_VENUES: any[] = [
  {
    id: 'mock-1',
    displayName: { text: 'Vibe Grounds Matrix' },
    formattedAddress: 'Centro, Rio de Janeiro - RJ',
    location: { lat: () => -22.9035, lng: () => -43.1729 },
    types: ['point_of_interest', 'establishment'],
    photos: []
  },
  {
    id: 'mock-2',
    displayName: { text: 'Club Noir Private' },
    formattedAddress: 'Barra da Tijuca, Rio de Janeiro - RJ',
    location: { lat: () => -23.0003, lng: () => -43.3659 },
    types: ['night_club', 'establishment'],
    photos: []
  },
  {
    id: 'mock-3',
    displayName: { text: 'Nexus Lounge' },
    formattedAddress: 'Campo Grande, Rio de Janeiro - RJ',
    location: { lat: () => -22.9031, lng: () => -43.5590 },
    types: ['bar', 'establishment'],
    photos: []
  }
];

export const VenueDiscovery: React.FC<VenueDiscoveryProps> = ({ userLocation, onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const placesLib = useMapsLibrary('places');

  useEffect(() => {
    if (!placesLib || !userLocation) return;

    if (!query || query.length < 3) {
      const loadNearby = async () => {
        setLoading(true);
        try {
          // Marcello: Tentativa com a API Nova e Tipos Específicos
          const searchParams = {
            locationRestriction: {
              center: { lat: userLocation.lat, lng: userLocation.lon },
              radius: 5000, 
            },
            includedTypes: ['night_club', 'bar', 'lodging', 'restaurant'],
            fields: ['id', 'displayName', 'formattedAddress', 'location', 'photos', 'types'],
            maxResultCount: 20,
          };

          try {
            const { places } = await (placesLib as any).Place.searchNearby(searchParams);
            if (places && places.length > 0) {
                setResults(places);
            } else {
                throw new Error('ZERO_RESULTS_CLOUDSIDE');
            }
          } catch (newApiError: any) {
            console.warn('[VENUE_DISCOVERY] Busca avançada falhou ou vazia. Tentando fallback/contingência:', newApiError.message);
            
            // Trava de Captura Rígida: Se der erro de faturamento, chave errada ou acesso negado
            if (newApiError.message?.includes('REQUEST_DENIED') || 
                newApiError.message?.includes('PERMISSION_DENIED') || 
                newApiError.message?.includes('API_KEY_INVALID')) {
              console.warn('[VENUE_DISCOVERY] Acesso Negado/Chave Inválida. Ativando Contingência Local.');
              setResults(MOCK_VENUES);
              return;
            }

            // Fallback Legado para busca por tipos
            const service = new google.maps.places.PlacesService(document.createElement('div'));
            service.nearbySearch({
              location: { lat: userLocation.lat, lng: userLocation.lon },
              radius: 5000,
              type: 'night_club' // Foco em Clubes
            }, (results, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                setResults(results.map(r => ({
                  id: r.place_id,
                  displayName: { text: r.name },
                  formattedAddress: r.vicinity,
                  location: { lat: () => r.geometry?.location?.lat(), lng: () => r.geometry?.location?.lng() },
                  photos: r.photos,
                  types: r.types
                })));
              } else {
                console.error('[VENUE_DISCOVERY] Falha total na busca legacy:', status);
                if (status === 'REQUEST_DENIED' || status === 'OVER_QUERY_LIMIT' || status === 'ZERO_RESULTS') {
                    setResults(MOCK_VENUES);
                }
              }
            });
          }
        } catch (error) {
          console.error('[VENUE_DISCOVERY] Erro crítico na busca:', error);
        } finally {
          setLoading(false);
        }
      };
      
      if (!query) loadNearby();
      else if (query.length < 3) setResults([]);
      return;
    }

    const searchTimer = setTimeout(async () => {
      setLoading(true);
      try {
        try {
          const { places } = await placesLib.Place.searchByText({
            textQuery: query,
            fields: ['id', 'displayName', 'formattedAddress', 'location', 'photos', 'types'],
            locationBias: userLocation ? { lat: userLocation.lat, lng: userLocation.lon } : undefined,
            maxResultCount: 10,
          });
          setResults(places || []);
        } catch (searchByTextError: any) {
          console.warn('[VENUE_DISCOVERY] SearchByText Nova API falhou, tentando fallback legado:', searchByTextError.message);
          
          if (searchByTextError.message?.includes('PERMISSION_DENIED') || searchByTextError.message?.includes('unregistered')) {
             setResults(MOCK_VENUES.filter(v => v.displayName.text.toLowerCase().includes(query.toLowerCase())));
             return;
          }

          const service = new google.maps.places.PlacesService(document.createElement('div'));
          service.textSearch({
            query: query,
            location: userLocation ? new google.maps.LatLng(userLocation.lat, userLocation.lon) : undefined,
          }, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              setResults(results.map(r => ({
                id: r.place_id,
                displayName: { text: r.name },
                formattedAddress: r.formatted_address,
                location: { lat: () => r.geometry?.location?.lat(), lng: () => r.geometry?.location?.lng() },
                photos: r.photos,
                types: r.types
              })));
            } else {
              console.error('[VENUE_DISCOVERY] Falha total na busca por texto:', status);
              if (status === 'REQUEST_DENIED' || status === 'OVER_QUERY_LIMIT') {
                setResults(MOCK_VENUES.filter(v => v.displayName.text.toLowerCase().includes(query.toLowerCase())));
              }
            }
          });
        }
      } catch (error) {
        console.error('[VENUE_DISCOVERY] Erro crítico na busca:', error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(searchTimer);
  }, [query, placesLib, userLocation]);

  const handleAdd = (place: google.maps.places.Place) => {
    const photoUrl = place.photos && place.photos.length > 0 
      ? place.photos[0].getURI({ maxWidth: 800 })
      : 'https://images.unsplash.com/photo-1514525253361-bee8718a74b2?auto=format&fit=crop&q=80&w=800';

    const newVenue: Venue = {
      id: place.id || `custom-${Date.now()}`,
      name: (typeof place.displayName === 'object' ? (place.displayName as any).text : place.displayName) || 'Local Desconhecido',
      address: place.formattedAddress || '',
      category: place.types && place.types.length > 0 ? place.types[0].replace(/_/g, ' ') : 'Outro',
      image: photoUrl,
      checkInCount: 0,
      lat: place.location?.lat() || 0,
      lon: place.location?.lng() || 0
    };

    onSelect(newVenue);
  };

  if (!hasValidKey) {
    return (
      <div className="p-8 text-center bg-slate-900 rounded-3xl border border-white/5 space-y-4">
        <MapPin size={32} className="text-amber-500 mx-auto" />
        <h2 className="text-white font-black uppercase italic tracking-tighter">API do Google Necessária</h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">
          Para detectar novos pontos na Matriz, configure o GOOGLE_MAPS_PLATFORM_KEY nas configurações do sistema.
        </p>
        <button 
          onClick={onClose}
          className="px-6 py-2 bg-white/5 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] rounded-t-[32px] overflow-hidden border-t border-white/10">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">Novos Pontos</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Detectando infraestrutura próxima</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={18} />
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="EX: SHOPPING 33, HOTEL..."
            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 focus:bg-slate-900 transition-all uppercase tracking-wider"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 size={18} className="text-amber-500 animate-spin" />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
        {results.map((place, idx) => (
          <motion.div
            key={place.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-slate-900/60 transition-all group"
          >
            <div className="flex-1 min-w-0 pr-4">
              <h4 className="text-sm font-black text-white uppercase truncate tracking-tight group-hover:text-amber-500 transition-colors">
                {typeof place.displayName === 'object' ? place.displayName.text : place.displayName}
              </h4>
              <p className="text-[9px] text-slate-500 truncate uppercase tracking-widest mt-0.5">
                {place.formattedAddress}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  {place.types && place.types[0]?.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
            <button 
              onClick={() => handleAdd(place)}
              className="w-10 h-10 bg-amber-500 text-black rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shrink-0 shadow-lg shadow-amber-500/10"
            >
              <Plus size={20} />
            </button>
          </motion.div>
        ))}

        {!loading && query.length >= 3 && results.length === 0 && (
          <div className="text-center py-12">
            <Search size={32} className="text-slate-800 mx-auto mb-3" />
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">
              Nenhum novo ponto detectado nesta frequência.<br/>Tente outros termos de busca.
            </p>
          </div>
        )}

        {query.length < 3 && !loading && (
          <div className="text-center py-12">
            <MapPin size={32} className="text-slate-800 mx-auto mb-3" />
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">
              Digite o nome de um local para<br/>escanear a infraestrutura.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
