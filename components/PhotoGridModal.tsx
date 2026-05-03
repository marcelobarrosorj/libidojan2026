
import React from 'react';
import { X, Grid, Camera } from 'lucide-react';
import { GalleryPhoto } from '../types';

interface PhotoGridModalProps {
  photos: GalleryPhoto[];
  onClose: () => void;
  onPhotoClick?: (index: number) => void;
  isBlurred?: boolean;
}

const PhotoGridModal: React.FC<PhotoGridModalProps> = ({ photos, onClose, onPhotoClick, isBlurred }) => {
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
                onClick={() => onPhotoClick?.(index)}
                className="aspect-square relative rounded-[2.5rem] overflow-hidden group cursor-pointer border border-white/5 shadow-xl hover:scale-[1.02] transition-transform active:scale-95"
              >
                <img 
                  src={photo.url} 
                  alt={`Galeria ${index}`} 
                  className={`w-full h-full object-cover transition-all duration-700 ${isBlurred ? 'blur-2xl scale-110' : 'group-hover:scale-110'}`}
                />
                
                {photo.isBlurred && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                     <p className="text-[8px] font-black text-white uppercase tracking-[0.3em] bg-black/60 px-4 py-2 rounded-full border border-white/10">Conteúdo Oculto</p>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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

      {/* Footer Branding */}
      <div className="p-8 text-center pb-12">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">Libido Matrix Core v2.0</p>
      </div>
    </div>
  );
};

export default PhotoGridModal;
