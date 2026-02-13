import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'

function getSupabase() {
  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
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

    const { error } = await supabase.from('users').insert({
      email,
      password_hash: sha256Hex(pwd),
      email_verified: true
    })

    if (error) {
      // unique violation (Postgres)
      if ((error as any).code === '23505') {
        return res.status(409).json({ ok: false, error: 'email already exists' })
      }
      return res.status(500).json({ ok: false, error: error.message })
    }

    return res.status(200).json({ ok: true })
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'internal error' })
  }
}
