# Módulo: Schemas

## Responsabilidade

Este módulo é responsável por definir os schemas de validação de dados da aplicação utilizando a biblioteca **Zod**.

## Funcionamento

Os schemas definidos aqui são usados para:
1.  **Validação de Requisições (Input)**: Garantir que os dados recebidos nas requisições HTTP (como `body`, `params`, `query`) estejam no formato correto. Isso é feito em conjunto com o `fastify-type-provider-zod` nas rotas.
2.  **Inferência de Tipos**: O TypeScript infere os tipos estáticos a partir dos schemas Zod. Isso significa que não precisamos declarar interfaces ou tipos separados para os dados validados, evitando duplicação e garantindo consistência entre a validação em tempo de execução e a checagem de tipos em tempo de desenvolvimento.
3.  **Validação de Dados Externos**: Como visto em `auth.ts`, os schemas também são usados para validar a estrutura de dados recebidos de APIs externas (ex: a resposta da API do Google).

## Arquivos

-   **`user.ts`**: Contém schemas relacionados ao domínio de **Usuário**.
-   **`quiz.ts`**: Contém schemas relacionados ao domínio de **Quiz**.

## Justificativa

Centralizar os schemas em um diretório dedicado torna a gestão das estruturas de dados mais organizada. Facilita a reutilização de schemas em diferentes partes da aplicação (ex: na criação e na atualização de um recurso). Essa abordagem, combinada com o Zod, é fundamental para a robustez da API, pois garante que a lógica de negócio só opere sobre dados que já foram validados e cuja estrutura é conhecida e segura.
