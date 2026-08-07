DO $$ 
DECLARE
  v_has_nulls boolean;
  v_has_duplicates boolean;
  v_has_unique_constraint boolean;
BEGIN
  -- Check for nulls
  SELECT EXISTS (SELECT 1 FROM public.users WHERE user_id IS NULL) INTO v_has_nulls;
  IF v_has_nulls THEN
    RAISE EXCEPTION 'Cannot enforce uniqueness: user_id contains NULL values';
  END IF;

  -- Check for duplicates
  SELECT EXISTS (
    SELECT user_id 
    FROM public.users 
    GROUP BY user_id 
    HAVING COUNT(*) > 1
  ) INTO v_has_duplicates;
  IF v_has_duplicates THEN
    RAISE EXCEPTION 'Cannot enforce uniqueness: user_id contains duplicate values';
  END IF;

  -- Check for existing unique constraint or index
  SELECT EXISTS (
    SELECT 1 
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)
    WHERE n.nspname = 'public' 
      AND t.relname = 'users' 
      AND a.attname = 'user_id'
      AND c.contype IN ('p', 'u')
      AND array_length(c.conkey, 1) = 1
  ) OR EXISTS (
    SELECT 1
    FROM pg_index i
    JOIN pg_class t ON i.indrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(i.indkey)
    WHERE n.nspname = 'public' 
      AND t.relname = 'users' 
      AND a.attname = 'user_id'
      AND i.indisunique = true
      AND i.indnatts = 1
  ) INTO v_has_unique_constraint;

  -- Create unique index if none exists
  IF NOT v_has_unique_constraint THEN
    CREATE UNIQUE INDEX idx_users_user_id_unique ON public.users(user_id);
    ALTER TABLE public.users ADD CONSTRAINT users_user_id_unique UNIQUE USING INDEX idx_users_user_id_unique;
  END IF;
END $$;
