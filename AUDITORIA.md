# Auditoria Pós-Migração

## 1. Mocks Restantes
Existem múltiplos componentes baseando-se parcialmente ou totalmente em `mockData` / `appMocks.ts`:
- **Feed.tsx**: usa `mockFeed` e `mockUsers` de `../mocks/appMocks`.
- **Chat.tsx**: usa constantes internas `mockContacts` e `mockMessages`.
- **Events.tsx** / **Groups.tsx** / **Forum.tsx**: usam constantes mockadas hardcoded locais.
- **Top.tsx**: usa `useSupabaseData('users', baseMockUsers)`, que faz fallback para mock se falhar, não usando o service `users.ts`.
- **AdminPanel.tsx**: usa `useSupabaseData` e `mockUsers`, falhando na gestão real de admin.
- **PixCheckout.tsx**: importando `CURRENT_USER_ID` do `mockData.ts`.

## 2. Tabelas Não Conectadas
- **posts**: Apesar da tabela existir e o `posts.ts` existir, o `Feed.tsx` ainda não consome o service.
- **reports** / **admin_logs**: Tabela pronta e policies ajustadas, mas o `AdminPanel.tsx` usa fallback para `[]` via `useSupabaseData`.
- **events**, **groups**, **forum_threads**: Estas tabelas/entidades **não existem no banco de dados** e precisarão ser desenhadas antes de conectar o frontend.

## 3. Serviços Ignorados
Os seguintes arquivos de service implementam lógica real (Supabase), mas não estão sendo importados pelos componentes chave:
- `src/services/posts.ts` (ignorado pelo Feed.tsx)
- `src/services/chat.ts` (ignorado pelo Chat.tsx)

## 4. Legado e Inconsistências
- **Tipagem (types.ts)**: A interface `User` mistura propriedades reais (`user_id`, `nickname`) com as legadas do firebase/mock (`id`, `name`, `username`). Componentes usando `.find(u => u.id === id)` vão quebrar se a lista vier do Supabase usando apenas `user_id`.
- **DataProvider Legado**: O `useSupabaseData` em `src/data/dataProvider.ts` tenta misturar sincronização Local/Mock/Supabase e deve ser removido em favor do uso direto dos services + `useEffect` (ou uma store/React Query).

## Ordem Recomendada das Próximas Migrações
1. **Unificação de Tipos**: Ajustar `types.ts` e `services` para usarem exatamente os nomes de coluna do schema atual do Supabase (ex: resolver o conflito de `id` vs `user_id` em `User`).
2. **Conectar Feed e Chat**: Refatorar `Feed.tsx` e `Chat.tsx` para importarem os métodos assíncronos e subscrições Realtime de `posts.ts` e `chat.ts`, removendo referências mockadas.
3. **Conectar Top Ranking e Admin**: Refatorar `Top.tsx` e `AdminPanel.tsx` removendo a dependência de `dataProvider.ts`, efetuando queries reais no `users.ts`.
4. **Novas Tabelas (Events, Groups, Forum)**: Criar as tabelas, RLS e services necessários para substituir as constantes temporárias nos componentes faltantes.
5. **Limpeza Geral**: Deletar permanentemente as pastas e arquivos de mocks.
