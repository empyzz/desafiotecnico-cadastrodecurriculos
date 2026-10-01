# Cadastro de candidatos

Aplicação simples para cadastrar candidatos manualmente ou preencher o mesmo formulário a partir de um currículo em PDF. Os dados extraídos poderão ser corrigidos antes de salvar. A ausência do PDF ou uma falha na leitura não impedirá o cadastro manual.

## Status

Etapa 2 de 12 concluída: SQL Server executado em Docker, script aplicado duas vezes sem erro e tabela `dbo.Candidatos` confirmada com as sete colunas. A aplicação ainda não está implementada.

## Escopo

- Cadastro com nome completo e e-mail obrigatórios; telefone, área ou cargo de interesse e resumo profissional opcionais.
- Validação dos mesmos campos nos dois caminhos de cadastro, no frontend e no backend.
- Importação opcional de PDF de até 5 MB, com leitura realizada no backend.
- Listagem de candidatos e consulta de detalhes.
- Persistência em SQL Server.

## Tecnologias planejadas

| Parte | Tecnologia |
| --- | --- |
| Frontend | React, Vite e React Router |
| Backend | Node.js, Express, mssql, dotenv e cors |
| PDF | multer e pdf-parse |
| Banco de dados | SQL Server 2022 Developer em Docker |
| Testes | Vitest, Supertest e React Testing Library |

As versões efetivamente instaladas serão registradas nas próximas etapas, junto dos arquivos de dependências e seus lockfiles.

A imagem configurada é `mcr.microsoft.com/mssql/server:2022-latest`. Essa tag recebe atualizações da linha 2022. Versões verificadas em 01/10/2026: SQL Server 2022 RTM-CU27 (`16.0.4295.3`), Docker Engine `29.8.1` e Docker Compose `5.5.1`. A versão do aplicativo Docker Desktop não foi registrada.

## Estrutura

```text
frontend/       Interface React
backend/        API Express, acesso ao banco e testes
database/       Scripts SQL
exemplos/       Currículo fictício em PDF
compose.yaml    SQL Server local e volume persistente
.env.example    Exemplo de configuração do Docker
README.md       Configuração, execução e testes
DESENVOLVIMENTO.md  Decisões, verificações e uso de IA
```

## SQL Server local

Pré-requisitos: Docker Desktop iniciado com containers Linux, Docker Compose v2 ou superior e pelo menos 2 GB de memória disponíveis para o SQL Server. O servidor local usa a porta 1433, que precisa estar livre. Referência: [guia oficial de SQL Server em Docker](https://learn.microsoft.com/en-us/sql/linux/quickstart-install-connect-docker?view=sql-server-ver16).

Execute os comandos abaixo em PowerShell, na raiz do repositório. O início do container e os comandos SQL foram verificados neste ambiente. Se `.env` já existir, preserve sua configuração em vez de sobrescrevê-la com o exemplo.

1. Copie o exemplo e edite `.env`, definindo uma senha local forte:

   ```powershell
   Copy-Item .env.example .env
   notepad .env
   ```

2. Inicie o servidor e aguarde o healthcheck:

   ```powershell
   docker compose up -d --wait --wait-timeout 180 sqlserver
   docker compose ps
   ```

3. Execute o script para criar o banco `CadastroCurriculos` e a tabela `dbo.Candidatos`:

   ```powershell
   docker compose exec -T sqlserver sh -c 'export SQLCMDPASSWORD=$MSSQL_SA_PASSWORD; exec /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -b -i /scripts/001_criar_tabela_candidatos.sql'
   ```

4. Confirme a tabela e consulte a versão do servidor:

   ```powershell
   docker compose exec -T sqlserver sh -c 'export SQLCMDPASSWORD=$MSSQL_SA_PASSWORD; exec /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -b -W -i /scripts/verificar.sql'
   ```

   O resultado esperado é uma linha `dbo Candidatos`, as sete colunas e a versão. O script de verificação retorna erro se a tabela estiver ausente. Execute novamente o comando do passo 3 para conferir que o script pode ser reaplicado sem erro. Ele não altera tabelas já existentes.

O volume `sqlserver-data` preserva os dados ao parar o container:

```powershell
docker compose down
```

Se o servidor não iniciar, consulte `docker compose logs sqlserver`. Confira a disponibilidade da porta, os recursos do Docker e a política de senha. Após a criação do volume, mudar `.env` não altera a senha já configurada no banco; use a senha original ou altere-a no SQL Server.

A conexão planejada para o backend será `localhost:1433`, banco `CadastroCurriculos`, usuário `sa` e a senha escolhida em `.env`. A configuração de conexão do backend será adicionada na etapa 3. O usuário `sa` e o certificado local confiado via `-C` são utilizados neste ambiente de desenvolvimento.

## Aplicação e testes

A completar nas etapas correspondentes, com comandos verificados para:

1. Instalar os requisitos e dependências.
2. Configurar a conexão do backend a partir de um `.env.example` sem credenciais reais.
3. Iniciar o backend e o frontend.
4. Rodar os testes automatizados.

## Verificação manual planejada

- [ ] Salvar um candidato sem enviar PDF e consultar a listagem e os detalhes.
- [ ] Rejeitar nome ou e-mail vazio e e-mail inválido.
- [ ] Importar o currículo fictício, revisar os campos e salvar.
- [ ] Corrigir os dados sugeridos antes de salvar.
- [ ] Rejeitar arquivo de outro tipo ou maior que 5 MB com mensagem clara.
- [ ] Exibir erro para PDF corrompido ou sem texto e permitir continuar manualmente.
- [ ] Conferir carregamento, lista vazia, falha de consulta e candidato inexistente.
- [ ] Confirmar persistência após reiniciar a aplicação.
- [ ] Clonar em uma pasta nova e seguir as instruções deste README.

## Limitações previstas

A extração usará regras de texto para sugerir nome, e-mail e telefone; não haverá OCR. PDFs digitalizados como imagem, protegidos ou com layouts incomuns podem não produzir informações úteis. Os campos continuarão disponíveis para preenchimento manual. Não haverá armazenamento permanente do PDF.

## Registro do desenvolvimento

Consulte [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md) para o plano de etapas, decisões e participação da IA.
