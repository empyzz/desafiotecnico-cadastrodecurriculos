import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { ErroHttp } from './erro.js';
import { extrairDados } from './extrairDados.js';

export const LIMITE_PDF = 5 * 1024 * 1024;
export const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMITE_PDF, files: 1, fields: 0 },
  fileFilter(_req, file, callback) {
    if (file.mimetype !== 'application/pdf' || !/\.pdf$/i.test(file.originalname)) return callback(new ErroHttp(400, 'Envie um arquivo PDF de até 5 MB.'));
    callback(null, true);
  },
}).single('curriculo');

export async function extrairCurriculo(req, res) {
  if (!req.file) throw new ErroHttp(400, 'Selecione um currículo em PDF.');
  if (req.file.buffer.subarray(0, 5).toString() !== '%PDF-') throw new ErroHttp(400, 'O arquivo enviado não é um PDF válido. Continue com o cadastro manual.');
  const parser = new PDFParse({ data: req.file.buffer });
  try {
    const resultado = await parser.getText();
    const text = resultado.pages.map(page => page.text).join('\n');
    if (!text.trim()) throw new Error('Sem texto');
    res.json({ dados: extrairDados(text), texto: text, mensagem: 'PDF lido. Revise os dados antes de salvar.' });
  } catch {
    throw new ErroHttp(422, 'Não foi possível ler o texto do PDF. Preencha o formulário manualmente.');
  } finally {
    await parser.destroy();
  }
}
