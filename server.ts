
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import radarRoutes from './routes/radar';
import paymentRoutes from './routes/payments';

// Carrega variáveis do arquivo .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Usamos 3001 por padrão no backend para não conflitar com o Vite (3000)
const PORT = process.env.PORT || 3001;

// Configurações Globais
app.use(cors());

/**
 * WEBHOOK STRIPE (Deve vir antes do express.json)
 * Necessário para processar pagamentos reais de forma assíncrona
 */
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

// Rotas da API
app.use('/api', radarRoutes);
app.use('/api/payments', paymentRoutes);

/**
 * SERVIDOR DE ARQUIVOS ESTÁTICOS
 * Serve o index.html e os arquivos .tsx diretamente do diretório raiz
 */
app.use(express.static(__dirname));

// Rota fallback para o PWA (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n\n`);
  console.log(`  🚀 MATRIZ LIBIDO 2026 ONLINE`);
  console.log(`  --------------------------------------`);
  console.log(`  🔗 API:      http://localhost:${PORT}`);
  console.log(`  💳 Gateway:  Stripe/PIX Ativos`);
  console.log(`  📡 Radar:    Sincronização Ativa`);
  console.log(`  --------------------------------------`);
  console.log(`\n  Aguardando conexões...\n`);
});
