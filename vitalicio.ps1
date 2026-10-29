param([string]$Raiz='C:\libidojan2026',[switch]$SemBuild)
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
    return [pscustomobject]@{Code=[int]$r.StatusCode;Body=$r.Content}
  }catch{
    $c=0; if($_.Exception.Response){$c=[int]$_.Exception.Response.StatusCode}
    $t=''; if($_.ErrorDetails.Message){$t=$_.ErrorDetails.Message}
    return [pscustomobject]@{Code=$c;Body=$t}
  }
}
Set-Location $Raiz

Sec '0. CREDENCIAIS'
$cfg=@{}
foreach($f in @('.env','backend\.env')){ $p=Join-Path $Raiz $f; if(Test-Path -LiteralPath $p){ foreach($ln in (Get-Content -LiteralPath $p -ErrorAction SilentlyContinue)){ if($ln -match '^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$'){ $k=$Matches[1]; $v=$Matches[2].Trim().Trim('"').Trim("'"); if(-not $cfg.ContainsKey($k)){$cfg[$k]=$v} } } } }
$base=$cfg['SUPABASE_URL']; if(-not $base){$base=$cfg['VITE_SUPABASE_URL']}
if($base){$base=$base.TrimEnd('/')}
$skey=$cfg['SUPABASE_SERVICE_ROLE_KEY']; if(-not $skey){$skey=$cfg['SERVICE_ROLE_KEY']}
$hS=@{apikey=$skey;Authorization=('Bearer '+$skey)}
$hJ=@{apikey=$skey;Authorization=('Bearer '+$skey);'Content-Type'='application/json'}
if(-not ($base -and $skey)){ Ef 'sem credenciais'; exit 1 }
Ok ('projeto: '+$base)

Sec '1. LIMPAR LOGINS DE TESTE (sem depender da Admin API)'
$testes=@(
  @{id='e29a3cc8-69c0-4e96-83cb-c9fa238595b3';mail='auditoria.20261029165740'},
  @{id='69abf35f-709b-460e-860f-b712a579d13b';mail='chattest.20261029175257'}
)
foreach($t in $testes){
  $r=Req ($base+'/rest/v1/users?user_id=eq.'+$t.id) $hS 'DELETE'
  if($r.Code -eq 204 -or $r.Code -eq 200){ In2 ('perfil removido: '+$t.mail) }
  else{ In2 ('perfil '+$t.mail+' -> HTTP '+$r.Code) }
  $a=Req ($base+'/auth/v1/admin/users/'+$t.id) $hJ 'DELETE'
  if($a.Code -eq 200 -or $a.Code -eq 204){ In2 ('auth removido: '+$t.mail) }
  else{ In2 ('auth '+$t.mail+' -> HTTP '+$a.Code+' (500 aqui e esperado neste projeto)') }
}
Ok 'limpeza concluida'

Sec '2. CONTAS SUSPEITAS DE VITALICIO QUEBRADO'
$r=Req ($base+'/rest/v1/users?select=user_id,nickname,premium,premium_until,created_at&premium=eq.false&premium_until=is.null&order=created_at.asc&limit=200') $hS
$cand=@()
if($r.Code -eq 200){
  foreach($x in @($r.Body|ConvertFrom-Json)){
    if($x.nickname -match '^(auditoria\.|chattest\.|teste\.)'){continue}
    $cand+=[string]$x.nickname
    Write-Host ('  '+([string]$x.nickname).PadRight(24)+' criado='+([string]$x.created_at).Substring(0,10)) -ForegroundColor Yellow
  }
  Ok ($cand.Count.ToString()+' conta(s) no estado ambiguo (premium=false + premium_until=null)')
}else{ Ef ('consulta users: HTTP '+$r.Code) }

Sec '3. QUEM TEM PREMIUM ATIVO (referencia do estado correto)'
$r2=Req ($base+'/rest/v1/users?select=nickname,premium,premium_until,plan&premium=eq.true&limit=50') $hS
if($r2.Code -eq 200){
  foreach($x in @($r2.Body|ConvertFrom-Json)){
    In2 (([string]$x.nickname).PadRight(24)+' until='+([string]$x.premium_until)+' plan='+([string]$x.plan))
  }
}else{ Ef ('consulta premium: HTTP '+$r2.Code) }

Sec '4. TABELAS DE CONVITE'
$tabInv=$null
foreach($n in @('premium_invite_codes','premium_invites','invite_codes','convites','premium_links')){
  $x=Req ($base+'/rest/v1/'+$n+'?select=*&limit=1') $hS
  if($x.Code -eq 200){
    $tabInv=$n; Ok ('tabela: '+$n)
    foreach($l in @($x.Body|ConvertFrom-Json)){ foreach($pp in $l.PSObject.Properties){ In2 ('  coluna: '+$pp.Name) } }
    break
  }
  elseif($x.Code -ne 404){ In2 ($n+' -> HTTP '+$x.Code) }
}
if(-not $tabInv){ Sk 'nenhuma tabela de convite reconhecida' }

Sec '5. ULTIMOS RESGATES'
if($tabInv){
  $x=Req ($base+'/rest/v1/'+$tabInv+'?select=*&limit=20') $hS
  if($x.Code -eq 200){ foreach($l in @($x.Body|ConvertFrom-Json)){ In2 ($l|ConvertTo-Json -Compress -Depth 2) } }
}

Sec '6. SQL DE CORRECAO'
$lista=''
if($cand.Count -gt 0){ $lista = ($cand | ForEach-Object { "'" + ($_ -replace "'","''") + "'" }) -join ', ' }
$sql=@()
$sql+='-- LIBIDO | vitalicio: funcao segura + correcao de dados'
$sql+='-- PARTE 1 | funcao que liga premium sem depender de policy nem trigger'
$sql+='create or replace function public.resgatar_vitalicio(p_user uuid, p_until timestamptz default null)'
$sql+='returns boolean language plpgsql security definer set search_path = public as $fn$'
$sql+='declare v int;'
$sql+='begin'
$sql+='  update public.users set premium = true, premium_until = p_until'
$sql+='   where user_id = p_user or id = p_user;'
$sql+='  get diagnostics v = row_count;'
$sql+='  return v > 0;'
$sql+='end;'
$sql+='$fn$;'
$sql+='revoke all on function public.resgatar_vitalicio(uuid, timestamptz) from public, anon;'
$sql+='grant execute on function public.resgatar_vitalicio(uuid, timestamptz) to authenticated;'
$sql+=''
$sql+='-- PARTE 2 | correcao de dados NAS CONTAS LISTADAS ABAIXO'
$sql+='-- Confira nickname por nickname antes de rodar. premium=false + premium_until=null'
$sql+='-- e tambem o estado de TODO cadastro novo: nao aplique em quem nao pagou.'
if($lista -ne ''){
  $sql+='begin;'
  $sql+='update public.users set premium = true, premium_until = null'
  $sql+=' where premium = false and premium_until is null'
  $sql+='   and nickname in ('+$lista+');'
  $sql+='commit;'
}else{ $sql+='-- nenhuma conta candidata nesta rodada' }
$sql+=''
$sql+='-- PARTE 3 | verificacao'
$sql+='select nickname, premium, premium_until from public.users where premium = true order by nickname;'

$sqlPath=Join-Path $Raiz 'FIX_VITALICIO.sql'
[IO.File]::WriteAllText($sqlPath,($sql -join "`r`n"),$utf8)
Ok ('SQL gerado: '+$sqlPath)
if($lista -ne ''){ In2 ('lista: '+$lista) }

Sec '7. PATCH DO CODIGO (caminho principal via RPC)'
$pi=Join-Path $Raiz 'src\services\premiumInvites.ts'
if(Test-Path -LiteralPath $pi){
  $t=[IO.File]::ReadAllText($pi)
  if($t -match 'resgatar_vitalicio'){
    Sk 'RPC ja integrado no codigo'
  }else{
    $velho='    let aplicado = false;'
    $novo="    // VITALICIO-RPC: caminho principal via funcao security definer no banco,"+[Environment]::NewLine+
          "    // que nao depende de policy de UPDATE na tabela users."+[Environment]::NewLine+
          "    let aplicado = false;"+[Environment]::NewLine+
          "    try {"+[Environment]::NewLine+
          "      const { data: rpcOk } = await (supabase as any).rpc('resgatar_vitalicio', { p_user: userId, p_until: until });"+[Environment]::NewLine+
          "      if (rpcOk === true) aplicado = true;"+[Environment]::NewLine+
          "    } catch (eRpc) { console.error('VITALICIO-RPC falhou', eRpc); }"
    if($t.Contains($velho)){
      [IO.File]::WriteAllText($pi,$t.Replace($velho,$novo),$utf8)
      Ok 'premiumInvites.ts - RPC como caminho principal'
    }else{ Sk 'ancora "let aplicado = false;" nao encontrada' }
  }
}else{ Ef 'premiumInvites.ts ausente' }

Sec '8. BUILD'
if($SemBuild){ Sk 'build pulado' }
else{
  $out=& npm run build 2>&1
  $cod=$LASTEXITCODE
  $out|Select-Object -Last 5|ForEach-Object{In2 $_}
  if($cod -eq 0){ Ok 'build OK' } else { Ef ('build falhou ('+$cod+') - restaure de .backup-fix4-20261029-174754') }
}

Sec 'VEREDITO'
In2 ('candidatos  : '+$cand.Count)
In2 ('sql         : FIX_VITALICIO.sql')
In2 ('codigo      : RPC resgatar_vitalicio + fallback antigo mantido')
Write-Host ''
Write-Host '  Ordem: rode FIX_VITALICIO.sql no SQL Editor do projeto '+$base -ForegroundColor Yellow
Write-Host '  Depois confira a PARTE 2 antes de commitar: ela trata como premium' -ForegroundColor Yellow
Write-Host '  todo nickname listado, inclusive quem nao pagou.' -ForegroundColor Yellow