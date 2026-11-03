DROP VIEW IF EXISTS public.presenca_publica;

CREATE VIEW public.presenca_publica AS
WITH combinado AS (
  SELECT p.user_id, p.last_seen_at
  FROM public.user_presence p
  UNION ALL
  SELECT u.user_id::uuid, u.last_seen
  FROM public.users u
  WHERE u.last_seen IS NOT NULL
    AND u.user_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
),
filtrado AS (
  SELECT c.user_id, max(c.last_seen_at) AS ultimo
  FROM combinado c
  JOIN public.users u ON u.user_id = c.user_id::text
  WHERE COALESCE(u.is_deleted, false) = false
    AND COALESCE(u.is_banned, false) = false
  GROUP BY c.user_id
)
SELECT f.user_id,
       f.ultimo > (now() - interval '5 minutes') AS online
FROM filtrado f;

REVOKE ALL ON public.presenca_publica FROM anon;
GRANT SELECT ON public.presenca_publica TO authenticated;