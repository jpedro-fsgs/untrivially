# Módulo: Routes

## Responsabilidade

Este módulo define todos os endpoints (rotas) da API. Ele atua como a **Camada de Apresentação** da aplicação, sendo a porta de entrada para todas as requisições HTTP.

## Funcionamento

Cada arquivo neste diretório agrupa um conjunto de rotas relacionadas a um domínio específico da aplicação (ex: `auth.ts` para autenticação, `quiz.ts` para quizzes).

As principais responsabilidades de uma rota são:
1.  **Definir o Endpoint**: Especificar o método HTTP (GET, POST, etc.) e o caminho (URL).
2.  **Validação**: Usar o `fastify-type-provider-zod` para validar o corpo da requisição (`body`), parâmetros de rota (`params`) e parâmetros de busca (`querystring`).
3.  **Orquestração**: Chamar as funções apropriadas da **Camada de Serviço** (`services`) para executar a lógica de negócio.
4.  **Formatação da Resposta**: Formatar e enviar a resposta HTTP para o cliente, incluindo o status code e o corpo da resposta.
5.  **Aplicação de Middleware/Hooks**: Registrar plugins como o `authenticate` para proteger rotas que exigem autenticação.

## Arquivos

-   **`auth.ts`**: Contém as rotas relacionadas à autenticação de usuários, como o endpoint `/users` para login/registro via Google OAuth e a rota `/me` para buscar os dados do usuário autenticado.
-   **`quiz.ts`**: Contém as rotas para o gerenciamento de quizzes (CRUD - Create, Read, Update, Delete).

## Justificativa

A separação de rotas por domínio torna a API mais organizada e fácil de manter. Fica claro onde encontrar a lógica de um endpoint específico. Essa estrutura também facilita a adição de novas versões da API ou novos grupos de funcionalidades no futuro.
