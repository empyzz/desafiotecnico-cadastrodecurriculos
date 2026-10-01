import { describe, it, expect } from 'vitest';
import { validarCandidato } from '../src/validarCandidato.js';
describe('validação', () => {
  it('exige nome e email', () => expect(validarCandidato({}).erros).toEqual({ nomeCompleto: 'Informe o nome completo.', email: 'Informe o e-mail.' }));
  it.each(['email', 'a@b', 'a b@exemplo.com', 'a@@exemplo.com'])('rejeita %s', email => expect(validarCandidato({ nomeCompleto: 'Ana Silva', email }).valido).toBe(false));
  it('aceita opcionais vazios e remove espaços', () => {
    const resultado = validarCandidato({ nomeCompleto: ' Ana Silva ', email: ' ana@exemplo.com ', areaInteresse: null });
    expect(resultado.valido).toBe(true);
    expect(resultado.dados).toEqual({ nomeCompleto: 'Ana Silva', email: 'ana@exemplo.com', telefone: '', areaInteresse: '', resumoProfissional: '' });
  });
  it('rejeita tipos incorretos e campos longos', () => {
    expect(validarCandidato({ nomeCompleto: 42, email: 'a@b.com', telefone: '1'.repeat(31) }).erros).toHaveProperty('telefone');
    expect(validarCandidato({ nomeCompleto: 'a'.repeat(201), email: {} }).valido).toBe(false);
  });
});
