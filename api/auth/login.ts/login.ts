import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'

function getSupabase() {
  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

function sha256Hex(input: string) {
  return createHash('sha256').update(input, 'utf8').digest('hex')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const { email, password } = (req.body ?? {}) as { email?: string; password?: string }

  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'email and password required' })
  }

  const pwd = String(password)
  if (!/^\d{6,8}$/.test(pwd)) {
    return res.status(400).json({ ok: false, error: 'password must be numeric with 6-8 digits' })
  }

  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('users')
      .select('id,email,password_hash,email_verified')
      .eq('email', email)
      .maybeSingle()

    if (error) return res.status(500).json({ ok: false, error: error.message })
    if (!data) return res.status(401).json({ ok: false, error: 'invalid credentials' })

    const candidateHash = sha256Hex(pwd)
    if (data.password_hash !== candidateHash) {
      return res.status(401).json({ ok: false, error: 'invalid credentials' })
    }

    if (data.email_verified === false) {
      return res.status(403).json({ ok: false, error: 'email not verified' })
    }

    return res.status(200).json({
      ok: true,
      user: { id: data.id, email: data.email }
    })
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'internal error' })
  }
}
