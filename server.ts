
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Rotas de API
import radarRoutes from './routes/radar'; // Ajustado para caminhos relativos
import paymentRoutes from './routes/payments';

// Carrega variáveis do arquivo .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
    const app = express();
    const PORT = 3000;

    app.use(cors());
    app.use(express.json());

    // 1. Health Check (Crítico para monitoramento do Cloud Run / AI Studio)
    app.get('/health', (req, res) => res.status(200).send('OK'));

    // 2. Registro de Rotas de API
    app.use('/api', radarRoutes);
    app.use('/api/payments', paymentRoutes);

    // 3. Configuração de Assets Estáticos ou Vite
    if (process.env.NODE_ENV !== 'production') {
        console.log('[BOOT] Iniciando modo desenvolvimento com Vite...');
        const vite = await createViteServer({
            server: { 
                middlewareMode: true, 
                hmr: false,
                host: '0.0.0.0'
            },
            appType: 'spa'
        });

        // Use o middleware do vite para processar as requisições
        app.use(vite.middlewares);

        // Fallback para SPA (Single Page Application)
        app.get('*', async (req, res, next) => {
            const url = req.originalUrl;
            
            // Ignora se for uma rota de API ou algo com extensão (assets que o vite já deveria ter pego)
            if (url.startsWith('/api') || url.includes('.') || url === '/health') {
                return next();
            }

            try {
                const templatePath = path.resolve(process.cwd(), 'index.html');
                if (!fs.existsSync(templatePath)) {
                    return res.status(404).send('index.html não encontrado na raiz.');
                }

                let template = fs.readFileSync(templatePath, 'utf-8');
                // Deixa o Vite injetar os scripts necessários no HTML
                template = await vite.transformIndexHtml(url, template);
                
                res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
            } catch (e: any) {
                vite.ssrFixStacktrace(e);
                console.error('[VITE_ERROR]', e.message);
                next(e);
            }
        });
    } else {
        const distPath = path.resolve(process.cwd(), 'dist');
        // Serve arquivos estáticos da pasta dist
        app.use(express.static(distPath));
        // Fallback SPA para produção
        app.get('*', (req, res) => {
            res.sendFile(path.resolve(distPath, 'index.html'));
        });
    }

    // 4. Inicia a escuta da porta
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n✅ SERVIDOR LIBIDO 2026 ONLINE`);
        console.log(`🌍 Endpoint principal: http://localhost:${PORT}`);
        console.log(`🚀 Ambiente: ${process.env.NODE_ENV || 'development'}\n`);
    });
}

startServer().catch(err => {
    console.error('❌ ERRO CRÍTICO NA INICIALIZAÇÃO DO SERVIDOR:', err);
    process.exit(1);
});
