import { it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { criarApp } from '../src/app.js';
import { conectar, fecharConexao, sql } from '../src/db.js';
afterAll(fecharConexao);
it('cadastra, lista e consulta usando SQL Server real', async () => {
  const app = criarApp();
  let id;
  try {
    expect((await request(app).get('/api/health')).status).toBe(200);
    const res = await request(app).post('/api/candidatos').send({ nomeCompleto: 'Teste Integração', email: `teste-${Date.now()}@example.com` });
    expect(res.status).toBe(201);
    id = res.body.id;
    expect((await request(app).get(`/api/candidatos/${id}`)).body).toMatchObject(res.body);
    expect((await request(app).get('/api/candidatos')).body.some(candidato => candidato.id === id)).toBe(true);
  } finally {
    if (id) {
      const pool = await conectar();
      await pool.request().input('id', sql.Int, id).query('DELETE FROM dbo.Candidatos WHERE Id = @id');
    }
  }
});
