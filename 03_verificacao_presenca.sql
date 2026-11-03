-- A view deve cobrir pelo menos os 23 ativos com last_seen preenchido
SELECT count(*) AS linhas,
       count(*) FILTER (WHERE online) AS online_agora
FROM public.presenca_publica;

-- Comparar com a view antiga (so user_presence)
SELECT count(*) AS linhas_user_presence
FROM public.user_presence;

-- Teste de vida: com o app aberto e GPS ativo, este numero deve subir
SELECT count(*) FILTER (WHERE online) AS online_agora FROM public.presenca_publica;