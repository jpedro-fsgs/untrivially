# Módulo: Plugins

## Responsabilidade

Este módulo contém plugins personalizados para o Fastify. Plugins são uma forma de estender a funcionalidade do Fastify, adicionando hooks, decoradores ou utilitários que podem ser reutilizados em diferentes rotas.

## Arquivos

-   **`authenticate.ts`**: Este plugin implementa a lógica de autenticação e autorização para rotas protegidas.

## Funcionamento

O plugin `authenticate` é um hook `onRequest` que executa antes do handler de uma rota. Ele:
1.  Extrai o token JWT do cabeçalho `Authorization` da requisição.
2.  Usa a função `request.jwt.verify()` (fornecida pelo plugin `@fastify/jwt`) para validar o token.
3.  Se o token for válido, o payload decodificado é anexado ao objeto `request.user`.
4.  Se o token for inválido ou ausente, ele interrompe a requisição e retorna um erro de "Não Autorizado" (401).

## Justificativa

Criar um plugin de autenticação centraliza a lógica de proteção de rotas em um único local. Isso evita a duplicação de código e torna a aplicação de políticas de segurança mais consistente e fácil de manter. Qualquer rota que precise de autenticação pode simplesmente registrar este plugin em seu `onRequest` hook.
