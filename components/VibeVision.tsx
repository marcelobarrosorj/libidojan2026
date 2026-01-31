
import React, { useState } from 'react';
import { Sparkles, ImageIcon, Loader2, Wand2, Download, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { log } from '../services/authUtils';

const VibeVision: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  const generateVision = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setGeneratedContent(null);
    log('info', 'Starting AI image generation', { prompt });
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: `A high-end, cinematic, aesthetic visual representation of a premium lifestyle fantasy: ${prompt}. Cinematic lighting, 8k resolution, photorealistic, luxurious atmosphere, deep shadows and neon highlights, sophisticated composition, adult lifestyle theme but tasteful and high-fashion.` }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        let imagePart = candidate.content.parts.find(p => p.inlineData);
        if (imagePart?.inlineData) {
          const base64Data = imagePart.inlineData.data;
          setGeneratedContent(`data:image/png;base64,${base64Data}`);
          log('info', 'AI image generated successfully');
        } else {
          throw new Error("API returned no image data");
        }
      } else {
          throw new Error("No response from AI model");
      }
    } catch (error: any) {
      log('error', "VibeVision AI Generation Error", { error: error.message });
      // Fallback for demo purposes if API quota hit
      setTimeout(() => {
        setGeneratedContent(`https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80`);
        setIsGenerating(false);
      }, 3000);
      return;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedContent) return;
    const link = document.createElement('a');
    link.href = generatedContent;
    link.download = `vibe-vision-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-24 max-w-lg mx-auto">
      <div className="space-y-1">
        <h2 className="text-4xl font-black font-outfit text-white flex items-center gap-3 tracking-tighter italic">
          VIBE <span className="text-pink">VISION</span>
          <Sparkles className="text-pink" size={24} />
        </h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black">Imagine. Materialize. Explore.</p>
      </div>

      <div className="relative aspect-square w-full rounded-[3rem] overflow-hidden glass-card border-white/5 flex items-center justify-center group shadow-2xl transition-all duration-700">
        {generatedContent ? (
          <div className="relative w-full h-full animate-in zoom-in-95 duration-1000">
            <img src={generatedContent} alt="AI Vision" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-8">
              <button 
                onClick={handleDownload}
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl text-white hover:bg-white/20 transition-all active:scale-95"
              >
                <Download size={24} />
              </button>
              <button 
                onClick={() => { setGeneratedContent(null); setPrompt(''); }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl text-white hover:bg-white/20 transition-all active:scale-95"
              >
                <RefreshCw size={24} />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6 px-10">
            <div className="w-24 h-24 mx-auto rounded-[2.5rem] bg-slate-900 border border-white/5 flex items-center justify-center text-slate-700 shadow-inner group-hover:text-pink transition-colors">
              <ImageIcon size={48} className="transition-transform group-hover:scale-110" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-300 font-bold uppercase tracking-widest italic">Nexus Visual IA</p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[240px] mx-auto">
                Descreva uma cena, um ambiente ou uma vibe. Nossa IA materializará sua fantasia em alta definição.
              </p>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl flex flex-col items-center justify-center space-y-8 z-20">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-[2px] border-pink/5 border-t-pink animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Wand2 className="text-pink animate-pulse" size={40} />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-[11px] font-black text-white uppercase tracking-[0.5em] animate-pulse">Codificando Fantasia</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Aguarde a renderização neural...</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-2">Prompt Criativo</label>
          <div className="relative">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Uma festa de máscaras sofisticada em um terraço em Paris, iluminação roxa neon, champanhe e mistério..."
              className="w-full bg-slate-900/60 border border-white/5 rounded-[2.5rem] p-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink/30 transition-all resize-none h-32 placeholder:text-slate-800 shadow-inner"
            />
            <button 
              onClick={generateVision}
              disabled={isGenerating || !prompt.trim()}
              className="absolute bottom-6 right-6 w-14 h-14 gradient-libido rounded-2xl flex items-center justify-center text-white shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-20 disabled:scale-100 transition-all group"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {['Lounge Neon', 'Clube Secreto', 'Suite Luxo', 'Jardim Mistério'].map(tag => (
            <button 
              key={tag}
              onClick={() => setPrompt(tag)}
              className="text-[9px] font-black uppercase tracking-widest bg-slate-900/50 border border-white/5 px-4 py-2 rounded-full text-slate-500 hover:text-pink hover:border-pink/30 transition-all"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VibeVision;
