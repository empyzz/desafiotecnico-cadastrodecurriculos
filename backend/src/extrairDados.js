export function extrairDados(texto = '') {
  if (typeof texto !== 'string') texto = '';
  const email = texto.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  const telefone = texto.match(/(?<!\d)(?:\+55[\s.-]*)?(?:\(?\d{2}\)?[\s.-]*)?\d{4,5}[\s.-]?\d{4}(?!\d)/)?.[0] || '';
  const linhas = texto.split(/\r?\n/).map(linha => linha.trim()).filter(Boolean);
  const nomeExplicito = linhas.find(linha => /^nome(?: completo)?\s*:/i.test(linha));
  const candidato = nomeExplicito?.replace(/^nome(?: completo)?\s*:\s*/i, '') || linhas.find(linha => {
    if (/^(curr[ií]culo|resume|curriculum|contato|dados pessoais|resumo|experi[eê]ncia|forma[cç][aã]o|objetivo)\b/i.test(linha)) return false;
    return /^[\p{L}][\p{L}'’.-]*(?:\s+[\p{L}][\p{L}'’.-]*){1,5}$/u.test(linha);
  }) || '';
  const nomeCompleto = /^[\p{L}][\p{L}\s'’.-]+$/u.test(candidato) && candidato.length <= 200 ? candidato : '';
  return { nomeCompleto, email, telefone };
}
