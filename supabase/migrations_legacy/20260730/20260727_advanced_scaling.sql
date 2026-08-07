-- RPC to safely increment likes without concurrency issues
CREATE OR REPLACE FUNCTION public.increment_likes(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.posts
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = post_id;
END;
$$;
