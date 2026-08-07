CREATE OR REPLACE FUNCTION public.protect_admin_fields()
RETURNS trigger AS $$
BEGIN
  IF auth.uid() = NEW.user_id AND NOT public.is_admin() THEN
    NEW.plan = OLD.plan;
    NEW.premium = OLD.premium;
    NEW.status = OLD.status;
    NEW.is_banned = OLD.is_banned;
    NEW.is_deleted = OLD.is_deleted;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_admin_fields ON public.users;
CREATE TRIGGER trg_protect_admin_fields
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_admin_fields();
