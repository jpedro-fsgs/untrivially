# Módulo: Lib

## Responsabilidade

O diretório `lib` contém módulos de utilidades e inicializações de bibliotecas que são compartilhadas por toda a aplicação. A ideia é centralizar a configuração de clientes e serviços externos em um único local.

## Arquivos

-   **`prisma.ts`**: Este arquivo é responsável por criar e exportar uma instância única do cliente Prisma (`PrismaClient`).

## Justificativa

Centralizar a instanciação do `PrismaClient` garante que toda a aplicação use a mesma instância, seguindo o padrão Singleton. Isso é crucial para o gerenciamento eficiente das conexões com o banco de dados e para evitar a criação de múltiplos pools de conexão, o que poderia levar a problemas de performance e esgotamento de recursos.
