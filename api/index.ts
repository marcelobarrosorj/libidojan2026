import type { IncomingMessage, ServerResponse } from 'node:http';
import app from '../backend/src/app.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const bruto = req.url || '/';
  const url = new URL(bruto, 'http://localhost');
  let destino: string | null = null;

  const rota = url.searchParams.get('rota');
  if (rota) {
    destino = '/api/' + rota;
  } else if (bruto.startsWith('/api/index/')) {
    destino = '/api/' + bruto.slice('/api/index/'.length);
  } else if (bruto === '/api/index' || bruto === '/api') {
    destino = '/api';
  }

  if (destino) {
    req.url = destino + (url.search || '');
  }

  return (app as unknown as (r: IncomingMessage, s: ServerResponse) => void)(req, res);
}