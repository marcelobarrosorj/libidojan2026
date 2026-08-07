-- Migration: Add user_number to public.users

-- 1. Add user_number column idempotently
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'user_number'
  ) THEN
    ALTER TABLE public.users ADD COLUMN user_number bigint;
  END IF;
END $$;

-- 2. Create sequence for user_number
CREATE SEQUENCE IF NOT EXISTS public.user_number_seq START 1;

-- 3. Backfill existing users (Owner gets 1, others get sequence values)
DO $$
DECLARE
  v_owner_auth_id uuid;
  v_owner_user_id text;
  v_user_record RECORD;
  v_rows_affected integer;
  v_duplicates integer;
  v_max_number bigint;
  v_current_seq_val bigint;
BEGIN
  -- Verify owner
  SELECT id INTO v_owner_auth_id 
  FROM auth.users 
  WHERE lower(email) = 'marcelobarrosorj@gmail.com';
  
  IF v_owner_auth_id IS NULL THEN
    RAISE EXCEPTION 'Owner account not found in auth.users';
  END IF;
  
  IF v_owner_auth_id != '0027337b-efa2-4148-8338-9d130bdc600f'::uuid THEN
    RAISE EXCEPTION 'Owner account UUID does not match expected 0027337b-efa2-4148-8338-9d130bdc600f';
  END IF;
  
  -- Confirm exactly one auth account exists
  IF (SELECT count(*) FROM auth.users WHERE lower(email) = 'marcelobarrosorj@gmail.com') > 1 THEN
    RAISE EXCEPTION 'Multiple accounts found with owner email';
  END IF;

  -- Get owner user profile (handling both UUID and text)
  SELECT user_id INTO v_owner_user_id
  FROM public.users
  WHERE user_id::uuid = '0027337b-efa2-4148-8338-9d130bdc600f'::uuid
    AND nickname = 'Casal Beijo'
    AND role = 'owner'
    AND COALESCE(status, 'active') = 'active'
    AND COALESCE(is_deleted, false) = false
    AND COALESCE(is_banned, false) = false;

  IF v_owner_user_id IS NULL THEN
    RAISE EXCEPTION 'Owner profile not found in public.users or does not match required criteria';
  END IF;
  
  IF (SELECT count(*) FROM public.users WHERE user_id::uuid = '0027337b-efa2-4148-8338-9d130bdc600f'::uuid) > 1 THEN
    RAISE EXCEPTION 'Multiple profiles found for owner auth id';
  END IF;

  -- Ensure no one else has 1
  IF EXISTS (SELECT 1 FROM public.users WHERE user_number = 1 AND user_id::text != v_owner_user_id::text) THEN
    RAISE EXCEPTION 'Another account already has user_number 1';
  END IF;

  -- Set owner to 1
  UPDATE public.users 
  SET user_number = 1 
  WHERE user_id::text = v_owner_user_id::text;
  
  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  IF v_rows_affected != 1 THEN
    RAISE EXCEPTION 'Failed to update exactly 1 row for owner user_number. Rows affected: %', v_rows_affected;
  END IF;

  -- Sync sequence BEFORE backfill to prevent going backwards
  SELECT COALESCE(MAX(user_number), 1) INTO v_max_number FROM public.users;
  SELECT last_value INTO v_current_seq_val FROM public.user_number_seq;
  PERFORM setval('public.user_number_seq', GREATEST(v_max_number, v_current_seq_val, 1), true);

  -- Backfill remaining valid users
  FOR v_user_record IN 
    SELECT u.user_id 
    FROM public.users u
    JOIN auth.users au ON u.user_id::text = au.id::text
    WHERE u.user_number IS NULL 
      AND u.user_id::text NOT LIKE 'demo:%'
      AND u.user_id::text != 'zSs8dMpmYnXHrJriGoOZF4kvEVn2'
      AND COALESCE(u.is_deleted, false) = false
      AND COALESCE(u.is_banned, false) = false
    ORDER BY au.created_at ASC, au.id ASC
  LOOP
    UPDATE public.users 
    SET user_number = nextval('public.user_number_seq') 
    WHERE user_id = v_user_record.user_id;
  END LOOP;
  
  -- Check for duplicate user numbers after backfill
  SELECT COUNT(*) INTO v_duplicates
  FROM (
    SELECT user_number FROM public.users WHERE user_number IS NOT NULL GROUP BY user_number HAVING COUNT(*) > 1
  ) sub;
  
  IF v_duplicates > 0 THEN
    RAISE EXCEPTION 'Duplicate user_number values found, cannot create unique constraint';
  END IF;

  -- Synchronize sequence AFTER backfill
  SELECT COALESCE(MAX(user_number), 1) INTO v_max_number FROM public.users;
  SELECT last_value INTO v_current_seq_val FROM public.user_number_seq;
  PERFORM setval('public.user_number_seq', GREATEST(v_max_number, v_current_seq_val, 1), true);

END $$;

-- 4. Add Unique constraint idempotently
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_user_number_key' 
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_user_number_key UNIQUE (user_number);
  END IF;
END $$;

-- 5. Revoke anon privileges from public.users and setup authenticated policies
REVOKE ALL ON public.users FROM PUBLIC;
REVOKE ALL ON public.users FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;

DROP POLICY IF EXISTS "Users can read their own profile and admins can read all" ON public.users;
CREATE POLICY "Authenticated users can read their own profile and admins can read all"
ON public.users
FOR SELECT
TO authenticated
USING (
  auth.uid()::text = user_id::text
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Authenticated users can update their own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (
  auth.uid()::text = user_id::text
  OR public.is_admin()
)
WITH CHECK (
  auth.uid()::text = user_id::text
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Authenticated admins can delete users"
ON public.users
FOR DELETE
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "open insert" ON public.users;
CREATE POLICY "Authenticated users can insert their own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid()::text = user_id::text
  OR public.is_admin()
);

-- 6. Create trigger to auto-assign user_number on insert
CREATE OR REPLACE FUNCTION public.assign_user_number()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Always ignore what frontend sends. Set to NULL temporarily.
  NEW.user_number := NULL;

  -- Only assign for real users (in auth.users) and not demo
  IF NEW.user_id::text NOT LIKE 'demo:%' THEN
    IF EXISTS (SELECT 1 FROM auth.users WHERE id::text = NEW.user_id::text) THEN
      NEW.user_number := nextval('public.user_number_seq');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Revoke execute from public to enforce usage only by triggers/admin
REVOKE EXECUTE ON FUNCTION public.assign_user_number() FROM PUBLIC;

DROP TRIGGER IF EXISTS trigger_assign_user_number ON public.users;
CREATE TRIGGER trigger_assign_user_number
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_user_number();

-- 7. Protect user_number from updates
CREATE OR REPLACE FUNCTION public.prevent_user_number_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.user_number IS DISTINCT FROM NEW.user_number THEN
    RAISE EXCEPTION 'user_number is immutable';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_user_number_change_trigger ON public.users;
CREATE TRIGGER prevent_user_number_change_trigger
BEFORE UPDATE OF user_number
ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.prevent_user_number_change();

-- 8. Update the user_profiles view to include user_number (Securely)
CREATE OR REPLACE VIEW public.user_profiles WITH (security_barrier = true, security_invoker = false) AS
SELECT 
  user_id,
  nickname,
  age,
  gender,
  relationship_status,
  bio,
  photo_url,
  photos,
  height,
  biotype,
  sexual_orientation,
  status,
  couple_profile,
  is_online,
  user_number
FROM public.users
WHERE COALESCE(is_deleted, false) = false AND COALESCE(is_banned, false) = false;

COMMENT ON VIEW public.user_profiles IS 'Exposes limited public profile fields for authenticated users. Uses security_invoker=false intentionally because table policies only allow reading own profile, but Radar/feed needs to read public fields of active users.';

REVOKE ALL ON public.user_profiles FROM PUBLIC;
REVOKE ALL ON public.user_profiles FROM anon;
-- Only grant to authenticated
GRANT SELECT ON public.user_profiles TO authenticated;
