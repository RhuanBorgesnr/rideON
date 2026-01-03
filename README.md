# Lucro Ride — Documentação Técnica

**Visão Geral**
- Objetivo: registrar e analisar jornadas de trabalho, corridas, despesas e indicadores de lucro.
- Público-alvo: motoristas e usuários que acompanham desempenho diário/semanal.
- Problema resolvido: organização das informações operacionais (corridas/expenses) e geração de métricas consolidadas com backend persistente.

**Arquitetura**
- Visão geral:
  - Frontend (React Native + Expo) consome API REST via Axios.
  - Backend (Node.js + Express) expõe endpoints sob o prefixo /api.
  - ORM Prisma gerencia schema, migrations e acesso a PostgreSQL.
  - Infra com Docker para desenvolvimento local; deploy manual em Railway, banco em Neon/Supabase.
- Diagrama textual:
  - App (Expo) → Axios → Base URL (EXPO_PUBLIC_API_URL) → Express (/api/*) → Prisma Client → PostgreSQL
- Separação de responsabilidades:
  - App: telas, navegação, chamadas à API, armazenamento local mínimo.
  - Backend: controllers, serviços, repositórios, regra de domínio de WorkDay/Ride/Expense.
  - Banco: tabelas mapeadas via Prisma, constraints de relacionamento, índices.

**Stack Tecnológica**
- Frontend: React Native (Expo), Axios, Styled Components.
- Backend: Node.js 20, Express 5, TSX para execução TypeScript.
- Banco: PostgreSQL (provider do Prisma).
- Infra: Docker (Node 20-alpine), Docker Compose (api + postgres).
- Deploy: Railway (serviço de aplicação), banco gerenciado (Neon/Supabase).

**Estrutura de Pastas**
- Raiz do app (Expo):
  - `src/screens`: telas e estilos.
  - `src/services`: cliente de API central [api.ts](file:///Users/educat/wk/lucro-ride/src/services/api.ts) e serviços de negócio do app [WorkDayService.ts](file:///Users/educat/wk/lucro-ride/src/services/WorkDayService.ts).
  - `app.config.ts`: carrega variáveis EXPO_PUBLIC_*.
- Backend (`consolidated-backend`):
  - `src/app.ts`: montagem do Express e prefixo `/api` [app.ts](file:///Users/educat/wk/lucro-ride/consolidated-backend/src/app.ts).
  - `src/server.ts`: bootstrap e leitura de `PORT` [server.ts](file:///Users/educat/wk/lucro-ride/consolidated-backend/src/server.ts).
  - `src/controllers`: endpoints REST [WorkDayController.ts](file:///Users/educat/wk/lucro-ride/consolidated-backend/src/controllers/WorkDayController.ts), [RideController.ts](file:///Users/educat/wk/lucro-ride/consolidated-backend/src/controllers/RideController.ts).
  - `src/services`: regras de aplicação do backend [WorkDayService.ts](file:///Users/educat/wk/lucro-ride/consolidated-backend/src/services/WorkDayService.ts), [RideService.ts](file:///Users/educat/wk/lucro-ride/consolidated-backend/src/services/RideService.ts).
  - `src/repositories`: acesso aos modelos via Prisma.
  - `src/lib/prisma.ts`: inicialização do Prisma Client [prisma.ts](file:///Users/educat/wk/lucro-ride/consolidated-backend/src/lib/prisma.ts).
  - `schema.prisma`: definição do schema [schema.prisma](file:///Users/educat/wk/lucro-ride/consolidated-backend/schema.prisma).
  - `migrations/`: histórico de migrations geradas pelo Prisma.
  - `Dockerfile`, `docker-compose.yml`: imagens e orquestração local.

**Configuração do Ambiente Local**
- Backend
  - Requisitos: Node.js 20, npm; opcional Docker Desktop.
  - Variáveis (.env exemplo):

    ```env
    # somente para desenvolvimento local
    DATABASE_URL="postgresql://dev:dev@localhost:5433/lucro?schema=public&sslmode=prefer"
    # opcional
    PORT=3000
    ```

  - Comandos:
    - Instalação: `npm install` na pasta `consolidated-backend`
    - Gerar client Prisma: `npm run prisma:generate`
    - Desenvolvimento: `npm run dev`
    - Testes de API/fluxos: `npm run test`
  - Docker Compose (desenvolvimento):
    - `docker-compose up --build` dentro de `consolidated-backend`
    - Observação: ao usar Compose, ajuste `DATABASE_URL` para o serviço `postgres`:

      ```env
      DATABASE_URL="postgresql://postgres:postgres@postgres:5432/appdb?schema=public&sslmode=disable"
      ```

      Isso reflete `docker-compose.yml` [docker-compose.yml](file:///Users/educat/wk/lucro-ride/consolidated-backend/docker-compose.yml#L13-L22).
- Frontend (Expo)
  - Variáveis de ambiente (.env na raiz do projeto):

    ```env
    EXPO_PUBLIC_API_URL="http://127.0.0.1:3000/api"
    ```

    O cliente Axios normaliza para garantir `/api` no final [api.ts](file:///Users/educat/wk/lucro-ride/src/services/api.ts#L19-L25).
  - Comandos:
    - Instalação: `npm install` na raiz
    - Rodar: `npm run start` (ou `expo start`)
  - Observação de desenvolvimento:
    - Sem `EXPO_PUBLIC_API_URL`, o app cai para `http://<host>:3000/api` com resolução automática: Android usa `10.0.2.2`, iOS usa `127.0.0.1`.

**Banco de Dados (Prisma)**
- Schema: [schema.prisma](file:///Users/educat/wk/lucro-ride/consolidated-backend/schema.prisma) com provider `postgresql` e `env("DATABASE_URL")`.
- Migrations:
  - Desenvolvimento: `npm run prisma:migrate` (gera migration e aplica).
  - Produção: `npm run prisma:migrate:deploy` (aplica migrations existentes sem gerar novas).
  - Dockerfile executa `prisma generate` em build e `prisma migrate deploy` no start [Dockerfile](file:///Users/educat/wk/lucro-ride/consolidated-backend/Dockerfile#L10-L14).
- Boas práticas adotadas:
  - Separação de camadas (controllers/serviços/repositórios).
  - Índices e mapeamentos com @@map/@@index nos modelos.
  - Uso de variáveis de ambiente para conexão.
- O que não fazer em produção:
  - Não usar `prisma migrate dev` em produção.
  - Não alterar nomes de tabelas/campos já em uso sem migração planejada.
  - Não expor `DATABASE_URL` no repositório público.

**Docker**
- Papel do Dockerfile:
  - Imagem Node 20-alpine; instala dependências; gera Prisma Client; inicia servidor após aplicar migrations.
- Diferença dev vs prod:
  - Dev: pode usar `docker-compose` com Postgres local; recompile com `--build` quando necessário.
  - Prod: preferível usar Docker no provider (Railway) para garantir dependências (`tsx` está em devDependencies).
- Limitações em ambiente gratuito:
  - Cold starts, quotas de CPU/Memória.
  - Conexões ao banco podem exigir `sslmode=require` (Neon/Supabase).

**Deploy (Manual)**
- Backend (Railway)
  - Opção A: usar Docker
    - Crie um serviço a partir do repositório com Dockerfile.
    - Defina variáveis:
      - `DATABASE_URL` com string fornecida por Neon/Supabase (geralmente requer `sslmode=require`).
      - `PORT` (opcional, padrão 3000).
    - O container executa `prisma migrate deploy` e sobe o servidor (`npm run start`).
  - Opção B: sem Docker (buildpack)
    - Garanta que `tsx` esteja disponível; caso contrário, ajuste o comando de start para execução de JS compilado.
- Banco (Neon/Supabase)
  - Crie instância gratuita.
  - Copie a `DATABASE_URL` (com SSL) para o serviço do backend.
- App (Expo)
  - Configure `EXPO_PUBLIC_API_URL` com o domínio público do backend incluindo `/api`.
  - Publique com `expo publish` ou use EAS conforme necessidade (não automatizado aqui).

**Boas Práticas e Decisões Técnicas**
- Prisma: produtividade, tipagem forte e migrations consistentes.
- Docker: padronização do ambiente e previsibilidade de dependências.
- Expo: acelera desenvolvimento mobile e distribuição OTA.
- Trade-offs:
  - `tsx` em devDependencies exige Docker ou instalação em produção.
  - Compose requer ajuste de `DATABASE_URL` para hostname `postgres`.
  - Fallback de host no app simplifica dev, mas deve ser substituído por `EXPO_PUBLIC_API_URL` em produção.

**Troubleshooting**
- Erro de conexão SSL (Neon/Supabase):
  - Ajuste `DATABASE_URL` para incluir `sslmode=require`.
- API 404 no app:
  - Verifique se `EXPO_PUBLIC_API_URL` termina com `/api` (normalização cobre casos comuns).
- Android não acessa `localhost`:
  - Use `10.0.2.2` (já tratado automaticamente no fallback do app).
- Compose sem acesso ao banco:
  - Certifique-se de usar hostname `postgres` e porta `5432` na `DATABASE_URL`.
- Migrations não aplicadas:
  - Rode `npm run prisma:migrate:deploy` em ambientes gerenciados.

**Próximos Passos**
- Melhorias futuras:
  - Adicionar endpoint `/health` no backend para healthchecks.
  - Scripts de lint e typecheck no CI.
  - Ajustar start para build TS→JS em produção sem `tsx`.
- Escalabilidade:
  - Cache de consultas, índices adicionais conforme acesso real, observabilidade.
- Segurança:
  - `sslmode=require` em produção; política de secrets via provider.
- Monitoramento:
  - Logs estruturados e métricas básicas (requisições/latência/erros).

