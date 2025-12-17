# Módulo: Services

## Responsabilidade

Este módulo contém a **lógica de negócio** da aplicação. Ele atua como a **Camada de Serviço (Service Layer)**, fazendo a ponte entre a camada de apresentação (rotas) e a camada de acesso a dados (Prisma).

## Funcionamento

Os serviços encapsulam as regras de negócio e as operações complexas que não deveriam estar diretamente nas rotas. As principais responsabilidades de um serviço são:
1.  **Executar a Lógica de Negócio**: Implementar as regras que definem como os dados são criados, lidos, atualizados e deletados.
2.  **Coordenar o Acesso a Dados**: Chamar os métodos do `PrismaClient` para interagir com o banco de dados. Um único método de serviço pode fazer várias chamadas ao banco de dados dentro de uma transação, por exemplo.
3.  **Abstrair a Fonte de Dados**: As rotas não sabem *como* os dados são armazenados ou recuperados; elas apenas chamam um método de serviço (ex: `createUser`). O serviço é quem sabe que precisa usar o Prisma para isso.
4.  **Integrar com Outros Serviços**: Um serviço pode chamar outros serviços para compor funcionalidades mais complexas.

## Arquivos

-   **`userService.ts`**: Contém a lógica de negócio relacionada a usuários, como `getUserByEmail` e `createUser`.
-   **`quizService.ts`**: Contém a lógica de negócio para o gerenciamento de quizzes.

## Justificativa

A separação da lógica de negócio em serviços é um pilar da **arquitetura em camadas** e do princípio da **separação de responsabilidades (SoC)**. Isso torna o código mais:
-   **Reutilizável**: A mesma lógica de serviço pode ser chamada por diferentes rotas ou até mesmo por outros serviços.
-   **Testável**: A lógica de negócio pode ser testada de forma isolada, sem depender de uma requisição HTTP. Pode-se "mockar" a camada de dados (Prisma) e testar apenas as regras de negócio.
-   **Manutenível**: Se a forma de acessar os dados mudar (ex: trocar de Prisma para outro ORM), apenas a camada de serviço precisa ser alterada, enquanto as rotas permanecem intactas.
