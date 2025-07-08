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

## 🛠️ Arquitetura e Conceitos Avançados

### SSR (Server-side Rendering)
- Utilizado em páginas sensíveis a dados do usuário, como o dashboard (`src/app/dashboard/page.tsx`) e rotas dinâmicas (`src/app/quests/[id]/page.tsx`, `src/app/users/[id]/page.tsx`, `src/app/factions/[id]/page.tsx`).
- Busca dados no servidor, garantindo segurança, performance e SEO.
- Exemplo: O dashboard busca estatísticas do usuário no servidor e passa como props para o componente.

### CSR (Client-side Rendering)
- Utilizado em componentes de visualização e formulários interativos, como `QuestVisualizer`, `QuestNodesView` e `NewQuestForm`.
- Dados são buscados e mutados no client-side usando React Query, garantindo experiência fluida e responsiva.
- Usuários FREE usam localStorage, enquanto PREMIUM usam API.

### Rotas e Páginas Dinâmicas com API Routes
- Rotas dinâmicas para quests, usuários e facções: `/quests/[id]`, `/users/[id]`, `/factions/[id]`.
- API Routes RESTful para CRUD completo: `src/app/api/quests`, `src/app/api/quests/[id].ts`, `src/app/api/users`, `src/app/api/users/[id].ts`, `src/app/api/factions`, `src/app/api/factions/[id].ts`.
- O frontend consome essas rotas via React Query.

### Autenticação com NextAuth
- Configurada em `src/app/api/auth` e usada globalmente via `SessionProvider` em `src/app/layout.tsx`.
- Middleware (`src/middleware.ts`) protege todas as rotas sensíveis, redirecionando não autenticados para `/auth/signin`.
- Sessão disponível em SSR e CSR.

### Gerenciamento de Estado com React Query
- Todos os fluxos de dados (fetch, mutação, cache) usam hooks customizados em `src/hooks/use-quest-api.ts`.
- O cache é invalidado automaticamente após mutações.
- O estado global de dados de API é padronizado e centralizado.

### Boas Práticas
- SSR para páginas sensíveis, CSR para interatividade.
- API Routes RESTful para todas as entidades.
- Hooks customizados para padronizar acesso a dados.
- Middleware para segurança.
- Documentação e exemplos no código.

---

## 👥 Contribuindo
- Siga os padrões de SSR/CSR e use sempre React Query para dados de API.
- Novas entidades devem ter API Route, hook customizado e página dinâmica.
- Proteja rotas sensíveis com autenticação.
- Mantenha o README atualizado com novas práticas.

---
