import { it, expect } from 'vitest';
import { extrairDados } from '../src/extrairDados.js';
it('extrai contato de currículo com cabeçalho', () => {
  expect(extrairDados('Currículo\nAna Luísa Silva\nana.silva@example.com\n(11) 98765-4321')).toEqual({ nomeCompleto: 'Ana Luísa Silva', email: 'ana.silva@example.com', telefone: '(11) 98765-4321' });
});
it.each(['98765-4321', '11 98765 4321', '+55 (11) 98765-4321', '1134567890', '(41) 99999-9999', '+55 41 99999-9999', '41999999999', '3333-4444'])('extrai telefone %s', telefone => expect(extrairDados(`Nome: João Santos\nTelefone: ${telefone}`).telefone).toBe(telefone));
it('prioriza nome explícito e permite email ausente', () => expect(extrairDados('Currículo\nNome completo: João Santos\nResumo profissional').nomeCompleto).toBe('João Santos'));
it.each(['', undefined, 42])('retorna vazios para entrada %s', entrada => expect(extrairDados(entrada)).toEqual({ nomeCompleto: '', email: '', telefone: '' }));
it('não inventa email ou nome em texto sem contato', () => expect(extrairDados('Experiência profissional\n2020 - 2024').email).toBe(''));
it.each(['2018-2022', '2018 - 2022', '1999.2003'])('ignora intervalo %s antes do telefone', intervalo => {
  expect(extrairDados(`Experiência\n${intervalo}\n(41) 99999-9999`).telefone).toBe('(41) 99999-9999');
});
it('não usa números de nenhum email como telefone', () => {
  const dados = extrairDados('João Silva\njoao11998877@mail.com\nsegundo41999999999@mail.com');
  expect(dados.email).toBe('joao11998877@mail.com');
  expect(dados.telefone).toBe('');
});
it('identifica contato e nome na mesma linha', () => {
  expect(extrairDados('João Silva  joao@mail.com  (41) 99999-9999')).toEqual({ nomeCompleto: 'João Silva', email: 'joao@mail.com', telefone: '(41) 99999-9999' });
});
it('prioriza o nome explícito sobre outro nome possível', () => {
  expect(extrairDados('Desenvolvedor Full Stack\nNome: Maria Souza').nomeCompleto).toBe('Maria Souza');
});
it('permite texto sem contatos', () => {
  expect(extrairDados('Maria Souza\nConhecimentos técnicos')).toMatchObject({ nomeCompleto: 'Maria Souza', email: '', telefone: '' });
});
it('não combina dígitos de linhas diferentes', () => {
  expect(extrairDados('2018\n2022').telefone).toBe('');
});
