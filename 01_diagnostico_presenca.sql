-- 1. Comparar as duas fontes de presenca
SELECT 'user_presence' AS fonte,
       count(*) AS registros,
       max(last_seen_at) AS mais_recente,
       now() - max(last_seen_at) AS idade,
       count(*) FILTER (WHERE last_seen_at > now() - interval '5 minutes') AS ultimos_5min
FROM public.user_presence
UNION ALL
SELECT 'users.last_seen',
       count(*) FILTER (WHERE last_seen IS NOT NULL),
       max(last_seen),
       now() - max(last_seen),
       count(*) FILTER (WHERE last_seen > now() - interval '5 minutes')
FROM public.users;

-- 2. Orfaos: presencas sem usuario correspondente
SELECT p.user_id, p.last_seen_at
FROM public.user_presence p
WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE u.user_id = p.user_id::text)
ORDER BY p.last_seen_at DESC;

-- 3. Ativos que nunca aparecem no radar
SELECT count(*) AS ativos_sem_presenca
FROM public.users u
WHERE COALESCE(u.is_deleted,false) = false
  AND COALESCE(u.is_banned,false) = false
  AND NOT EXISTS (SELECT 1 FROM public.user_presence p WHERE p.user_id::text = u.user_id);

-- 4. Distribuicao de last_seen (detecta backfill em massa)
SELECT last_seen, count(*) AS quantos
FROM public.users
WHERE last_seen IS NOT NULL
GROUP BY last_seen
ORDER BY quantos DESC
LIMIT 10;