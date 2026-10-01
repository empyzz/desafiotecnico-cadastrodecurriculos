import { beforeEach, describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { criarApp } from '../src/app.js';
const candidato = { id: 1, nomeCompleto: 'Ana Silva', email: 'ana@exemplo.com' };
const repository = { listar: vi.fn(), buscarPorId: vi.fn(), inserir: vi.fn() };
const app = criarApp({ repository });
beforeEach(() => vi.resetAllMocks());
describe('API', () => {
  it('salva sem PDF', async () => {
    repository.inserir.mockResolvedValue(candidato);
    const res = await request(app).post('/api/candidatos').send(candidato);
    expect(res.status).toBe(201);
    expect(res.headers.location).toBe('/api/candidatos/1');
  });
  it('rejeita dados antes de acessar o banco', async () => {
    const res = await request(app).post('/api/candidatos').send({ email: 'invalido' });
    expect(res.status).toBe(400);
    expect(res.body.erros).toHaveProperty('nomeCompleto');
    expect(repository.inserir).not.toHaveBeenCalled();
  });
  it('lista e consulta', async () => {
    repository.listar.mockResolvedValue([candidato]);
    repository.buscarPorId.mockResolvedValue(candidato);
    expect((await request(app).get('/api/candidatos')).body).toEqual([candidato]);
    expect((await request(app).get('/api/candidatos/1')).body).toEqual(candidato);
  });
  it('trata ausente e id inválido', async () => {
    repository.buscarPorId.mockResolvedValue(null);
    expect((await request(app).get('/api/candidatos/9')).status).toBe(404);
    expect((await request(app).get('/api/candidatos/abc')).status).toBe(400);
  });
  it('não expõe erros internos', async () => {
    repository.listar.mockRejectedValue(new Error('senha-secreta'));
    const res = await request(app).get('/api/candidatos');
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('senha-secreta');
  });
  it('trata JSON inválido', async () => expect((await request(app).post('/api/candidatos').set('Content-Type', 'application/json').send('{')).status).toBe(400));
});
