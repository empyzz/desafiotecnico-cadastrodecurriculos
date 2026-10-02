import { criarApp } from './app.js';
import { fecharConexao } from './db.js';

const port = Number(process.env.PORT || 3001);
const server = criarApp().listen(port, (error) => {
  if (error) {
    console.error(`Não foi possível iniciar a API: ${error.code || error.message}`);
    process.exitCode = 1;
    return;
  }
  console.log(`API disponível em http://localhost:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () =>
    server.close(async () => {
      await fecharConexao();
      process.exit(0);
    }),
  );
}
