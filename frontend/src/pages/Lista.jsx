import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api.js';
export default function Lista() {
  const location = useLocation();
  const [estado, setEstado] = useState({ carregando: true, erro: '', candidatos: [] });
  useEffect(() => {
    let ativo = true;
    api
      .listar()
      .then((candidatos) => {
        if (ativo) setEstado({ carregando: false, erro: '', candidatos });
      })
      .catch((error) => {
        if (ativo) setEstado({ carregando: false, erro: error.message, candidatos: [] });
      });
    return () => {
      ativo = false;
    };
  }, []);
  return (
    <>
      <div className="titulo">
        <div>
          <p className="sobretitulo">Recrutamento</p>
          <h1>Candidatos</h1>
          <p>Consulte os cadastros e encontre as informações de cada pessoa.</p>
        </div>
        <Link className="botao" to="/candidatos/novo">
          Novo candidato
        </Link>
      </div>
      {location.state?.mensagem && (
        <p className="sucesso" role="status">
          {location.state.mensagem}
        </p>
      )}
      {estado.carregando ? (
        <p role="status">Carregando candidatos…</p>
      ) : estado.erro ? (
        <p className="erro" role="alert">
          {estado.erro}
        </p>
      ) : !estado.candidatos.length ? (
        <section className="card vazio">
          <h2>Nenhum candidato cadastrado</h2>
          <p>Comece pelo cadastro manual ou importe um currículo em PDF.</p>
          <Link to="/candidatos/novo">Cadastrar primeiro candidato</Link>
        </section>
      ) : (
        <div className="card tabela">
          <table>
            <caption className="sr-only">Candidatos cadastrados</caption>
            <thead>
              <tr>
                <th>Nome completo</th>
                <th>E-mail</th>
                <th>Área de interesse</th>
                <th>
                  <span className="sr-only">Detalhes</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {estado.candidatos.map((candidato) => (
                <tr key={candidato.id}>
                  <td>{candidato.nomeCompleto}</td>
                  <td>{candidato.email}</td>
                  <td>{candidato.areaInteresse || 'Não informada'}</td>
                  <td>
                    <Link
                      to={`/candidatos/${candidato.id}`}
                      aria-label={`Ver detalhes de ${candidato.nomeCompleto}`}
                    >
                      Ver detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
