-- permite criar convite vitalicio: duration_hours nulo = sem expiracao
alter table public.premium_invite_codes alter column duration_hours drop not null;

-- convite vitalicio de uso unico
insert into public.premium_invite_codes (code, duration_hours, max_uses, used_count, active)
values ('LIB-PREM-VITALICIO', null, 1, 0, true)
on conflict (code) do nothing;

select code, duration_hours, used_count, active from public.premium_invite_codes where duration_hours is null;