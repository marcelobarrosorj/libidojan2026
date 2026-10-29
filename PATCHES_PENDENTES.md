# PATCHES PENDENTES - LIBIDO

Gerado: 2026-10-28 19:19

Modo: somente relatorio

- [CRITICO] URL publica permanente em vez de signed URL -> Trocar getPublicUrl por createSignedUrl(60s) e gravar o PATH, nao a URL
- [CRITICO] Zero createSignedUrl no projeto - PIN e apenas interface -> Implementar signed URL obrigatoria para bucket privado
- [CRITICO] Bucket photos = PUBLICO -> ALTER bucket para privado + policies em storage.objects
- [ALTO] Dados em localStorage sem limpeza no panic -> Limpar localStorage/sessionStorage no acionamento do Ghost
- [ALTO] Service Worker presente - verificar cache de midia privada -> Excluir rotas de storage do precache do SW
- [ALTO] Coordenada bruta exposta em select -> Calcular distancia no backend via RPC, enviar apenas metros
- [ALTO] is_premium checado no cliente (bypassavel) -> Validar por RPC SECURITY DEFINER ou RLS
- [MEDIO] Uso de any: 327 ocorrencia(s) -> Substituir por tipos derivados do schema
- [MEDIO] try/catch silencioso: 80 -> Registrar erro ou tratar