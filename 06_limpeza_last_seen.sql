-- Quantas linhas estao contaminadas com o timestamp do backfill
SELECT count(*) AS contaminadas
FROM public.users
WHERE last_seen = '2026-11-02 15:48:42.137435+00'::timestamptz;

-- Zera APENAS o timestamp do backfill. Preserva historico real.
UPDATE public.users
SET last_seen = NULL, is_online = false
WHERE last_seen = '2026-11-02 15:48:42.137435+00'::timestamptz;

-- Qual fonte esta viva
SELECT 'user_presence' AS fonte,
       count(*) AS registros,
       max(last_seen_at) AS mais_recente,
       now() - max(last_seen_at) AS idade
FROM public.user_presence
UNION ALL
SELECT 'users.last_seen',
       count(*) FILTER (WHERE last_seen IS NOT NULL),
       max(last_seen),
       now() - max(last_seen)
FROM public.users;

-- Resultado final
SELECT count(*) AS linhas_presenca,
       count(*) FILTER (WHERE online) AS online_agora
FROM public.presenca_publica;