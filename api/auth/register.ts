import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'

function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
  return createClient(url, key)
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
    const password_hash = sha256Hex(pwd)

    const { error } = await supabase.from('users').insert({
      email,
      password_hash,
      email_verified: true
    })

    if (error) {
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
