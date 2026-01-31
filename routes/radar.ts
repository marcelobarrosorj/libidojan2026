
import express from 'express';
import { queryRadar } from '../services/radarService';

const router = express.Router();

/**
 * GET /radar
 * Endpoint to retrieve nearby lifestyle connections based on geolocation.
 * Requires x-user-id header for preference matching and lat/lon query parameters.
 */
router.get('/radar', async (req, res) => {
  try {
    // Extraction of parameters from request
    const viewerId = (req.headers['x-user-id'] as string) || '';
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    // Validation of required inputs
    if (!viewerId) {
      return res.status(400).json({ 
        error: 'Identificação do usuário (header x-user-id) é obrigatória para filtragem de preferências.' 
      });
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({ 
        error: 'Coordenadas lat/lon inválidas ou ausentes.' 
      });
    }

    // Processing the radar query using the centralized service
    const data = await queryRadar({ 
      viewerId, 
      viewerLat: lat, 
      viewerLon: lon 
    });

    return res.json(data);
  } catch (e: any) {
    console.error('[API_RADAR_ERROR]', e.message);
    
    // Graceful error response
    return res.status(500).json({ 
      error: e?.message || 'Erro interno ao processar consulta do radar.' 
    });
  }
});

export default router;
