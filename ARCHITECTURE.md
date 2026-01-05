# Arquitetura da Aplicação: Untrivially API

## Estilo Arquitetural

A aplicação segue uma **arquitetura em camadas (Layered Architecture)**, com uma clara separação de responsabilidades. O estilo é o de uma API RESTful monolítica.

-   **Camada de Apresentação (Presentation Layer)**: Implementada pelas `rotas` (routes). É responsável por receber as requisições HTTP, validar os dados de entrada e formatar as respostas. Utiliza o Fastify para gerenciar rotas e o Zod para validação de schemas.
-   **Camada de Serviço (Service Layer)**: Implementada pelos `serviços` (services). Contém a lógica de negócio da aplicação. É chamada pelas rotas e coordena o acesso aos dados.
-   **Camada de Acesso a Dados (Data Access Layer)**: Abstraída pelo `Prisma`. É responsável pela comunicação com o banco de dados (PostgreSQL). Os serviços utilizam o cliente Prisma para realizar operações de CRUD (Create, Read, Update, Delete).

## Fluxos de Dados Principais

### 1. Fluxo de Autenticação e Criação de Usuário (OAuth2 Server-Side)

Este fluxo descreve como um usuário é autenticado via Google OAuth2 (fluxo de autorização server-side) e como sua conta é criada ou acessada no sistema.

1.  **Redirecionamento para o Google**: O cliente (navegador) acessa a rota `GET /login/google` na API.
2.  **Início do Fluxo OAuth2**: A API, usando o plugin `@fastify/oauth2`, redireciona o navegador do usuário para a página de consentimento do Google.
3.  **Callback do Google**: Após o usuário autorizar, o Google redireciona o navegador de volta para a API, na rota de callback `GET /auth/google/callback`, enviando um `code` (código de autorização) como parâmetro.
4.  **Troca do Código pelo Token**:
    -   A rota de callback (`auth.ts`) recebe o `code`.
    -   Ela usa a função `app.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow` para se comunicar diretamente com o Google e trocar o `code` por um `access_token`.
5.  **Busca de Informações do Usuário**: Com o `access_token` em mãos, a API faz uma chamada `fetch` para a API do Google (`https://www.googleapis.com/oauth2/v2/userinfo`) para obter as informações do usuário (id, email, nome, etc.).
6.  **Validação e Persistência do Usuário**:
    -   Os dados retornados pelo Google são validados com um schema Zod (`userInfoSchema`).
    -   A rota chama o `userService` para verificar se o usuário já existe (`getUserByEmail`). Se não existir, um novo usuário é criado (`createUser`).
7.  **Geração do Token JWT e Resposta**:
    -   Com os dados do usuário do banco de dados, a API gera um token JWT com validade de 7 dias, contendo o ID do usuário como `sub`.
    -   **Em vez de retornar o token em um corpo JSON**, a API o define em um **cookie `HttpOnly`** chamado `untrivially_token`.
    -   A API então redireciona o cliente para a aplicação frontend (ex: '/').

### 2. Fluxo de Criação de Quiz

1.  **Requisição do Cliente**: O usuário envia uma requisição `POST /quizzes` com o título e uma lista de perguntas, cada uma contendo seu texto, opções e o índice da resposta correta.
2.  **Validação**: A camada de rotas usa o Zod para validar se o corpo da requisição corresponde ao `createQuizBodySchema`.
3.  **Processamento no Serviço**: O `quizService` recebe os dados. Ele transforma a entrada em um objeto JSON estruturado, gerando IDs únicos para cada pergunta (`questionId`) e cada opção (`optionId`), e determina o `correctOptionId` com base no índice fornecido.
4.  **Persistência**: O serviço chama o `prisma.quiz.create`, que salva o novo quiz no banco de dados. O campo `questions` é armazenado como um tipo `Json`.

### 3. Fluxo de Acesso a Rotas Protegidas

Este fluxo descreve como o token JWT, armazenado em um cookie, é usado para proteger e acessar rotas.

1.  **Requisição do Cliente**: O cliente faz uma requisição a uma rota protegida (ex: `GET /quizzes`). O navegador anexa automaticamente o cookie `untrivially_token` à requisição.
2.  **Plugin de Autenticação (`authenticate.ts`)**:
    -   A rota protegida é configurada com um hook `onRequest` que chama o plugin `authenticate`.
    -   O plugin `authenticate` executa a função `request.jwtVerify()`.
3.  **Verificação do Token a partir do Cookie**:
    -   A função `request.jwtVerify()` (do `@fastify/jwt`) é configurada (em `server.ts`) para ler e validar automaticamente o token JWT do cookie `untrivially_token`.
    -   Se o token for inválido, ausente ou expirado, o `verify()` lança um erro, e a requisição é interrompida com um status de não autorizado (401).
    -   Se o token for válido, o payload é decodificado, e suas informações são anexadas ao objeto `request.user`.
4.  **Execução do Handler da Rota**:
    -   O controle é passado para o handler da rota (ex: o handler de `/quizzes`).
    -   O handler agora tem acesso aos dados do usuário autenticado através de `request.user`.
    -   Ele executa sua lógica (chama o `quizService`) e retorna a resposta apropriada.

## Decisões Arquiteturais Chave

-   **Escolha do Fastify**: Fastify foi escolhido em vez de frameworks como Express.js, provavelmente devido ao seu foco em alta performance e baixo overhead, além de seu ecossistema de plugins robusto e suporte nativo a `async/await`.
-   **Uso de TypeScript**: A adoção do TypeScript impõe tipagem estática, o que melhora a manutenibilidade, a detecção de erros em tempo de desenvolvimento e a clareza do código, especialmente em uma arquitetura em camadas onde os contratos de dados entre camadas são cruciais.
-   **Prisma como ORM**: Prisma foi escolhido para a camada de acesso a dados. Ele oferece segurança de tipos de ponta a ponta (type-safety) e um cliente gerado que facilita a interação com o banco de dados, alinhando-se bem com o uso de TypeScript.
-   **Zod para Validação**: Em vez de usar validações manuais ou outras bibliotecas, Zod foi integrado com o Fastify (`fastify-type-provider-zod`). Isso centraliza a definição de schemas e garante que os dados que entram e saem da API são consistentes e previsíveis.
-   **Autenticação via Google (OAuth)**: Em vez de implementar um sistema de autenticação com senhas do zero, a aplicação delega a autenticação para o Google. Isso simplifica o desenvolvimento, aumenta a segurança (não armazena senhas) e melhora a experiência do usuário.
-   **JWT para Gerenciamento de Sessão**: Após a autenticação inicial, o estado da sessão é gerenciado por tokens JWT, o que torna a API *stateless* e facilita a escalabilidade.
