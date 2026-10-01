async function requisitar(caminho, opcoes = {}) {
  let resposta;
  try { resposta = await fetch(`/api${caminho}`, opcoes); }
  catch { throw new Error('Não foi possível conectar ao servidor. Tente novamente.'); }
  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    const erro = new Error(corpo.mensagem || 'Não foi possível concluir a operação.');
    erro.status = resposta.status;
    erro.erros = corpo.erros || {};
    throw erro;
  }
  return corpo;
}
export const api = {
  listar: () => requisitar('/candidatos'),
  buscarPorId: id => requisitar(`/candidatos/${encodeURIComponent(id)}`),
  inserir: dados => requisitar('/candidatos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) }),
  extrair: arquivo => {
    const form = new FormData();
    form.append('curriculo', arquivo);
    return requisitar('/curriculos/extrair', { method: 'POST', body: form });
  },
};
