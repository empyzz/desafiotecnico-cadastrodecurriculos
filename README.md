# Cadastro de candidatos

Aplicação simples para cadastro manual ou importação opcional de currículo em PDF. A importação sugere nome, e-mail e telefone no mesmo formulário, sem salvar automaticamente. Os dados podem ser corrigidos; falhas de leitura não impedem o cadastro manual.

## Requisitos e versões

Node.js 24 ou superior, npm e Docker Desktop iniciado com containers Linux e Docker Compose v2 ou superior. Reserve pelo menos 2 GB de memória para SQL Server e deixe livres as portas 1433, 3001 e 5173.

| Parte | Versões verificadas |
| --- | --- |
| Ambiente | Node.js 24.18.0, npm 12.0.2, Docker Engine 29.8.1, Docker Compose 5.5.1 |
| Frontend | React / React DOM 19.3.0, React Router 7.18.4, Vite 8.3.2, plugin React 6.1.1 |
| Backend | Express 5.2.1, mssql 12.7.2, dotenv 18.0.5, cors 2.8.6 |
| PDF | multer 2.4.0, pdf-parse 2.4.5; PDFKit 0.20.2 para gerar exemplos de teste |
| Banco | SQL Server 2022 Developer RTM-CU27, build 16.0.4295.3 |
| Testes | Vitest 5.0.3, Supertest 7.3.0, React Testing Library 16.3.3, user-event 14.6.7, jest-dom 7.0.1, jsdom 30.1.1 |

Os lockfiles fixam as dependências. A imagem `mcr.microsoft.com/mssql/server:2022-latest` recebe atualizações, portanto a versão baixada pode variar. Referências: [SQL Server em Docker](https://learn.microsoft.com/en-us/sql/linux/quickstart-install-connect-docker?view=sql-server-ver16), [Vite](https://vite.dev/guide/), [pdf-parse](https://www.npmjs.com/package/pdf-parse).

## Estrutura

```text
frontend/src/      Telas React, cliente HTTP e testes
backend/src/       API, validação, extração e repositório SQL
backend/tests/     Testes unitários, API e integração real com SQL Server
backend/scripts/   Gerador do currículo fictício
database/          Scripts de criação e verificação
exemplos/          curriculo-ficticio.pdf
compose.yaml       SQL Server local com volume persistente
DESENVOLVIMENTO.md  Decisões e uso de IA
```

## Configurar e executar

Comandos em PowerShell, na raiz do repositório. Se `.env` já existir, preserve sua senha. Os exemplos contêm apenas valores fictícios; arquivos `.env` são ignorados pelo Git.

### 1. SQL Server

```powershell
Copy-Item .env.example .env
notepad .env
```

Escolha `MSSQL_SA_PASSWORD` com pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e símbolos. Inicie o container:

```powershell
docker compose config --quiet
docker compose up -d --wait --wait-timeout 180 sqlserver
docker compose ps
```

Crie o banco `CadastroCurriculos` e a tabela `dbo.Candidatos`:

```powershell
docker compose exec -T sqlserver sh -c 'export SQLCMDPASSWORD=$MSSQL_SA_PASSWORD; exec /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -b -i /scripts/001_criar_tabela_candidatos.sql'
```

Confirme a tabela, suas sete colunas e a versão:

```powershell
docker compose exec -T sqlserver sh -c 'export SQLCMDPASSWORD=$MSSQL_SA_PASSWORD; exec /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -b -W -i /scripts/verificar.sql'
```

O script de criação pode ser reaplicado sem apagar registros; não altera tabelas já existentes. O script de verificação falha se a tabela estiver ausente.

### 2. Backend

```powershell
Copy-Item backend/.env.example backend/.env
notepad backend/.env
npm --prefix backend ci
```

Defina `DB_PASSWORD` com a **mesma senha** usada no `.env` da raiz. Os demais padrões são:

| Variável | Valor local |
| --- | --- |
| PORT | 3001 |
| FRONTEND_ORIGIN | http://localhost:5173 |
| DB_SERVER / DB_PORT | localhost / 1433 |
| DB_NAME / DB_USER | CadastroCurriculos / sa |
| DB_ENCRYPT / DB_TRUST_CERTIFICATE | true / true |

`sa`, a edição Developer e o certificado local confiado são utilizados para desenvolvimento. O backend carrega `backend/.env` independentemente da pasta atual.

Em um terminal:

```powershell
npm --prefix backend run dev
```

Em outro terminal, confirme:

```powershell
Invoke-RestMethod http://localhost:3001/api/health
```

Resultado esperado: `status = ok`, `banco = conectado`. Banco indisponível retorna 503. Para iniciar sem watch: `npm --prefix backend start`.

### 3. Frontend

Em outro terminal, na raiz:

```powershell
npm --prefix frontend ci
npm --prefix frontend run dev
```

Abra [http://127.0.0.1:5173](http://127.0.0.1:5173). O Vite encaminha `/api` para `http://localhost:3001`. Se mudar a porta do backend, ajuste também `frontend/vite.config.js`.

```powershell
npm --prefix frontend run build
```

O build fica em `frontend/dist`. O proxy funciona no desenvolvimento; hospedar o build requer encaminhar `/api` para o backend e servir `index.html` para as rotas React. Deploy não faz parte do escopo.

## Testes

```powershell
npm --prefix backend test
npm --prefix frontend test
```

Esses testes não exigem SQL Server: usam funções puras, repositório simulado e API simulada no frontend. O upload é testado com o PDF fictício real.

Com o banco configurado e iniciado:

```powershell
npm --prefix backend run test:db
```

O teste usa `backend/.env`, insere um candidato fictício, consulta lista e detalhes e remove seu próprio registro ao terminar. Execute em uma base de desenvolvimento. Resultado verificado: **29 testes backend, 14 frontend e 1 com SQL Server real**. Esses comandos e o build também passaram em um clone novo, com `npm ci` e um banco criado do zero; o início dos dois servidores e o proxy foram confirmados via HTTP.

Exemplo: [exemplos/curriculo-ficticio.pdf](exemplos/curriculo-ficticio.pdf). Para regenerar:

```powershell
node backend/scripts/gerarExemplo.js
```

## Checklist manual

1. Na listagem, clique em **Novo candidato**, salve nome e e-mail sem PDF e confira sucesso, listagem e detalhes.
2. Tente nome vazio e e-mail inválido; confira as mensagens junto dos campos.
3. Importe o PDF fictício no mesmo formulário, corrija um valor sugerido e salve. Campos já digitados são preservados.
4. Teste outro tipo de arquivo, PDF maior que 5 MB e PDF corrompido. Após o erro, conclua o cadastro manual.
5. Confira lista vazia num banco novo, carregamento, erro com backend parado e detalhes de um ID inexistente.
6. Reinicie os processos e o container e confira a persistência.

As regras e estados têm cobertura automatizada. Os fluxos reais e o proxy Vite foram verificados via HTTP, e a persistência foi conferida após reiniciar SQL Server. **A inspeção visual no navegador permanece pendente**: não havia navegador disponível para automação nesta sessão. O PDF foi renderizado e inspecionado visualmente.

## API e regras

| Método | Rota | Resposta |
| --- | --- | --- |
| GET | `/api/health` | 200 ou 503 |
| GET | `/api/candidatos` | 200, lista |
| GET | `/api/candidatos/:id` | 200; 404 se ausente; 400 se ID inválido |
| POST | `/api/candidatos` | 201; 400 com `mensagem` e `erros` por campo |
| POST | `/api/curriculos/extrair` | 200 com `dados` e `mensagem`; 400 para arquivo inválido; 422 para ilegível/sem texto |

```json
{
  "nomeCompleto": "Ana Silva",
  "email": "ana@example.com",
  "telefone": "(11) 98765-4321",
  "areaInteresse": "Desenvolvimento web",
  "resumoProfissional": "Experiência com aplicações web."
}
```

Nome e e-mail são obrigatórios, espaços externos são removidos e o e-mail deve ter formato válido. Limites: nome 200, e-mail 254, telefone 30, área 150 e resumo 10.000 caracteres. Opcionais aceitam vazio; não há requisito de e-mail único.

Upload: `multipart/form-data`, campo `curriculo`, um único `.pdf` de tipo `application/pdf`, até **5 × 1024 × 1024 bytes**. O backend confere extensão, tipo, tamanho e assinatura antes da leitura. O arquivo não é armazenado.

## Persistência e problemas comuns

```powershell
docker compose down
```

Para os containers, preservando o volume. Reinicie com `up`. `docker compose down --volumes` apaga os dados e não é necessário para executar o projeto.

- Docker não responde: abra Docker Desktop e aguarde o engine Linux.
- SQL Server não fica saudável: consulte `docker compose logs sqlserver`; confira senha, memória e porta.
- Login falha: `DB_PASSWORD` deve ser a senha usada ao criar o volume. Mudar `.env` depois não altera a senha do banco existente.
- API falha: confira o `.env` do backend e a execução do script SQL.
- Porta ocupada: pare o processo/container correspondente antes de iniciar outra cópia.

## Limitações

Sem OCR: PDFs digitalizados como imagem, protegidos ou com layouts incomuns podem não fornecer texto útil. Regras de extração podem confundir títulos com nomes ou números com telefone; revise as sugestões. Apenas nome, e-mail e telefone são extraídos, enquanto área e resumo são manuais.

Aplicação local sem login, busca, paginação, edição ou exclusão. Veja [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md) para decisões, participação da IA e evidências de verificação.
