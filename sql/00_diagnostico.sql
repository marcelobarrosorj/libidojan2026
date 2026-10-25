-- ============================================================
-- PASSO 0: DIAGNOSTICO
-- Rode este bloco primeiro e veja a lista de colunas.
-- ============================================================

select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'users'
order by ordinal_position;

-- Quantos perfis existem e quantos estao ativos hoje
select count(*) as total,
       count(*) filter (where is_online = true) as online_agora
from public.users;