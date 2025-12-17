# Módulo: Declarations

## Responsabilidade

Este módulo é responsável por estender ou modificar as declarações de tipos de bibliotecas de terceiros para se adequarem às necessidades específicas da aplicação.

## Arquivos

-   **`fastify-jwt.d.ts`**: Adiciona a propriedade `user` ao tipo `FastifyRequest` do Fastify. Isso permite que, após a autenticação, o payload do JWT decodificado (contendo os dados do usuário) seja anexado ao objeto de requisição de forma tipada.

## Justificativa

O uso de arquivos de declaração (`.d.ts`) é uma prática padrão em TypeScript para garantir a segurança de tipos ao interagir com objetos que são modificados dinamicamente em tempo de execução, como o objeto `request` do Fastify após a execução de um plugin de autenticação.
