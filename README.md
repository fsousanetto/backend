# 📊 Organizador Financeiro 📈 

> Um sistema simples e eficiente para gerenciar suas finanças pessoais! 💰💡  

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-blue?style=flat-square&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-ORM-brightgreen?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue?style=flat-square&logo=postgresql)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange?style=flat-square&logo=jsonwebtokens)

**API REST robusta para gerenciamento financeiro pessoal**

*Autenticação • Transações • Categorias • Carteiras*

</div>

---

## 📑 Índice

- [🚀 Início Rápido](#-início-rápido)
- [⚙️ Configuração](#️-configuração)
- [🛠️ Instalação](#️-instalação)
- [🔧 Variáveis de Ambiente](#-variáveis-de-ambiente)
- [▶️ Execução](#️-execução)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [🌐 API Endpoints](#-api-endpoints)
- [🔐 Autenticação](#-autenticação)
- [🔗 Google OAuth2](#-google-oauth2)
- [📋 Exemplos de Uso](#-exemplos-de-uso)
- [✨ Boas Práticas](#-boas-práticas)
- [🤝 Contribuição](#-contribuição)

---

## 🚀 Início Rápido

> **Pré-requisitos**: Node.js 18+, PostgreSQL 12+, npm/yarn

```bash
git clone https://github.com/seu-usuario/backend.git
cd backend
npm install
cp .env.example .env 
npx prisma generate && npx prisma migrate dev
npm run dev
```

---

## ⚙️ Configuração

### 📋 Requisitos do Sistema

| Tecnologia | Versão Mínima | Descrição |
|------------|---------------|-----------|
| **Node.js** | `18.x+` | Runtime JavaScript |
| **PostgreSQL** | `12+` | Banco de dados relacional |
| **Prisma** | `Latest` | ORM e migrations |

### 🔧 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
🗄️ Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/seu-db"

🔐 Segurança
JWT_SECRET="sua_chave_super_secreta_aqui"

🌐 Google OAuth2
GOOGLE_CLIENT_ID="seu_google_client_id.apps.googleusercontent.com"

🚀 Servidor
PORT=3000
CORS_ORIGIN="http://..."
```

> ⚠️ **Importante**: Nunca commite o arquivo `.env` com dados reais!

---

## ▶️ Execução

### 🔧 Desenvolvimento

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 🌱 Dados Iniciais (Seed)

```bash
node prisma/seed.js
```

### 📊 Visualizar Banco de Dados

```bash
npx prisma studio
```

---

## 📁 Estrutura do Projeto

```
backend/
├── 📂 prisma/
│   ├── 📄 schema.prisma          # Schema do banco
│   ├── 📄 seed.js               # Dados iniciais
│   └── 📂 migrations/           # Histórico de migrações
├── 📂 src/
│   ├── 📂 controllers/          # Lógica de negócio
│   │   ├── 🔐 authController.js
│   │   ├── 👤 userController.js
│   │   ├── 🏷️ categoryController.js
│   │   ├── 💳 transactionsController.js
│   │   └── 💰 walletController.js
│   ├── 📂 middlewares/          # Middlewares personalizados
│   │   └── 🛡️ authMiddleware.js
│   ├── 📂 routes/               # Definição de rotas
│   │   ├── 🔗 routes.js
│   │   ├── 🔐 authRoutes.js
│   │   ├── 👤 userRoutes.js
│   │   ├── 🏷️ categoriesRoutes.js
│   │   ├── 💳 transactionRoutes.js
│   │   └── 💰 walletRoutes.js
│   └── 🚀 server.js            # Inicialização do servidor
├── 🔧 .env                     # Variáveis de ambiente
├── 📦 package.json            # Dependências do projeto
└── 📚 README.md              # Esta documentação
```

---

## 🌐 API Endpoints

### 🔐 **Autenticação**

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `POST` | `/api/auth/login` | Login com email/senha | ❌ |
| `POST` | `/api/auth/login/google` | Login com Google OAuth2 | ❌ |
| `POST` | `/api/auth/refresh` | Renovar JWT com refresh token | ❌ |
| `POST` | `/api/auth/logout` | Logout do usuário | ✅ |

### 👤 **Usuários**

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `POST` | `/api/users` | Criar novo usuário | ❌ |
| `GET` | `/api/users/me` | Dados do usuário autenticado | ✅ |

### 🏷️ **Categorias**

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `GET` | `/api/categories` | Listar todas as categorias | ✅ |
| `POST` | `/api/categories` | Criar nova categoria | ✅ |
| `PUT` | `/api/categories/:id` | Atualizar categoria | ✅ |
| `DELETE` | `/api/categories/:id` | Remover categoria | ✅ |

### 💳 **Transações**

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `GET` | `/api/transactions` | Listar transações do usuário | ✅ |
| `GET` | `/api/transactions/recent` | Últimas 5 transações | ✅ |
| `GET` | `/api/transactions/history` | Histórico agrupado por categoria | ✅ |
| `POST` | `/api/transactions` | Criar nova transação | ✅ |
| `PUT` | `/api/transactions/:id` | Atualizar transação | ✅ |
| `DELETE` | `/api/transactions/:id` | Remover transação | ✅ |

### 💰 **Carteiras**

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `GET` | `/api/wallet/balance` | Obter saldo atual | ✅ |
| `GET` | `/api/wallet/statement` | Extrato completo | ✅ |

---

## 🔐 Autenticação

### 🎯 **Fluxo de Autenticação**

```mermaid
sequenceDiagram
    participant C as Cliente
    participant A as API
    participant G as Google
    participant DB as Database

    C->>A: POST /auth/login/google {idToken}
    A->>G: Validar idToken
    G-->>A: Dados do usuário
    A->>DB: Criar/Atualizar usuário
    A-->>C: {jwt, refreshToken, user}
    
    Note over C: Salvar tokens
    
    C->>A: GET /users/me (Authorization: Bearer jwt)
    A-->>C: Dados do usuário
```

### 🔑 **Headers de Autenticação**

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 🔄 **Renovação de Token**

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "seu_refresh_token_aqui"
}
```

---

## 🔗 Google OAuth2

### 🚀 **Configuração**

1. **Criar projeto no Google Cloud Console**
2. **Ativar Google+ API**
3. **Configurar OAuth consent screen**
4. **Criar credenciais OAuth 2.0**
5. **Adicionar GOOGLE_CLIENT_ID no .env**

### 🔄 **Fluxo de Integração**

```
Frontend (Angular) → Obtém idToken do Google
       ↓
Backend → Valida idToken com Google APIs
       ↓
Backend → Cria/Atualiza usuário no banco
       ↓
Backend → Retorna JWT próprio + refresh token
```

---

## 📋 Exemplos de Uso

### 🔐 **Login com Google**

```http
POST /api/auth/login/google
Content-Type: application/json

{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjY4M..."
}
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "def50200a1b2c3d4e5f6...",
  "user": {
    "id": "uuid-4",
    "name": "João Silva",
    "email": "joao@example.com",
    "avatar": "https://lh3.googleusercontent.com/..."
  }
}
```

### 🏷️ **Listar Categorias**

```http
GET /api/categories
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Resposta:**

```json
[
  {
    "id": "uuid-1",
    "name": "Alimentação",
    "type": "expense",
    "createdAt": "2025-07-04T10:00:00.000Z"
  },
  {
    "id": "uuid-2", 
    "name": "Salário",
    "type": "income",
    "createdAt": "2025-07-04T10:00:00.000Z"
  }
]
```

### 💳 **Criar Transação**

```http
POST /api/transactions
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "type": "expense",
  "category": "uuid-1",
  "amount": 127.50,
  "date": "2025-07-04",
  "description": "Supermercado Pão de Açúcar"
}
```

**Resposta:**

```json
{
  "id": "uuid-3",
  "userId": "uuid-4",
  "type": "expense",
  "categoryId": "uuid-1",
  "amount": 127.50,
  "date": "2025-07-04T00:00:00.000Z",
  "description": "Supermercado Pão de Açúcar",
  "createdAt": "2025-07-04T14:30:00.000Z"
}
```

### 💰 **Consultar Saldo**

```http
GET /api/wallet/balance
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Resposta:**

```json
{
  "balance": 2750.25
}
```

---

## ✨ Boas Práticas

### 🔒 **Segurança**

- ✅ **Nunca** exponha o arquivo `.env` ou dados sensíveis
- ✅ Use **HTTPS** em produção 
- ✅ Implemente **rate limiting** para APIs públicas
- ✅ Valide e sanitize **todas as entradas** do usuário
- ✅ Use tokens JWT com **tempo de expiração curto**

### 🧹 **Código Limpo**

- ✅ Mantenha **dependências atualizadas**
- ✅ Use **ESLint** e **Prettier** para formatação
- ✅ Implemente **logs estruturados** 
- ✅ Escreva **testes unitários** e de integração
- ✅ Documente **endpoints** e fluxos complexos

### 🚀 **Performance**

- ✅ Use **conexão pooling** no banco de dados
- ✅ Implemente **cache** em endpoints frequentes
- ✅ Otimize **queries** do Prisma
- ✅ Configure **compressão gzip**
- ✅ Monitore **métricas** de performance

### 🔧 **DevOps**

- ✅ Use **Docker** para containerização
- ✅ Configure **CI/CD** pipelines
- ✅ Implemente **health checks**
- ✅ Use **variáveis de ambiente** para configuração
- ✅ Configure **backup automático** do banco

---

## 🤝 Contribuição

### 🎯 **Como Contribuir**

1. **Fork** o repositório
2. Crie uma **branch** para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um **Pull Request**

### 🐛 **Reportar Bugs**

- Use o template de **issue** do GitHub
- Inclua **passos para reproduzir** o problema
- Adicione **logs** e **screenshots** se necessário
- Especifique **versão** do Node.js e dependências

### 💡 **Sugerir Melhorias**

- Abra uma **issue** com label `enhancement`
- Descreva **claramente** a funcionalidade desejada
- Explique **por que** seria útil
- Sugira **implementação** se possível

---

<div align="center">

### 🎉 **Projeto criado com 💜 por [Francisco Moreira](https://www.linkedin.com/in/francisco-sousa1/)**

**🛠️ Em constante desenvolvimento** • **🚀 Novas features em breve**

---

*⭐ Se este projeto te ajudou, considere deixar uma estrela!*

</div>
