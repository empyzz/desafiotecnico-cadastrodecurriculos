import { it, expect } from 'vitest';
import request from 'supertest';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'node:url';
import { criarApp } from '../src/app.js';
const app = criarApp();
const rota = '/api/curriculos/extrair';
it('importa o PDF fictício', async () => {
  const res = await request(app)
    .post(rota)
    .attach(
      'curriculo',
      fileURLToPath(new URL('../../exemplos/curriculo-ficticio.pdf', import.meta.url)),
    );
  expect(res.status).toBe(200);
  expect(res.body.dados).toEqual({
    nomeCompleto: 'Ana Luísa Silva',
    email: 'ana.silva@example.com',
    telefone: '(11) 98765-4321',
  });
  expect(res.body.texto).toContain('Resumo profissional');
  expect(res.body.texto).toContain('ana.silva@example.com');
});
it('exige arquivo', async () => expect((await request(app).post(rota)).status).toBe(400));
it('rejeita tipo incorreto', async () =>
  expect(
    (await request(app).post(rota).attach('curriculo', Buffer.from('texto'), 'curriculo.txt'))
      .status,
  ).toBe(400));
it('rejeita PDF acima de 5 MB', async () => {
  const res = await request(app)
    .post(rota)
    .attach('curriculo', Buffer.alloc(5 * 1024 * 1024 + 1), {
      filename: 'grande.pdf',
      contentType: 'application/pdf',
    });
  expect(res.status).toBe(400);
  expect(res.body.mensagem).toContain('5 MB');
});
it.each([Buffer.alloc(0), Buffer.from('falso'), Buffer.from('%PDF-1.7\ncorrompido')])(
  'trata PDF vazio ou corrompido',
  async (buffer) => {
    const res = await request(app)
      .post(rota)
      .attach('curriculo', buffer, { filename: 'teste.pdf', contentType: 'application/pdf' });
    expect([400, 422]).toContain(res.status);
    expect(res.body.mensagem).toMatch(/manual/);
  },
);
it('trata PDF válido sem texto', async () => {
  const doc = new PDFDocument();
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  const done = new Promise((resolve) => doc.on('end', resolve));
  doc.end();
  await done;
  const res = await request(app).post(rota).attach('curriculo', Buffer.concat(chunks), {
    filename: 'vazio.pdf',
    contentType: 'application/pdf',
  });
  expect(res.status).toBe(422);
});
