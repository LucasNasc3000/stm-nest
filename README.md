# Storage Manager System - API v2.0
Sistema de controle de estoque e vendas desenvolvido para gerenciamento de micro e pequenas empresas do setor alimentício. Esta é uma API REST moderna construída com NestJS, TypeORM e PostgreSQL, oferecendo controle granular de acesso baseado em funções (RBAC - Role-Based Access Control).

## 🚀 Stack Tecnológica
- Runtime: Node.js
- Framework: NestJS 10
- ORM: TypeORM 0.3
- Banco de Dados: PostgreSQL
- Autenticação: JWT (Access + Refresh Tokens)
- Segurança: Helmet, CSRF Protection, Rate Limiting
- Validação: class-validator, class-transformer

## 📌 Status
👨‍💻 Desenvolvimento ativo

## 📋 Funcionalidades
### Insumos (Supplies)

- Cadastrar novos insumos com rastreamento de peso e quantidade
- Pesquisar insumos por nome, categoria, fornecedor, data de validade, preço
- Atualizar dados dos insumos (informações gerais e preços separadamente)
- Definir quantidade mínima de estoque (alertas automáticos)
- Histórico completo de movimentações
- Soft delete com campo is_active

### Produtos

- Criar produtos com ou sem receita (lista de insumos)
- Gerenciar receitas de produtos (ingredientes e quantidades)
- Atualizar produtos e suas receitas
- Controle de estoque automático ao usar insumos
- Soft delete com campo is_active
- Rastreamento de criação por funcionário

### Saídas (Outflows)

- Registrar saídas de insumos ou produtos
- Atualização automática de estoque
- Rastreamento por tipo (SUPPLY/PRODUCT)
- Pesquisa por data, hora, categoria, motivo, funcionário
- Validação de estoque disponível antes de registrar saída

### Vendas (Sales)

- Registrar vendas com múltiplos itens
- Atualizar dados da venda e preços
- Pesquisar por data, hora, cliente, endereço, funcionário
- Validação de estoque de produtos antes de finalizar venda

### Funcionários (Employees)

- Criar funcionários com funções (roles) específicas
- Atualizar dados próprios ou de outros (conforme permissão)
- Pesquisar por nome, email, função, situação
- Sistema de hierarquia (chefe/subordinados)
- Logs de autenticação

### Sistema de Autenticação

- Login com JWT (Access Token: 20min, Refresh Token: 24h)
- Rotação automática de refresh tokens com detecção de reuso
- Blacklist de tokens para logout
- Cookies HTTP-only com proteção CSRF
- Rate limiting específico para rotas de autenticação

## 🔐 Sistema de Permissões (RBAC)
O sistema usa Role-Based Access Control com duas entidades principais:
Roles (Funções)
Definem conjuntos de permissões que podem ser atribuídas a um cargo que será atribuído a um ou mais funcionários. Exemplos:

`admin` - Acesso total ao sistema<br>
`gerente` - Gerenciar produtos, insumos e vendas<br>
`vendedor` - Apenas registrar vendas e visualizar produtos<br>

### Permissions (Permissões)
Permissões são uma combinação de ação + recurso:<br>
<strong>Ações disponíveis:</strong><br>

`READ` - Visualizar<br>
`CREATE` - Criar<br>
`UPDATE` - Atualizar<br>
`DELETE` - Deletar<br>
`EDIT_PRICES` - Editar preços (controle específico)<br>

### Recursos disponíveis:

`EMPLOYEES` - Funcionários<br>
`PRODUCTS` - Produtos<br>
`SUPPLIES` - Insumos<br>
`OUTFLOWS` - Saídas<br>
`SALES` - Vendas<br>

<strong>Exemplo:</strong> Um funcionário com role "vendedor" pode ter as permissões:

`READ` + `PRODUCTS`<br>
`CREATE` + `SALES`<br>
`READ` + `SALES`<br>
<strong>Criando roles e permissões</strong><br>

```
// POST /roles
{
  "name": "vendedor",
  "permissions": [
    { "action": "READ", "resource": "PRODUCTS" },
    { "action": "CREATE", "resource": "SALES" },
    { "action": "READ", "resource": "SALES" }
  ]
}
```

## 🛡️ Recursos de Segurança
### CSRF Protection

- Double Submit Cookie pattern
- Token gerado automaticamente
- Validação em todas as requisições POST/PUT/PATCH/DELETE
- Desabilitado em desenvolvimento para facilitar testes

### Rate Limiting
- Limites configurados por tipo de operação:<br>

- auth: 5 requisições/minuto (login)
- write: 10 requisições/10 segundos (criação/atualização)
- read: 50 requisições/10 segundos (consultas)
- global: 100 requisições/minuto

### CORS

- Configurado para permitir credenciais
- Lista de origens permitidas configurável via `.env`
- Headers personalizados permitidos (X-CSRF-Token)

### Cookies Seguros

`httpOnly: true` para tokens de autenticação
`sameSite: 'none'` em produção (cross-domain)
`secure: true` apenas em HTTPS (produção)

## 📦 Instalação e Configuração
### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:<br>
```
# Node
NODE_ENV=development

# Database
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_NAME=controle_estoque
DATABASE_PASSWORD=sua_senha
DATABASE_AUTOLOADENTITIES=true
DATABASE_SYNCHRONIZE=false  # SEMPRE false em produção

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura_minimo_32_caracteres
JWT_TOKEN_AUDIENCE=localhost:3000
JWT_TOKEN_ISSUER=localhost:3000
JWT_TTL=1200                    # 20 minutos (em segundos)
JWT_REFRESH_TOKEN_TTL=86400     # 24 horas (em segundos)

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting (opcional - valores padrão já configurados)
THROTTLE_AUTH_LIMIT=5
THROTTLE_WRITE_LIMIT=10
THROTTLE_READ_LIMIT=50

# Port
PORT=3000
```
### Instalação - Modo Desenvolvimento

```
# 1. Clone o repositório
git clone https://github.com/LucasNasc3000/stm-nest.git
cd stm-nest

# 2. Instale as dependências
npm install

# 3. Configure o PostgreSQL
# Crie um banco de dados: CREATE DATABASE controle_estoque;

# 4. Execute as migrações
npm run migration:run

# 5. Inicie o servidor em modo desenvolvimento
npm run start:dev

# Servidor estará rodando em http://localhost:3000
```

### Scripts Disponíveis
```
# Desenvolvimento
npm run start:dev          # Inicia em modo watch
npm run start:debug        # Inicia em modo debug

# Produção
npm run build              # Compila o projeto
npm run start:prod         # Inicia versão compilada

# Migrações
npm run migration:generate # Gera nova migração
npm run migration:run      # Executa migrações pendentes
npm run migration:revert   # Reverte última migração

# Testes
npm run test              # Testes unitários
npm run test:e2e          # Testes end-to-end
npm run test:cov          # Cobertura de testes

# Qualidade de Código
npm run lint              # ESLint
npm run format            # Prettier
```

## 🗄️ Estrutura do Banco de Dados
### Principais Entidades

- Employee: Funcionários do sistema
- Role: Funções/cargos
- Permission: Permissões granulares
- SupplyRealTime: Estoque atual de insumos
- SupplyHistory: Histórico de movimentações de insumos
- Product: Produtos cadastrados
- ProductIngredient: Receitas dos produtos
- Outflow: Saídas de estoque
- Sale: Vendas realizadas
- SaleItems: Itens de cada venda
- RefreshTokenEmployee: Tokens de autenticação
- JWTBlacklist: Tokens invalidados
- LogEmployee: Logs de acesso


### 🔄 Migrações
As migrações já estão no repositório. Para criar uma nova:<br>
```
# 1. Modifique suas entities
# 2. Gere a migração
npm run migration:generate

# 3. Revise o arquivo gerado em migrations/
# 4. Execute a migração
npm run migration:run
```

### 📚 Endpoints Principais
```
### Autenticação

POST   /auth              - Login
POST   /auth/logout       - Logout
POST   /refresh           - Renovar tokens


### Funcionários

POST   /employees                    - Criar funcionário
GET    /employees/search/email/:email
GET    /employees/search/name
GET    /employees/search/role
PATCH  /employees/update/self/:id
PATCH  /employees/update/admin/:id


### Funções e Permissões

POST   /roles             - Criar role
PATCH  /roles/:id         - Atualizar role


### Insumos

POST   /supplies          - Criar insumo
GET    /supplies/search/:campo
PATCH  /supplies/:id      - Atualizar insumo


### Produtos

POST   /products/create/withRecipe
POST   /products/create/withoutRecipe
GET    /products/search/:campo
PATCH  /products/update/general/:id
PATCH  /products/update/price/:id


### Saídas

POST   /outflows/create/supply
POST   /outflows/create/product
GET    /outflows/search/:campo


### Vendas
POST   /sales
GET    /sales/search/:campo
PATCH  /sales/:id
```
Todas as rotas (exceto `/auth` e `/refresh`) exigem autenticação via JWT e permissões adequadas. Para testar uma rota sem autenticação use o decorator @Public() e caso queira pular a verificação de csrf use o @SkipCsrf(). ambos em `src/auth/decorators/`

## 📝 Notas da Versão 2.0
### Mudanças Principais da v1.0 → v2.0

- Framework: Express → NestJS
- ORM: Sequelize → TypeORM
- Banco: MySQL → PostgreSQL
- Permissões: Strings hardcoded → RBAC com entidades
- Autenticação: JWT simples → JWT + Refresh Tokens + CSRF
- Validação: Removido campo CPF (desnecessário para o contexto)
- Soft Delete: deletedAt → is_active (apenas Product e SupplyRealTime)
- Segurança: Adicionado rate limiting, helmet, CORS configurável
- Arquitetura: Monolítico → Modular (NestJS modules)
