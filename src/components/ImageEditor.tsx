import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, Grid, Square, ShieldAlert, Undo, Sliders, X, Save } from 'lucide-react';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedUrl: string) => void;
  onCancel: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'pixelate' | 'blackbar' | 'none'>('pixelate');
  const [brushSize, setBrushSize] = useState(40);
  const [isDrawing, setIsDrawing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  const filtersList = [
    { id: 'none', label: 'Normal', filterString: 'none' },
    { id: 'mono', label: 'P&B', filterString: 'grayscale(100%)' },
    { id: 'sepia', label: 'Sépia', filterString: 'sepia(100%)' },
    { id: 'vintage', label: 'Vintage', filterString: 'sepia(30%) contrast(110%) brightness(110%)' },
    { id: 'cool', label: 'Frio', filterString: 'saturate(70%) hue-rotate(10deg) brightness(95%)' },
    { id: 'vibrant', label: 'Vibrante', filterString: 'saturate(150%) contrast(110%)' },
  ];

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setOriginalImage(img);
      resetCanvas(img, 'none');
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const resetCanvas = (img: HTMLImageElement, filterStr: string = 'none') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const maxDim = 800;
    let w = img.width;
    let h = img.height;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = (maxDim / w) * h;
        w = maxDim;
      } else {
        w = (maxDim / h) * w;
        h = maxDim;
      }
    }

    canvas.width = w;
    canvas.height = h;
    ctx.filter = filterStr;
    ctx.drawImage(img, 0, 0, w, h);
    ctx.filter = 'none';
  };

  const rotate90 = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    tempCtx.drawImage(canvas, 0, 0);

    canvas.width = tempCanvas.height;
    canvas.height = tempCanvas.width;

    const newCtx = canvas.getContext('2d');
    if (!newCtx) return;

    newCtx.translate(canvas.width / 2, canvas.height / 2);
    newCtx.rotate(Math.PI / 2);
    newCtx.drawImage(tempCanvas, -tempCanvas.width / 2, -tempCanvas.height / 2);
  };

  const applyFilter = (filterStr: string, filterId: string) => {
    if (!originalImage) return;
    setSelectedFilter(filterId);
    resetCanvas(originalImage, filterStr);
  };

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    draw(e);
  };

  const handleStopDraw = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || tool === 'none') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    const touches = (e as any).touches || ((e as any).nativeEvent && (e as any).nativeEvent.touches);
    if (touches && touches.length > 0) {
      clientX = touches[0].clientX;
      clientY = touches[0].clientY;
    } else {
      clientX = (e as any).clientX;
      clientY = (e as any).clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    if (tool === 'pixelate') {
      const size = brushSize;
      const startX = Math.max(0, x - size / 2);
      const startY = Math.max(0, y - size / 2);
      const w = Math.min(canvas.width - startX, size);
      const h = Math.min(canvas.height - startY, size);

      if (w <= 0 || h <= 0) return;

      const imgData = ctx.getImageData(startX, startY, w, h);
      const pixelScale = 8;
      const sw = Math.max(1, Math.round(w / pixelScale));
      const sh = Math.max(1, Math.round(h / pixelScale));
      
      const tinyCanvas = document.createElement('canvas');
      tinyCanvas.width = sw;
      tinyCanvas.height = sh;
      const tinyCtx = tinyCanvas.getContext('2d');
      
      if (tinyCtx) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        tempCanvas.getContext('2d')?.putImageData(imgData, 0, 0);
        
        tinyCtx.drawImage(tempCanvas, 0, 0, w, h, 0, 0, sw, sh);
        
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tinyCanvas, 0, 0, sw, sh, startX, startY, w, h);
      }
    } else if (tool === 'blackbar') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - brushSize / 2, y - 10, brushSize, 20);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSaving(true);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.textAlign = 'right';
      ctx.fillText('ID: 000001', canvas.width - 20, canvas.height - 20);
    }
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onSave(dataUrl);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-[var(--libido-surface)]/95 z-[150] flex flex-col justify-between p-4 backdrop-blur-md animate-in fade-in">
      <div className="flex items-center justify-between py-2 border-b border-[var(--libido-border)]">
        <div className="flex items-center gap-2 text-[var(--libido-accent)]">
          <ShieldAlert size={16} />
          <h2 className="text-xs font-black uppercase tracking-widest italic">Edição de Fotos Sexlog</h2>
        </div>
        <button onClick={onCancel} className="text-[var(--libido-muted)] opacity-60 hover:text-[var(--libido-text)] p-2">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-2 overflow-hidden my-4">
        <canvas
          ref={canvasRef}
          onMouseDown={handleStartDraw}
          onMouseMove={handleDraw}
          onMouseUp={handleStopDraw}
          onMouseLeave={handleStopDraw}
          onTouchStart={handleStartDraw}
          onTouchMove={handleDraw}
          onTouchEnd={handleStopDraw}
          className="max-w-full max-h-[50vh] object-contain rounded-xl border border-[var(--libido-border)] shadow-[0_0_50px_rgba(0,0,0,0.8)] cursor-crosshair touch-none"
        />
      </div>

      <div className="bg-[var(--libido-surface-2)] border border-[var(--libido-border)] rounded-3xl p-4 space-y-4 max-w-sm mx-auto w-full">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTool('pixelate')}
            className={`flex-1 flex flex-col items-center gap-1 py-2 px-1.5 rounded-xl border text-[9px] font-black uppercase transition-all ${
              tool === 'pixelate' ? 'bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] border-[var(--libido-accent)]' : 'bg-black/30 text-[var(--libido-muted)] opacity-70 border-[var(--libido-border)]'
            }`}
          >
            <Grid size={16} />
            Mosaico
          </button>
          <button
            type="button"
            onClick={() => setTool('blackbar')}
            className={`flex-1 flex flex-col items-center gap-1 py-2 px-1.5 rounded-xl border text-[9px] font-black uppercase transition-all ${
              tool === 'blackbar' ? 'bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] border-[var(--libido-accent)]' : 'bg-black/30 text-[var(--libido-muted)] opacity-70 border-[var(--libido-border)]'
            }`}
          >
            <Square size={16} />
            Tarja Preta
          </button>
          <button
            type="button"
            onClick={rotate90}
            className="flex-1 flex flex-col items-center gap-1 py-2 px-1.5 rounded-xl bg-black/30 border border-[var(--libido-border)] text-[9px] font-black uppercase text-[var(--libido-muted)] opacity-80 hover:text-[var(--libido-text)]"
          >
            <RotateCw size={16} />
            Girar
          </button>
          <button
            type="button"
            onClick={() => originalImage && resetCanvas(originalImage, 'none')}
            className="flex-1 flex flex-col items-center gap-1 py-2 px-1.5 rounded-xl bg-black/30 border border-[var(--libido-border)] text-[9px] font-black uppercase text-[var(--libido-muted)] opacity-80 hover:text-[var(--libido-text)]"
          >
            <Undo size={16} />
            Resetar
          </button>
        </div>

        {tool !== 'none' && (
          <div className="flex items-center gap-3">
            <Sliders size={12} className="text-[var(--libido-muted)] opacity-60" />
            <input
              type="range"
              min="20"
              max="100"
              value={brushSize}
              onChange={e => setBrushSize(Number(e.target.value))}
              className="flex-1 accent-[var(--libido-accent)]"
            />
            <span className="text-[10px] font-bold font-mono text-[var(--libido-muted)] w-8 text-right">{brushSize}px</span>
          </div>
        )}

        <div className="border-t border-[var(--libido-border)] pt-3">
          <p className="text-[9px] font-black uppercase tracking-wider text-[var(--libido-muted)] opacity-60 mb-2">Filtros de Foto</p>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {filtersList.map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => applyFilter(f.filterString, f.id)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all flex-shrink-0 ${
                  selectedFilter === f.id
                    ? 'bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] border-[var(--libido-accent)]'
                    : 'bg-black/20 text-[var(--libido-muted)] opacity-70 border-[var(--libido-border)] hover:text-[var(--libido-text)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] font-black py-3.5 rounded-2xl text-xs uppercase tracking-widest transition-opacity hover:opacity-95 flex items-center justify-center gap-2 shadow-lg shadow-[var(--libido-accent)]/10"
        >
          <Save size={14} />
          {saving ? 'Criptografando...' : 'Aplicar e Salvar'}
        </button>
      </div>
    </div>
  );
};

export default ImageEditor;
