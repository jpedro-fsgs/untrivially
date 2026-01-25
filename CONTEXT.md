# Contexto do Projeto: Untrivial API

## Objetivo Principal

O objetivo desta API é fornecer uma plataforma para criação e gerenciamento de quizzes. A aplicação permite que usuários se cadastrem, criem seus próprios quizzes com perguntas e respostas, e participem de quizzes criados por outros usuários. O foco é ter uma API robusta, performática e bem estruturada para dar suporte a uma aplicação de quiz.

## Conceitos de Domínio

-   **Usuário (User)**: Representa um participante da plataforma. Cada usuário é identificado por um email único e pode ter um nome e um avatar. Os usuários são os criadores dos quizzes.

-   **Quiz**: Representa um conjunto de perguntas. Cada quiz tem um título e uma estrutura de perguntas armazenada em um campo JSON no banco de dados. Essa estrutura consiste em uma lista de objetos, onde cada objeto representa uma questão e contém:
    - O texto da pergunta (`title`).
    - Uma lista de opções de resposta (`options`), cada uma com seu texto e uma URL de imagem opcional.
    - A referência para a opção correta (`correctOptionId`).

-   **Autenticação**: O sistema utiliza autenticação baseada em JWT (JSON Web Token) para proteger as rotas. Um usuário precisa se autenticar para criar quizzes e acessar rotas protegidas.

## Não-Objetivos (O que o sistema NÃO é)

-   **Sistema de Pontuação Complexo**: O schema atual não inclui um sistema de pontuação, ranking ou acompanhamento de progresso detalhado dos usuários nos quizzes.
-   **Banco de Perguntas Compartilhado**: Não há um banco de perguntas centralizado que possa ser reutilizado em diferentes quizzes. As perguntas são definidas dentro de cada quiz.
-   **Gerenciamento de Acesso Baseado em Papéis (RBAC)**: O sistema não parece ter diferentes níveis de acesso (como administrador, moderador, etc.). A lógica de permissão é simples, baseada na autenticidade do usuário.
-   **Busca ou Categorização Avançada de Quizzes**: Não há funcionalidades implementadas para buscar quizzes por categoria, dificuldade ou tags. A busca é simples, por título ou ID.
