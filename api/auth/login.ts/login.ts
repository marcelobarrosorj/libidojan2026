import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  let body: any = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch {}
  }

  const email = body?.email
  const password = body?.password

  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'missing fields' })
  }

  return res.status(200).json({ ok: true })
}
