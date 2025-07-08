# 🚀 Deployment Guide - Quest Visualizer

## Vercel Deployment

### 1. Preparação Local

```bash
# Instale o Vercel CLI se não tiver
npm i -g vercel

# Faça login no Vercel
vercel login
```

### 2. Configuração das Variáveis de Ambiente

No painel do Vercel ou via CLI, configure as seguintes variáveis:

#### Produção (vercel.com dashboard):
```
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-super-strong-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
DATABASE_URL=postgresql://username:password@host:port/database
```

#### Via CLI:
```bash
# Configurar variáveis de ambiente
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add GITHUB_CLIENT_ID
vercel env add GITHUB_CLIENT_SECRET
vercel env add DATABASE_URL
```

### 3. Deploy

```bash
# Deploy para preview
vercel

# Deploy para produção
vercel --prod
```

### 4. Database Setup (Supabase)

1. Acesse [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Copie a connection string do PostgreSQL
4. Configure como `DATABASE_URL` no Vercel

### 5. OAuth Setup

#### Google OAuth:
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie/selecione um projeto
3. Configure OAuth 2.0 credentials
4. Adicione suas URLs autorizadas:
   - `https://your-project.vercel.app/api/auth/callback/google`

#### GitHub OAuth:
1. Acesse [GitHub Developer Settings](https://github.com/settings/developers)
2. Crie uma nova OAuth App
3. Configure:
   - Homepage URL: `https://your-project.vercel.app`
   - Callback URL: `https://your-project.vercel.app/api/auth/callback/github`

### 6. Verificação

Após o deploy, verifique:

- [ ] NextAuth funciona (login/logout)
- [ ] Database conecta (check logs)
- [ ] APIs respondem corretamente
- [ ] Build completa sem erros

### 7. Troubleshooting

#### Build Failures:
```bash
# Testar build localmente
npm run build

# Verificar logs do Vercel
vercel logs your-deployment-url
```

#### Database Issues:
```bash
# Verificar conexão
npx prisma db push

# Gerar cliente
npx prisma generate
```

### 8. Comandos Úteis

```bash
# Ver deployments
vercel ls

# Ver logs em tempo real
vercel logs --follow

# Remover deployment
vercel rm deployment-url

# Listar variáveis de ambiente
vercel env ls
```

## Estrutura do Build

O Vercel automaticamente:

1. Detecta Next.js framework
2. Executa `npm install` 
3. Executa `npm run vercel-build` (que inclui `prisma generate && next build`)
4. Otimiza para produção
5. Deploy nas edge locations

## Configurações Importantes

- **Framework Detection**: Automática para Next.js
- **Build Command**: `npm run vercel-build` (customizado no package.json)
- **Output Directory**: `.next` (automático)
- **Install Command**: `npm install` (automático)
- **Node Version**: 18.x (recomendado)
