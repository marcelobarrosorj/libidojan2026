
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
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
     * WEBHOOK STRIPE
     */
    app.post('/api/payments/webhook', express.raw({ type: 'application/json' }));

    // Health check simples
    app.get('/health', (req, res) => res.json({ status: 'ok' }));

    app.use(express.json());

    // Rotas da API...
    app.use('/api', radarRoutes);
    app.use('/api/payments', paymentRoutes);

    // PROXY SUPABASE - Fix para "Failed to fetch" (CORS/Network bypass)
    app.all('/api/sb-api*', async (req, res) => {
        const supabaseUrl = process.env.SUPABASE_URL || 'https://hkuwlazwtxwfffnpgfdd.supabase.co';
        const fullUrl = req.originalUrl || '';
        const pathAfterProxy = fullUrl.replace('/api/sb-api', '') || '/';
        
        const targetUrl = new URL(pathAfterProxy, supabaseUrl);
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); 

        try {
            const headers: Record<string, string> = {
                'host': new URL(supabaseUrl).hostname,
                'apikey': req.headers['apikey'] as string || '',
                'authorization': req.headers['authorization'] as string || '',
                'content-type': req.headers['content-type'] as string || 'application/json',
                'prefer': req.headers['prefer'] as string || '',
                'x-client-info': 'libido-applet-proxy'
            };

            const fetchOptions: any = {
                method: req.method,
                headers: headers,
                signal: controller.signal
            };

            if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
                fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
            }

            const response = await fetch(targetUrl.toString(), fetchOptions);
            
            const data = await response.arrayBuffer();
            
            // Repassa headers importantes (ex: range para paginação)
            const responseHeaders = ['content-type', 'content-range', 'preference-applied'];
            responseHeaders.forEach(h => {
                const val = response.headers.get(h);
                if (val) res.setHeader(h, val);
            });

            res.status(response.status).send(Buffer.from(data));
        } catch (e: any) {
            if (!res.headersSent) {
                res.status(502).json({ error: 'Supabase Proxy Error', details: e.message });
            }
        } finally {
            clearTimeout(timeout);
        }
    });

    // SPA Fallback Logic
    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { 
                middlewareMode: true, 
                hmr: false,
                host: '0.0.0.0'
            },
            appType: 'spa',
        });
        
        app.use(vite.middlewares);

        app.get('*', async (req, res, next) => {
            if (req.path.startsWith('/api/') || req.path === '/health' || req.path.includes('.')) {
                return next();
            }

            try {
                const templatePath = path.resolve(process.cwd(), 'index.html');
                if (!fs.existsSync(templatePath)) return next();

                let template = fs.readFileSync(templatePath, 'utf8');
                template = await vite.transformIndexHtml(req.originalUrl || '/', template);
                
                res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
            } catch (e: any) {
                vite.ssrFixStacktrace(e);
                next(e);
            }
        });
    } else {
        const distPath = path.resolve(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(path.resolve(distPath, 'index.html'));
        });
    }

  // Iniciamos a escuta ao final para garantir que tudo está pronto
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 LIBIDO 2026: MATRIZ ONLINE EM http://localhost:${PORT}`);
    console.log(`[ENV] Modo: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(err => {
    console.error('CRITICAL ERROR during server startup:', err);
    process.exit(1);
});
