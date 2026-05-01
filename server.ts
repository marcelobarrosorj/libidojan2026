
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

    // 1. Health Check (Prioritário)
    app.get('/health', (req, res) => res.status(200).send('OK'));

    // Listen IMEDIATO
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀 SERVIDOR ONLINE [PORTA ${PORT}]`);
    });

    // 2. API Routes
    app.use('/api', radarRoutes);
    app.use('/api/payments', paymentRoutes);

    // 3. Integração com Vite (Desenvolvimento)
    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true, hmr: false, host: '0.0.0.0' },
            appType: 'spa'
        });

        app.use(vite.middlewares);

        app.get('*', async (req, res, next) => {
            const url = req.originalUrl;
            if (url.startsWith('/api') || url === '/health' || url.includes('.')) {
                return next();
            }

            try {
                let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
                template = await vite.transformIndexHtml(url, template);
                res.status(200).set({ 'Content-Type': 'text/html' }).send(template);
            } catch (e: any) {
                vite.ssrFixStacktrace(e);
                next(e);
            }
        });
    } else {
        const distPath = path.resolve(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => res.sendFile(path.resolve(distPath, 'index.html')));
    }
}

startServer().catch(err => {
    console.error('ERRO CRÍTICO NA INICIALIZAÇÃO:', err);
    process.exit(1);
});
