export function validarFormulario(dados) {
  const erros = {};
  if (!dados.nomeCompleto.trim()) erros.nomeCompleto = 'Informe o nome completo.';
  if (!dados.email.trim()) erros.email = 'Informe o e-mail.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())) erros.email = 'Informe um e-mail válido.';
  const limites = { nomeCompleto: 200, email: 254, telefone: 30, areaInteresse: 150, resumoProfissional: 10000 };
  for (const [campo, limite] of Object.entries(limites)) {
    if (dados[campo].trim().length > limite) erros[campo] = `Use até ${limite} caracteres.`;
  }
  return erros;
}
