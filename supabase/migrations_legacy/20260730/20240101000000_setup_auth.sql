-- 1. Garante que user_id seja UUID e referência a auth.users
ALTER TABLE public.users 
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_user_id_fkey'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Habilita Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Recria Policies para garantir a segurança (Permite ler, inserir, atualizar e deletar apenas o próprio perfil)
DROP POLICY IF EXISTS "Usuários podem ler o próprio perfil" ON public.users;
CREATE POLICY "Usuários podem ler o próprio perfil" 
  ON public.users FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir o próprio perfil" ON public.users;
CREATE POLICY "Usuários podem inserir o próprio perfil" 
  ON public.users FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar o próprio perfil" ON public.users;
CREATE POLICY "Usuários podem atualizar o próprio perfil" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar o próprio perfil" ON public.users;
CREATE POLICY "Usuários podem deletar o próprio perfil" 
  ON public.users FOR DELETE 
  USING (auth.uid() = user_id);

-- 4. Função e Trigger para criar perfil automaticamente no momento do cadastro no auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (user_id, email, nickname)
  VALUES (new.id, new.email, split_part(new.email, '@', 1))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
