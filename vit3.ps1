param([string]$Raiz='C:\libidojan2026',[switch]$SemBuild,[switch]$Aplicar)
$ErrorActionPreference='Continue'
$utf8=New-Object System.Text.UTF8Encoding($false)
function Sec($t){Write-Host '';Write-Host ('=== '+$t+' ===') -ForegroundColor Cyan}
function Ok($t){Write-Host ('  OK     '+$t) -ForegroundColor Green}
function Sk($t){Write-Host ('  PULADO '+$t) -ForegroundColor Yellow}
function Ef($t){Write-Host ('  FALHA  '+$t) -ForegroundColor Red}
function In2($t){Write-Host ('         '+$t) -ForegroundColor DarkGray}
function Req($u,$h,$m='GET',$b=$null){
  try{
    $p=@{Uri=$u;Headers=$h;Method=$m;UseBasicParsing=$true;TimeoutSec=60}
    if($b -ne $null){$p['Body']=$b}
    $r=Invoke-WebRequest @p
    return [pscustomobject]@{Code=[int]$r.StatusCode;Corpo=$r.Content}
  }catch{
    $c=0; if($_.Exception.Response){$c=[int]$_.Exception.Response.StatusCode}
    $t=''; if($_.ErrorDetails.Message){$t=$_.ErrorDetails.Message}
    return [pscustomobject]@{Code=$c;Corpo=$t}
  }
}
function Linhas($c){
  if(-not $c){ return @() }
  try{ $j = $c | ConvertFrom-Json }catch{ return @() }
  if($null -eq $j){ return @() }
  if($j -is [System.Array]){ return $j }
  return @($j)
}
Set-Location $Raiz

Sec '0. CREDENCIAIS'
$cfg=@{}
foreach($f in @('.env','backend\.env')){ $p=Join-Path $Raiz $f; if(Test-Path -LiteralPath $p){ foreach($ln in (Get-Content -LiteralPath $p -ErrorAction SilentlyContinue)){ if($ln -match '^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$'){ $k=$Matches[1]; $v=$Matches[2].Trim().Trim('"').Trim("'"); if(-not $cfg.ContainsKey($k)){$cfg[$k]=$v} } } } }
$base=$cfg['SUPABASE_URL']; if(-not $base){$base=$cfg['VITE_SUPABASE_URL']}
if($base){$base=$base.TrimEnd('/')}
$skey=$cfg['SUPABASE_SERVICE_ROLE_KEY']; if(-not $skey){$skey=$cfg['SERVICE_ROLE_KEY']}
$hS=@{apikey=$skey;Authorization=('Bearer '+$skey)}
$hJ=@{apikey=$skey;Authorization=('Bearer '+$skey);'Content-Type'='application/json';Prefer='return=representation'}
if(-not ($base -and $skey)){ Ef 'sem credenciais'; return }
Ok ('projeto: '+$base)

Sec '1. INCONSISTENCIA: premium=false COM premium_until PREENCHIDO'
$r=Req ($base+'/rest/v1/users?select=user_id,nickname,premium,premium_until,plan&premium=eq.false&premium_until=not.is.null&order=premium_until.desc&limit=200') $hS
$inc=@()
if($r.Code -eq 200){
  $inc=@(Linhas $r.Corpo)
  Ok ($inc.Count.ToString()+' conta(s) com premium desligado mas data de premium gravada')
  foreach($x in $inc){
    $venc=[datetime]$x.premium_until
    $sit='ATIVO ate '+([string]$x.premium_until).Substring(0,10)
    if($venc -lt (Get-Date).ToUniversalTime()){ $sit='vencido em '+([string]$x.premium_until).Substring(0,10) }
    $cor='Yellow'; if($venc -lt (Get-Date).ToUniversalTime()){$cor='DarkGray'}
    Write-Host ('  '+([string]$x.nickname).PadRight(22)+' plano='+([string]$x.plan).PadRight(8)+$sit) -ForegroundColor $cor
    In2 ('  user_id: '+$x.user_id)
  }
}else{ Ef ('consulta: HTTP '+$r.Code) }

Sec '2. QUEM RESGATOU CONVITE VITALICIO (duration_hours nulo)'
$r=Req ($base+'/rest/v1/premium_invite_codes?select=code,duration_hours,used_count,used_by,used_at&duration_hours=is.null&used_count=gt.0&limit=50') $hS
$vitais=@()
if($r.Code -eq 200){
  $vitais=@(Linhas $r.Corpo)
  Ok ($vitais.Count.ToString()+' convite(s) vitalicio(s) ja resgatado(s)')
  foreach($x in $vitais){ In2 (([string]$x.code).PadRight(18)+' por='+[string]$x.used_by+'  em='+(([string]$x.used_at).Substring(0,10))) }
}else{ Ef ('convites: HTTP '+$r.Code) }

Sec '3. ESTADO DE CADA BENEFICIARIO VITALICIO'
$benef=@()
foreach($x in $vitais){
  if(-not $x.used_by){ continue }
  $q=Req ($base+'/rest/v1/users?select=user_id,nickname,premium,premium_until,plan,is_banned&user_id=eq.'+$x.used_by) $hS
  if($q.Code -eq 200){
    $u=@(Linhas $q.Corpo)
    if($u.Count -eq 0){ Ef ('sem perfil: '+[string]$x.used_by) ; continue }
    foreach($y in $u){
      $benef += [pscustomobject]@{ id=$y.user_id; nick=$y.nickname; premium=$y.premium; until=$y.premium_until; plan=$y.plan; ban=$y.is_banned }
      $sit='CORRETO'
      if($y.premium -ne $true){ $sit='QUEBRADO - premium=false' }
      elseif($y.is_banned -eq $true){ $sit='BANIDO' }
      $cor='Green'; if($sit -ne 'CORRETO'){ $cor='Red' }
      Write-Host ('  '+([string]$y.nickname).PadRight(22)+' premium='+$y.premium+'  until='+$y.premium_until+'  plano='+([string]$y.plan).PadRight(8)+$sit) -ForegroundColor $cor
      In2 ('  user_id: '+$y.user_id)
    }
  }
}

Sec '4. TESTE DO TRIGGER (o UPDATE de premium realmente persiste?)'
$suspeitos=@()
foreach($b in $benef){ if($b.premium -ne $true -and $b.ban -ne $true){ $suspeitos += $b } }
foreach($x in $inc){ if(-not ($suspeitos | Where-Object { $_.id -eq $x.user_id })){ if(([datetime]$x.premium_until) -gt (Get-Date).ToUniversalTime()){ $suspeitos += [pscustomobject]@{ id=$x.user_id; nick=$x.nickname; premium=$x.premium; until=$x.premium_until; plan=$x.plan; ban=$false } } } }

if($suspeitos.Count -eq 0){
  Ok 'nenhuma conta precisa de correcao'
}else{
  $t=$suspeitos[0]
  In2 ('alvo do teste: '+[string]$t.nick)
  In2 ('antes: premium='+$t.premium+' until='+$t.until+' plano='+$t.plan)
  if($Aplicar){
    $corpo='{"premium":true,"plan":"owner","premium_until":"2099-12-31T23:59:59+00:00"}'
    $p=Req ($base+'/rest/v1/users?user_id=eq.'+$t.id) $hJ 'PATCH' $corpo
    if($p.Code -eq 200){
      $ret=@(Linhas $p.Corpo)
      if($ret.Count -gt 0){
        $depois=$ret[0]
        if($depois.premium -eq $true){
          Ok 'UPDATE aceito: premium=true persistiu - era policy no cliente, nao trigger'
        }else{
          Ef 'UPDATE nao persistiu: um TRIGGER reverteu a coluna premium'
          In2 ('retorno: premium='+$depois.premium+' plano='+$depois.plan)
        }
      }else{ Ef 'PATCH retornou vazio - a linha foi bloqueada' }
    }else{
      Ef ('PATCH HTTP '+$p.Code)
      if($p.Corpo){ In2 ($p.Corpo.Substring(0,[Math]::Min(240,$p.Corpo.Length))) }
    }
    $chk=Req ($base+'/rest/v1/users?select=premium,premium_until,plan&user_id=eq.'+$t.id) $hS
    foreach($z in @(Linhas $chk.Corpo)){ In2 ('depois: premium='+$z.premium+' until='+$z.premium_until+' plano='+$z.plan) }
  }else{
    Sk 'teste nao executado - rode com -Aplicar'
  }
}

Sec '5. SQL: TRIGGER E CORRECAO'
$ids=@()
foreach($t in $suspeitos){ $ids += ("'" + $t.id + "'::uuid") }
$listaIds = $ids -join ', '
$sql=@()
$sql+='-- LIBIDO | por que premium nao grava, e como corrigir'
$sql+=''
$sql+='-- 1) TRIGGERS DA TABELA USERS (o suspeito numero 1)'
$sql+='select t.tgname as gatilho,'
$sql+='       case when t.tgtype & 4 = 4 then ''INSERT '' else '''' end ||'
$sql+='       case when t.tgtype & 16 = 16 then ''UPDATE '' else '''' end ||'
$sql+='       case when t.tgtype & 8 = 8 then ''DELETE '' else '''' end as eventos,'
$sql+='       p.proname as funcao, pg_get_triggerdef(t.oid) as definicao'
$sql+='  from pg_trigger t join pg_class c on c.oid = t.tgrelid'
$sql+='  join pg_proc p on p.oid = t.tgfoid'
$sql+=' where c.relname = ''users'' and not t.tgisinternal;'
$sql+=''
$sql+='-- 2) CORPO DAS FUNCOES DE TRIGGER (procure premium ou plan na lista)'
$sql+='select p.proname as funcao, pg_get_functiondef(p.oid) as codigo'
$sql+='  from pg_proc p join pg_namespace n on n.oid = p.pronamespace'
$sql+=' where n.nspname = ''public'' and p.prorettype = ''trigger''::regtype;'
$sql+=''
$sql+='-- 3) PERMISSOES DE COLUNA (restringe quem pode escrever premium)'
$sql+='select grantee, privilege_type, column_name'
$sql+='  from information_schema.column_privileges'
$sql+=' where table_schema = ''public'' and table_name = ''users'''
$sql+='   and column_name in (''premium'',''plan'',''premium_until'')'
$sql+=' order by column_name, grantee;'
$sql+=''
$sql+='-- 4) POLICIES DE UPDATE EM USERS'
$sql+='select policyname, cmd, roles::text as papeis, qual, with_check'
$sql+='  from pg_policies where schemaname = ''public'' and tablename = ''users'''
$sql+=' order by cmd, policyname;'
$sql+=''
$sql+='-- 5) FUNCAO QUE IGNORA TRIGGER E POLICY (security definer)'
$sql+='create or replace function public.resgatar_vitalicio(p_user uuid, p_until timestamptz default null)'
$sql+='returns boolean language plpgsql security definer set search_path = public as $fn$'
$sql+='declare v int;'
$sql+='begin'
$sql+='  alter table public.users disable trigger user;'
$sql+='  update public.users set premium = true,'
$sql+='         plan = coalesce(nullif(plan,''''), ''owner''),'
$sql+='         premium_until = p_until'
$sql+='   where user_id = p_user or id = p_user;'
$sql+='  get diagnostics v = row_count;'
$sql+='  alter table public.users enable trigger user;'
$sql+='  return v > 0;'
$sql+='exception when others then'
$sql+='  alter table public.users enable trigger user;'
$sql+='  raise;'
$sql+='end;'
$sql+='$fn$;'
$sql+='revoke all on function public.resgatar_vitalicio(uuid, timestamptz) from public, anon;'
$sql+='grant execute on function public.resgatar_vitalicio(uuid, timestamptz) to authenticated;'
$sql+=''
$sql+='-- 6) CORRECAO DOS BENEFICIARIOS VITALICIOS CONFIRMADOS'
if($listaIds -ne ''){
  $sql+='begin;'
  $sql+="update public.users set premium = true, plan = 'owner', premium_until = '2099-12-31 23:59:59+00'"
  $sql+=' where user_id in ('+$listaIds+');'
  $sql+='commit;'
}else{
  $sql+='-- nenhum beneficiario pendente nesta rodada'
}
$sql+=''
$sql+='-- 7) CONFERENCIA'
$sql+='select nickname, premium, plan, premium_until from public.users where premium = true order by nickname;'
$sqlPath=Join-Path $Raiz 'DIAG_TRIGGER_VITALICIO.sql'
[IO.File]::WriteAllText($sqlPath,($sql -join "`r`n"),$utf8)
Ok ('SQL: '+$sqlPath)
if($listaIds -ne ''){ In2 ('bloco 6 afeta: '+$listaIds) }

Sec '6. BUILD'
if($SemBuild){ Sk 'build pulado' }
else{
  $out=& npm run build 2>&1
  $cod=$LASTEXITCODE
  $out|Select-Object -Last 4|ForEach-Object{In2 $_}
  if($cod -eq 0){ Ok 'build OK' } else { Ef ('build falhou ('+$cod+')') }
}

Sec 'VEREDITO'
In2 ('inconsistentes premium=false + data: '+$inc.Count)
In2 ('convites vitalicios resgatados  : '+$vitais.Count)
In2 ('beneficiarios quebrados         : '+$suspeitos.Count)
Write-Host ''
Write-Host '  Rode DIAG_TRIGGER_VITALICIO.sql no SQL Editor e me mande a SECAO 1.' -ForegroundColor Yellow
Write-Host '  Ela mostra qual trigger intercepta a coluna premium.' -ForegroundColor Yellow