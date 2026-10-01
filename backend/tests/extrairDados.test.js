import { it, expect } from 'vitest';
import { extrairDados } from '../src/extrairDados.js';
it('extrai contato de currículo com cabeçalho', () => {
  expect(extrairDados('Currículo\nAna Luísa Silva\nana.silva@example.com\n(11) 98765-4321')).toEqual({ nomeCompleto: 'Ana Luísa Silva', email: 'ana.silva@example.com', telefone: '(11) 98765-4321' });
});
it.each(['98765-4321', '11 98765 4321', '+55 (11) 98765-4321', '1134567890'])('extrai telefone %s', telefone => expect(extrairDados(`Nome: João Santos\nTelefone: ${telefone}`).telefone).toBe(telefone));
it('prioriza nome explícito e permite email ausente', () => expect(extrairDados('Currículo\nNome completo: João Santos\nResumo profissional').nomeCompleto).toBe('João Santos'));
it('retorna vazios quando não identifica dados', () => expect(extrairDados('')).toEqual({ nomeCompleto: '', email: '', telefone: '' }));
it('não inventa email ou nome em texto sem contato', () => expect(extrairDados('Experiência profissional\n2020 - 2024').email).toBe(''));
