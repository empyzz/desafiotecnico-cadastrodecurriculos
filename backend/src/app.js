import express from 'express';
import cors from 'cors';
import { conectar } from './db.js';
import * as candidatosRepository from './candidatosRepository.js';
import { validarCandidato } from './validarCandidato.js';
import { ErroHttp, tratarErro } from './erro.js';

export function criarApp({ repository = candidatosRepository } = {}) {
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
  app.get('/api/candidatos', async (_req, res) => res.json(await repository.listar()));
  app.get('/api/candidatos/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!/^\d+$/.test(req.params.id) || !Number.isInteger(id) || id < 1 || id > 2147483647) throw new ErroHttp(400, 'Identificador de candidato inválido.');
    const candidato = await repository.buscarPorId(id);
    if (!candidato) throw new ErroHttp(404, 'Candidato não encontrado.');
    res.json(candidato);
  });
  app.post('/api/candidatos', async (req, res) => {
    const { dados, erros, valido } = validarCandidato(req.body);
    if (!valido) return res.status(400).json({ mensagem: 'Confira os campos do formulário.', erros });
    const candidato = await repository.inserir(dados);
    res.location(`/api/candidatos/${candidato.id}`).status(201).json(candidato);
  });
  app.use((_req, res) => res.status(404).json({ mensagem: 'Rota não encontrada.' }));
  app.use(tratarErro);
  return app;
}
