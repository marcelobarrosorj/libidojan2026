-- 1. Storage bucket for photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;


DROP POLICY IF EXISTS "Fotos publicas" ON storage.objects;
CREATE POLICY "Fotos publicas" ON storage.objects FOR SELECT USING (bucket_id = 'photos');

DROP POLICY IF EXISTS "Upload de fotos proprio usuario" ON storage.objects;
CREATE POLICY "Upload de fotos proprio usuario" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Atualizar fotos proprio usuario" ON storage.objects;
CREATE POLICY "Atualizar fotos proprio usuario" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]
) WITH CHECK (
  bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Deletar fotos proprio usuario" ON storage.objects;
CREATE POLICY "Deletar fotos proprio usuario" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Realtime
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'posts') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'posts'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
    END IF;
  END IF;
END $$;
