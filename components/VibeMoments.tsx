
import React, { useState } from 'react';
import { MOCK_MOMENTS } from '../constants';
import { Moment } from '../types';
import { X, ChevronLeft, ChevronRight, Zap, RefreshCw } from 'lucide-react';
import { cache, saveUserData, showNotification } from '../services/authUtils';
import { soundService } from '../services/soundService';

interface VibeMomentsProps {
  onMomentClick?: (moment: Moment) => void;
}

const VibeMoments: React.FC<VibeMomentsProps> = ({ onMomentClick }) => {
  const [activeMoment, setActiveMoment] = useState<Moment | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const openMoment = (moment: Moment) => {
    setActiveMoment(moment);
    setProgress(0);
    // Simular progresso
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setActiveMoment(null);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const handleVibeClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            if (!base64) return;
            
            // Salva na "vibe" do usuário logado
            const currentUser = cache.userData;
            if (currentUser) {
                const updatedUser = { 
                    ...currentUser, 
                    lastMoment: {
                        imageUrl: base64,
                        timestamp: new Date().toISOString()
                    }
                };
                saveUserData(updatedUser);
                showNotification('Sua Vibe foi publicada na Matriz!', 'success');
                soundService.play('MATCH');
            } else {
                showNotification('Você precisa estar logado para publicar.', 'error');
            }
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    } catch (err) {
        console.error(err);
        showNotification('Erro ao publicar vibe.', 'error');
        setIsUploading(false);
    }
  };

  const currentUser = cache.userData;

  return (
    <div className="w-full">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      {/* Horizontal Scroll Bar */}
      <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide">
        {/* Adicionar Próprio Moment */}
        <div 
            onClick={handleVibeClick}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 transition-transform"
        >
          <div className={`w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center p-1 bg-slate-900/50 ${isUploading ? 'border-amber-500 animate-pulse' : 'border-slate-700'}`}>
            <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-amber-500 overflow-hidden">
               {currentUser?.lastMoment ? (
                   <img 
                    src={currentUser.lastMoment.imageUrl} 
                    className="w-full h-full object-cover" 
                    onClick={(e) => {
                        e.stopPropagation();
                        openMoment({
                            id: 'own',
                            userId: currentUser.id,
                            nickname: currentUser.nickname,
                            avatar: currentUser.avatar,
                            imageUrl: currentUser.lastMoment!.imageUrl,
                            timestamp: 'Agora',
                            viewed: false
                        });
                    }}
                    alt="Sua Vibe" 
                   />
               ) : (
                   isUploading ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={24} />
               )}
            </div>
          </div>
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
            {isUploading ? 'Enviando...' : (currentUser?.lastMoment ? 'Sua Vibe' : 'Toque p/ Postar')}
          </span>
        </div>

        {MOCK_MOMENTS.map((moment) => (
          <div 
            key={moment.id} 
            onClick={() => openMoment(moment)}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 animate-in zoom-in duration-500">
              <div className="w-full h-full rounded-full border-2 border-[#050505] overflow-hidden">
                <img src={moment.avatar} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={moment.nickname} />
              </div>
            </div>
            <span className="text-[8px] font-black text-white uppercase tracking-widest truncate max-w-[64px]">{moment.nickname.split(' ')[0]}</span>
          </div>
        ))}
      </div>

      {/* Moment Viewer Fullscreen */}
      {activeMoment && (
        <div className="fixed inset-0 z-[1000] bg-black animate-in fade-in duration-300 flex flex-col">
          {/* Progress Bar */}
          <div className="absolute top-12 left-6 right-6 z-[1010] flex gap-1">
            <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 transition-all duration-100 linear" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="absolute top-16 left-6 right-6 z-[1010] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={activeMoment.avatar} className="w-10 h-10 rounded-full border border-white/20 object-cover" />
              <div>
                <p className="text-white text-xs font-black uppercase tracking-widest">{activeMoment.nickname}</p>
                <p className="text-[9px] text-amber-500/80 font-bold uppercase tracking-widest">{activeMoment.timestamp}</p>
              </div>
            </div>
            <button onClick={() => setActiveMoment(null)} className="p-2 bg-white/10 rounded-full text-white backdrop-blur-md">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 w-full flex items-center justify-center relative">
            <img src={activeMoment.imageUrl} className="w-full h-full object-cover" alt="Moment Content" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
          </div>

          {/* Botão de Resposta Rápida */}
          <div className="absolute bottom-12 left-6 right-6 z-[1010]">
             <div className="flex gap-2">
                <input 
                  placeholder="Responder vibe..." 
                  className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 text-xs text-white placeholder:text-white/50 outline-none" 
                />
                <button className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-black shadow-lg">
                  <Zap size={20} fill="currentColor" />
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VibeMoments;
