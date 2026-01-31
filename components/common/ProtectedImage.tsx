
import React, { useEffect, useRef, useState } from 'react';
import { cache } from '../../services/authUtils';
import { getWatermarkData } from '../../services/securityService';
import { Loader2, ShieldAlert } from 'lucide-react';

interface ProtectedImageProps {
  src: string;
  alt: string;
  className?: string;
  isBlurred?: boolean;
}

const ProtectedImage: React.FC<ProtectedImageProps> = ({ src, alt, className = '', isBlurred = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const user = cache.userData;
  const imageObj = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      imageObj.current = img;
      setLoading(false);
      renderImage();
    };
    img.onerror = () => {
      setError(true);
      setLoading(false);
    };
  }, [src, isBlurred]);

  const renderImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageObj.current) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Configuração de Resolução
    canvas.width = imageObj.current.naturalWidth;
    canvas.height = imageObj.current.naturalHeight;
    
    // Camada de Conteúdo
    if (isBlurred) {
      ctx.filter = 'blur(60px) brightness(0.5)';
    } else {
      ctx.filter = 'none';
    }
    
    ctx.drawImage(imageObj.current, 0, 0);
    
    // Camada Forense (Marca d'água dinâmica do Usuário)
    ctx.filter = 'none';
    const watermark = getWatermarkData(user);
    
    // Configura texto para marca d'água legível mas discreta
    ctx.font = 'bold 24px Outfit';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.textAlign = 'center';
    
    // Desenha padrão repetido em grade diagonal
    const step = 200;
    for (let x = -canvas.width; x < canvas.width * 2; x += step) {
        for (let y = -canvas.height; y < canvas.height * 2; y += step) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-Math.PI / 4);
            ctx.fillText(watermark, 0, 0);
            ctx.restore();
        }
    }
  };

  return (
    <div className={`relative overflow-hidden bg-slate-950 flex items-center justify-center group ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-950">
          <Loader2 className="text-pink animate-spin" size={24} />
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-900 text-slate-500 text-[8px] uppercase font-black text-center px-4">
          <ShieldAlert size={16} className="mb-2 mx-auto" />
          Acesso à mídia negado pela matriz
        </div>
      )}

      <canvas 
        ref={canvasRef}
        className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 group-hover:scale-105"
        onContextMenu={(e) => e.preventDefault()}
      />
      
      {/* Overlay de Deterrence - Feedback visual imediato de proibição */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent pointer-events-none flex items-end justify-center p-4">
          <span className="text-[7px] text-white/40 font-black uppercase tracking-widest bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">Cópia Proibida - Identidade Monitorada</span>
      </div>
    </div>
  );
};

export default ProtectedImage;
