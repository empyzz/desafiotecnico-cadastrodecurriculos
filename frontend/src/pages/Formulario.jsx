import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { validarFormulario } from '../validarFormulario.js';

const campos = [
  { nome: 'nomeCompleto', rotulo: 'Nome completo', limite: 200, obrigatorio: true, autoComplete: 'name' },
  { nome: 'email', rotulo: 'E-mail', limite: 254, obrigatorio: true, tipo: 'email', autoComplete: 'email' },
  { nome: 'telefone', rotulo: 'Telefone', limite: 30, tipo: 'tel', autoComplete: 'tel' },
  { nome: 'areaInteresse', rotulo: 'Área ou cargo de interesse', limite: 150 },
  { nome: 'resumoProfissional', rotulo: 'Resumo profissional', limite: 10000, textarea: true },
];
const vazio = { nomeCompleto: '', email: '', telefone: '', areaInteresse: '', resumoProfissional: '' };
export default function Formulario() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(vazio);
  const [erros, setErros] = useState({});
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  function alterar(event) {
    const { name, value } = event.target;
    setDados(atual => ({ ...atual, [name]: value }));
    setErros(atual => ({ ...atual, [name]: '' }));
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
    } catch (error) { setErro(error.message); setErros(error.erros || {}); }
    finally { setSalvando(false); }
  }
  return <>
    <Link className="voltar" to="/">← Voltar à listagem</Link>
    <p className="sobretitulo">Recrutamento</p><h1>Novo candidato</h1>
    <p>Preencha os dados abaixo. Nome completo e e-mail são obrigatórios.</p>
    <form className="card formulario" onSubmit={salvar} noValidate>
      {erro && <p className="erro" role="alert">{erro}</p>}
      <div className="campos">{campos.map(campo => {
        const Tag = campo.textarea ? 'textarea' : 'input';
        return <div className={campo.textarea ? 'campo inteiro' : 'campo'} key={campo.nome}>
          <label htmlFor={campo.nome}>{campo.rotulo}{campo.obrigatorio && <span aria-hidden="true"> *</span>}</label>
          <Tag id={campo.nome} name={campo.nome} type={campo.tipo || 'text'} value={dados[campo.nome]} onChange={alterar} maxLength={campo.limite} required={campo.obrigatorio} autoComplete={campo.autoComplete} rows={campo.textarea ? 5 : undefined} aria-invalid={Boolean(erros[campo.nome])} aria-describedby={erros[campo.nome] ? `${campo.nome}-erro` : undefined} disabled={salvando} />
          {erros[campo.nome] && <span className="erro-campo" id={`${campo.nome}-erro`}>{erros[campo.nome]}</span>}
        </div>;
      })}</div>
      <div className="acoes"><button disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar candidato'}</button><Link to="/">Cancelar</Link></div>
    </form>
  </>;
}
