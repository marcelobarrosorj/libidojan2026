
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Star, ExternalLink } from 'lucide-react';

interface Venue {
  name: string;
  type: string;
  description: string;
  vibeScore: number;
  uri: string;
}

const MOCK_VENUES: Venue[] = [
  {
    name: "Vogue Lounge",
    type: "Lounge Privado",
    description: "Ambiente sofisticado com música ambiente e drinks exclusivos. Ideal para casais liberais.",
    vibeScore: 94,
    uri: "https://maps.google.com"
  },
  {
    name: "Club X",
    type: "Private Club",
    description: "O mais exclusivo clube de swing da região. Requinte e discrição absoluta.",
    vibeScore: 89,
    uri: "https://maps.google.com"
  },
  {
    name: "Secret Terrace",
    type: "Cocktail Bar",
    description: "Terraço escondido com vista para a cidade. Frequentado pela comunidade lifestyle.",
    vibeScore: 91,
    uri: "https://maps.google.com"
  }
];

const VibeGrounds: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState<Venue[]>(MOCK_VENUES);

  const fetchGrounds = () => {
    setLoading(true);
    // Simula carregamento offline
    setTimeout(() => {
      setVenues(MOCK_VENUES);
      setLoading(false);
    }, 1500);
  };

  useEffect(() => {
    fetchGrounds();
  }, []);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold font-outfit text-white">Vibe Grounds</h2>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Picos recomendados (Modo Offline)</p>
      </div>

      {loading ? (
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 gradient-libido rounded-3xl flex items-center justify-center animate-pulse shadow-2xl shadow-pink-500/20">
            <Navigation size={32} className="text-white animate-bounce" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Escaneando hotspots...</p>
        </div>
      ) : (
        <div className="space-y-4 pb-20">
          {venues.map((venue, idx) => (
            <div key={idx} className="glass-card p-5 rounded-3xl border-slate-800/50 space-y-4 hover:border-pink-500/30 transition-all group">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-lg group-hover:text-pink-400 transition-colors">{venue.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">
                      {venue.type}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                      <Star size={10} fill="currentColor" />
                      {venue.vibeScore}% Vibe
                    </span>
                  </div>
                </div>
                <button className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-pink-500 hover:bg-pink-500 hover:text-white transition-all shadow-lg">
                  <ExternalLink size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                {venue.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VibeGrounds;
