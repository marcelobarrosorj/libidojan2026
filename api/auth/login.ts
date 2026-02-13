import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // DEBUG TEMPORÁRIO (vamos remover depois)
  console.log('DEBUG method:', req.method)
  console.log('DEBUG headers content-type:', req.headers['content-type'])
  console.log('DEBUG raw req.body:', req.body)
  console.log('DEBUG typeof req.body:', typeof req.body)

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  let body: any = req.body

  // Se o body vier como string, tenta parsear
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch (e) {
      console.log('DEBUG JSON.parse failed:', e)
    }
  }

  console.log('DEBUG parsed body:', body)

  const email = body?.email
  const password = body?.password

  console.log('DEBUG extracted email:', email)
  console.log('DEBUG extracted password type:', typeof password)

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
