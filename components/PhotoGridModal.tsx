
import React, { useState } from 'react';
import { X, Grid, Camera, ChevronLeft, ChevronRight, Maximize2, ShieldCheck, Eye } from 'lucide-react';
import { GalleryPhoto } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface PhotoGridModalProps {
  photos: GalleryPhoto[];
  onClose: () => void;
  onPhotoClick?: (index: number) => void;
  isBlurred?: boolean;
}

const PhotoGridModal: React.FC<PhotoGridModalProps> = ({ photos, onClose, isBlurred: initialBlurred }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isPhotoBlurred, setIsPhotoBlurred] = useState(initialBlurred);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % photos.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-3xl flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-black shadow-lg">
            <Grid size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Galeria Digital</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{photos.length} Mídias Verificadas</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 bg-slate-900 rounded-2xl text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo, index) => (
              <div 
                key={photo.id} 
                onClick={() => setSelectedIndex(index)}
                className="aspect-square relative rounded-[32px] overflow-hidden group cursor-pointer border border-white/5 shadow-xl hover:scale-[1.02] transition-transform active:scale-95"
              >
                <img 
                  src={photo.url} 
                  alt={`Galeria ${index}`} 
                  className={`w-full h-full object-cover transition-all duration-700 ${initialBlurred ? 'blur-2xl scale-110 grayscale' : 'group-hover:scale-110'}`}
                />
                
                {initialBlurred && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                     <p className="text-[8px] font-black text-white uppercase tracking-[0.3em] bg-black/60 px-4 py-2 rounded-full border border-white/10">Protegido</p>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 size={16} className="text-white" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
            <div className="w-24 h-24 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-700">
               <Camera size={48} />
            </div>
            <div>
                <h4 className="text-white font-black uppercase italic tracking-tighter text-xl">Nenhuma Mídia</h4>
                <p className="text-slate-500 text-xs font-medium max-w-[200px] mx-auto mt-2 leading-relaxed">
                  Esta galeria está vazia. Adicione fotos para enriquecer sua Matriz Libido.
                </p>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Viewer Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000] bg-black flex flex-col items-center justify-center p-4 sm:p-12"
            onClick={() => setSelectedIndex(null)}
          >
            <button 
                className="absolute top-8 right-8 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white z-[3001]"
                onClick={() => setSelectedIndex(null)}
            >
                <X size={32} />
            </button>

            <div className="relative w-full max-w-4xl aspect-[4/5] sm:aspect-square flex items-center justify-center group">
                <motion.img
                    layoutId={`photo-${photos[selectedIndex].id}`}
                    src={photos[selectedIndex].url}
                    className={`max-w-full max-h-full object-contain rounded-3xl transition-all duration-500 ${isPhotoBlurred ? 'blur-3xl scale-110 brightness-50' : 'blur-0 scale-100'}`}
                    onClick={(e) => e.stopPropagation()}
                />

                {isPhotoBlurred && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-md rounded-3xl">
                        <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500 border border-amber-500/30 mb-6">
                            <ShieldCheck size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-white italic uppercase mb-2">Visão Protegida</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-8">Esta mídia está criptografada</p>
                        
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsPhotoBlurred(false); }}
                            className="px-10 py-5 bg-amber-500 text-black rounded-3xl font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Eye size={20} />
                            Revelar Matriz
                        </button>
                    </div>
                )}

                {/* Navigation */}
                {photos.length > 1 && (
                    <>
                        <button 
                            className="absolute left-4 p-4 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                            onClick={handlePrev}
                        >
                            <ChevronLeft size={32} />
                        </button>
                        <button 
                            className="absolute right-4 p-4 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                            onClick={handleNext}
                        >
                            <ChevronRight size={32} />
                        </button>
                    </>
                )}
            </div>

            <div className="mt-8 text-center bg-white/5 px-8 py-4 rounded-[2rem] border border-white/5 backdrop-blur-md">
                <p className="text-xs font-black text-white italic uppercase tracking-tighter">Mídia Verificada Libido NoFake</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">ID: {photos[selectedIndex].id.substring(0, 16)}...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Branding */}
      <div className="p-8 text-center pb-12">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">Libido Matrix Core v2.0</p>
      </div>
    </div>
  );
};

export default PhotoGridModal;
