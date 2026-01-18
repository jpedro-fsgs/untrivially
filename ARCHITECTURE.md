# Arquitetura da Aplicação: Untrivially API

## Estilo Arquitetural

A aplicação segue uma **arquitetura em camadas (Layered Architecture)**, com uma clara separação de responsabilidades. O estilo é o de uma API RESTful monolítica.

-   **Camada de Apresentação (Presentation Layer)**: Implementada pelas `rotas` (routes). É responsável por receber as requisições HTTP, validar os dados de entrada e formatar as respostas. Utiliza o Fastify para gerenciar rotas e o Zod para validação de schemas.
-   **Camada de Serviço (Service Layer)**: Implementada pelos `serviços` (services). Contém a lógica de negócio da aplicação. É chamada pelas rotas e coordena o acesso aos dados.
-   **Camada de Acesso a Dados (Data Access Layer)**: Abstraída pelo `Prisma`. É responsável pela comunicação com o banco de dados (PostgreSQL). Os serviços utilizam o cliente Prisma para realizar operações de CRUD (Create, Read, Update, Delete).

## Fluxos de Dados Principais

### 1. Fluxo de Autenticação e Gerenciamento de Sessão

Este fluxo descreve como um usuário é autenticado via Google OAuth2 e como sua sessão é estabelecida e gerenciada usando um sistema híbrido de tokens.

1.  **Início do Fluxo OAuth2**: O cliente (navegador) inicia o fluxo de autenticação com o Google.
2.  **Callback do Google**: Após o usuário autorizar, o Google redireciona o navegador de volta para a API, na rota de callback `GET /auth/google/callback`, enviando um `code`.
3.  **Troca do Código pelo Token e Busca de Dados**: A API troca o `code` por um token de acesso do Google e usa-o para buscar as informações do perfil do usuário.
4.  **Validação e Persistência do Usuário**: O `userService` verifica se o usuário já existe (`getUserByEmail`). Se não, um novo usuário é criado (`createUser`).
5.  **Geração de Tokens e Início da Sessão**:
    -   A API gera um **Access Token**: um JWT de curta duração (ex: 15 minutos) contendo os dados do usuário.
    -   A API chama o `sessionService` para gerar um **Refresh Token**: um token opaco, de longa duração (ex: 30 dias), aleatório e criptograficamente seguro.
    -   O hash do Refresh Token é armazenado em uma nova entrada na tabela `RefreshTokens` no banco de dados, junto com o `userId`, `User-Agent` (`deviceInfo`) e `IP Address`.
6.  **Resposta ao Cliente**:
    -   O **Access Token** é retornado no corpo da resposta JSON.
    -   O **Refresh Token** é enviado ao cliente através de um cookie `HttpOnly`, seguro, chamado `untrivially_refresh_token`.

### 2. Fluxo de Renovação de Sessão (Refresh Token Rotation)

Este fluxo é acionado quando o Access Token expira e o cliente precisa de um novo para continuar fazendo chamadas à API.

1.  **Requisição de Refresh**: O cliente faz uma requisição `POST /auth/refresh`. O navegador anexa automaticamente o cookie `untrivially_refresh_token`.
2.  **Validação do Refresh Token**: O `sessionService` busca o hash do token recebido na tabela `RefreshTokens`.
3.  **Detecção de Roubo/Reuso**: Se o hash do token não for encontrado, significa que o token é inválido, expirou, ou já foi usado em uma rotação anterior. O servidor retorna um erro `401 Unauthorized`, efetivamente encerrando a sessão potencialmente comprometida.
4.  **Rotação de Tokens**: Se o token é encontrado e válido:
    -   O servidor **deleta imediatamente** a entrada do token antigo do banco de dados para prevenir reuso.
    -   Um **novo Access Token** (JWT, curta duração) é gerado.
    -   Um **novo Refresh Token** (opaco, longa duração) é gerado e seu hash é salvo no banco de dados.
5.  **Resposta ao Cliente**:
    -   O novo Access Token é retornado no corpo da resposta JSON.
    -   O novo Refresh Token é enviado ao cliente, substituindo o antigo no cookie `untrivially_refresh_token`.

### 3. Fluxo de Acesso a Rotas Protegidas

1.  **Requisição do Cliente**: O cliente faz uma requisição a uma rota protegida (ex: `GET /quizzes`), incluindo o Access Token no cabeçalho `Authorization` como um `Bearer Token`. (`Authorization: Bearer <access_token>`).
2.  **Plugin de Autenticação (`authenticate.ts`)**:
    -   O hook `onRequest` da rota chama o plugin `authenticate`.
    -   O plugin executa `request.jwtVerify()`, que lê e valida o token do cabeçalho `Authorization`.
    -   Se o token for inválido (expirado, malformado), um erro `401` é retornado.
    -   Se válido, o payload é decodificado e anexado a `request.user`.
3.  **Execução do Handler da Rota**: Com o usuário autenticado, o handler da rota executa sua lógica de negócio.

*(Nota sobre o fluxo de Quizzes: A arquitetura de dados para quizzes foi refatorada de um campo JSON monolítico para um modelo relacional (Quiz -> Question -> Answer). A API agora suporta tanto a criação em massa de um quiz completo quanto endpoints granulares para criar, modificar e excluir questões e respostas individualmente, oferecendo maior flexibilidade e alinhamento com os princípios REST.)*

## Decisões Arquiteturais Chave

-   **Escolha do Fastify, TypeScript, Prisma, Zod**: Estas escolhas permanecem fundamentais para a performance, segurança de tipos e manutenibilidade da aplicação.
-   **Autenticação via Google (OAuth)**: A delegação da autenticação primária ao Google continua sendo uma decisão chave para segurança e simplicidade.
-   **Gerenciamento de Sessão Híbrido (Stateless + Stateful)**:
    -   A arquitetura anterior, puramente com JWT, era *stateless*. A nova arquitetura é **híbrida**.
    -   **Access Tokens (JWT)**: São *stateless*. O servidor não precisa consultar o banco para validá-los, o que os torna rápidos e eficientes para autorizar requisições. Sua curta duração minimiza o risco em caso de vazamento.
    -   **Refresh Tokens (Opaque)**: São *stateful*. Estão armazenados no banco de dados e representam a sessão do usuário em um dispositivo. Esta abordagem permite:
        -   **Revogação de Sessões**: Uma sessão pode ser invalidada a qualquer momento (ex: no logout) simplesmente removendo o token do banco.
        -   **Gerenciamento Multi-dispositivo**: O usuário pode ter sessões ativas e independentes em vários dispositivos.
        -   **Segurança Aprimorada**: A rotação de tokens e a detecção de reuso previnem o sequestro de sessão de longa duração, mesmo se um refresh token for interceptado.
