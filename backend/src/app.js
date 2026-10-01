import express from 'express';
import cors from 'cors';
import { conectar } from './db.js';

export function criarApp() {
  const app = express();
  app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json({ limit: '100kb' }));
  app.get('/api/health', async (_req, res) => {
    try {
      const pool = await conectar();
      await pool.request().query('SELECT 1 AS ok');
      res.json({ status: 'ok', banco: 'conectado' });
    } catch {
      res.status(503).json({ mensagem: 'Banco de dados indisponível.' });
    }
  });
  return app;
}
