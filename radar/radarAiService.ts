import { RadarProfile } from "./types";
import { log } from "../services/authUtils";

export async function generateRadarSummary(profiles: RadarProfile[]) {
  if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
    return "Conexões interessantes detectadas no seu radar agora.";
  }
  
  try {
    const response = await fetch('/api/ai/radar-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profiles })
    });

    if (!response.ok) throw new Error('AI Radar Summary request failed');
    const data = await response.json();
    return data.summary || "Conexões interessantes detectadas no seu radar agora.";
  } catch (error: any) {
    log('error', 'Radar AI Summary failed', { error: error.message });
    return "O radar está agitado! Explore as conexões lifestyle ao seu redor.";
  }
}

export async function generateVibeCheck(profile: RadarProfile) {
  try {
    const response = await fetch('/api/ai/vibe-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
    });

    if (!response.ok) throw new Error('Vibe Check request failed');
    const data = await response.json();
    return data.tag || "Conexão Ativa";
  } catch (error) {
    return "High Compatibility";
  }
}
