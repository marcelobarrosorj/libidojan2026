import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

function json(res: VercelResponse, status: number, body: unknown) {
  res.status(status)
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
  }

  return createClient(url, key)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const method = (req.method || 'GET').toUpperCase()
    const url = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`)
    const path = url.pathname.replace(/\/+$/, '') || '/'

    // A Vercel vai rotear /api/* pra este handler (via vercel.json)
    // Aqui tratamos o path SEM depender do framework.
    // Exemplos:
    // - /api/health
    // - /api/auth/register
    // - /api/auth/login

    if (method === 'GET' && path === '/api/health') {
      return json(res, 200, { ok: true })
    }

    if (method === 'POST' && path === '/api/auth/register') {
      const { email, password } = (req.body ?? {}) as { email?: string; password?: string }

      if (!email || !password) {
        return json(res, 400, { ok: false, error: 'email and password required' })
      }

      const pwd = String(password)
      if (!/^\d{6,8}$/.test(pwd)) {
        return json(res, 400, { ok: false, error: 'password must be numeric with 6-8 digits' })
      }

      const supabase = getSupabase()
      const password_hash = await sha256Hex(pwd)

      const { error } = await supabase.from('users').insert({
        email,
        password_hash,
        email_verified: true // se quiser verificação por token depois, troque para false
      })

      if (error) {
        // 23505 = unique_violation (se você colocou UNIQUE no email)
        if ((error as any).code === '23505') {
          return json(res, 409, { ok: false, error: 'email already exists' })
        }
        return json(res, 500, { ok: false, error: error.message })
      }

      return json(res, 200, { ok: true })
    }

    if (method === 'POST' && path === '/api/auth/login') {
      const { email, password } = (req.body ?? {}) as { email?: string; password?: string }

      if (!email || !password) {
        return json(res, 400, { ok: false, error: 'email and password required' })
      }

      const pwd = String(password)
      const supabase = getSupabase()
      const password_hash = await sha256Hex(pwd)

      const { data, error } = await supabase
        .from('users')
        .select('id,email,email_verified')
        .eq('email', email)
        .eq('password_hash', password_hash)
        .single()

      if (error || !data) {
        return json(res, 401, { ok: false, error: 'invalid credentials' })
      }

      if (!data.email_verified) {
        return json(res, 403, { ok: false, error: 'email not verified' })
      }

      return json(res, 200, { ok: true, user: { id: data.id, email: data.email } })
    }

    // Se cair aqui, rota não existe ou método errado
    res.setHeader('Allow', 'GET, POST')
    return json(res, 405, { ok: false, error: 'method not allowed or route not found', path, method })
  } catch (e: any) {
    // Erro de config (ex.: env vars faltando) ou runtime
    return json(res, 500, { ok: false, error: e?.message || 'internal error' })
  }
}
