-- ==========================================================
-- LIBIDO | DIAGNOSTICO DO CHAT
-- Cole o resultado no chat
-- ==========================================================

-- 1) COLUNAS DA TABELA DE MENSAGENS
select column_name, data_type, is_nullable
  from information_schema.columns
 where table_schema = 'public'
   and table_name in ('messages','mensagens','chat_messages')
 order by ordinal_position;

-- 2) EXISTE CAMPO DE VISUALIZACAO UNICA?
select table_name, column_name
  from information_schema.columns
 where table_schema = 'public'
   and column_name in ('view_once','viewed_at','read_at','expires_at','opened_at');

-- 3) MENSAGENS DUPLICADAS (mesma url, mesmo remetente, mesmo minuto)
select sender_id, media_url, date_trunc('minute', created_at) as minuto, count(*) as repeticoes
  from public.messages
 where media_url is not null
 group by 1,2,3
having count(*) > 1
 order by repeticoes desc limit 20;

-- 4) TABELAS DE CONVERSA
select table_name from information_schema.tables
 where table_schema = 'public'
   and table_name in ('conversations','conversas','chats','chat_participants');