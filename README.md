# Quest Visualizer - Next.js

Uma aplicação completa para criação e visualização de quests/missões com autenticação, diferentes planos de usuário e persistência de dados.

## 🚀 Funcionalidades

### Autenticação
- **NextAuth** com suporte a Google e GitHub OAuth
- Sessões persistentes no banco de dados
- Redirecionamento automático para login

### Planos de Usuário
- **Plano Free**: Dados salvos no localStorage do navegador
- **Plano Premium**: Dados salvos na nuvem (SQLite via Prisma)
- Interface diferenciada baseada no plano do usuário

### Gestão de Quests
- ✅ Criar, editar e excluir quests
- ✅ Sistema de pré-requisitos entre quests
- ✅ Organização por facções e tipos
- ✅ Campo de diálogo para cada quest
- ✅ Sistema de reputação por facção

### Tecnologias
- **Next.js 14** (App Router)
- **TypeScript**
- **NextAuth** para autenticação
- **Prisma** + **SQLite** para banco de dados
- **React Query** para gerenciamento de estado
- **Tailwind CSS** + **Shadcn/ui** para estilização
- **Radix UI** para componentes acessíveis

## 📦 Instalação e Setup

### 1. Clone e Instale

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd quest-visualizer-nextjs

# Instale as dependências
npm install
```

### 2. Configuração do Ambiente

Copie o arquivo de exemplo e configure as variáveis:

```bash
cp .env.local.example .env.local
```

Edite o arquivo `.env.local`:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua-chave-secreta-super-forte-aqui

# Google OAuth (Para Google Cloud Console)
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret

# GitHub OAuth (Para GitHub Apps)
GITHUB_CLIENT_ID=seu-github-client-id
GITHUB_CLIENT_SECRET=seu-github-client-secret

# Database
DATABASE_URL="file:./dev.db"
```

### 3. Setup do Banco de Dados

```bash
# Gere o cliente Prisma
npx prisma generate

# Crie o banco de dados
npx prisma db push

# Execute o seed (dados iniciais)
npm run db:seed
```

### 4. Execute o Projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🗄️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa linting

# Banco de Dados
npm run db:push      # Aplica mudanças do schema
npm run db:seed      # Executa seed de dados iniciais
npm run db:studio    # Abre Prisma Studio (interface visual)

# Utilitários
npm run type-check   # Verifica tipos TypeScript
```

## 🎯 Funcionalidades Implementadas

✅ **Autenticação completa**
- NextAuth com Google e GitHub
- Sessões persistentes
- Middleware de proteção

✅ **Sistema de planos**
- FREE vs PREMIUM
- Interface diferenciada
- Armazenamento condicional

✅ **CRUD de Quests**
- Criar, editar, excluir
- Requisitos entre quests
- Campos personalizados

✅ **Gerenciamento de dados**
- LocalStorage para FREE
- API + Banco para PREMIUM
- React Query para cache

✅ **Interface moderna**
- Tailwind CSS
- Componentes Shadcn/ui
- Design responsivo

## 🚀 Como Executar

1. **Clone o projeto**
2. **Configure `.env.local`** (copie de `.env.local.example`)
3. **Instale dependências**: `npm install`
4. **Setup banco**: `npm run db:push && npm run db:seed`
5. **Execute**: `npm run dev`

Projeto estará rodando em http://localhost:3000
