import { conectar, sql } from './db.js';

const colunas = `Id AS id, NomeCompleto AS nomeCompleto, Email AS email,
  Telefone AS telefone, AreaInteresse AS areaInteresse,
  ResumoProfissional AS resumoProfissional, CriadoEm AS criadoEm`;

export async function listar() {
  const pool = await conectar();
  const result = await pool
    .request()
    .query(`SELECT ${colunas} FROM dbo.Candidatos ORDER BY CriadoEm DESC, Id DESC`);
  return result.recordset;
}

export async function buscarPorId(id) {
  const pool = await conectar();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query(`SELECT ${colunas} FROM dbo.Candidatos WHERE Id = @id`);
  return result.recordset[0] || null;
}

export async function inserir(dados) {
  const pool = await conectar();
  const result = await pool
    .request()
    .input('nome', sql.NVarChar(200), dados.nomeCompleto)
    .input('email', sql.NVarChar(254), dados.email)
    .input('telefone', sql.NVarChar(30), dados.telefone || null)
    .input('area', sql.NVarChar(150), dados.areaInteresse || null)
    .input('resumo', sql.NVarChar(sql.MAX), dados.resumoProfissional || null)
    .query(`INSERT INTO dbo.Candidatos (NomeCompleto, Email, Telefone, AreaInteresse, ResumoProfissional)
      OUTPUT INSERTED.Id AS id
      VALUES (@nome, @email, @telefone, @area, @resumo)`);
  return buscarPorId(result.recordset[0].id);
}
