
import { Router } from 'express';
import { GoogleGenAI, Type } from "@google/genai";

const router = Router();

const getAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is required');
    }
    return new GoogleGenAI({ apiKey });
};

router.post('/compatibility', async (req, res) => {
    try {
        const { dossier } = req.body;
        if (!dossier) {
            return res.status(400).json({ error: 'Dossier is required' });
        }

        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: `Você é um Consultor de Lifestyle de Alta Performance especializado em Deep Matching para uma rede social lifestyle premium (Swing/Liberal/BDSM).
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
            - iceBreaker: Uma sugestão de frase inicial "quebra-gelo" baseada em um desejo comum ou na audácia detectada.`,
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
                },
            },
        });

        res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
        console.error('[AI_ERROR_COMPATIBILITY]', error);
        res.status(500).json({ error: error.message || 'Internal AI Error' });
    }
});

router.post('/radar-summary', async (req, res) => {
    try {
        const { profiles } = req.body;
        if (!profiles || !Array.isArray(profiles)) {
            return res.status(400).json({ error: 'Profiles array is required' });
        }

        const summaryData = profiles.slice(0, 5).map((p: any) => ({
            name: p.name,
            category: p.category,
            bio: p.bio,
            dist: p.distanceLabel
        }));

        const prompt = `Analise esta lista de perfis próximos em uma rede social lifestyle (swing/liberal) e crie um resumo de 1 frase (máximo 15 palavras) sobre a "vibe" da área agora.
        Seja instigante e sofisticado. Use português do Brasil.
        Perfis: ${JSON.stringify(summaryData)}`;

        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt
        });
        res.json({ summary: response.text?.trim() });
    } catch (error: any) {
        console.error('[AI_ERROR_RADAR_SUMMARY]', error);
        res.status(500).json({ error: 'Radar AI Summary failed' });
    }
});

router.post('/vibe-check', async (req, res) => {
    try {
        const { profile } = req.body;
        if (!profile) return res.status(400).json({ error: 'Profile is required' });

        const prompt = `Crie uma "Vibe Check" tag super curta (máximo 2-3 palavras) para este perfil lifestyle:
        Nome: ${profile.name}
        Bio: ${profile.bio}
        Categoria: ${profile.category}
        
        Exemplos: "Energia Magnética", "Mistério Total", "Vibe Sofisticada", "Pura Ousadia".`;

        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt
        });
        res.json({ tag: response.text?.trim().replace(/[".]/g, '') });
    } catch (error: any) {
        console.error('[AI_ERROR_VIBE_CHECK]', error);
        res.status(500).json({ error: 'Vibe Check failed' });
    }
});

router.post('/vibe-vision', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        const ai = getAI();
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

        const candidate = (response as any).candidates?.[0];
        let base64Data = null;
        if (candidate?.content?.parts) {
            let imagePart = candidate.content.parts.find((p: any) => p.inlineData);
            if (imagePart?.inlineData) {
                base64Data = imagePart.inlineData.data;
            }
        }

        if (base64Data) {
            res.json({ imageData: base64Data });
        } else {
            res.json({ imageUrl: `https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80` });
        }
    } catch (error: any) {
        console.error('[AI_ERROR_VISION]', error);
        res.status(500).json({ error: 'Vision generation failed' });
    }
});

router.post('/starter', async (req, res) => {
    try {
        const { targetUser } = req.body;
        if (!targetUser) {
            return res.status(400).json({ error: 'Target user is required' });
        }

        const ai = getAI();
        const prompt = `Crie um "icebreaker" instigante e sofisticado para:
        Nickname: ${targetUser.nickname}
        Audácia (B22): ${targetUser.braveryLevel}/10
        Estilo (B12): ${(targetUser.behaviors || []).join(', ')}
        Bio: ${targetUser.bio}
        
        O tom deve ser instigante, focado no lifestyle liberal e condizente com o nível de audácia do alvo.`;

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt
        });
        res.json({ text: response.text });
    } catch (error: any) {
        console.error('[AI_ERROR_STARTER]', error);
        res.status(500).json({ error: error.message || 'Internal AI Error' });
    }
});

export default router;
