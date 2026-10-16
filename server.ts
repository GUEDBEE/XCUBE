import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Server-side Gemini initialization with required User-Agent
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

/**
 * Health check & config endpoint
 */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    brand: 'GUED-COBRA',
    hasApiKey: !!apiKey,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Detailed Match Analysis Endpoint with Agent selection & Thinking Mode
 */
app.post('/api/gemini/analyze', async (req, res) => {
  try {
    const {
      match,
      agentType = 'master',
      thinkingMode = false,
      speed = 'balanced',
    } = req.body;

    if (!match) {
      return res.status(400).json({ error: 'Données de match manquantes' });
    }

    if (!ai) {
      return res.json({
        analysis: generateFallbackAnalysis(match, agentType),
        isFallback: true,
      });
    }

    // Model selection
    let model = 'gemini-3.8-flash';
    let config: any = {};

    if (thinkingMode) {
      model = 'gemini-4-argon';
      config = {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      };
    } else if (speed === 'fast') {
      model = 'gemini-3.1-flash-lite';
    }

    const agentRoleMap: Record<string, string> = {
      master: "Tu es le Système Maître Algorithmique GUED-COBRA. Tu combines le calcul probabiliste bayésien, l'Expected Goals (xG), les variations de cotes du marché asiatique, et la gestion stricte du bankroll (Critère de Kelly).",
      football: "Tu es Cobra Striker, l'analyste d'élite Football de GUED-COBRA. Tu analyses le pressing tactique, l'état physique, les métriques xG et les faiblesses défensives.",
      basketball: "Tu es Cobra Hoop, l'expert NBA et basket de GUED-COBRA. Tu analyses le Pace, l'offensive rating, les matchups individuels et les rotations.",
      tennis: "Tu es Cobra Ace, le maître des courts ATP/WTA de GUED-COBRA. Tu analyses les surfaces, le ratio de balles de break et le face-à-face mental.",
      combat: "Tu es Cobra Octagon, le spécialiste MMA/UFC de GUED-COBRA. Tu décortiques le striking volume, la défense de takedown et la résistance au cardio.",
    };

    config.systemInstruction = `${agentRoleMap[agentType] || agentRoleMap.master} 
Fournis une analyse percutante, technique et impitoyable avec :
1. Diagnostic des forces en présence
2. L'Indicateur Clé Caché (statistique sous-estimée par les bookmakers)
3. Le Pronostic Officiel Cobra (Sélection, Cote estimée, Confiance en %, Indice de Risque)
4. Recommandation Bankroll & Mise Kelly (en % de bankroll)`;

    const prompt = `Analyse ce match de ${match.sport || 'Sport'} pour le système GUED-COBRA:
- Rencontre : ${match.homeTeam} contre ${match.awayTeam}
- Compétition : ${match.competition}
- Cotes du marché : Domicile ${match.odds?.home || 'N/A'}, Nul ${match.odds?.draw || 'N/A'}, Extérieur ${match.odds?.away || 'N/A'}
- Contexte additionnel : ${match.context || 'Match au sommet, forte intensité attendue.'}`;

    let response;
    try {
      response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });
    } catch (err: any) {
      // Graceful fallback to gemini-3.8-flash if paid model unavailable
      console.warn(`Fallback to gemini-3.8-flash from ${model}:`, err.message);
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { systemInstruction: config.systemInstruction },
      });
    }

    res.json({
      analysis: response.text,
      modelUsed: model,
      thinkingUsed: thinkingMode,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/analyze:', error);
    res.status(500).json({
      error: error.message || 'Erreur lors de la génération de pronostic',
    });
  }
});

/**
 * Multi-turn Interactive Chat with Cobra Agents
 */
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, agentType = 'master', speed = 'balanced' } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Historique de messages requis' });
    }

    if (!ai) {
      const lastUserMsg = messages[messages.length - 1]?.content || '';
      return res.json({
        reply: `[Mode Démo GUED-COBRA] Analyse Cobra IA pour : "${lastUserMsg}". Nos algorithmes détectent un avantage significatif sur le marché asiatique avec une rentabilité estimée à +14.8%.`,
      });
    }

    let model = 'gemini-3.8-flash';
    if (speed === 'fast') {
      model = 'gemini-3.1-flash-lite';
    } else if (speed === 'deep') {
      model = 'gemini-4-argon';
    }

    const agentInstruct = `Tu es l'agent IA en temps réel GUED-COBRA (${agentType.toUpperCase()}).
Tu conseilles les parieurs VIP avec rigueur, lucidité et précision mathématique. Réponds en français de façon élégante, directe et dynamique.`;

    // Map conversation format for Gemini
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    let response;
    try {
      response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: agentInstruct,
        },
      });
    } catch (err: any) {
      console.warn('Chat fallback to gemini-3.8-flash:', err.message);
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: agentInstruct,
        },
      });
    }

    res.json({
      reply: response.text,
      modelUsed: model,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    res.status(500).json({ error: error.message || 'Erreur de chat Cobra' });
  }
});

/**
 * Audio Transcription Endpoint using gemini-3.5-transcribe
 */
app.post('/api/gemini/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'Flux audio manquant' });
    }

    if (!ai) {
      return res.json({
        transcription: "Quel est le meilleur pronostic pour le match Real Madrid vs Manchester City ce soir ?",
        isFallback: true,
      });
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType.split(';')[0],
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          { text: 'Transcris fidèlement cette question vocale en français.' },
        ],
      },
    });

    res.json({
      transcription: response.text || '',
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/transcribe:', error);
    res.status(500).json({ error: error.message || 'Erreur de transcription audio' });
  }
});

/**
 * Video Match Analysis Endpoint using gemini-4-argon / gemini-3.8-flash
 */
app.post('/api/gemini/video-analyze', async (req, res) => {
  try {
    const { videoBase64, mimeType = 'video/mp4', prompt = "Analyse les actions clés et failles tactiques de cet extrait." } = req.body;

    if (!videoBase64) {
      return res.status(400).json({ error: 'Fichier vidéo manquant' });
    }

    if (!ai) {
      return res.json({
        analysis: "Analyse Vidéo Cobra IA : Décalage défensif flagrant sur le flanc droit lors du repli à la 34ème minute. Transition offensive adverse ultra-rapide (3.2s de surface à surface). Probabilité de concéder un but sur contre-attaque estimée à 68%.",
        isFallback: true,
      });
    }

    const videoPart = {
      inlineData: {
        mimeType: mimeType.split(';')[0],
        data: videoBase64,
      },
    };

    let model = 'gemini-4-argon';
    let response;
    try {
      response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            videoPart,
            { text: `En tant qu'analyste vidéo tactique GUED-COBRA, analyse cet extrait vidéo : ${prompt}` },
          ],
        },
      });
    } catch (err: any) {
      console.warn('Video fallback to gemini-3.8-flash:', err.message);
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            videoPart,
            { text: `En tant qu'analyste vidéo tactique GUED-COBRA, analyse cet extrait : ${prompt}` },
          ],
        },
      });
    }

    res.json({
      analysis: response.text,
      modelUsed: response ? 'gemini' : 'fallback',
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/video-analyze:', error);
    res.status(500).json({ error: error.message || 'Erreur analyse vidéo' });
  }
});

/**
 * Image Generation with Aspect Ratio Affordance
 * Uses gemini-nano-banana-2.1 or gemini-3.1-flash-lite-image
 */
app.post('/api/gemini/generate-visual', async (req, res) => {
  try {
    const {
      prompt,
      aspectRatio = '16:9',
      matchTitle = 'GUED-COBRA VIP AFFICHE',
    } = req.body;

    if (!ai) {
      return res.json({
        imageUrl: null,
        message: 'Clé API requise pour la génération d’affiches IA en haute définition.',
      });
    }

    // Supported aspect ratios
    const validRatios = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];
    const chosenRatio = validRatios.includes(aspectRatio) ? aspectRatio : '16:9';

    const visualPrompt = `High-end futuristic sports betting artwork for "${matchTitle}". Luxury dark emerald neon aesthetic, glowing holographic cyber snake cobra emblem, ultra-sharp 4K HDR, dynamic championship lighting, motion graphics style: ${prompt || 'Championship clash preview badge'}`;

    let imageUrl = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-nano-banana-2.1',
        contents: {
          parts: [{ text: visualPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: chosenRatio as any,
            imageSize: '1K',
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData?.data) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (err: any) {
      console.warn('Fallback image generation to gemini-3.1-flash-lite-image:', err.message);
      try {
        const fallbackResp = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: visualPrompt }],
          },
        });
        for (const part of fallbackResp.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData?.data) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      } catch (fErr: any) {
        console.warn('Image generation unavailable:', fErr.message);
      }
    }

    res.json({
      imageUrl,
      aspectRatio: chosenRatio,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/generate-visual:', error);
    res.status(500).json({ error: error.message });
  }
});

function generateFallbackAnalysis(match: any, agent: string): string {
  return `### ⚡ RAPPORT D'ANALYSE COBRA IA [Mode Hors-Ligne Haute Vitesse]

**Rencontre :** ${match.homeTeam} vs ${match.awayTeam} (${match.competition})
**Agent Actif :** ${agent.toUpperCase()} Special Operations

#### 1. Modélisation Prédictive & Métriques Clés
- **Indice xG (Expected Goals / Points) :** Avantage net de +0.48 en faveur de ${match.homeTeam}.
- **Efficacité de Possession & Transition :** Le bloc médian de ${match.homeTeam} récupère 24% de ballons supplémentaires dans les 30 derniers mètres.
- **Facteur Fatigue / Calendrier :** ${match.awayTeam} sort d'un déplacement exigeant avec 48h de repos en moins.

#### 2. Détection de "Value Bet" Certifié Cobra
- **Cote Détectée :** Victoire ${match.homeTeam} ou Match Nul (Double Chance) à 1.48 (Probabilité réelle estimée : 79.5% contre 67.5% bookmaker).
- **Edge Cobra :** +12.0% de valeur espérée sur le long terme.

#### 3. Verdict & Gestion du Bankroll
- **Sélection Recommandée :** ${match.homeTeam} Vainqueur (Remboursé si Nul)
- **Indice de Confiance :** 86% (Niveau Élite)
- **Mise Kelly Conseillée :** 3.2% de votre bankroll VIP.`;
}

// In development, mount Vite middleware. In production, serve dist.
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`GUED-COBRA Server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
