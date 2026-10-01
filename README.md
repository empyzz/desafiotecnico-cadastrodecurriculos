# Cadastro de candidatos

Aplicação simples para cadastrar candidatos manualmente ou preencher o mesmo formulário a partir de um currículo em PDF. Os dados extraídos poderão ser corrigidos antes de salvar. A ausência do PDF ou uma falha na leitura não impedirá o cadastro manual.

## Status

Etapa 1 de 12: estrutura do repositório e documentação inicial. A aplicação ainda não está implementada; os comandos de instalação, execução e testes serão adicionados conforme forem verificados.

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
| Banco de dados | SQL Server em Docker |
| Testes | Vitest, Supertest e React Testing Library |

As versões efetivamente instaladas serão registradas nas próximas etapas, junto dos arquivos de dependências e seus lockfiles.

## Estrutura

```text
frontend/       Interface React
backend/        API Express, acesso ao banco e testes
database/       Scripts SQL
exemplos/       Currículo fictício em PDF
README.md       Configuração, execução e testes
DESENVOLVIMENTO.md  Decisões, verificações e uso de IA
```

## Configuração e execução

A completar nas etapas correspondentes, com comandos verificados para:

1. Instalar os requisitos e dependências.
2. Iniciar o SQL Server em Docker.
3. Configurar a conexão a partir de um `.env.example` sem credenciais reais.
4. Executar `database/001_criar_tabela_candidatos.sql`.
5. Iniciar o backend e o frontend.
6. Rodar os testes automatizados.

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
