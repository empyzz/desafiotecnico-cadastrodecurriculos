import { beforeEach, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import { api } from '../api.js';
vi.mock('../api.js', () => ({ api: { listar: vi.fn(), buscarPorId: vi.fn() } }));
beforeEach(() => vi.resetAllMocks());
const abrir = (path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
it('mostra carregamento', () => {
  api.listar.mockReturnValue(new Promise(() => {}));
  abrir();
  expect(screen.getByRole('status')).toHaveTextContent('Carregando');
});
it('mostra candidatos e link de detalhes', async () => {
  api.listar.mockResolvedValue([
    { id: 7, nomeCompleto: 'Ana Silva', email: 'ana@example.com', areaInteresse: 'Web' },
  ]);
  abrir();
  expect(await screen.findByText('Ana Silva')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Ver detalhes de Ana Silva' })).toHaveAttribute(
    'href',
    '/candidatos/7',
  );
});
it('mostra lista vazia', async () => {
  api.listar.mockResolvedValue([]);
  abrir();
  expect(await screen.findByText('Nenhum candidato cadastrado')).toBeInTheDocument();
});
it('mostra erro na consulta', async () => {
  api.listar.mockRejectedValue(new Error('Servidor indisponível.'));
  abrir();
  expect(await screen.findByRole('alert')).toHaveTextContent('Servidor indisponível');
});
it('mostra candidato ausente', async () => {
  api.buscarPorId.mockRejectedValue(Object.assign(new Error('Ausente'), { status: 404 }));
  abrir('/candidatos/99');
  expect(await screen.findByRole('alert')).toHaveTextContent('Candidato não encontrado');
});
it('mostra detalhes e opcionais vazios', async () => {
  api.buscarPorId.mockResolvedValue({
    nomeCompleto: 'Ana Silva',
    email: 'ana@example.com',
    criadoEm: '2026-10-01T12:00:00Z',
  });
  abrir('/candidatos/7');
  expect(await screen.findByRole('heading', { name: 'Ana Silva' })).toBeInTheDocument();
  expect(screen.getByText('ana@example.com')).toBeInTheDocument();
  expect(screen.getByText('Não informada')).toBeInTheDocument();
});
