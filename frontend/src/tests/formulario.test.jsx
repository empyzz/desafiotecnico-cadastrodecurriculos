import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import { api } from '../api.js';
vi.mock('../api.js', () => ({
  api: { listar: vi.fn(), buscarPorId: vi.fn(), inserir: vi.fn(), extrair: vi.fn() },
}));
beforeEach(() => {
  vi.resetAllMocks();
  api.listar.mockResolvedValue([]);
  api.inserir.mockResolvedValue({ id: 1 });
});
beforeEach(() => {
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = vi.fn(() => 'blob:curriculo-teste');
      static revokeObjectURL = vi.fn();
    },
  );
});
afterEach(() => vi.unstubAllGlobals());
function iniciar() {
  render(
    <MemoryRouter initialEntries={['/candidatos/novo']}>
      <App />
    </MemoryRouter>,
  );
  return userEvent.setup();
}
const nome = () => screen.getByLabelText('Nome completo', { exact: false });
const email = () => screen.getByLabelText('E-mail', { exact: false });
const pdf = () => screen.getByLabelText('Currículo em PDF');
it('mostra validação para nome vazio e email inválido', async () => {
  const user = iniciar();
  await user.type(email(), 'invalido');
  await user.click(screen.getByRole('button', { name: 'Salvar candidato' }));
  expect(screen.getByText('Informe o nome completo.')).toBeInTheDocument();
  expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument();
  expect(api.inserir).not.toHaveBeenCalled();
});
it('salva manualmente sem arquivo', async () => {
  const user = iniciar();
  await user.type(nome(), 'Ana Silva');
  await user.type(email(), 'ana@example.com');
  await user.click(screen.getByRole('button', { name: 'Salvar candidato' }));
  expect(await screen.findByText('Candidato salvo com sucesso.')).toBeInTheDocument();
  expect(api.extrair).not.toHaveBeenCalled();
});
it('preenche campos após PDF e permite corrigir', async () => {
  api.extrair.mockResolvedValue({
    dados: { nomeCompleto: 'Ana Silva', email: 'ana@example.com', telefone: '(11) 98765-4321' },
  });
  const user = iniciar();
  await user.upload(pdf(), new File(['%PDF-'], 'curriculo.pdf', { type: 'application/pdf' }));
  await waitFor(() => expect(nome()).toHaveValue('Ana Silva'));
  expect(email()).toHaveValue('ana@example.com');
  expect(screen.getByLabelText('Telefone')).toHaveValue('(11) 98765-4321');
  await user.clear(nome());
  await user.type(nome(), 'Ana Corrigida');
  await user.click(screen.getByRole('button', { name: 'Salvar candidato' }));
  await screen.findByText('Candidato salvo com sucesso.');
  expect(api.inserir.mock.calls[0][0].nomeCompleto).toBe('Ana Corrigida');
});
it('falha no PDF não bloqueia cadastro manual', async () => {
  api.extrair.mockRejectedValue(new Error('Não foi possível ler o PDF.'));
  const user = iniciar();
  await user.upload(pdf(), new File(['corrompido'], 'curriculo.pdf', { type: 'application/pdf' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('cadastro manual continua disponível');
  await user.type(nome(), 'João Silva');
  await user.type(email(), 'joao@example.com');
  await user.click(screen.getByRole('button', { name: 'Salvar candidato' }));
  expect(await screen.findByText('Candidato salvo com sucesso.')).toBeInTheDocument();
});
it('preserva dados já digitados e permite campos não identificados', async () => {
  api.extrair.mockResolvedValue({ dados: { nomeCompleto: 'Outro Nome', email: '', telefone: '' } });
  const user = iniciar();
  await user.type(nome(), 'Nome Manual');
  await user.upload(pdf(), new File(['%PDF-'], 'curriculo.pdf', { type: 'application/pdf' }));
  await screen.findByText(/PDF lido/);
  expect(nome()).toHaveValue('Nome Manual');
  expect(email()).toHaveValue('');
});
it('rejeita tamanho acima de 5 MB antes de chamar API', async () => {
  const user = iniciar();
  await user.upload(
    pdf(),
    new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'grande.pdf', { type: 'application/pdf' }),
  );
  expect(screen.getByRole('alert')).toHaveTextContent('5 MB');
  expect(api.extrair).not.toHaveBeenCalled();
  expect(nome()).toBeEnabled();
});
it('rejeita tipo incorreto antes da API', async () => {
  iniciar();
  const user = userEvent.setup({ applyAccept: false });
  await user.upload(pdf(), new File(['texto'], 'curriculo.txt', { type: 'text/plain' }));
  expect(screen.getByRole('alert')).toHaveTextContent('arquivo PDF');
  expect(api.extrair).not.toHaveBeenCalled();
});
it('exibe erro de validação retornado pelo backend', async () => {
  api.inserir.mockRejectedValue(
    Object.assign(new Error('Confira os campos.'), {
      erros: { email: 'E-mail rejeitado pelo servidor.' },
    }),
  );
  const user = iniciar();
  await user.type(nome(), 'Ana Silva');
  await user.type(email(), 'ana@example.com');
  await user.click(screen.getByRole('button', { name: 'Salvar candidato' }));
  expect(await screen.findByText('E-mail rejeitado pelo servidor.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Salvar candidato' })).toBeEnabled();
});
it('mostra link do PDF e texto somente para leitura e cópia', async () => {
  api.extrair.mockResolvedValue({
    dados: { nomeCompleto: '', email: '', telefone: '' },
    texto: 'Resumo profissional\nExperiência com React.',
  });
  const user = iniciar();
  await user.upload(pdf(), new File(['%PDF-'], 'curriculo.pdf', { type: 'application/pdf' }));
  const texto = await screen.findByLabelText('Texto disponível para copiar');
  expect(texto).toHaveValue('Resumo profissional\nExperiência com React.');
  expect(texto).toHaveAttribute('readonly');
  const link = screen.getByRole('link', { name: 'Abrir PDF: curriculo.pdf' });
  expect(link).toHaveAttribute('href', 'blob:curriculo-teste');
  expect(link).toHaveAttribute('target', '_blank');
});
it('mantém acesso ao PDF quando a leitura falha', async () => {
  api.extrair.mockRejectedValue(new Error('PDF sem texto.'));
  const user = iniciar();
  await user.upload(pdf(), new File(['%PDF-'], 'imagem.pdf', { type: 'application/pdf' }));
  await screen.findByRole('alert');
  expect(screen.getByRole('link', { name: 'Abrir PDF: imagem.pdf' })).toBeInTheDocument();
  expect(screen.queryByLabelText('Texto disponível para copiar')).not.toBeInTheDocument();
});
it('libera o link local ao sair do formulário', async () => {
  api.extrair.mockResolvedValue({ dados: {}, texto: 'Texto' });
  const user = iniciar();
  await user.upload(pdf(), new File(['%PDF-'], 'curriculo.pdf', { type: 'application/pdf' }));
  await screen.findByLabelText('Texto disponível para copiar');
  await user.click(screen.getByRole('link', { name: 'Cancelar' }));
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:curriculo-teste');
});
it('remove o texto anterior ao tentar ler outro PDF que falha', async () => {
  api.extrair
    .mockResolvedValueOnce({ dados: {}, texto: 'Texto anterior' })
    .mockRejectedValueOnce(new Error('PDF ilegível.'));
  const user = iniciar();
  await user.upload(pdf(), new File(['%PDF-'], 'primeiro.pdf', { type: 'application/pdf' }));
  await screen.findByLabelText('Texto disponível para copiar');
  await user.upload(pdf(), new File(['%PDF-'], 'segundo.pdf', { type: 'application/pdf' }));
  await screen.findByRole('alert');
  expect(screen.queryByLabelText('Texto disponível para copiar')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Abrir PDF: segundo.pdf' })).toBeInTheDocument();
});
