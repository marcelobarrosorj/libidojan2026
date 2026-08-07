import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Migration 20260803120000_add_user_number.sql', () => {
  it('contains all required user_number protections and no security vulnerabilities', () => {
    const filePath = path.join(process.cwd(), 'supabase/migrations/20260803120000_add_user_number.sql');
    const content = fs.readFileSync(filePath, 'utf-8');

    // 1. Não existe GRANT para anon
    expect(content).not.toContain('GRANT SELECT ON public.user_profiles TO anon');
    expect(content).not.toContain('GRANT SELECT ON public.users TO anon');
    
    // 2. Existe REVOKE de anon na tabela e na view
    expect(content).toContain('REVOKE ALL ON public.users FROM anon');
    expect(content).toContain('REVOKE ALL ON public.user_profiles FROM anon');
    
    // 3. Política open insert removida
    expect(content).toContain('DROP POLICY IF EXISTS "open insert" ON public.users');
    
    // 4. INSERT restrito a authenticated
    expect(content).toContain('CREATE POLICY "Authenticated users can insert their own profile"');
    expect(content).toContain('TO authenticated');
    
    // 5. INSERT exige auth.uid() igual ao user_id ou is_admin()
    expect(content).toMatch(/WITH CHECK \([\s\S]*auth\.uid\(\)::text = user_id::text[\s\S]*OR public\.is_admin\(\)[\s\S]*\)/);
    
    // 6. View continua security_barrier=true
    expect(content).toContain('security_barrier = true');
    
    // 7. View preserva security_invoker=false intencionalmente
    expect(content).toContain('security_invoker = false');
    expect(content).toContain('COMMENT ON VIEW public.user_profiles IS');
    
    // 8. Somente authenticated recebe SELECT da view
    expect(content).toContain('GRANT SELECT ON public.user_profiles TO authenticated');
    
    // 9. Owner é validado por UUID, e-mail, nickname e role
    expect(content).toContain("lower(email) = 'marcelobarrosorj@gmail.com'");
    expect(content).toContain("nickname = 'Casal Beijo'");
    expect(content).toContain("role = 'owner'");
    expect(content).toContain("user_id::uuid = '0027337b-efa2-4148-8338-9d130bdc600f'::uuid");
    
    // 10. Perfil legado é ignorado
    expect(content).toContain("zSs8dMpmYnXHrJriGoOZF4kvEVn2");
    
    // 11. Owner recebe 1
    expect(content).toContain("SET user_number = 1");
    
    // 12. Sequence não retrocede
    expect(content).toContain("GREATEST(v_max_number, v_current_seq_val, 1)");
    
    // 13. Test for setval('public.user_number_seq', 1) unconditional
    expect(content).not.toMatch(/PERFORM setval\('public\.user_number_seq',\s*1\);/);
    
    // 14. Frontend não pode escolher user_number no banco
    expect(content).toContain("NEW.user_number := NULL;");
    
    // 15. Update de user_number bloqueado
    expect(content).toContain('BEFORE UPDATE OF user_number');
    expect(content).toContain('OLD.user_number IS DISTINCT FROM NEW.user_number');
    expect(content).toContain("RAISE EXCEPTION 'user_number is immutable'");
    
    // 16. Demos e órfãos ficam sem número
    expect(content).toContain("NEW.user_id::text NOT LIKE 'demo:%'");
    expect(content).toContain("EXISTS (SELECT 1 FROM auth.users WHERE id::text = NEW.user_id::text)");
  });
});
