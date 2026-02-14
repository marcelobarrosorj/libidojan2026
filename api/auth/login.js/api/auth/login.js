const { createClient } = require("@supabase/supabase-js");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method not allowed" });
  }

  // Vercel geralmente já entrega JSON parseado aqui:
  let body = req.body;

  // Se vier como string, tenta parsear:
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (_) {}
  }

  const email = body && body.email;
  const password = body && body.password;

  if (!email || !password) {
    return res.status(400).json({ ok: false, error: "missing fields" });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({ ok: false, error: "server env not configured" });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return res.status(401).json({ ok: false, error: "invalid credentials" });
  }

  return res.status(200).json({ ok: true, user: data.user, session: data.session });
};
