export function extrairDados(texto = '') {
  if (typeof texto !== 'string') texto = '';
  const regexEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  const email = texto.match(regexEmail)?.[0] || '';
  const semEmails = texto.replace(regexEmail, ' ');
  const regexTelefone = /(?<![\p{L}\d])(?:\+55[ \t.-]*)?(?:\(?\d{2}\)?[ \t.-]*)?\d{4,5}[ \t.-]*\d{4}(?![\p{L}\d])/gu;
  const intervaloDeAnos = /^(?:19|20)\d{2}(?:19|20)\d{2}$/;
  const telefone = [...semEmails.matchAll(regexTelefone)]
    .map(match => match[0].trim())
    .find(numero => !intervaloDeAnos.test(numero.replace(/\D/g, ''))) || '';
  const linhas = semEmails.split(/\r?\n/)
    .map(linha => linha.replace(regexTelefone, ' ')
      .replace(/\b(?:e-?mail|telefone|celular|tel|contato)\s*:\s*/gi, ' ')
      .replace(/[|•]/g, ' ')
      .replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const nomeExplicito = linhas.find(linha => /^nome(?: completo)?\s*:/i.test(linha));
  const candidato = nomeExplicito?.replace(/^nome(?: completo)?\s*:\s*/i, '') || linhas.find(linha => {
    if (/^(curr[ií]culo|resume|curriculum|contato|dados pessoais|resumo|experi[eê]ncia|forma[cç][aã]o|objetivo)\b/i.test(linha)) return false;
    return /^[\p{L}][\p{L}'’.-]*(?:\s+[\p{L}][\p{L}'’.-]*){1,5}$/u.test(linha);
  }) || '';
  const nomeCompleto = /^[\p{L}][\p{L}\s'’.-]+$/u.test(candidato) && candidato.length <= 200 ? candidato : '';
  return { nomeCompleto, email, telefone };
}
