[CmdletBinding()]
param(
  [switch]$Audit,[switch]$Apply,[switch]$Deploy,[switch]$All,
  [switch]$SkipBuild,[switch]$SkipDeployCheck,[string]$ReportDir='reports'
)
$ErrorActionPreference='Continue'
$script:Root = if($PSScriptRoot){ Split-Path -Parent $PSScriptRoot } else { (Get-Location).Path }
$script:F = New-Object System.Collections.ArrayList
$script:SqlOk=$false; $script:SqlErr=$null
Set-Location $script:Root

function W-OK($m){ Write-Host "  OK       $m" -ForegroundColor Green }
function W-NG($m){ Write-Host "  FALHA    $m" -ForegroundColor Red }
function W-IN($m){ Write-Host "  INFO     $m" -ForegroundColor DarkGray }
function W-H ($m){ Write-Host ''; Write-Host "=== $m ===" -ForegroundColor Cyan }
function AddF { param([string]$Id,[string]$Sev,[string]$Alvo,[string]$Det,[string]$Fix='')
  [void]$script:F.Add([pscustomobject]@{Id=$Id;Severity=$Sev;Alvo=$Alvo;Detalhe=$Det;Fix=$Fix}) }

function GetCfg {
  $p = Join-Path $script:Root 'src\config\supabasePublic.ts'
  if(-not (Test-Path $p)){ throw "arquivo nao encontrado: $p" }
  $m = [regex]::Match((Get-Content $p -Raw),'https://([a-z0-9]+)\.supabase\.co')
  if(-not $m.Success){ throw 'ref do projeto nao encontrado' }
  $ref = $m.Groups[1].Value
  $tk = Join-Path $script:Root 'tools\.supabase-token'
  $token=$null
  if($env:SUPABASE_ACCESS_TOKEN -match '^sbp_'){ $token=$env:SUPABASE_ACCESS_TOKEN.Trim() }
  if(-not $token -and (Test-Path $tk)){ $v=(Get-Content $tk -Raw).Trim(); if($v -match '^sbp_'){ $token=$v } }
  if(-not $token){
    Write-Host '  Token: https://supabase.com/dashboard/account/tokens' -ForegroundColor Magenta
    $e=(Read-Host '  sbp_...').Trim(); if($e -match '^sbp_'){ $token=$e }
  }
  if(-not $token){ throw 'sem token de gerenciamento' }
  [IO.File]::WriteAllText($tk,$token,(New-Object System.Text.UTF8Encoding($false)))
  $gi = Join-Path $script:Root '.gitignore'
  if(-not (Test-Path $gi)){ New-Item -ItemType File -Path $gi | Out-Null }
  if(-not (Select-String -Path $gi -Pattern 'supabase-token' -Quiet)){ Add-Content $gi "`r`ntools/.supabase-token" }
  [pscustomobject]@{ Ref=$ref; Headers=@{ Authorization="Bearer $token"; 'Content-Type'='application/json' } }
}

function Q {
  param($Cfg,[string]$Sql)
  $script:SqlOk=$false; $script:SqlErr=$null
  $uri = "https://api.supabase.com/v1/projects/$($Cfg.Ref)/database/query"
  for($i=1;$i -le 3;$i++){
    try {
      $r = Invoke-RestMethod -Method Post -Uri $uri -Headers $Cfg.Headers -Body (@{query=$Sql}|ConvertTo-Json -Compress) -TimeoutSec 180 -ErrorAction Stop
      if($r -is [string]){ $r = $r | ConvertFrom-Json }
      $script:SqlOk=$true
      if($null -eq $r){ return @() }
      return @($r)
    } catch {
      $script:SqlErr = if($_.ErrorDetails.Message){ $_.ErrorDetails.Message } else { $_.Exception.Message }
      if("$($script:SqlErr)" -match '\(4\d\d\)|syntax|does not exist'){ break }
      if($i -lt 3){ Start-Sleep -Seconds ($i*2) }
    }
  }
  return $null
}

$script:TIPOS = @('text','uuid','integer','int4','int8','int','boolean','bool','timestamptz','timestamp','numeric','double','real','bigint','smallint','date','time','jsonb','json','bytea','interval','varchar','character','serial','bigserial','money','inet','citext','anyarray','anyelement','regclass','oid')

function SplitTop {
  param([string]$s)
  $out=@(); $buf=''; $d=0
  foreach($ch in $s.ToCharArray()){
    if($ch -eq '('){ $d++; $buf+=$ch; continue }
    if($ch -eq ')'){ $d--; $buf+=$ch; continue }
    if($ch -eq ',' -and $d -eq 0){ $out+=$buf; $buf=''; continue }
    $buf+=$ch
  }
  if($buf.Trim()){ $out+=$buf }
  return $out
}

function ArgInfo {
  param([string]$seg)
  $s = $seg.Trim()
  $opt = [bool]($s -match '(?i)\sDEFAULT\s')
  $antes = ($s -split '(?i)\sDEFAULT\s')[0].Trim()
  $toks = @($antes -split '\s+' | Where-Object { $_ })
  $nome = $null
  if($toks.Count -ge 2 -and ($script:TIPOS -notcontains $toks[0].ToLower().Trim('"'))){
    $nome = $toks[0].Trim('"')
  }
  [pscustomobject]@{ Nome=$nome; Opt=$opt }
}

function GetDb {
  param($Cfg)
  $rows=@(); $off=0; $passo=50; $g=0
  while($g -lt 40){
    $g++
    $sql = "select p.proname::text as nome, pg_get_function_arguments(p.oid) as args, pg_get_function_identity_arguments(p.oid) as ident, pg_get_functiondef(p.oid) as def from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prokind in ('f','p') order by 1,3 limit $passo offset $off;"
    $r = Q -Cfg $Cfg -Sql $sql
    if(-not $script:SqlOk){ throw "inventario do banco falhou: $($script:SqlErr)" }
    if($r.Count -eq 0){ break }
    $rows += $r
    if($r.Count -lt $passo){ break }
    $off += $passo
  }
  return $rows
}

function GetCode {
  $map=@{}
  $arqs = @(Get-ChildItem (Join-Path $script:Root 'src') -Recurse -File -Include *.ts,*.tsx -ErrorAction SilentlyContinue)
  foreach($a in $arqs){
    $t = Get-Content $a.FullName -Raw -ErrorAction SilentlyContinue
    if(-not $t){ continue }
    foreach($m in [regex]::Matches($t,'rpc\(\s*["'']([a-z0-9_]+)["'']\s*(?:,\s*\{([^}]*)\})?')){
      $n = $m.Groups[1].Value
      if(-not $map.ContainsKey($n)){ $map[$n]=@{ Files=@(); Calls=@() } }
      if($map[$n].Files -notcontains $a.Name){ $map[$n].Files += $a.Name }
      $ps=@()
      if($m.Groups[2].Value){
        foreach($k in [regex]::Matches($m.Groups[2].Value,'([a-zA-Z0-9_]+)\s*:')){
          if($ps -notcontains $k.Groups[1].Value){ $ps += $k.Groups[1].Value }
        }
      }
      $map[$n].Calls += ,$ps
    }
  }
  return $map
}

function GetTables {
  param($Cfg)
  $r = Q -Cfg $Cfg -Sql "select table_name::text as t from information_schema.tables where table_schema='public' order by 1;"
  if(-not $script:SqlOk){ return @() }
  return @($r | ForEach-Object { $_.t })
}

function Resolve-Variant {
  param($Row)
  $nomes=@(); $obrig=@()
  if(-not [string]::IsNullOrWhiteSpace($Row.args)){
    foreach($seg in (SplitTop -s $Row.args)){
      $i = ArgInfo -seg $seg
      if($i.Nome){ $nomes += $i.Nome; if(-not $i.Opt){ $obrig += $i.Nome } }
    }
  }
  [pscustomobject]@{ Nomes=$nomes; Obrig=$obrig }
}

function Audit-Rpc {
  param($Db,$Code)
  $by=@{}
  foreach($x in $Db){
    if(-not $by.ContainsKey($x.nome)){ $by[$x.nome]=@() }
    $by[$x.nome] += $x
  }
  foreach($n in ($Code.Keys | Sort-Object)){
    $files = $Code[$n].Files -join ', '
    if(-not $by.ContainsKey($n)){ AddF 'RPC_AUSENTE' 'Error' $n "chamada em $files, inexistente em public" 'criar'; continue }
    $vs = @($by[$n] | ForEach-Object { Resolve-Variant $_ })
    $falhas=@()
    foreach($call in $Code[$n].Calls){
      $ok=$false
      foreach($v in $vs){
        $t=$true
        foreach($c in $call){ if($v.Nomes -notcontains $c){ $t=$false; break } }
        if($t){ foreach($r in $v.Obrig){ if($call -notcontains $r){ $t=$false; break } } }
        if($t){ $ok=$true; break }
      }
      if(-not $ok){ $falhas += $(if($call.Count -eq 0){'(sem params)'} else { $call -join ',' }) }
    }
    if($falhas.Count -eq 0){
      AddF 'RPC_OK' 'Info' $n "assinatura compativel"
    } else {
      $b = @($by[$n] | ForEach-Object { "($($_.ident))" }) -join ' | '
      AddF 'RPC_ASSINATURA' 'Warning' $n "call site=[$($falhas -join ' / ')] banco=$b" 'revisar'
    }
  }
  foreach($n in ($by.Keys | Sort-Object)){
    if(-not $Code.ContainsKey($n)){ AddF 'RPC_ORFA' 'Info' $n 'definida no banco, sem chamada no codigo' }
  }
}

function Audit-Schema {
  param($Cfg,$Code)
  $sql = "select n.nspname::text as s, p.proname::text as nome from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname not in ('pg_catalog','information_schema','public') and p.prokind in ('f','p') order by 2;"
  $r = Q -Cfg $Cfg -Sql $sql
  if(-not $script:SqlOk){ return }
  foreach($x in $r){ if($Code.ContainsKey($x.nome)){ AddF 'SCHEMA_ERRADO' 'Error' $x.nome "existe em $($x.s), codigo chama public" } }
}

function Audit-Artefato {
  param($Cfg)
  $sql = "select p.proname::text as nome from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('_dump_funcoes','_dump_all','_rpc_defs','_ddl_export');"
  $r = Q -Cfg $Cfg -Sql $sql
  if(-not $script:SqlOk){ return }
  foreach($x in $r){ AddF 'ARTEFATO' 'Warning' $x.nome 'artefato de diagnostico no banco' 'limpar' }
}

function Audit-Rls {
  param($Cfg)
  $sql = "select c.relname::text as t from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relrowsecurity=false order by 1;"
  $r = Q -Cfg $Cfg -Sql $sql
  if(-not $script:SqlOk){ return }
  foreach($x in $r){ AddF 'RLS_OFF' 'Warning' $x.t 'RLS desligado em tabela de public' }
}

function Audit-Build {
  if($SkipBuild){ AddF 'BUILD_SKIP' 'Info' 'npm run build' 'ignorado'; return }
  $log = Join-Path $env:TEMP ("b-"+[guid]::NewGuid().ToString('N')+".log")
  $null = cmd /c "npm run build > `"$log`" 2>&1"
  if($LASTEXITCODE -eq 0){ AddF 'BUILD_OK' 'Info' 'npm run build' 'sucesso' }
  else { AddF 'BUILD_FALHA' 'Error' 'npm run build' ((@(Get-Content $log -Tail 12 -ErrorAction SilentlyContinue)) -join ' ~ ') }
}

function Audit-Git {
  $null = & git rev-parse --is-inside-work-tree 2>$null
  if($LASTEXITCODE -ne 0){ AddF 'GIT_FORA' 'Warning' 'git' 'nao e repositorio'; return }
  $st = @(& git status --porcelain 2>$null)
  if($st.Count -eq 0){ AddF 'GIT_LIMPO' 'Info' 'git' 'sem alteracoes pendentes' }
  else { AddF 'GIT_PENDENTE' 'Info' 'git' "$($st.Count) arquivo(s) nao commitado(s)" }
}

function Get-Html {
  param([string]$Url)
  try { $h = [System.Net.Dns]::GetHostEntry(([uri]$Url).Host) } catch { return @{ Ok=$false; Erro='DNS nao resolve' } }
  for($i=1;$i -le 3;$i++){
    try {
      $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 45 -ErrorAction Stop
      return @{ Ok=$true; Content=$r.Content }
    } catch {
      if($i -lt 3){ Start-Sleep -Seconds 2 }
      else { return @{ Ok=$false; Erro=$_.Exception.Message } }
    }
  }
}

function Audit-Prod {
  if($SkipDeployCheck){ AddF 'PROD_SKIP' 'Info' 'producao' 'ignorado'; return }
  foreach($d in @('https://www.libidoapp.com.br','https://libido2026.vercel.app')){
    $v = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $r = Get-Html -Url "$d/?v=$v"
    if(-not $r.Ok){ AddF 'PROD_NAO_VERIFICAVEL' 'Warning' $d "sem acesso da rede local: $($r.Erro)"; continue }
    $js = @([regex]::Matches($r.Content,'src="([^"]+\.js[^"]*)"') | ForEach-Object { $_.Groups[1].Value } | Select-Object -First 1)
    if(-not $js){ AddF 'PROD_SEM_BUNDLE' 'Warning' $d 'nenhum bundle no HTML'; continue }
    $alvo = if($js -match '^https?://'){ $js } else { ($d.TrimEnd('/')+'/'+$js.TrimStart('/')) }
    $b = Get-Html -Url "$alvo?v=$v"
    if(-not $b.Ok){ AddF 'PROD_NAO_VERIFICAVEL' 'Warning' $d "bundle inacessivel: $($b.Erro)"; continue }
    $nome = ($alvo -split '/')[-1]
    if($b.Content -match 'useCallback is not defined'){ AddF 'PROD_ERRO_HOOK' 'Error' $d "$nome com erro de hook" }
    elseif($b.Content -match 'listar_conversas'){ AddF 'PROD_OK' 'Info' $d $nome }
    else { AddF 'PROD_SUSPEITO' 'Warning' $d "$nome sem marcador esperado" }
  }
}

function Apply-Fix {
  param($Cfg)
  $stmts=@()
  foreach($f in @($script:F | Where-Object { $_.Id -eq 'ARTEFATO' })){ $stmts += "drop function if exists public.$($f.Alvo)();" }
  if($stmts.Count -eq 0){ W-IN 'nada aplicavel automaticamente'; return }
  $sql = ($stmts -join "`r`n") + "`r`nnotify pgrst, 'reload schema';"
  $null = Q -Cfg $Cfg -Sql $sql
  if(-not $script:SqlOk){ AddF 'FIX_FALHOU' 'Error' 'apply' $script:SqlErr }
  else { AddF 'FIX_APLICADO' 'Info' 'apply' "$($stmts.Count) comando(s)" }
}

function Show-R {
  W-H 'RESULTADO'
  $ord=@{Error=0;Warning=1;Info=2}
  foreach($f in ($script:F | Sort-Object { $ord[$_.Severity] },Id,Alvo)){
    if($f.Id -in @('RPC_OK','RPC_ORFA')){ continue }
    $cor = switch($f.Severity){ 'Error'{'Red'} 'Warning'{'Yellow'} default{'DarkGray'} }
    $tag = switch($f.Severity){ 'Error'{'ERRO '} 'Warning'{'AVISO'} default{'INFO '} }
    Write-Host ("  {0}  {1,-22} {2,-24} {3}" -f $tag,$f.Id,$f.Alvo,$f.Detalhe) -ForegroundColor $cor
  }
  $ok = @($script:F | Where-Object { $_.Id -eq 'RPC_OK' }).Count
  $or = @($script:F | Where-Object { $_.Id -eq 'RPC_ORFA' }).Count
  if($ok -gt 0){ W-OK "$ok RPC(s) com assinatura compativel" }
  if($or -gt 0){ W-IN "$or RPC(s) orfa(s) no banco (sem chamada no codigo)" }
}

function Export-R {
  $dir = Join-Path $script:Root $ReportDir
  if(-not (Test-Path $dir)){ New-Item -ItemType Directory -Path $dir | Out-Null }
  $ts = Get-Date -Format 'yyyyMMdd-HHmmss'
  $j = Join-Path $dir "audit-$ts.json"; $m = Join-Path $dir "audit-$ts.md"
  $script:F | ConvertTo-Json -Depth 6 | Set-Content $j -Encoding UTF8
  $L = @("# Auditoria $ts", '', "Achados: $($script:F.Count)", '')
  foreach($sev in 'Error','Warning','Info'){
    $g = @($script:F | Where-Object { $_.Severity -eq $sev })
    if($g.Count -eq 0){ continue }
    $L += "## $sev ($($g.Count))"
    foreach($f in $g){ $L += "- **$($f.Id)** ``$($f.Alvo)`` - $($f.Detalhe)" }
    $L += ''
  }
  $L | Set-Content $m -Encoding UTF8
  W-IN "relatorios: $j | $m"
}

function Publish {
  W-H 'PUBLICACAO'
  $erros = @($script:F | Where-Object { $_.Severity -eq 'Error' })
  if($erros.Count -gt 0){
    W-NG "deploy bloqueado por $($erros.Count) erro(s)"
    foreach($e in $erros){ Write-Host "     - $($e.Id): $($e.Alvo)" -ForegroundColor Yellow }
    return 1
  }
  $null = & git add -A 2>$null
  $null = & git commit -m "chore: auditoria automatica libido.ps1" 2>$null
  & git push origin main 2>&1 | ForEach-Object { W-IN $_ }
  $null = & git fetch origin 2>$null
  $fora = @(& git log --oneline 'origin/main..HEAD' 2>$null)
  if($fora.Count -eq 0){ W-OK "publicado $(& git rev-parse --short HEAD)"; return 0 }
  W-NG "$($fora.Count) commit(s) fora do remoto"; return 1
}

function Run {
  W-H '0. CONFIG'
  $cfg=$null
  try { $cfg = GetCfg; W-OK "projeto $($cfg.Ref)" }
  catch { W-NG $_.Exception.Message; AddF 'CONFIG' 'Error' 'config' $_.Exception.Message; return }

  W-H '1. BANCO'
  $db=@(); $tb=@()
  try { $db=@(GetDb -Cfg $cfg); $tb=@(GetTables -Cfg $cfg); W-OK "$($db.Count) funcao(oes) / $($tb.Count) tabela(s)" }
  catch { W-NG $_.Exception.Message; AddF 'DB_OFFLINE' 'Error' 'banco' $_.Exception.Message }

  W-H '2. CODIGO'
  $code=@{}
  try { $code = GetCode; W-OK "$($code.Count) RPC(s) chamada(s)" }
  catch { W-NG $_.Exception.Message; AddF 'CODE_OFFLINE' 'Error' 'codigo' $_.Exception.Message }

  W-H '3. AUDITORIA'
  if($db.Count -gt 0 -and $code.Count -gt 0){
    Audit-Rpc -Db $db -Code $code
    $aus = @($script:F | Where-Object { $_.Id -eq 'RPC_AUSENTE' }).Count
    $div = @($script:F | Where-Object { $_.Id -eq 'RPC_ASSINATURA' }).Count
    W-OK "$($code.Count - $aus - $div) RPC(s) conformes"
    if($aus -gt 0){ W-NG "$aus ausente(s) no banco" }
    if($div -gt 0){ W-NG "$div com assinatura incompativel" }
  }
  if($db.Count -gt 0){ Audit-Schema -Cfg $cfg -Code $code; Audit-Artefato -Cfg $cfg; Audit-Rls -Cfg $cfg }

  W-H '4. CORRECAO'
  if($Apply -and $db.Count -gt 0){ Apply-Fix -Cfg $cfg } else { W-IN 'somente leitura (use -Apply)' }

  W-H '5. BUILD'
  Audit-Build
  if(@($script:F | Where-Object { $_.Id -eq 'BUILD_OK' }).Count -gt 0){ W-OK 'build OK' }
  elseif(@($script:F | Where-Object { $_.Id -eq 'BUILD_SKIP' }).Count -eq 0){ W-NG 'build falhou' }

  W-H '6. GIT'
  Audit-Git
  $gp = @($script:F | Where-Object { $_.Id -eq 'GIT_PENDENTE' })
  if($gp.Count -gt 0){ W-IN $gp[0].Detalhe } else { W-OK 'working tree limpo' }

  W-H '7. PRODUCAO'
  Audit-Prod
  foreach($f in @($script:F | Where-Object { $_.Id -like 'PROD_*' })){
    if($f.Severity -eq 'Error'){ W-NG "$($f.Alvo) $($f.Detalhe)" }
    elseif($f.Severity -eq 'Warning'){ W-IN "$($f.Alvo) $($f.Detalhe)" }
    else { W-OK "$($f.Alvo) $($f.Detalhe)" }
  }

  Show-R
  Export-R
}

if($All){ $Audit=$true; $Apply=$true; $Deploy=$true }
if(-not $Audit -and -not $Apply -and -not $Deploy){ $Audit=$true }

Write-Host ''
Write-Host '  libido.ps1 v2 | auditoria centralizada' -ForegroundColor Cyan
Write-Host "  raiz: $($script:Root)" -ForegroundColor DarkGray

Run
$rc=0
if($Deploy){ $rc = Publish }

$erros  = @($script:F | Where-Object { $_.Severity -eq 'Error' })
$avisos = @($script:F | Where-Object { $_.Severity -eq 'Warning' })
W-H 'VEREDITO'
Write-Host ("  erros: {0}  avisos: {1}  achados: {2}" -f $erros.Count,$avisos.Count,$script:F.Count) -ForegroundColor DarkGray
if($erros.Count -eq 0 -and $avisos.Count -eq 0){ W-OK 'limpo' }
elseif($erros.Count -eq 0){ W-IN 'sem erros, com avisos' }
else { W-NG 'pendencias bloqueantes' }
exit $(if($erros.Count -gt 0){1} elseif($rc -ne 0){$rc} else {0})