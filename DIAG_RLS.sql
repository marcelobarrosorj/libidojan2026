-- ==============================================================
-- TESTE DECISIVO: o que a RLS devolve para um usuario real
-- Nao altera nada. Termina em ROLLBACK.
-- ==============================================================

-- PASSO 1: descobrir um usuario que participa de conversas.
-- Rode so esta parte primeiro, copie o uuid e cole no PASSO 2.
SELECT sender_id AS uuid_sugerido, count(*) AS mensagens_enviadas
FROM public.messages
GROUP BY sender_id
ORDER BY mensagens_enviadas DESC
LIMIT 5;

-- ==============================================================
-- PASSO 2: substitua COLE-O-UUID-AQUI pelo uuid do passo 1 e rode
-- o bloco inteiro de uma vez.
-- ==============================================================
BEGIN;

SELECT set_config(
  'request.jwt.claims',
  json_build_object('sub','COLE-O-UUID-AQUI','role','authenticated')::text,
  true
);

SET LOCAL ROLE authenticated;

-- a) quantas mensagens esse usuario enxerga
SELECT count(*) AS mensagens_visiveis
FROM public.messages;

-- b) quantas conversas distintas isso representa
SELECT count(DISTINCT
         CASE WHEN sender_id = auth.uid()::text
              THEN receiver_id ELSE sender_id END) AS conversas_visiveis
FROM public.messages
WHERE sender_id = auth.uid()::text OR receiver_id = auth.uid()::text;

-- c) quantas ele DEVERIA ver (sem RLS, como referencia)
SELECT count(*) AS mensagens_esperadas
FROM public.messages
WHERE sender_id = auth.uid()::text OR receiver_id = auth.uid()::text;

ROLLBACK;