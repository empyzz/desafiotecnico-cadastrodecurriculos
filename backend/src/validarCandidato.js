const limites = { nomeCompleto: 200, email: 254, telefone: 30, areaInteresse: 150, resumoProfissional: 10000 };
const rotulos = { nomeCompleto: 'Nome completo', email: 'E-mail', telefone: 'Telefone', areaInteresse: 'Área de interesse', resumoProfissional: 'Resumo profissional' };
export function validarCandidato(entrada) {
  const dados = {}, erros = {};
  for (const [campo, limite] of Object.entries(limites)) {
    const valor = entrada?.[campo];
    dados[campo] = typeof valor === 'string' ? valor.trim() : '';
    if (valor != null && typeof valor !== 'string') erros[campo] = `${rotulos[campo]} deve ser um texto.`;
    else if (dados[campo].length > limite) erros[campo] = `${rotulos[campo]} deve ter até ${limite} caracteres.`;
  }
  if (!dados.nomeCompleto && !erros.nomeCompleto) erros.nomeCompleto = 'Informe o nome completo.';
  if (!dados.email && !erros.email) erros.email = 'Informe o e-mail.';
  else if (dados.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) erros.email = 'Informe um e-mail válido.';
  return { dados, erros, valido: Object.keys(erros).length === 0 };
}
