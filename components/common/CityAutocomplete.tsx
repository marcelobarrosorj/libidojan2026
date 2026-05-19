
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Search, Loader2, ChevronRight } from 'lucide-react';
import { fetchCities } from '../../services/locationService';

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const BRAZIL_STATES: Record<string, string> = {
  'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM', 'Bahia': 'BA',
  'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES', 'Goiás': 'GO',
  'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG',
  'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE', 'Piauí': 'PI',
  'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN', 'Rio Grande do Sul': 'RS',
  'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC', 'São Paulo': 'SP',
  'Sergipe': 'SE', 'Tocantins': 'TO'
};

export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({ 
  value, 
  onChange, 
  placeholder = "EX: SÃO PAULO, RJ...",
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGPSLoading, setIsGPSLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.length >= 2) {
        setIsLoading(true);
        fetchCities(value).then(results => {
          setSuggestions(results);
          // Só abre se tiver resultados e o campo estiver focado (ou tiver mudado recentemente)
          if (results.length > 0) setIsOpen(true);
          setIsLoading(false);
        }).catch(() => {
          setIsLoading(false);
        });
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 400); // Aumentado um pouco o debounce

    return () => clearTimeout(timer);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada no seu navegador.");
      return;
    }

    const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const hasGoogleKey = GOOGLE_KEY && GOOGLE_KEY !== 'YOUR_API_KEY';

    setIsGPSLoading(true);
    console.log('[GPS] Iniciando solicitação de geolocalização...');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          console.log(`[GPS] Coordenadas obtidas: ${latitude}, ${longitude}`);
          
          let city = '';
          let state = '';

          if (hasGoogleKey) {
            console.log('[GPS] Usando Google Geocoding API...');
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_KEY}&language=pt-BR`);
            const data = await response.json();
            
            if (data.status === 'OK' && data.results.length > 0) {
              const addressComponents = data.results[0].address_components;
              const cityComp = addressComponents.find((c: any) => c.types.includes('locality') || c.types.includes('administrative_area_level_2'));
              const stateComp = addressComponents.find((c: any) => c.types.includes('administrative_area_level_1'));
              
              if (cityComp) city = cityComp.long_name;
              if (stateComp) state = stateComp.long_name;
            } else {
              console.warn('[GPS] Google Geocoding falhou ou sem resultados:', data.status);
              // Fallback para Nominatim se o Google falhar por algum motivo de cota/chave
            }
          }

          // Fallback para Nominatim se a cidade ainda não foi encontrada
          if (!city) {
            console.log('[GPS] Usando Nominatim API (Fallback)...');
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pt-BR&zoom=10`, {
              headers: {
                'Accept-Language': 'pt-BR'
              }
            });

            if (response.ok) {
              const data = await response.json();
              console.log('[GPS] Nominatim Data:', data);
              if (data.address) {
                city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.city_district || data.address.county;
                state = data.address.state;
              }
            }
          }
          
          if (city) {
            const stateInitial = BRAZIL_STATES[state] || (state ? state.substring(0, 2).toUpperCase() : '');
            const formatted = stateInitial ? `${city} - ${stateInitial}`.toUpperCase() : city.toUpperCase();
            console.log('[GPS] Localização final formatada:', formatted);
            
            // Marcello: Protocolo de Atualização Direta de Matriz (Bypass Cache Autoritário)
            import('../../services/authUtils').then(m => {
              const baseData = m.cache.userData || { id: '000001', nickname: 'CASAL BEIJO', serialNumber: '000001' };
              const updated = {
                ...baseData,
                lat: latitude,
                lon: longitude,
                city: formatted,
                updatedAt: new Date().toISOString()
              };
              m.saveUserData(updated);
              (m.cache as any).userData = updated; // Força cache local imediato
              console.log('[GPS] Coordenadas sincronizadas com o Perfil Agente.');
              
              // Marcello: Dispara evento global de atualização para outros componentes se necessário
              if (window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('libido-profile-update', { detail: updated }));
              }
            });

            onChange(formatted);
            setIsOpen(false);
          } else {
            console.warn('[GPS] Não foi possível determinar a cidade');
            alert("Não conseguimos identificar o nome da sua cidade automaticamente. Por favor, digite manualmente.");
          }
        } catch (err) {
          console.error("[GPS] Reverse Geocoding Error:", err);
          alert("Houve um problema de conexão ao tentar identificar sua cidade.");
        } finally {
          setIsGPSLoading(false);
        }
      },
      (error) => {
        console.error("[GPS] Position Error:", error);
        setIsGPSLoading(false);
        
        let msg = "Erro ao obter localização.";
        if (error.code === 1) msg = "Permissão de localização negada pelo navegador.";
        else if (error.code === 2) msg = "A Matriz não conseguiu captar seu sinal de GPS.";
        else if (error.code === 3) msg = "O tempo limite para obter localização expirou.";
        
        alert(msg);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000, 
        maximumAge: 0 
      }
    );
  };

  const handleSelect = (city: string) => {
    onChange(city);
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <div className="relative group">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          onFocus={() => {
            if (value.length >= 2 && suggestions.length > 0) setIsOpen(true);
          }}
          className="w-full h-16 bg-black border-2 border-white/10 rounded-2xl px-6 pr-14 text-white font-bold placeholder:text-slate-700 focus:border-amber-500 transition-all outline-none text-center uppercase tracking-widest"
        />
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleGPSLocation();
          }}
          disabled={isGPSLoading}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-amber-500 disabled:text-amber-500/30 transition-all z-10"
          title="Usar GPS"
        >
          {isGPSLoading ? <Loader2 size={20} className="animate-spin text-amber-500" /> : <MapPin size={20} />}
        </button>
      </div>

      <div className="flex justify-center -mt-1 h-1">
        {isLoading && <motion.div initial={{ width: 0 }} animate={{ width: '40%' }} className="h-[2px] bg-amber-500/50 rounded-full" />}
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-[100] left-0 right-0 mt-2 bg-slate-900 border-2 border-amber-500/30 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl"
          >
            <div className="p-2 border-b border-white/5 bg-black/60 flex items-center justify-between">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-500/50 px-2">Cidades Sugeridas</span>
              {isLoading && <Loader2 size={10} className="animate-spin text-amber-500/50 mr-2" />}
            </div>
            {suggestions.map((city, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(city)}
                className="w-full px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-colors border-b border-white/5 last:border-0 flex items-center justify-between group/suggestion"
              >
                <span className="flex items-center gap-3">
                  <Search size={12} className="opacity-30 group-hover/suggestion:opacity-100 transition-opacity" />
                  {city}
                </span>
                <ChevronRight size={14} className="opacity-0 group-hover/suggestion:opacity-100 transition-all -translate-x-2 group-hover/suggestion:translate-x-0" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
