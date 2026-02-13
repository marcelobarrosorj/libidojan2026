import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  let body: any = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {}
  }

  const email = body?.email
  const password = body?.password

  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'missing fields' })
  }

  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({ ok: false, error: 'server env not configured' })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return res.status(401).json({ ok: false, error: 'invalid credentials' })
    }

    return res.status(200).json({
      ok: true,
      user: data.user,
      session: data.session
    })
  } catch (err) {
    console.error('login error:', err)
    return res.status(500).json({ ok: false, error: 'internal server error' })
  }
}
