DO $$
BEGIN
  IF EXISTS (
    SELECT provider, payment_id
    FROM public.payment_transactions
    GROUP BY provider, payment_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicated transactions found. Please clean them up manually.';
  END IF;
END $$;

DROP INDEX IF EXISTS idx_payment_transactions_provider_payment_id;
CREATE UNIQUE INDEX idx_payment_transactions_provider_payment_id ON public.payment_transactions (provider, payment_id);

CREATE OR REPLACE FUNCTION public.process_payment(
  p_user_id text,
  p_payment_id text,
  p_provider text,
  p_status text,
  p_amount numeric
)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_transaction record;
BEGIN
  SELECT * INTO v_transaction
  FROM public.payment_transactions
  WHERE provider = p_provider AND payment_id = p_payment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment transaction not found';
  END IF;

  IF v_transaction.user_id != p_user_id THEN
    RAISE EXCEPTION 'User ID mismatch';
  END IF;

  IF v_transaction.amount != p_amount THEN
    RAISE EXCEPTION 'Amount mismatch';
  END IF;

  IF v_transaction.status = 'PAID' THEN
    RETURN FALSE;
  END IF;

  UPDATE public.payment_transactions
  SET status = p_status, updated_at = now()
  WHERE provider = p_provider AND payment_id = p_payment_id;

  IF p_provider = 'pagbank' AND p_status = 'PAID' THEN
    UPDATE public.users
    SET premium = true, plan = 'premium', updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  RETURN TRUE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.process_payment(text, text, text, text, numeric) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.process_payment(text, text, text, text, numeric) FROM anon;
REVOKE EXECUTE ON FUNCTION public.process_payment(text, text, text, text, numeric) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.process_payment(text, text, text, text, numeric) TO service_role;
