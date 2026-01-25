# Registro de Decisões Técnicas: Untrivial API

Este documento lista as decisões técnicas explícitas e implícitas tomadas durante o desenvolvimento da aplicação, com base na análise do código-fonte.

## 1. Escolha de Framework: Fastify

-   **Decisão**: Utilizar Fastify como o framework web principal.
-   **Justificativa**: A escolha do Fastify sobre alternativas como o Express.js é geralmente motivada pela **performance**. O Fastify é projetado para ter baixo overhead e alta taxa de transferência, o que o torna ideal para APIs que precisam ser rápidas e eficientes. Seu sistema de plugins e o suporte a schemas de validação (como o Zod) de forma nativa também agilizam o desenvolvimento.
-   **Alternativas Consideradas**: Express.js, Koa.
-   **Consequências**: O ecossistema, embora robusto, é menos extenso que o do Express. O código tende a ser mais verboso na configuração inicial dos plugins, mas mais limpo e seguro nas rotas devido à validação de schema integrada.

## 2. Linguagem de Programação: TypeScript

-   **Decisão**: Desenvolver a aplicação utilizando TypeScript em vez de JavaScript puro.
-   **Justificativa**: A principal razão é a **segurança de tipos (type safety)**. TypeScript ajuda a detectar erros em tempo de desenvolvimento, melhora o auto-complete (IntelliSense) e torna o código mais auto-documentado. Em uma arquitetura em camadas, garantir que os dados que fluem entre rotas, serviços e o ORM mantenham um contrato claro é crucial para a manutenibilidade.
-   **Alternativas Consideradas**: JavaScript com JSDoc.
-   **Consequências**: Requer um passo de compilação (ou transpilação, como o `tsx` faz em desenvolvimento). Exige que os desenvolvedores tenham uma curva de aprendizado para entender e aplicar os tipos corretamente, mas o benefício em qualidade de código a longo prazo compensa o esforço inicial.

## 3. Acesso a Dados: Prisma ORM

-   **Decisão**: Utilizar o Prisma como a ferramenta de acesso e manipulação de dados (ORM).
-   **Justificativa**: Prisma oferece **segurança de tipos de ponta a ponta**. O `Prisma Client` é gerado a partir do `schema.prisma`, o que significa que as queries ao banco de dados são totalmente tipadas, eliminando uma classe inteira de erros comuns em tempo de execução. Sua sintaxe declarativa para o schema e a API fluente para queries são modernas e produtivas.
-   **Alternativas Consideradas**: TypeORM, Sequelize, Knex.js (Query Builder).
-   **Consequências**: O Prisma adiciona uma camada de abstração e um passo de "geração" (`prisma generate`) ao fluxo de trabalho. A performance pode ser ligeiramente inferior à de query builders como o Knex.js em cenários muito específicos, mas a segurança de tipos e a produtividade do desenvolvedor são consideradas mais valiosas para este tipo de aplicação.

## 4. Validação de Dados: Zod

-   **Decisão**: Utilizar Zod para declaração e validação de schemas.
-   **Justificativa**: Zod possui uma **excelente integração com TypeScript**. Ele permite inferir tipos estáticos a partir de schemas de validação, eliminando a necessidade de declarar tipos e schemas separadamente. A integração com o Fastify através do `fastify-type-provider-zod` automatiza a validação de `body`, `querystring` e `params`, tornando as rotas mais seguras e limpas.
-   **Alternativas Consideradas**: Joi, Yup, validação manual.
-   **Consequências**: A sintaxe do Zod pode ser um pouco diferente de outras bibliotecas de validação, mas sua capacidade de inferência de tipos é uma grande vantagem no ecossistema TypeScript.

## 5. Autenticação: OAuth 2.0 (Google) + JWT

-   **Decisão**: Implementar um fluxo de autenticação que delega a verificação de identidade ao Google (via OAuth 2.0) e gerencia a sessão interna da API com JSON Web Tokens (JWT).
-   **Justificativa**:
    1.  **Segurança e Simplicidade**: Evita a necessidade de armazenar senhas e implementar lógicas complexas de "esqueci minha senha". A segurança da autenticação primária fica a cargo do Google.
    2.  **Stateless API**: O uso de JWT para autorização após o login inicial torna a API *stateless*. Cada requisição contém toda a informação necessária para ser processada, o que simplifica o design do servidor e facilita a escalabilidade horizontal.
-   **Alternativas Consideradas**: Autenticação baseada em email/senha, autenticação baseada em sessão (stateful).
-   **Consequências**: A aplicação se torna dependente de um provedor de identidade externo (Google). Se a API do Google estiver indisponível, novos usuários não conseguirão se registrar ou fazer login. O JWT precisa ser armazenado de forma segura no cliente (e.g., `HttpOnly cookie`).

## 6. Banco de Dados: PostgreSQL

-   **Decisão**: Utilizar PostgreSQL como o sistema de gerenciamento de banco de dados.
-   **Justificativa**: PostgreSQL é um banco de dados relacional robusto, de código aberto e altamente confiável. É uma escolha padrão para aplicações que necessitam de consistência de dados e a capacidade de realizar queries complexas. A escolha é evidente pelo `docker-compose.yml` e pelo `provider` no `schema.prisma`.
-   **Alternativas Consideradas**: MySQL, SQLite (para desenvolvimento), MongoDB (NoSQL).
-   **Consequências**: Sendo um banco de dados relacional, requer a definição de um schema rígido. Mudanças no schema exigem migrações, que devem ser gerenciadas com cuidado (o Prisma oferece ferramentas para isso).
