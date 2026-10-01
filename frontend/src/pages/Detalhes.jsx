import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
export default function Detalhes() {
  const { id } = useParams();
  const [estado, setEstado] = useState({ carregando: true, erro: '', candidato: null });
  useEffect(() => {
    let ativo = true;
    setEstado({ carregando: true, erro: '', candidato: null });
    api.buscarPorId(id).then(candidato => { if (ativo) setEstado({ carregando: false, erro: '', candidato }); })
      .catch(error => { if (ativo) setEstado({ carregando: false, erro: error.status === 404 ? 'Candidato não encontrado.' : error.message, candidato: null }); });
    return () => { ativo = false; };
  }, [id]);
  const c = estado.candidato;
  return <><Link className="voltar" to="/">← Voltar à listagem</Link>
    {estado.carregando ? <p role="status">Carregando detalhes…</p> : estado.erro ? <><h1>Detalhes do candidato</h1><p className="erro" role="alert">{estado.erro}</p></> : <><p className="sobretitulo">Detalhes do candidato</p><h1>{c.nomeCompleto}</h1><section className="card"><dl><dt>E-mail</dt><dd>{c.email}</dd><dt>Telefone</dt><dd>{c.telefone || 'Não informado'}</dd><dt>Área ou cargo de interesse</dt><dd>{c.areaInteresse || 'Não informada'}</dd><dt>Resumo profissional</dt><dd className="resumo">{c.resumoProfissional || 'Não informado'}</dd><dt>Cadastrado em</dt><dd>{new Date(c.criadoEm).toLocaleString('pt-BR')}</dd></dl></section></>}
  </>;
}
