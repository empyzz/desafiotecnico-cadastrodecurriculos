# Registro do desenvolvimento

## Organização e execução

Escolhi React e Node.js e organizei o desenvolvimento em 12 etapas, começando pela estrutura e pelo banco, seguindo pelo backend e pelo frontend e finalizando com testes e documentação. Mantive a solução pequena, com três telas e uma tabela, para facilitar a configuração e a compreensão do fluxo.

Usei commits separados para registrar a evolução do trabalho:

| Etapa | Entrega | Mensagem de commit |
| --- | --- | --- |
| 1 | Estrutura e desenho inicial | chore: initial structure and design docs |
| 2 | SQL Server em Docker e scripts | feat(db): add Candidatos table script |
| 3 | Express, conexão, repositório e health | feat(backend): server, sql server connection and repository |
| 4 | Validação, rotas e testes | feat(backend): candidate validation and routes with tests |
| 5 | Extração de dados do texto e testes | feat(backend): resume data extraction with tests |
| 6 | Upload, PDF fictício e testes | feat(backend): pdf upload route, sample resume and api tests |
| 7 | React, rotas e cliente HTTP | feat(frontend): setup, routing and api client |
| 8 | Listagem e detalhes | feat(frontend): list and details pages |
| 9 | Formulário manual | feat(frontend): candidate form |
| 10 | Importação no formulário | feat(frontend): pdf import in form |
| 11 | Testes do frontend | test(frontend): form tests |
| 12 | Verificação final e documentação | docs: complete readme and development log |

Também registrei separadamente as correções do tratamento de PDFs no Git e das falhas ao iniciar o servidor, além do resultado da verificação em um clone novo.

## Principais decisões técnicas

- **Um formulário para os dois caminhos:** a importação apenas sugere valores. O cadastro manual e o cadastro com PDF usam o mesmo endpoint e as mesmas regras de validação.
- **Validação no frontend e no backend:** usei a validação no frontend para feedback imediato e no backend para garantir as regras antes da persistência. Nome e e-mail são obrigatórios; os demais campos aceitam vazio. Também defini limites de comprimento e validação básica do formato do e-mail.
- **Express e um repositório simples:** concentrei o acesso ao SQL Server em `listar`, `buscarPorId` e `inserir`, com consultas parametrizadas e pool de conexão. Para uma tabela, optei por não adicionar um ORM.
- **Script SQL reaplicável:** o script cria o banco e a tabela se estiverem ausentes, sem apagar registros existentes. Usei UTC na data de criação. Não defini unicidade de e-mail, pois não era um requisito do desafio.
- **PDF processado em memória:** usei multer para receber um único PDF de até 5 MB e pdf-parse para extrair o texto. O backend confere extensão, tipo, tamanho e assinatura. O arquivo não é armazenado e o parser é liberado após a leitura.
- **Extração por regras de texto:** separei a identificação dos dados em uma função pura, facilitando os testes. Ela procura nome, e-mail e telefone e retorna vazio para informações não identificadas. As sugestões precisam de revisão.
- **Consulta durante o preenchimento:** acrescentei um link local para abrir o PDF e uma área somente de leitura com o texto extraído, permitindo copiar trechos para os campos. O link não exige armazenamento no servidor e é liberado ao substituir o arquivo ou sair do formulário.
- **Preservação dos dados manuais:** a importação preenche somente campos vazios, permitindo corrigir as sugestões. Uma falha na leitura não apaga o formulário nem impede o cadastro manual.
- **Interface simples:** usei JavaScript, CSS comum e Vite, sem biblioteca de componentes ou estado global. O frontend encaminha `/api` ao backend por proxy durante o desenvolvimento.
- **Tratamento central de erros:** usei um middleware para mensagens consistentes, sem expor detalhes internos ou credenciais.

As tecnologias e versões efetivamente utilizadas estão no README e nos arquivos de dependências.

## Participação da IA

Usei o Codex, da OpenAI, com GPT-6.1 Sol na sessão principal de desenvolvimento.

A IA teve participação substancial na implementação. Usei seu apoio para estruturar a solução, gerar código do backend e do frontend, criar testes e documentação, executar verificações e analisar falhas. O código foi desenvolvido com essa assistência; a IA não faz parte da aplicação entregue, que extrai os dados do PDF por regras locais de texto.

Alguns exemplos de como aproveitei a IA:

- **Estrutura da API:** geração dos módulos de conexão, repositório, validação e rotas, mantendo o acesso ao banco separado do tratamento HTTP.
- **Testes de comportamento:** criação de cenários para campos obrigatórios, e-mail inválido, dados não identificados no currículo e erros de upload. Os resultados dos testes orientaram correções na implementação.
- **Leitura do PDF:** implementação da extração e análise da falha com PDFs sem texto, que levou à mudança da verificação para o conteúdo real de cada página.
- **Formulário React:** implementação do preenchimento a partir do PDF e de testes garantindo que os campos continuassem editáveis e que uma falha de importação permitisse concluir o cadastro manual.
- **Verificação da entrega:** execução assistida dos testes, do build, dos fluxos HTTP e da configuração em um clone novo, com registro dos resultados e das limitações.

Defini a direção do projeto e usei a IA para desenvolver a implementação e apoiar as verificações. Não considerei uma resposta gerada como prova de funcionamento: os resultados descritos abaixo foram conferidos por execução. A revisão pessoal do código e a preparação para explicar a solução continuam sendo parte da minha responsabilidade antes da entrega.

## Correções, adaptações e dificuldades

1. **Preparação do ambiente:** instalei Docker Desktop para executar SQL Server e usei o engine Linux. A configuração da aplicação usa Docker Compose com um container comum.
2. **PDF sem texto:** os testes mostraram que o texto combinado de pdf-parse inclui marcadores de página mesmo em um documento vazio. Com apoio da IA, adaptei a implementação para usar `resultado.pages[].text`; o caso passou a retornar 422 com orientação para cadastro manual.
3. **PDF no histórico Git:** adicionei `.gitattributes` para tratar os PDFs como binários e evitar conversão de finais de linha no checkout.
4. **Falha ao iniciar o backend:** durante a verificação em um clone novo, foi identificado que Express 5 entrega erros de listen no callback. O código imprimia sucesso mesmo com a porta ocupada. Corrigi esse tratamento com auxílio da IA e verifiquei a mensagem `EADDRINUSE` e o código de saída 1.
5. **Portas ocupadas:** processos de desenvolvimento permaneceram ativos após o encerramento dos terminais. Foi necessário parar os processos correspondentes antes de iniciar a cópia de verificação.
6. **Ferramentas de verificação:** usei `docker compose config --quiet` para validar o Compose e o renderizador de pdf-parse para inspecionar o PDF, evitando instalar dependências adicionais apenas para essas verificações.
7. **Inspeção da interface:** a automação de navegador não estava disponível na sessão. Mantive essa verificação visual como pendência, sem confundi-la com os testes automatizados dos componentes.
8. **Identificação dos contatos:** melhorei a extração para ignorar intervalos de anos e números dentro de e-mails, além de remover os contatos antes de testar uma linha como nome. Acrescentei testes para contatos na mesma linha, nomes explícitos e diferentes formatos de telefone. Títulos e cidades ainda podem ser confundidos com nomes pela heurística.

Mantive OCR, armazenamento de PDFs e extração com IA fora do escopo para preservar a simplicidade da solução.

## Como verifiquei a solução

As verificações foram executadas com auxílio da IA:

- **Banco:** validação do Compose, container saudável, execução do script de criação duas vezes sem erro e confirmação das sete colunas. SQL Server retornou a versão `16.0.4295.3`.
- **Backend:** 43 testes passaram, cobrindo validação, limites, consultas, candidato inexistente, ID inválido, JSON inválido, extração e erros de upload. A importação do PDF fictício retornou os contatos esperados e o texto para consulta.
- **SQL Server real:** um teste de integração passou, verificando healthcheck, cadastro, listagem e detalhes. O teste remove seu próprio registro ao terminar.
- **Frontend:** 18 testes passaram, cobrindo cadastro manual, validação, sugestões editáveis, preservação de dados já digitados, continuidade após erro no PDF, link local do documento, texto para cópia e estados de listagem e detalhes.
- **Build:** o build de produção do frontend passou.
- **Fluxos HTTP:** com os servidores em execução, foram verificados cadastro sem PDF, importação, correção dos dados antes de salvar, listagem, validação, resposta 404 e proxy Vite.
- **Persistência:** os dois candidatos fictícios da verificação permaneceram após reiniciar e recriar o container usando o mesmo volume. Foram mantidos no banco local como demonstração; não são dados iniciais do repositório.
- **PDF de exemplo:** o documento foi renderizado e inspecionado visualmente, sem cortes ou sobreposição.
- **Configuração:** somente exemplos sem credenciais reais foram versionados; os arquivos `.env` são ignorados pelo Git.
- **Clone novo:** a configuração foi repetida em uma pasta nova, com `npm ci`, um banco criado do zero, todos os 44 testes e o build. Também foram confirmados início dos servidores, healthcheck, proxy e listagem vazia após a limpeza do teste. O checksum do PDF permaneceu igual após o clone. O volume temporário de teste foi removido e o ambiente original foi restaurado.

Os testes de componentes usam a API simulada e não substituem uma revisão visual no navegador. O README contém o checklist dessa revisão pendente.

## Tempo dedicado

A execução assistida das etapas de implementação, testes e documentação levou aproximadamente 40 minutos; a retomada da configuração do banco levou cerca de 10 minutos. São estimativas do tempo de execução com IA.

Ainda preciso complementar o tempo total dedicado à preparação do ambiente, estudo e revisão pessoal antes da entrega.

## Limitações e melhorias

A extração não usa OCR e pode falhar com PDFs digitalizados, protegidos ou com layouts em colunas. A identificação do nome e do telefone é heurística e pode sugerir valores incorretos. A validação de e-mail verifica o formato, não a existência da caixa.

A aplicação não possui autenticação, busca, paginação, edição ou exclusão. Usei SQL Server Developer e o usuário sa para facilitar a execução local. Uma publicação exigiria configuração própria de hospedagem; o proxy Vite é destinado ao desenvolvimento. A imagem Docker recebe atualizações, embora a versão verificada esteja documentada.

Com mais tempo, faria a revisão visual em navegador e em telas menores, acrescentaria testes completos no navegador, busca e paginação e melhoraria a extração com currículos de formatos variados.
