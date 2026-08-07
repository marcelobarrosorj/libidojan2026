import { Request, Response, NextFunction } from 'express';
import { getAdminSupabase } from '../config/supabase.js';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Não autorizado. Token ausente.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const supabase = getAdminSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Não autorizado. Token inválido.' });
    }

    (req as any).user = user;
    next();
  } catch (err: any) {
    return res.status(400).json({ error: "Serviço temporariamente indisponível (Faltam credenciais no servidor)" });
  }
};
