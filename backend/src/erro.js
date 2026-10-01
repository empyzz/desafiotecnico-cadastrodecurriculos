export class ErroHttp extends Error {
  constructor(status, mensagem) { super(mensagem); this.status = status; }
}
export function tratarErro(error, _req, res, _next) {
  if (error.name === 'MulterError') return res.status(400).json({ mensagem: error.code === 'LIMIT_FILE_SIZE' ? 'O PDF deve ter até 5 MB.' : 'Envie somente um PDF no campo curriculo.' });
  if (error instanceof ErroHttp) return res.status(error.status).json({ mensagem: error.message });
  if (error.type === 'entity.parse.failed') return res.status(400).json({ mensagem: 'JSON inválido.' });
  if (error.type === 'entity.too.large') return res.status(413).json({ mensagem: 'Dados enviados excedem o limite permitido.' });
  console.error('Falha na requisição:', error.code || error.name);
  res.status(500).json({ mensagem: 'Não foi possível concluir a operação. Tente novamente.' });
}
