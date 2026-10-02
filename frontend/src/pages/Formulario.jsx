import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { validarFormulario } from '../validarFormulario.js';

const campos = [
  {
    nome: 'nomeCompleto',
    rotulo: 'Nome completo',
    limite: 200,
    obrigatorio: true,
    autoComplete: 'name',
  },
  {
    nome: 'email',
    rotulo: 'E-mail',
    limite: 254,
    obrigatorio: true,
    tipo: 'email',
    autoComplete: 'email',
  },
  { nome: 'telefone', rotulo: 'Telefone', limite: 30, tipo: 'tel', autoComplete: 'tel' },
  { nome: 'areaInteresse', rotulo: 'Área ou cargo de interesse', limite: 150 },
  { nome: 'resumoProfissional', rotulo: 'Resumo profissional', limite: 10000, textarea: true },
];
const vazio = {
  nomeCompleto: '',
  email: '',
  telefone: '',
  areaInteresse: '',
  resumoProfissional: '',
};
export default function Formulario() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(vazio);
  const [erros, setErros] = useState({});
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [erroPdf, setErroPdf] = useState('');
  const [mensagemPdf, setMensagemPdf] = useState('');
  const [pdfSelecionado, setPdfSelecionado] = useState(null);
  const [textoExtraido, setTextoExtraido] = useState('');
  useEffect(() => {
    return () => {
      if (pdfSelecionado) URL.revokeObjectURL(pdfSelecionado.url);
    };
  }, [pdfSelecionado]);
  async function importar(event) {
    const input = event.target;
    const arquivo = input.files?.[0];
    setErroPdf('');
    setMensagemPdf('');
    if (!arquivo) return;
    setPdfSelecionado(null);
    setTextoExtraido('');
    if (!/\.pdf$/i.test(arquivo.name) || (arquivo.type && arquivo.type !== 'application/pdf')) {
      setErroPdf('Envie um arquivo PDF de até 5 MB. Você pode continuar manualmente.');
      input.value = '';
      return;
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      setErroPdf('O PDF deve ter até 5 MB. Você pode continuar manualmente.');
      input.value = '';
      return;
    }
    setPdfSelecionado({ nome: arquivo.name, url: URL.createObjectURL(arquivo) });
    setImportando(true);
    try {
      const resultado = await api.extrair(arquivo);
      setTextoExtraido(resultado.texto || '');
      setDados((atual) => ({
        ...atual,
        nomeCompleto: atual.nomeCompleto.trim()
          ? atual.nomeCompleto
          : resultado.dados.nomeCompleto || '',
        email: atual.email.trim() ? atual.email : resultado.dados.email || '',
        telefone: atual.telefone.trim() ? atual.telefone : resultado.dados.telefone || '',
      }));
      setErros({});
      setMensagemPdf('PDF lido. Revise os dados e preencha as informações que faltam.');
    } catch (error) {
      setErroPdf(`${error.message} O cadastro manual continua disponível.`);
    } finally {
      setImportando(false);
      input.value = '';
    }
  }
  function alterar(event) {
    const { name, value } = event.target;
    setDados((atual) => ({ ...atual, [name]: value }));
    setErros((atual) => ({ ...atual, [name]: '' }));
  }
  async function salvar(event) {
    event.preventDefault();
    const encontrados = validarFormulario(dados);
    setErros(encontrados);
    setErro('');
    if (Object.keys(encontrados).length) return;
    setSalvando(true);
    try {
      await api.inserir(dados);
      navigate('/', { state: { mensagem: 'Candidato salvo com sucesso.' } });
    } catch (error) {
      setErro(error.message);
      setErros(error.erros || {});
    } finally {
      setSalvando(false);
    }
  }
  return (
    <>
      <Link className="voltar" to="/">
        ← Voltar à listagem
      </Link>
      <p className="sobretitulo">Recrutamento</p>
      <h1>Novo candidato</h1>
      <p>Preencha os dados abaixo. Nome completo e e-mail são obrigatórios.</p>
      <form className="card formulario" onSubmit={salvar} noValidate>
        <section className="importacao" aria-labelledby="titulo-pdf">
          <h2 id="titulo-pdf">
            Importar currículo <span className="opcional">Opcional</span>
          </h2>
          <p>
            Envie um PDF de até 5 MB para sugerir nome, e-mail e telefone. Campos já preenchidos
            serão preservados.
          </p>
          <label htmlFor="curriculo">Currículo em PDF</label>
          <input
            id="curriculo"
            type="file"
            accept="application/pdf,.pdf"
            onChange={importar}
            disabled={importando || salvando}
          />
          {importando && <p role="status">Lendo currículo…</p>}
          {erroPdf && (
            <p className="erro" role="alert">
              {erroPdf}
            </p>
          )}
          {mensagemPdf && (
            <p className="aviso" role="status">
              {mensagemPdf}
            </p>
          )}
          {pdfSelecionado && (
            <p>
              <a href={pdfSelecionado.url} target="_blank" rel="noopener noreferrer">
                Abrir PDF: {pdfSelecionado.nome}
              </a>
            </p>
          )}
        </section>
        {erro && (
          <p className="erro" role="alert">
            {erro}
          </p>
        )}
        <div className="campos">
          {campos.map((campo) => {
            const Tag = campo.textarea ? 'textarea' : 'input';
            return (
              <div className={campo.textarea ? 'campo inteiro' : 'campo'} key={campo.nome}>
                <label htmlFor={campo.nome}>
                  {campo.rotulo}
                  {campo.obrigatorio && <span aria-hidden="true"> *</span>}
                </label>
                <Tag
                  id={campo.nome}
                  name={campo.nome}
                  type={campo.tipo || 'text'}
                  value={dados[campo.nome]}
                  onChange={alterar}
                  maxLength={campo.limite}
                  required={campo.obrigatorio}
                  autoComplete={campo.autoComplete}
                  rows={campo.textarea ? 5 : undefined}
                  aria-invalid={Boolean(erros[campo.nome])}
                  aria-describedby={erros[campo.nome] ? `${campo.nome}-erro` : undefined}
                  disabled={salvando}
                />
                {erros[campo.nome] && (
                  <span className="erro-campo" id={`${campo.nome}-erro`}>
                    {erros[campo.nome]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {textoExtraido && (
          <section className="texto-extraido" aria-labelledby="titulo-texto">
            <h2 id="titulo-texto">Texto extraído do currículo</h2>
            <p>
              Copie os trechos que precisar e cole nos campos acima. Confira as informações no PDF
              original.
            </p>
            <label htmlFor="texto-extraido">Texto disponível para copiar</label>
            <textarea id="texto-extraido" value={textoExtraido} readOnly rows={8} />
          </section>
        )}
        <div className="acoes">
          <button disabled={salvando || importando}>
            {salvando ? 'Salvando…' : 'Salvar candidato'}
          </button>
          <Link to="/">Cancelar</Link>
        </div>
      </form>
    </>
  );
}
