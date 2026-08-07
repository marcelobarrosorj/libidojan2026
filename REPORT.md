# Relatório de Auditoria do Schema Supabase

## 1. Estado Atual

### Tabela `users`
- **Status**: Existe no schema `public`.
- **Colunas Encontradas**: `user_id`, `email`, `nickname`, `photo_url`, `bio`, `age`, `gender`, `plan`, `status`.
- **PK e FK**: O script de migração indica que `user_id` é chave estrangeira referenciando `auth.users(id)`.
- **Gatilhos (Triggers)**: Existe o trigger `on_auth_user_created` rodando a função `handle_new_user` para criar o perfil automaticamente.
- **RLS (Policies)**: Ativado. Políticas limitam SELECT, INSERT, UPDATE, DELETE ao próprio usuário (`auth.uid() = user_id`).

### Tabela `messages` (Chat)
- **Status**: Existe no schema `public`.
- **Colunas Encontradas**: `id`, `sender_id`, `receiver_id`, `content`, `created_at`.
- **Relacionamentos**: **NÃO** há constraint de Foreign Key mapeada no PostgREST entre `messages` (via `sender_id` ou `receiver_id`) e `public.users`. 
- **RLS**: Ativado (operações anon violam política de segurança, exigindo token validado).
- **Realtime**: A aplicação se inscreve via `supabase.channel`, mas depende do backend ter ativado essa tabela no `pg_publication`.

### Tabela `posts` (Feed)
- **Status**: **NÃO EXISTE** (`Could not find the table 'public.posts'`).

### Tabelas `admin` (`reports` e `admin_logs`)
- **Status**: **NÃO EXISTEM** (`Could not find the table...`).

### Storage (Buckets)
- **Status**: O bucket `photos` existe (testes de upload confirmam), mas sem verificação aprofundada de policies, ele atualmente permite uploads anônimos (ou as policies baseadas no frontend estão permissivas).

## 2. Inconsistências Frontend vs Banco de Dados

1. **Campos Faltantes na Tabela `users`**: 
   O frontend (`types.ts` e `dataProvider.ts`) espera colunas que não existem no banco: `id` (mapeado de `user_id`), `name`, `username`, `location`, `role`, `is_banned`, `is_deleted`, `followers`, `created_at`.
   Sem elas, a listagem e os estados internos do app ficam corrompidos assim que deixarem de usar Mocks.

2. **Supabase Realtime**:
   Tabelas como `messages` e (futuramente) `posts` e `admin_logs` precisam estar inclusas no `supabase_realtime` publication, caso contrário o evento `postgres_changes` no frontend (`chat.ts` / `posts.ts`) nunca disparará.

3. **Referências Legadas ao Firebase**:
   Existem estruturas de campos no front (como `status` na interface `Message`) que foram limpas da tabela no banco, mas precisam de sincronia estrutural.

## 3. Riscos

1. **Perda/Falha de Dados no Feed e Admin**: O usuário não poderá carregar ou criar posts e relatórios, resultando em tela vazia ou quebra silenciosa (catch console.error).
2. **Crash de Consistência (Chat)**: A falta de relacionamentos ForeignKey em `messages` inviabiliza fazer selects avançados como `.select('*, users(*)')`.
3. **Escalada de Privilégios/Poluição no Storage**: Se o bucket `photos` continuar permitindo inserts anônimos (se for o caso) pode ser alvo de sobrecarga maliciosa.

## 4. Ordem Recomendada das Próximas Alterações

1. **Schema DDL (SQL)**:
   - Criar as tabelas `posts`, `reports`, `admin_logs`.
   - Adicionar as colunas faltantes na tabela `users` (`name`, `username`, `location`, `role`, `is_banned`, `is_deleted`, `followers`, `created_at`).
   - Adicionar as Constraints (Foreign Keys) na tabela `messages` referenciando `public.users`.
2. **Realtime**:
   - Rodar `ALTER PUBLICATION supabase_realtime ADD TABLE messages, posts, admin_logs;` no Supabase.
3. **RLS (Security)**:
   - Refinar policies para `posts`, `messages`, `reports` e restringir buckets de Storage, além de bloquear uploads não autorizados.
4. **Refatoração Frontend**:
   - Ajustar interfaces em `types.ts` para que estejam 100% refletindo as novas colunas e constraints.
