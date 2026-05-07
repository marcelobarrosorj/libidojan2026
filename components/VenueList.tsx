
import React, { useEffect, useState, useMemo } from 'react';
import { MapPin, Users, Navigation, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { Venue, CheckIn } from '../types';
import { venueService } from '../services/venueService';
import { haversineKm } from '../services/geoService';
import { showNotification } from '../services/authUtils';
import { motion, AnimatePresence } from 'motion/react';

interface VenueListProps {
  userLocation: { lat: number; lon: number } | null;
  userId: string;
}

export const VenueList: React.FC<VenueListProps> = ({ userLocation, userId }) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCheckIn, setActiveCheckIn] = useState<CheckIn | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        console.log('[VENUE_LIST] Carregando dados para localização:', userLocation);
        const data = await venueService.getVenues();
        setVenues(data);
        setActiveCheckIn(venueService.getCurrentCheckIn());
      } catch (e) {
        console.error('[VENUE_LIST_ERROR]', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userLocation]); // Re-carrega se a localização mudar

  const venuesWithDistance = useMemo(() => {
    if (!userLocation) {
        console.log('[VENUE_LIST] Sem localização, exibindo lista padrão');
        return venues;
    }
    const mapped = venues.map(v => ({
      ...v,
      distance: haversineKm(userLocation.lat, userLocation.lon, v.lat, v.lon)
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    console.log('[VENUE_LIST] Locais ordenados por distância:', mapped.length);
    return mapped;
  }, [venues, userLocation]);

  const handleCheckIn = async (venueId: string) => {
    try {
      const checkIn = await venueService.checkIn(userId, venueId);
      setActiveCheckIn(checkIn);
      showNotification('Check-in realizado com sucesso!', 'success');
    } catch (e) {
      showNotification('Erro ao realizar check-in.', 'error');
    }
  };

  const handleCheckOut = async () => {
    try {
      await venueService.checkOut();
      setActiveCheckIn(null);
      showNotification('Check-out realizado.', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="text-amber-500 animate-spin" size={40} />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Sincronizando Locais...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {activeCheckIn && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500 rounded-3xl p-6 flex items-center justify-between shadow-2xl shadow-amber-500/20"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-[8px] font-black text-black/60 uppercase tracking-widest">Check-in Ativo</p>
              <h3 className="text-lg font-black text-black uppercase leading-tight italic">
                {venues.find(v => v.id === activeCheckIn.venueId)?.name || 'Local Desconhecido'}
              </h3>
            </div>
          </div>
          <button 
            onClick={handleCheckOut}
            className="px-4 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
          >
            Sair
          </button>
        </motion.div>
      )}

      <div className="grid gap-4">
        {venuesWithDistance.map((venue, idx) => {
          const isCheckedIn = activeCheckIn?.venueId === venue.id;
          const distance = (venue as any).distance;

          return (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`group relative overflow-hidden rounded-3xl border transition-all duration-500 bg-slate-900/40 ${isCheckedIn ? 'border-amber-500' : 'border-white/5 hover:border-white/10'}`}
            >
              <div className="flex gap-4 p-4">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                  <img src={venue.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={venue.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white">
                    <Users size={10} />
                    <span className="text-[10px] font-black">{venue.checkInCount}</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">{venue.category}</span>
                      {distance !== undefined && (
                        <div className="flex items-center gap-1 text-slate-500">
                          <Navigation size={10} className="rotate-45" />
                          <span className="text-[10px] font-bold">{distance.toFixed(1)}km</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-amber-500 transition-colors">{venue.name}</h3>
                    <p className="text-[9px] text-slate-500 font-medium line-clamp-1 mt-1 flex items-center gap-1">
                      <MapPin size={10} /> {venue.address}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    {!isCheckedIn ? (
                      <button
                        onClick={() => handleCheckIn(venue.id)}
                        className="flex-1 py-2 bg-white/5 hover:bg-amber-500 hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest translate-y-0 active:scale-95 transition-all text-white border border-white/5"
                      >
                        Fazer Check-in
                      </button>
                    ) : (
                      <div className="flex-1 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-center">
                        Você está aqui
                      </div>
                    )}
                    <button className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 border border-white/5 hover:text-white transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {venues.length === 0 && (
        <div className="p-12 text-center bg-slate-900/20 border border-white/5 rounded-3xl">
          <MapPin size={32} className="text-slate-700 mx-auto mb-4" />
          <h3 className="text-white font-black uppercase italic tracking-tight">Nenhum local próximo</h3>
          <p className="text-slate-500 text-[10px] font-medium mt-1">A Matriz ainda não detectou infraestrutura nesta zona.</p>
        </div>
      )}
    </div>
  );
};
