# Análise da Aplicação e Plano para MVP do Frontend

Este documento resume a análise da codebase realizada em 05/01/2026 e estabelece os próximos passos para o desenvolvimento de um frontend funcional.

## Resumo da Análise

> A aplicação é uma API de quiz bem estruturada, construída com uma stack moderna (Fastify, Prisma, TypeScript). A base é sólida, mas incompleta.

## 1. Funcionalidade Principal
O propósito da aplicação é servir como um backend para uma plataforma de quiz, permitindo que usuários se autentiquem, criem, gerenciem e (eventualmente) joguem quizzes.

## 2. Recursos Atualmente Implementados
*   **Autenticação de Usuário via Google OAuth2:** O fluxo completo, desde o redirecionamento até a criação do usuário e o gerenciamento da sessão com um cookie JWT HttpOnly, está implementado.
*   **Endpoint de Perfil de Usuário (`GET /me`):** Permite que um frontend verifique se o usuário está logado.
*   **CRUD Completo para Quizzes:**
    *   `POST /quizzes`: Cria um novo quiz.
    *   `GET /quizzes`: Lista os quizzes criados pelo usuário autenticado.
    *   `GET /quizzes/:id`: Obtém os detalhes de um quiz específico.
    *   `PUT /quizzes/:id`: Atualiza um quiz.
    *   `DELETE /quizzes/:id`: Deleta um quiz.

## 3. Proposta de MVP para o Frontend
Com base no backend atual, um MVP de frontend poderia consistir em:
1.  **Página de Login:** Um botão "Login com Google" que redireciona para a API.
2.  **Dashboard do Usuário ("Meus Quizzes"):** Após o login, o usuário é redirecionado para uma página que usa `GET /quizzes` para listar os quizzes que ele criou.
3.  **Criador/Editor de Quiz:** Um formulário para criar (`POST /quizzes`) e editar (`PUT /quizzes/:id`) quizzes.
4.  **Visualizador de Quiz:** Uma página que usa `GET /quizzes/:id` para exibir as perguntas de um quiz. O usuário pode ver o quiz, mas ainda não pode jogá-lo.

## 4. Correções Realizadas
1.  **Falha de Segurança Crítica:** As funções `updateQuiz` e `deleteQuiz` no `quizService.ts` **não verificavam a propriedade do quiz**. Qualquer usuário autenticado podia modificar ou deletar o quiz de qualquer outro usuário. **Isto foi corrigido** adicionando uma verificação para garantir que o `userId` do requisitante corresponda ao `userId` do quiz.

## 5. Funcionalidades Faltando
1.  **Endpoint de Submissão de Respostas (Essencial):** A funcionalidade mais crucial que falta. É necessário um novo endpoint (ex: `POST /quizzes/:id/submit`) que aceite as respostas do usuário, as compare com as respostas corretas no banco de dados e retorne um resultado/pontuação.
2.  **Endpoint de Descoberta de Quizzes (Importante):** Atualmente, não há como um usuário encontrar quizzes criados por outros. Um endpoint público (ex: `GET /quizzes/public`) para listar todos os quizzes é essencial para que a aplicação seja mais do que um editor de quizzes pessoal.

## 6. Recomendações e Próximos Passos
O backend tem uma excelente fundação, mas não está pronto para um frontend de produção devido às lacunas de funcionalidade.

**Lista de Ações Priorizadas para o Backend:**
1.  **Implementar o Fluxo de "Jogar um Quiz" (Prioridade Alta):**
    *   Criar um novo endpoint `POST /quizzes/:id/submit`.
    *   Implementar a lógica de serviço para processar as respostas, calcular a pontuação e retornar o resultado.
    *   Considerar adicionar uma nova tabela `QuizAttempt` ao `prisma/schema.prisma` para armazenar os resultados dos usuários.
2.  **Implementar a Descoberta de Quizzes (Prioridade Média):**
    *   Criar um novo endpoint `GET /quizzes/public` que retorne uma lista de quizzes de todos os usuários, possivelmente com paginação.
3.  **Melhorar o Endpoint `/me` (Prioridade Baixa):** Conforme o comentário no código, fazer com que o endpoint `/me` busque os dados mais recentes do usuário no banco de dados em vez de depender exclusivamente do conteúdo do JWT, para evitar dados obsoletos.
