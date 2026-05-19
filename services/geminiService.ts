
import { User } from "../types";
import { log } from "./authUtils";

/**
 * Analiza a compatibilidade profunda baseada na Matriz B (Lifestyle, Behaviors, Boundaries, Bravery).
 */
export const analyzeCompatibility = async (currentUser: User, targetUser: User) => {
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

  try {
    const response = await fetch('/api/ai/compatibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dossier })
    });

    if (!response.ok) {
        throw new Error(`AI Request failed: ${response.statusText}`);
    }

    const result = await response.json();
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
  try {
    const response = await fetch('/api/ai/starter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUser })
    });

    if (!response.ok) {
        throw new Error(`AI Starter Request failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.text || `Olá ${targetUser.nickname}, sua audácia nível ${targetUser.braveryLevel} me chamou atenção. Vamos conversar?`;
  } catch (error: any) {
    log('error', 'Gemini Starter failed', { error: error.message });
    return `Sua audácia de nível ${targetUser.braveryLevel} é instigante. Que tal um papo?`;
  }
};
