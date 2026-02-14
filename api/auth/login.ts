import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Logs básicos do request (ajuda a confirmar que a function está rodando)
  console.log('DEBUG method:', req.method)
  console.log('DEBUG url:', req.url)
  console.log('DEBUG headers content-type:', req.headers['content-type'])
  console.log('DEBUG typeof req.body:', typeof req.body)
  console.log('DEBUG raw req.body:', req.body)

  // Health rápido (opcional): facilita validar que endpoint está vivo via GET
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, message: 'login endpoint alive (use POST)' })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, GET')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  // Body parsing robusto
  let body: any = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch (e) {
      console.log('DEBUG JSON.parse failed:', e)
      return res.status(400).json({ ok: false, error: 'invalid json body' })
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

  // Variáveis de ambiente (Vercel)
  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

  // Logs seguros (não expõe chave inteira)
  console.log('DEBUG SUPABASE_URL:', SUPABASE_URL)
  console.log('DEBUG SUPABASE_KEY prefix:', (SUPABASE_ANON_KEY || '').slice(0, 20))

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({
      ok: false,
      error: 'server env not configured',
      missing: {
        SUPABASE_URL: !SUPABASE_URL,
        SUPABASE_ANON_KEY: !SUPABASE_ANON_KEY
      }
    })
  }

  // Cria client do Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.log('DEBUG supabase error:', error)
      return res.status(401).json({
        ok: false,
        error: 'invalid credentials',
        supabase_message: error.message
      })
    }

    // Sucesso
    return res.status(200).json({
      ok: true,
      user: data.user,
      session: data.session
    })
  } catch (err: any) {
    console.error('login error (unexpected):', err)
    return res.status(500).json({
      ok: false,
      error: 'internal server error',
      detail: err?.message || String(err)
    })
  }
}
