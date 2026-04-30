
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Carrega variáveis do arquivo .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
    const app = express();
    const PORT = 3000;

    app.use(cors());
    app.use(express.json());

    // Health check instantâneo
    app.get('/health', (req, res) => res.status(200).send('OK'));

    // Cache para o servidor vite
    let vitePromise: Promise<any> | null = null;

    const getVite = () => {
        if (!vitePromise && process.env.NODE_ENV !== 'production') {
            console.log('[BOOT] Iniciando compilador Vite em background...');
            vitePromise = createViteServer({
                server: { middlewareMode: true, hmr: false, host: '0.0.0.0' },
                appType: 'spa',
            });
        }
        return vitePromise;
    };

    // Pré-carrega o Vite em background sem bloquear o listen
    if (process.env.NODE_ENV !== 'production') getVite();

    // Rotas de API
    try {
        const radarRoutes = (await import('./routes/radar')).default;
        const paymentRoutes = (await import('./routes/payments')).default;
        app.use('/api', radarRoutes);
        app.use('/api/payments', paymentRoutes);
    } catch (e) {
        console.warn('[SERVER] Erro nas rotas:', e);
    }

    // Middleware SPA
    app.get('*', async (req, res, next) => {
        const url = req.originalUrl;

        if (url.startsWith('/api') || url.includes('.') || url === '/health') {
            return next();
        }

        try {
            if (process.env.NODE_ENV !== 'production') {
                const vite = await getVite();
                // Deixa o Vite lidar com o middleware primeiro se for um asset conhecido
                return vite.middlewares(req, res, async () => {
                    let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
                    template = await vite.transformIndexHtml(url, template);
                    res.status(200).set({ 'Content-Type': 'text/html' }).send(template);
                });
            } else {
                const distPath = path.resolve(process.cwd(), 'dist');
                res.sendFile(path.resolve(distPath, 'index.html'));
            }
        } catch (e: any) {
            console.error('[CATCH_ALL_ERROR]', e.message);
            next(e);
        }
    });

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀 LIBIDO 2026: MATRIZ ONLINE [PORT ${PORT}]`);
    });
}

startServer().catch(err => {
    console.error('ERRO CRÍTICO NA INICIALIZAÇÃO:', err);
    process.exit(1);
});
