# Arquitetura da Aplicação: Untrivially API

## Estilo Arquitetural

A aplicação segue uma **arquitetura em camadas (Layered Architecture)**, com uma clara separação de responsabilidades. O estilo é o de uma API RESTful monolítica.

-   **Camada de Apresentação (Presentation Layer)**: Implementada pelas `rotas` (routes). É responsável por receber as requisições HTTP, validar os dados de entrada e formatar as respostas. Utiliza o Fastify para gerenciar rotas e o Zod para validação de schemas.
-   **Camada de Serviço (Service Layer)**: Implementada pelos `serviços` (services). Contém a lógica de negócio da aplicação. É chamada pelas rotas e coordena o acesso aos dados.
-   **Camada de Acesso a Dados (Data Access Layer)**: Abstraída pelo `Prisma`. É responsável pela comunicação com o banco de dados (PostgreSQL). Os serviços utilizam o cliente Prisma para realizar operações de CRUD (Create, Read, Update, Delete).

## Fluxos de Dados Principais

### 1. Fluxo de Autenticação e Criação de Usuário

Este fluxo descreve como um usuário é autenticado via Google OAuth e como sua conta é criada ou acessada no sistema.

1.  **Requisição do Cliente**: O cliente faz uma requisição `POST /users` enviando um `access_token` do Google no corpo da requisição.
2.  **Camada de Rota (`auth.ts`)**:
    -   A rota `/users` recebe a requisição.
    -   O corpo da requisição é validado usando Zod para garantir que o `access_token` foi fornecido.
    -   A rota faz uma chamada `fetch` para a API do Google (`https://www.googleapis.com/oauth2/v2/userinfo`) para obter as informações do usuário, usando o `access_token` para autorização.
3.  **Validação dos Dados do Google**:
    -   Os dados retornados pelo Google são validados com um schema Zod (`userInfoSchema`) para garantir que contêm `id`, `email`, `name` e `picture`.
4.  **Camada de Serviço (`userService.ts`)**:
    -   A rota chama a função `getUserByEmail` para verificar se o usuário já existe no banco de dados.
    -   Se o usuário não existe (`user` é `null`), a rota chama a função `createUser` para criar um novo registro de usuário com os dados obtidos do Google.
5.  **Geração do Token JWT**:
    -   Com o usuário (novo ou existente) em mãos, a rota utiliza o plugin `fastify-jwt` para gerar um token JWT.
    -   O token contém `name` and `avatarUrl` no payload, o `id` do usuário como `sub` (subject), e uma data de expiração de 7 dias.
6.  **Resposta ao Cliente**: A API retorna o token JWT para o cliente.

### 2. Fluxo de Acesso a Rotas Protegidas

Este fluxo descreve como o token JWT é usado para proteger e acessar rotas.

1.  **Requisição do Cliente**: O cliente faz uma requisição a uma rota protegida (ex: `GET /me`) incluindo o token JWT no cabeçalho `Authorization` (ex: `Authorization: Bearer <token>`).
2.  **Plugin de Autenticação (`authenticate.ts`)**:
    -   A rota protegida é configurada com um hook `onRequest` que chama o plugin `authenticate`.
    -   O plugin `authenticate` é executado antes do handler da rota.
    -   Ele utiliza a função `request.jwt.verify()` (do `fastify-jwt`) para validar o token JWT.
3.  **Validação e Decodificação do Token**:
    -   Se o token for inválido ou expirado, o `verify()` lança um erro, e a requisição é interrompida com um status de não autorizado (401).
    -   Se o token for válido, o payload é decodificado, e as informações do usuário (como o `sub`, que é o ID do usuário) são anexadas ao objeto `request`.
4.  **Execução do Handler da Rota**:
    -   O controle é passado para o handler da rota (ex: o handler de `/me`).
    -   O handler agora tem acesso aos dados do usuário autenticado através do objeto `request.user`.
    -   O handler executa sua lógica e retorna a resposta apropriada (neste caso, os dados do usuário).

## Decisões Arquiteturais Chave

-   **Escolha do Fastify**: Fastify foi escolhido em vez de frameworks como Express.js, provavelmente devido ao seu foco em alta performance e baixo overhead, além de seu ecossistema de plugins robusto e suporte nativo a `async/await`.
-   **Uso de TypeScript**: A adoção do TypeScript impõe tipagem estática, o que melhora a manutenibilidade, a detecção de erros em tempo de desenvolvimento e a clareza do código, especialmente em uma arquitetura em camadas onde os contratos de dados entre camadas são cruciais.
-   **Prisma como ORM**: Prisma foi escolhido para a camada de acesso a dados. Ele oferece segurança de tipos de ponta a ponta (type-safety) e um cliente gerado que facilita a interação com o banco de dados, alinhando-se bem com o uso de TypeScript.
-   **Zod para Validação**: Em vez de usar validações manuais ou outras bibliotecas, Zod foi integrado com o Fastify (`fastify-type-provider-zod`). Isso centraliza a definição de schemas e garante que os dados que entram e saem da API são consistentes e previsíveis.
-   **Autenticação via Google (OAuth)**: Em vez de implementar um sistema de autenticação com senhas do zero, a aplicação delega a autenticação para o Google. Isso simplifica o desenvolvimento, aumenta a segurança (não armazena senhas) e melhora a experiência do usuário.
-   **JWT para Gerenciamento de Sessão**: Após a autenticação inicial, o estado da sessão é gerenciado por tokens JWT, o que torna a API *stateless* e facilita a escalabilidade.
