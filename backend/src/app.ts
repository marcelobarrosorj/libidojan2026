import express from "express";
import cors from "cors";
import { getBackendAvailability } from "./config/env.js";
import paymentRoutes from "./routes/payment.js";
import webhookRoutes from "./routes/webhook.js";

const app = express();

app.use(cors());
app.use(express.json({ verify: (req: any, res, buf) => { req.rawBody = buf; } }));

app.use("/api/payment", (req, res, next) => {
  if (!getBackendAvailability()) {
    return res.status(400).json({ error: "Serviço temporariamente indisponível (Faltam credenciais no servidor)" });
  }
  next();
}, paymentRoutes);

app.use("/api/webhook", (req, res, next) => {
  if (!getBackendAvailability()) {
    return res.status(400).json({ error: "Serviço temporariamente indisponível (Faltam credenciais no servidor)" });
  }
  next();
}, webhookRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "libido-api"
  });
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API_ROUTE_NOT_FOUND' });
});

export default app;
