import { GoogleGenAI } from "@google/genai";
import { RadarProfile } from "./types";
import { log } from "../services/authUtils";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateRadarSummary(profiles: RadarProfile[]) {
  const ai = getAI();
  const summaryData = profiles.slice(0, 5).map(p => ({
    name: p.name,
    category: p.category,
    bio: p.bio,
    dist: p.distanceLabel
  }));

  const prompt = `Analise esta lista de perfis próximos em uma rede social lifestyle (swing/liberal) e crie um resumo de 1 frase (máximo 15 palavras) sobre a "vibe" da área agora.
  Seja instigante e sofisticado. Use português do Brasil.
  Perfis: ${JSON.stringify(summaryData)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || "Conexões interessantes detectadas no seu radar agora.";
  } catch (error: any) {
    log('error', 'Radar AI Summary failed', { error: error.message });
    return "O radar está agitado! Explore as conexões lifestyle ao seu redor.";
  }
}

export async function generateVibeCheck(profile: RadarProfile) {
  const ai = getAI();
  const prompt = `Crie uma "Vibe Check" tag super curta (máximo 2-3 palavras) para este perfil lifestyle:
  Nome: ${profile.name}
  Bio: ${profile.bio}
  Categoria: ${profile.category}
  
  Exemplos: "Energia Magnética", "Mistério Total", "Vibe Sofisticada", "Pura Ousadia".`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim().replace(/[".]/g, '') || "Conexão Ativa";
  } catch (error) {
    return "High Compatibility";
  }
}