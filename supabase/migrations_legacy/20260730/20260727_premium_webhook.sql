CREATE OR REPLACE FUNCTION public.activate_premium(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.users 
  SET premium = true, plan = 'premium' 
  WHERE user_id = target_user_id;
END;
$$;
