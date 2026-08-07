-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Payment transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    payment_id TEXT UNIQUE NOT NULL,
    provider TEXT NOT NULL,
    status TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on payment_transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Only admins can see payment transactions
CREATE POLICY "Admins can view payment transactions" 
ON public.payment_transactions FOR SELECT 
USING (public.is_admin());

-- RPC to process payment safely
CREATE OR REPLACE FUNCTION public.process_payment(
    p_user_id UUID,
    p_payment_id TEXT,
    p_provider TEXT,
    p_status TEXT,
    p_amount NUMERIC
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    -- Check if payment already exists
    SELECT EXISTS(
        SELECT 1 FROM public.payment_transactions WHERE payment_id = p_payment_id
    ) INTO v_exists;
    
    IF v_exists THEN
        RETURN FALSE; -- Already processed
    END IF;
    
    -- Insert transaction
    INSERT INTO public.payment_transactions (user_id, payment_id, provider, status, amount)
    VALUES (p_user_id, p_payment_id, p_provider, p_status, p_amount);
    
    -- If status is PAID, activate premium
    IF p_status = 'PAID' THEN
        UPDATE public.users 
        SET premium = true, plan = 'premium' 
        WHERE user_id = p_user_id;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- Restrict direct users table access to own profile and admins
DROP POLICY IF EXISTS "Anyone can read user profiles" ON public.users;
DROP POLICY IF EXISTS "Usuários podem ler o próprio perfil" ON public.users;

CREATE POLICY "Usuários podem ler o próprio perfil" 
ON public.users FOR SELECT 
USING (auth.uid() = user_id OR public.is_admin());

-- Create secure view for public profiles
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
    user_id,
    nickname,
    photo_url,
    photos,
    bio,
    age,
    location,
    status,
    is_online,
    sexual_orientation,
    relationship_status
FROM public.users;

-- Grant access to authenticated users
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;

