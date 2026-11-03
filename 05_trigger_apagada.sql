CREATE OR REPLACE FUNCTION public.protege_apagada_para_todos()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.apagada_para_todos IS DISTINCT FROM OLD.apagada_para_todos
     AND auth.uid() IS DISTINCT FROM OLD.sender_id THEN
    RAISE EXCEPTION 'Apenas o remetente pode apagar para todos';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protege_apagada_para_todos() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.protege_apagada_para_todos() TO authenticated;

DROP TRIGGER IF EXISTS trg_protege_apagada ON public.messages;
CREATE TRIGGER trg_protege_apagada
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.protege_apagada_para_todos();

SELECT tgname AS trigger, tgenabled AS ativo
FROM pg_trigger
WHERE tgrelid = 'public.messages'::regclass AND NOT tgisinternal;