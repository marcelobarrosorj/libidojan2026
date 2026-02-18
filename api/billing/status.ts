import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = String(req.query.userId || '')
  if (!userId) return res.status(400).json({ ok: false, error: 'missing userId' })

  const { data, error } = await supabase
    .from('profiles')
    .select('id, subscription_status, subscription_current_period_end')
    .eq('id', userId)
    .single()

  if (error) return res.status(500).json({ ok: false, error: error.message })
  return res.status(200).json({ ok: true, data })
}
