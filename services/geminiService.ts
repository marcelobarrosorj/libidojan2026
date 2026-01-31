
import { GoogleGenAI, Type } from "@google/genai";
import { User } from "../types";
import { log, retryWithBackoff } from "./authUtils";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analiza a compatibilidade profunda baseada na Matriz B (Lifestyle, Behaviors, Boundaries, Bravery).
 */
export const analyzeCompatibility = async (currentUser: User, targetUser: User) => {
  const ai = getAI();
  
  // Dossiê completo para a IA focar na Matriz B (Lifestyle Deep Matching)
  const dossier = {
    current: {
      nick: currentUser.nickname,
      bravery: currentUser.braveryLevel,           // B22
      boundaries: currentUser.boundaries,         // B11
      behaviors: currentUser.behaviors,           // B12
      bucketList: currentUser.bucketList || [],   // B17
      vibes: currentUser.vibes,
      bio: currentUser.bio,
      biotype: currentUser.biotype                // B4
    },
    target: {
      nick: targetUser.nickname,
      bravery: targetUser.braveryLevel,
      boundaries: targetUser.boundaries,
      behaviors: targetUser.behaviors,
      bucketList: (targetUser as any).bucketList || [],
      vibes: targetUser.vibes,
      bio: targetUser.bio,
      biotype: targetUser.biotype
    }
  };

  const prompt = `Você é um Consultor de Lifestyle de Alta Performance especializado em Deep Matching para uma rede social lifestyle premium (Swing/Liberal/BDSM).
  Analise a compatibilidade profunda (Matriz B) entre estes dois perfis:
  
  ${JSON.stringify(dossier, null, 2)}
  
  MISSÃO ANALÍTICA:
  1. CONFLITO DE LIMITES (CRÍTICO): Verifique se o 'behavior' (B12) de um é listado como 'boundary' (B11) do outro. Ex: Um gosta de exibicionismo (B12) e o outro bloqueia isso (B11). Penalize o score em 50 pontos se houver conflito.
  2. SINTONIA DE AUDÁCIA (B22): Perfis com delta de audácia <= 2 são altamente compatíveis.
  3. AFINIDADE DE DESEJOS (B17): Identifique se itens na 'bucketList' convergem ou são complementares.
  4. DINÂMICA DE PODER: Se houver traços BDSM, avalie se a dinâmica (Dom/Sub/Switch) é funcional.
  
  Retorne um JSON com:
  - score: (0-100)
  - analysis: Uma frase sofisticada, instigante e curta em português sobre a sintonia lifestyle.
  - iceBreaker: Uma sugestão de frase inicial "quebra-gelo" baseada em um desejo comum ou na audácia detectada.`;

  const operation = async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            analysis: { type: Type.STRING },
            iceBreaker: { type: Type.STRING },
          },
          required: ["score", "analysis", "iceBreaker"],
        }
      }
    });

    return JSON.parse(response.text || '{}');
  };

  try {
    const result = await retryWithBackoff(operation);
    log('info', 'Deep B-Matrix Match Analysis complete', { score: result.score });
    return result;
  } catch (error: any) {
    log('error', 'Gemini B-Matrix matching failed', { error: error.message });
    return {
      score: 69,
      analysis: "Uma sintonia baseada em audácia mútua e vibes complementares.",
      iceBreaker: `Notei uma audácia de nível ${targetUser.braveryLevel} no seu perfil. Que tal explorarmos nossos limites?`
    };
  }
};

export const getConversationStarter = async (targetUser: User) => {
  const ai = getAI();
  const prompt = `Crie um "icebreaker" instigante e sofisticado para:
  Nickname: ${targetUser.nickname}
  Audácia (B22): ${targetUser.braveryLevel}/10
  Estilo (B12): ${targetUser.behaviors.join(', ')}
  Bio: ${targetUser.bio}
  
  O tom deve ser instigante, focado no lifestyle liberal e condizente com o nível de audácia do alvo.`;

  const operation = async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  };

  try {
    const result = await retryWithBackoff(operation);
    return result || `Olá ${targetUser.nickname}, sua audácia nível ${targetUser.braveryLevel} me chamou atenção. Vamos conversar?`;
  } catch (error: any) {
    return `Sua audácia de nível ${targetUser.braveryLevel} é instigante. Que tal um papo?`;
  }
};
