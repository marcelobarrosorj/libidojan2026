
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
import aiRoutes from './routes/ai';

// Marcello: Importação estática do repo para evitar problemas com import() dinâmico em rotas
import { fetchLatestProfiles } from './services/repo';

// Carrega variáveis do arquivo .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
    const app = express();
    const PORT = 3000;

    app.use(cors());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

    // 1. Health Check (Crítico: deve estar disponível imediatamente)
    app.get('/health', (_req, res) => res.status(200).send('OK'));

    // 3. Registro de Rotas de API Internas
    app.use('/api', radarRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/ai', aiRoutes);

    // Marcello: Rota de Proxy para Perfis (Bypass de Erros de Rede Client-side)
    app.get('/api/profiles/latest', async (req, res) => {
        try {
            const limit = Number(req.query.limit) || 30;
            const profiles = await fetchLatestProfiles(limit);
            return res.json(profiles);
        } catch (e: any) {
            console.error('[SERVER_PROFILES_ERROR] Falha na Matriz Central:', e.message);
            return res.status(500).json({ 
                error: 'Erro ao buscar perfis na Matriz Central',
                debug: e.message 
            });
        }
    });

    // 3. Inicia a escuta da porta IMEDIATAMENTE (antes de inicializações lentas)
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀 SERVIDOR LIBIDO 2026 ONLINE`);
        console.log(`🌍 Endpoint principal: http://localhost:${PORT}`);
        console.log(`🚀 Ambiente: ${process.env.NODE_ENV || 'development'}\n`);
    });

    // 4. Configuração de Assets Estáticos ou Vite (Executado após o servidor já estar "vivo")
    if (process.env.NODE_ENV !== 'production') {
        console.log('[BOOT] Iniciando modo desenvolvimento com Vite...');
        try {
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
                
                // Deixa passar: API, health e arquivos com extensão que o Vite cuida
                if (url.startsWith('/api') || url === '/health' || /\.\w+$/.test(url)) {
                    return next();
                }

                try {
                    const templatePath = path.resolve(process.cwd(), 'index.html');
                    if (!fs.existsSync(templatePath)) {
                        return res.status(404).send('index.html não encontrado.');
                    }

                    let template = fs.readFileSync(templatePath, 'utf-8');
                    template = await vite.transformIndexHtml(url, template);
                    
                    res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
                } catch (e: any) {
                    vite.ssrFixStacktrace(e);
                    console.error('[VITE_ERROR]', e.message);
                    next(e);
                }
            });
            console.log('[BOOT] Vite middleware pronto.');
        } catch (err) {
            console.error('[BOOT] Erro ao iniciar Vite:', err);
        }
    } else {
        const distPath = path.resolve(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            if (/\.\w+$/.test(req.path)) {
                return res.status(404).send('Arquivo estático não encontrado.');
            }
            res.sendFile(path.resolve(distPath, 'index.html'));
        });
    }

    // Gerenciamento de encerramento amigável (SIGTERM)
    process.on('SIGTERM', () => {
        console.log('[SHUTDOWN] Recebido SIGTERM, encerrando servidor...');
        server.close(() => {
            process.exit(0);
        });
    });
}

startServer().catch(err => {
    console.error('❌ ERRO CRÍTICO NA INICIALIZAÇÃO DO SERVIDOR:', err);
    process.exit(1);
});
