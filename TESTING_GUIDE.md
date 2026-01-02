# Guia de Testes com Vitest

Este guia fornece uma visão geral de como escrever e organizar testes usando a framework [Vitest](https://vitest.dev/).

## Sintaxe Básica

A sintaxe do Vitest é muito semelhante à de outras frameworks de teste populares como Jest e Mocha, o que facilita a sua adoção. As funções globais mais comuns que você usará são:

- `describe(name, factory)`: Cria um bloco que agrupa vários testes relacionados.
- `it(name, factory)` ou `test(name, factory)`: Representa um único caso de teste.
- `expect(value)`: Cria uma asserção, que é usada para verificar se um valor atende a uma determinada condição.

### Exemplo de Sintaxe

```typescript
import { describe, it, expect } from 'vitest'

// describe agrupa testes relacionados a uma funcionalidade específica
describe('Calculadora', () => {
  // 'it' ou 'test' define um caso de teste individual
  it('deve somar dois números corretamente', () => {
    // 'expect' é usado para fazer asserções sobre o resultado
    expect(1 + 2).toBe(3)
  })

  it('deve subtrair dois números', () => {
    expect(5 - 2).not.toBe(2) // Exemplo de um matcher 'not'
  })
})
```

## Organização dos Testes

### Estrutura Dentro de um Arquivo

- **Agrupamento com `describe`**: Use `describe` para agrupar testes para uma única função, módulo ou classe. Você pode aninhar `describe` para criar uma hierarquia mais detalhada.
- **Nomes Descritivos**: Dê nomes claros e descritivos para seus `describe` e `it`. O nome do `it` geralmente deve descrever o comportamento esperado, como "deve retornar um erro se o usuário não for encontrado".
- **Hooks**: Vitest fornece "hooks" para executar código antes ou depois dos testes.
    - `beforeAll(fn)`: Executa uma vez antes de todos os testes em um bloco `describe`. Útil para configurar um banco de dados ou iniciar um servidor.
    - `afterAll(fn)`: Executa uma vez após todos os testes em um bloco `describe`. Útil para limpar recursos.
    - `beforeEach(fn)`: Executa antes de cada teste no bloco `describe`. Útil para resetar o estado entre os testes.
    - `afterEach(fn)`: Executa depois de cada teste.

### Exemplo de Organização

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'

describe('UserService', () => {
  beforeAll(() => {
    // Conectar ao banco de dados de teste
    console.log('Conectando ao banco de dados de teste...');
  });

  afterAll(() => {
    // Desconectar do banco de dados
    console.log('Desconectando do banco de dados de teste...');
  });

  beforeEach(() => {
    // Limpar a tabela de usuários antes de cada teste
    console.log('Limpando a tabela de usuários...');
  });

  describe('createUser', () => {
    it('deve criar um novo usuário com sucesso', () => {
      // Lógica do teste...
      const user = { name: 'John Doe', email: 'john.doe@example.com' };
      expect(user).toHaveProperty('name', 'John Doe');
    });

    it('deve lançar um erro se o email já estiver em uso', () => {
      // Lógica do teste...
      // expect(() => createUser({ ... })).toThrow('Email already in use');
    });
  });
});
```

## Separação e Nomeação de Arquivos

Manter uma estrutura de arquivos consistente é crucial para a manutenibilidade do projeto.

- **Localização**: Coloque todos os seus arquivos de teste em um diretório `tests/` (ou `test/`) na raiz do projeto. Isso mantém os testes separados do código-fonte da aplicação.
- **Convenção de Nomenclatura**: Nomeie seus arquivos de teste com o sufixo `.test.ts` ou `.spec.ts`. O nome do arquivo deve corresponder ao módulo que está sendo testado.

### Exemplo de Estrutura de Arquivos

```
/
├── src/
│   ├── services/
│   │   └── userService.ts
│   └── routes/
│       └── auth.ts
├── tests/
│   ├── services/
│   │   └── userService.test.ts  // Testes para o userService
│   └── routes/
│       └── auth.test.ts         // Testes para as rotas de autenticação
├── package.json
└── vitest.config.ts
```

Esta estrutura espelha a estrutura do diretório `src/`, tornando fácil encontrar os testes para um arquivo específico. Vitest é configurado para encontrar e executar automaticamente arquivos que sigam essa convenção de nomenclatura.

## Testes Assíncronos

Para testar código assíncrono, use `async/await` em suas funções de teste. Vitest esperará que a promise seja resolvida.

```typescript
it('deve buscar um usuário da API', async () => {
  // Supondo que fetchUser é uma função que retorna uma promise
  const user = await fetchUser(1);
  expect(user.name).toBe('Leanne Graham');
});
```
