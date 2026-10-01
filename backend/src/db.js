import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import sql from 'mssql';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });

let poolPromise;
export function conectar() {
  if (!poolPromise) {
    const pool = new sql.ConnectionPool({
      server: process.env.DB_SERVER || 'localhost',
      port: Number(process.env.DB_PORT || 1433),
      database: process.env.DB_NAME || 'CadastroCurriculos',
      user: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD,
      options: {
        encrypt: process.env.DB_ENCRYPT !== 'false',
        trustServerCertificate: process.env.DB_TRUST_CERTIFICATE === 'true',
      },
      connectionTimeout: 10000,
    });
    poolPromise = pool.connect().catch((error) => {
      poolPromise = undefined;
      throw error;
    });
  }
  return poolPromise;
}

export async function fecharConexao() {
  if (poolPromise) {
    const pool = await poolPromise;
    await pool.close();
    poolPromise = undefined;
  }
}

export { sql };
