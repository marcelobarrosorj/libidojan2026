
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import radarRoutes from './routes/radar';
import paymentRoutes from './routes/payments';

// Carrega variáveis do arquivo .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  // No AI Studio, a porta deve ser SEMPRE 3000
  const PORT = 3000;

  // Configurações Globais
  app.use(cors({ origin: true, credentials: true }));

  /**
   * WEBHOOK STRIPE (Deve vir antes do express.json)
   */
  app.post('/api/payments/webhook', express.raw({ type: 'application/json' }));

  app.use(express.json());

  // Logger de requisições simplificado
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') && process.env.NODE_ENV !== 'production') {
      // Log leve apenas em desenvolvimento
    }
    next();
  });

  // Rotas da API...
  app.use('/api', radarRoutes);
  app.use('/api/payments', paymentRoutes);

  // PROXY SUPABASE - Fix para "Failed to fetch" (CORS/Network bypass)
  app.all('/api/sb-api*', async (req, res) => {
    const supabaseUrl = 'https://hkuwlazwtxwfffnpgfdd.supabase.co';
    
    // Extrai o caminho após /api/sb-api
    let pathAfterProxy = req.originalUrl.split('/api/sb-api')[1] || '/';
    if (!pathAfterProxy.startsWith('/')) pathAfterProxy = '/' + pathAfterProxy;
    
    const url = `${supabaseUrl}${pathAfterProxy}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => {
        controller.abort();
    }, 25000); // 25s timeout

    try {
      const headers: Record<string, string> = {
          'host': 'hkuwlazwtxwfffnpgfdd.supabase.co'
      };

      for (const [key, value] of Object.entries(req.headers)) {
        const lowerKey = key.toLowerCase();
        const skipHeaders = [
            'host', 'origin', 'referer', 'content-length', 
            'connection', 'keep-alive', 'accept-encoding', 'cookie'
        ];
        if (value && typeof value === 'string' && !skipHeaders.includes(lowerKey)) {
          headers[key] = value;
        }
      }

      let body: any = undefined;
      if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
         if (req.body && Object.keys(req.body).length > 0) {
             body = JSON.stringify(req.body);
             headers['content-type'] = 'application/json';
         }
      }

      console.log(`[SB_PROXY] ${req.method} ${url}`);

      const response = await fetch(url, {
        method: req.method,
        headers: headers,
        body,
        signal: controller.signal
      });
      
      clearTimeout(timeout);

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
          const lowerKey = key.toLowerCase();
          const skipResponseHeaders = [
              'content-encoding', 'transfer-encoding', 'content-length', 
              'connection', 'access-control-allow-origin', 'set-cookie'
          ];
          if (!skipResponseHeaders.includes(lowerKey)) {
              responseHeaders[key] = value;
          }
      });

      const buffer = await response.arrayBuffer();
      res.status(response.status).set(responseHeaders).send(Buffer.from(buffer));

    } catch (e: any) {
      clearTimeout(timeout);
      const isTimeout = e.name === 'AbortError';
      console.error('[SB_PROXY_ERR]', isTimeout ? 'Timeout' : e.message, '->', url);
      res.status(isTimeout ? 504 : 502).json({ 
        error: isTimeout ? 'Timeout Supabase' : `Proxy Error`,
        details: e.message 
      });
    }
  });

  // Health check para o ambiente AI Studio
  app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  // Integração com Vite (Desenvolvimento vs Produção)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('  🛠️  Vite Middleware Ativo (Modo Dev)');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LIBIDO 2026: Servidor Ativo na porta ${PORT}`);
  });
}

startServer().catch(err => {
    console.error('Falha ao iniciar o servidor:', err);
});
