import app from "./app.js";
import { config, getBackendAvailability } from "./config/env.js";
import { createServer as createViteServer } from "vite";
import path from "path";
import express from "express";

const PORT = config.PORT;

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
      if (getBackendAvailability()) {
        console.log('Firebase Backend + Express PagBank APIs initialized.');
      } else {
        console.log('Express APIs starting in degraded mode due to missing environment configuration.');
      }
    });
  }
}

startServer().catch(err => {
  console.error("Failed to start server:");
  console.error(err.message);
  process.exit(1);
});
