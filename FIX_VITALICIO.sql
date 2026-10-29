-- LIBIDO | vitalicio: funcao segura + correcao de dados
-- PARTE 1 | funcao que liga premium sem depender de policy nem trigger
create or replace function public.resgatar_vitalicio(p_user uuid, p_until timestamptz default null)
returns boolean language plpgsql security definer set search_path = public as $fn$
declare v int;
begin
  update public.users set premium = true, premium_until = p_until
   where user_id = p_user or id = p_user;
  get diagnostics v = row_count;
  return v > 0;
end;
$fn$;
revoke all on function public.resgatar_vitalicio(uuid, timestamptz) from public, anon;
grant execute on function public.resgatar_vitalicio(uuid, timestamptz) to authenticated;

-- PARTE 2 | correcao de dados NAS CONTAS LISTADAS ABAIXO
-- Confira nickname por nickname antes de rodar. premium=false + premium_until=null
-- e tambem o estado de TODO cadastro novo: nao aplique em quem nao pagou.
begin;
update public.users set premium = true, premium_until = null
 where premium = false and premium_until is null
   and nickname in ('lh4788609 rafaelkautzman1 ASB.H fadsrevddaahh tulembukajunior lojatoquasela vistabelahb cerberusvr igordelima.cavalcante oliveirakenis vistalindarj diegobertini080 brunyynhafg levimartins6821 wandersonmelosud huahuahua Vic Casal tesao  oninjarodrigo Dupla Travessa ');
commit;

-- PARTE 3 | verificacao
select nickname, premium, premium_until from public.users where premium = true order by nickname;