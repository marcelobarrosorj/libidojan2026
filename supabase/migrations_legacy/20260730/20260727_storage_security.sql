-- Ensure photos bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Protect objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Fotos publicas" ON storage.objects;
CREATE POLICY "Fotos publicas" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'photos');

DROP POLICY IF EXISTS "Upload de fotos proprio usuario" ON storage.objects;
CREATE POLICY "Upload de fotos proprio usuario" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Deletar fotos proprio usuario" ON storage.objects;
CREATE POLICY "Deletar fotos proprio usuario" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

