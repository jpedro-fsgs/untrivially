# Untrivial API

## Visão Geral

API RESTful para um sistema de quiz, construída com Node.js, Fastify e TypeScript. A API gerencia usuários, autenticação e quizzes, utilizando Prisma para interação com o banco de dados.

## Funcionalidades

-   **Autenticação de Usuários**: Sistema de login via Google OAuth2 com gerenciamento de sessão seguro, utilizando rotação de refresh tokens para suportar múltiplos dispositivos e proteger contra roubo de sessão.
-   **Gerenciamento de Quizzes**: Criação, busca, atualização e exclusão de quizzes. Os usuários podem construir quizzes com perguntas estruturadas, incluindo um título, múltiplas opções de resposta e a designação da resposta correta.

## Tecnologias

-   **Node.js**: Ambiente de execução para o servidor.
-   **Fastify**: Framework web para construção da API, focado em performance.
-   **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
-   **Prisma**: ORM para interação com o banco de dados.
-   **Zod**: Biblioteca para validação de schemas e tipos.

## Estrutura do Projeto

O projeto é organizado da seguinte forma:

-   `src/`: Contém o código-fonte da aplicação.
    -   `routes/`: Define os endpoints da API.
    -   `services/`: Contém a lógica de negócio.
    -   `schemas/`: Define os schemas de validação com Zod.
    -   `lib/`: Módulos de utilidades, como a instância do Prisma.
    -   `plugins/`: Plugins do Fastify, como o de autenticação.
-   `prisma/`: Contém o schema do banco de dados.
-   `docs/`: Documentação do projeto.
