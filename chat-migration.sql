ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS view_once boolean DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS viewed_at timestamptz;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_type text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS apagada_para_todos boolean DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS apagada_em timestamptz;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS apagada_por uuid;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_seen timestamptz;

CREATE TABLE IF NOT EXISTS public.conversas_ocultas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  outro_id uuid NOT NULL,
  ocultada_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, outro_id)
);

CREATE TABLE IF NOT EXISTS public.mensagens_ocultas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  message_id text NOT NULL,
  ocultada_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, message_id)
);

ALTER TABLE public.conversas_ocultas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "conversas_ocultas_select" ON public.conversas_ocultas;
CREATE POLICY "conversas_ocultas_select" ON public.conversas_ocultas FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "conversas_ocultas_insert" ON public.conversas_ocultas;
CREATE POLICY "conversas_ocultas_insert" ON public.conversas_ocultas FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "conversas_ocultas_delete" ON public.conversas_ocultas;
CREATE POLICY "conversas_ocultas_delete" ON public.conversas_ocultas FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.mensagens_ocultas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mensagens_ocultas_select" ON public.mensagens_ocultas;
CREATE POLICY "mensagens_ocultas_select" ON public.mensagens_ocultas FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "mensagens_ocultas_insert" ON public.mensagens_ocultas;
CREATE POLICY "mensagens_ocultas_insert" ON public.mensagens_ocultas FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "mensagens_ocultas_delete" ON public.mensagens_ocultas;
CREATE POLICY "mensagens_ocultas_delete" ON public.mensagens_ocultas FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON public.messages (sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON public.users (last_seen DESC);