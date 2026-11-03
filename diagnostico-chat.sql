-- 1. RLS esta ativo?
SELECT relname AS tabela, relrowsecurity AS rls_ativo, relforcerowsecurity AS rls_forcado
FROM pg_class
WHERE relname IN ('messages','users','conversas_ocultas','mensagens_ocultas');

-- 2. sender_id e receiver_id existem em users?
SELECT
  (SELECT count(*) FROM public.messages) AS total_mensagens,
  (SELECT count(DISTINCT sender_id) FROM public.messages) AS remetentes_distintos,
  (SELECT count(*) FROM public.messages m
     JOIN public.users u ON u.user_id::text = m.sender_id) AS sender_casa_com_users,
  (SELECT count(*) FROM public.messages m
     JOIN public.users u ON u.user_id::text = m.receiver_id) AS receiver_casa_com_users;

-- 3. Tipo real das colunas
SELECT column_name, data_type, udt_name, is_nullable
FROM information_schema.columns
WHERE table_schema='public' AND table_name='messages'
ORDER BY ordinal_position;

-- 4. Amostra real
SELECT id, sender_id, receiver_id, left(content, 40) AS trecho, created_at, status
FROM public.messages
ORDER BY created_at DESC
LIMIT 10;

-- 5. auth.uid() no editor (retorna NULL: e esperado no SQL Editor)
SELECT auth.uid() AS auth_uid_no_editor;

-- 6. Politicas atuais
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname='public' AND tablename='messages'
ORDER BY policyname;

-- 7. Usuarios: comparar user_id com id de auth.users
SELECT
  (SELECT count(*) FROM public.users) AS usuarios_tabela,
  (SELECT count(*) FROM public.users u
     JOIN auth.users a ON a.id::text = u.user_id::text) AS user_id_casa_com_auth
FROM (SELECT 1) AS t;