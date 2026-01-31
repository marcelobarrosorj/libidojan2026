
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Check, Palette, Sun, Loader2, Sparkles } from 'lucide-react';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (newImageUrl: string) => void;
  onCancel: () => void;
}

const FILTERS = [
  { name: 'Original', filter: '' },
  { name: 'Natural', filter: 'sepia(0.1) saturate(1.2) contrast(1.1)' },
  { name: 'Vibe', filter: 'brightness(0.9) contrast(1.2) saturate(1.1) hue-rotate(-5deg)' },
  { name: 'P&B', filter: 'grayscale(1) contrast(1.2)' },
  { name: 'Frio', filter: 'hue-rotate(180deg) saturate(0.8) brightness(1.1)' },
  { name: 'Quente', filter: 'sepia(0.4) saturate(1.4) contrast(1.1)' }
];

const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'adjust' | 'filter'>('filter');
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  
  // Ajustes Manuais
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  
  const [imgSize, setImgSize] = useState({ width: 0, height: 0, ratio: 1 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Renderiza a imagem no canvas aplicando apenas os filtros e ajustes selecionados
  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    
    if (!canvas || !img || !isImgLoaded) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Sincroniza dimensões do canvas com a imagem original
    canvas.width = imgSize.width;
    canvas.height = imgSize.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    
    // Aplicação dos filtros CSS via context 2D
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) ${activeFilter.filter}`;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    ctx.restore();
  }, [brightness, contrast, activeFilter, imgSize, isImgLoaded]);

  const handleImageLoad = () => {
    if (imgRef.current) {
      const w = imgRef.current.naturalWidth;
      const h = imgRef.current.naturalHeight;
      setImgSize({ width: w, height: h, ratio: w / h });
      setIsImgLoaded(true);
    }
  };

  useEffect(() => {
    if (isImgLoaded) {
      renderPreview();
    }
  }, [renderPreview, isImgLoaded]);

  const handleFinish = () => {
    if (canvasRef.current) {
      // Exporta a imagem final sem qualquer desfoque
      onSave(canvasRef.current.toDataURL('image/jpeg', 0.95));
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-black flex flex-col animate-in fade-in duration-300">
      <header className="p-6 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-md">
        <button onClick={onCancel} className="p-2 text-slate-500 hover:text-white transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic flex items-center gap-2">
            <Sparkles size={14} className="text-pink" /> Photo Matrix Editor
        </h2>
        <button onClick={handleFinish} className="p-2 text-pink active:scale-90 transition-transform">
          <Check size={28} />
        </button>
      </header>

      <main className="flex-1 relative overflow-hidden flex items-center justify-center bg-[#050505] p-4">
        {!isImgLoaded && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="text-pink animate-spin" size={40} />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sincronizando Pixels...</p>
          </div>
        )}

        <div className={`relative max-w-full max-h-full flex items-center justify-center transition-all duration-500 ${isImgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <canvas 
            ref={canvasRef} 
            className="max-w-full max-h-[60vh] object-contain rounded-2xl shadow-2xl border border-white/5 bg-slate-900" 
            style={{ aspectRatio: imgSize.ratio }} 
          />
        </div>

        {isImgLoaded && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/90 backdrop-blur-2xl p-1.5 rounded-full border border-white/10 shadow-2xl z-20">
            <button 
              onClick={() => setActiveTab('filter')} 
              className={`px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'filter' ? 'bg-pink text-white shadow-lg shadow-pink/30' : 'text-slate-500'}`}
            >
              <Palette size={14} /> Filtros
            </button>
            <button 
              onClick={() => setActiveTab('adjust')} 
              className={`px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'adjust' ? 'bg-pink text-white shadow-lg shadow-pink/30' : 'text-slate-500'}`}
            >
              <Sun size={14} /> Ajustes
            </button>
          </div>
        )}
      </main>

      {isImgLoaded && (
        <footer className="bg-black/95 border-t border-white/5 p-6 pb-12 space-y-6">
          {activeTab === 'adjust' && (
            <div className="space-y-6 max-w-sm mx-auto animate-in slide-in-from-bottom-2">
              <div className="space-y-2">
                  <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest">
                    <span>Brilho</span>
                    <span>{brightness}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="150" 
                    value={brightness} 
                    onChange={(e) => setBrightness(parseInt(e.target.value))} 
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none accent-pink" 
                  />
              </div>
              <div className="space-y-2">
                  <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest">
                    <span>Contraste</span>
                    <span>{contrast}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="150" 
                    value={contrast} 
                    onChange={(e) => setContrast(parseInt(e.target.value))} 
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none accent-pink" 
                  />
              </div>
            </div>
          )}

          {activeTab === 'filter' && (
            <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide animate-in slide-in-from-bottom-2">
              {FILTERS.map(f => (
                <button 
                  key={f.name} 
                  onClick={() => setActiveFilter(f)} 
                  className={`flex-shrink-0 flex flex-col items-center gap-2 transition-all ${activeFilter.name === f.name ? 'scale-110' : 'opacity-40 grayscale'}`}
                >
                  <div className={`w-16 h-16 rounded-xl border-2 bg-slate-800 overflow-hidden flex items-center justify-center text-[8px] font-black text-white ${activeFilter.name === f.name ? 'border-pink shadow-[0_0_15px_rgba(255,20,147,0.4)]' : 'border-white/5'}`}>
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center" style={{ filter: f.filter }}>
                       {f.name === 'Original' ? <X size={20} /> : <Palette size={20} />}
                    </div>
                  </div>
                  <span className="text-[7px] font-black uppercase tracking-widest text-white">{f.name}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-4">
               <button onClick={onCancel} className="flex-1 py-4 bg-slate-900 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:text-white transition-colors">
                 Descartar
               </button>
               <button onClick={handleFinish} className="flex-[2] py-4 gradient-libido text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-pink/30 hover:brightness-110 active:scale-95 transition-all">
                 Publicar Agora
               </button>
          </div>
        </footer>
      )}

      {/* Fonte da Imagem (Invisível) */}
      <img 
        ref={imgRef} 
        src={imageUrl} 
        onLoad={handleImageLoad}
        className="hidden" 
        alt="source"
      />
    </div>
  );
};

export default ImageEditor;
