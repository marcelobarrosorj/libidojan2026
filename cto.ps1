param(
  [string]$Raiz = 'C:\libidojan2026',
  [switch]$Corrigir,
  [switch]$Manter,
  [switch]$SemBuild
)

$ErrorActionPreference = 'Continue'
$utf8 = New-Object System.Text.UTF8Encoding($false)

function L($t)   { Write-Host ''; Write-Host ('=== ' + $t + ' ===') -ForegroundColor Cyan }
function Ok($t)  { Write-Host ('  OK     ' + $t) -ForegroundColor Green }
function Av($t)  { Write-Host ('  AVISO  ' + $t) -ForegroundColor Yellow }
function Er($t)  { Write-Host ('  FALHA  ' + $t) -ForegroundColor Red }
function Inf($t) { Write-Host ('         ' + $t) -ForegroundColor DarkGray }

$P = New-Object System.Collections.ArrayList
function AddP($t) { if (-not $P.Contains($t)) { [void]$P.Add($t) } }

if (-not (Test-Path -LiteralPath $Raiz)) { Er ('raiz inexistente: ' + $Raiz); exit 1 }
Push-Location $Raiz

# ============================================================
L '1. CONFIGURACAO'
# ============================================================

$cfg = @{}
foreach ($f in @('.env','backend\.env','.env.local','backend\.env.local')) {
  $p = Join-Path $Raiz $f
  if (-not (Test-Path -LiteralPath $p)) { continue }
  foreach ($ln in (Get-Content -LiteralPath $p -ErrorAction SilentlyContinue)) {
    if ($ln -match '^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$') {
      $k = $Matches[1]
      $v = $Matches[2].Trim().Trim('"').Trim("'")
      if (-not $cfg.ContainsKey($k)) { $cfg[$k] = $v }
    }
  }
}

$base = $cfg['SUPABASE_URL']
if (-not $base) { $base = $cfg['VITE_SUPABASE_URL'] }
if ($base) { $base = $base.TrimEnd('/') } else { Er 'SUPABASE_URL ausente'; Pop-Location; exit 1 }

$skey = $cfg['SUPABASE_SERVICE_ROLE_KEY']
if (-not $skey) { $skey = $cfg['SERVICE_ROLE_KEY'] }

$anon = $cfg['VITE_SUPABASE_ANON_KEY']
if (-not $anon) { $anon = $cfg['SUPABASE_ANON_KEY'] }
if (-not $anon) { $anon = $cfg['VITE_SUPABASE_PUBLISHABLE_KEY'] }
if (-not $anon) {
  $dirBundle = Join-Path $Raiz 'dist\assets'
  if (Test-Path -LiteralPath $dirBundle) {
    foreach ($js in (Get-ChildItem -LiteralPath $dirBundle -Filter *.js -ErrorAction SilentlyContinue)) {
      $m = [regex]::Match([System.IO.File]::ReadAllText($js.FullName, [System.Text.Encoding]::UTF8), 'sb_publishable_[A-Za-z0-9_-]{8,}')
      if ($m.Success) { $anon = $m.Value; break }
    }
  }
}

$pat = $cfg['SUPABASE_ACCESS_TOKEN']
$ref = ''
if ($base -match 'https://([a-z0-9]+)\.supabase\.co') { $ref = $Matches[1] }

Ok ('url  : ' + $base)
if ($ref)  { Ok ('ref  : ' + $ref) } else { AddP 'ref nao extraido' }
if ($anon) { Ok ('anon : ' + $anon.Substring(0,[Math]::Min(14,$anon.Length)) + '...') } else { AddP 'anon key ausente' }
if ($skey) { Ok 'admin: presente' } else { AddP 'service_role ausente' }
if ($pat)  { Ok 'pat  : presente' } else { Av 'pat  : ausente - bloco SQL pulado' }

function Req([string]$u, [hashtable]$h, [string]$m = 'GET', [string]$b = '') {
  try {
    $args = @{ Uri = $u; Headers = $h; UseBasicParsing = $true; TimeoutSec = 30; Method = $m }
    if ($b -ne '') { $args['Body'] = $b }
    $r = Invoke-WebRequest @args
    return [pscustomobject]@{ Code = 200; Content = $r.Content }
  } catch {
    $c = 0
    if ($_.Exception.Response) { $c = [int]$_.Exception.Response.StatusCode }
    $t = ''
    try { if ($_.ErrorDetails.Message) { $t = $_.ErrorDetails.Message } } catch { }
    return [pscustomobject]@{ Code = $c; Content = $t }
  }
}

# ============================================================
L '2. GIT'
# ============================================================

$temGit = Test-Path -LiteralPath (Join-Path $Raiz '.git')
$riscoGit = $false

if (-not $temGit) {
  Av 'nao e repositorio git'
} else {
  $trk = @(git ls-files 2>$null | Where-Object { $_ -match '(^|/)\.env(\.|$)' -and $_ -notmatch '\.example$' })
  if ($trk.Count -gt 0) { $riscoGit = $true; Er ('versionados: ' + ($trk -join ', ')); AddP 'env versionado no HEAD' }
  else { Ok 'nenhum .env versionado' }

  $hist = @(git log --all --pretty=format: --name-only --diff-filter=A 2>$null | Where-Object { $_ -match '(^|/)\.env(\.|$)' -and $_ -notmatch '\.example$' } | Sort-Object -Unique)
  if ($hist.Count -gt 0) { $riscoGit = $true; Er ('no historico: ' + ($hist -join ', ')); AddP 'env no historico do git' }
  else { Ok 'nenhum .env no historico' }

  if ($skey -and $skey.Length -gt 25) {
    $frag = $skey.Substring($skey.Length - 22)
    $hits = @(git log --all -S $frag --pretty=format:'%h %s' 2>$null)
    if ($hits.Count -gt 0) {
      $riscoGit = $true
      Er 'service_role ATUAL aparece no historico'
      foreach ($h in $hits) { Inf $h }
      AddP 'service_role no historico - ROTACIONAR'
    } else { Ok 'service_role atual fora do historico' }
  } else { Av 'service_role nao lida - busca pulada' }

  $rem = @(git remote -v 2>$null)
  if ($rem.Count -gt 0) { Inf ($rem[0] -replace '\s+',' ') }
}

# ============================================================
L '3. ANON KEY'
# ============================================================

$tabelas = New-Object System.Collections.ArrayList
if ($skey) {
  $spec = Req ($base + '/rest/v1/') @{ apikey = $skey; Authorization = ('Bearer ' + $skey) }
  if ($spec.Code -eq 200 -and $spec.Content) {
    try {
      $j = $spec.Content | ConvertFrom-Json
      if ($j.definitions) { foreach ($n in $j.definitions.PSObject.Properties.Name) { if ($n -notlike 'pg_*') { [void]$tabelas.Add($n) } } }
      elseif ($j.components -and $j.components.schemas) { foreach ($n in $j.components.schemas.PSObject.Properties.Name) { [void]$tabelas.Add($n) } }
    } catch { }
  }
}
if ($tabelas.Count -eq 0) {
  foreach ($t in @('users','profiles','follows','messages','chat_messages','blocks','affiliate_referrals','posts','fotos','photos','likes','eventos','grupos','notificacoes','visits','invites','premium_invites','partners','reports','radar','subscriptions','payments')) { [void]$tabelas.Add($t) }
  Av 'spec nao lida - lista de candidatos'
}
$tabelas = @($tabelas | Sort-Object -Unique)
Inf ('tabelas: ' + $tabelas.Count)

$expostas = New-Object System.Collections.ArrayList
$chaveValida = $false

if ($anon) {
  $hA = @{ apikey = $anon; Authorization = ('Bearer ' + $anon) }
  $ctrl = Req ($base + '/rest/v1/tabela_inexistente_xyz?select=*&limit=1') $hA

  if ($ctrl.Code -eq 404) { $chaveValida = $true; Ok 'controle 404 - anon key valida' }
  elseif ($ctrl.Code -eq 401 -or $ctrl.Code -eq 403) { Er ('controle HTTP ' + $ctrl.Code + ' - anon key invalida'); AddP 'anon key invalida' }
  else { Av ('controle HTTP ' + $ctrl.Code) }

  if ($chaveValida) {
    foreach ($t in $tabelas) {
      $x = Req ($base + '/rest/v1/' + $t + '?select=*&limit=3') $hA
      if ($x.Code -eq 200) {
        $n = 0
        try { $jj = $x.Content | ConvertFrom-Json; if ($jj -is [System.Array]) { $n = $jj.Count } elseif ($null -ne $jj) { $n = 1 } } catch { }
        if ($n -gt 0) { Er ('  ' + $t.PadRight(26) + 'LE ' + $n); [void]$expostas.Add($t); AddP ('anon le ' + $t) }
        else { Av ('  ' + $t.PadRight(26) + '200 mas vazia') }
      } elseif ($x.Code -eq 401 -or $x.Code -eq 403) {
        Inf ('  ' + $t.PadRight(26) + 'bloqueada')
      } elseif ($x.Code -eq 404) {
        # inexistente ou nao exposta
      } else {
        Av ('  ' + $t.PadRight(26) + 'HTTP ' + $x.Code)
      }
    }
  }
}

if ($skey) {
  $r = Req ($base + '/rest/v1/follows?select=*&limit=1') @{ apikey = $skey; Authorization = ('Bearer ' + $skey) }
  if ($r.Code -eq 200) { Ok 'service_role le follows' }
  elseif ($r.Code -eq 404) { Av 'follows nao exposta' }
  else { Er ('service_role sem leitura - HTTP ' + $r.Code); AddP 'grant quebrado para service_role' }
}

# ============================================================
L '4. AUTHENTICATED'
# ============================================================

$quebradas = New-Object System.Collections.ArrayList
$uid = $null
$tok = $null
$email = ''
$hAdm = @{ apikey = $skey; Authorization = ('Bearer ' + $skey); 'Content-Type' = 'application/json' }

if ($skey -and $anon) {
  $email = 'auditoria.' + (Get-Date -Format 'yyyyMMddHHmmss') + '@libidoaudit.dev'
  $senha = 'Aud2026rls!'

  try {
    $bd = @{ email = $email; password = $senha; email_confirm = $true } | ConvertTo-Json -Compress
    $u = Invoke-RestMethod -Uri ($base + '/auth/v1/admin/users') -Method Post -Headers $hAdm -Body $bd -TimeoutSec 60
    $uid = $u.id
    Ok ('usuario criado: ' + $email)
  } catch {
    Er ('criar usuario: ' + $_.Exception.Message)
    if ($_.ErrorDetails.Message) { Inf $_.ErrorDetails.Message }
  }

  if ($uid) {
    try {
      $bd = @{ email = $email; password = $senha } | ConvertTo-Json -Compress
      $s = Invoke-RestMethod -Uri ($base + '/auth/v1/token?grant_type=password') -Method Post -Headers @{ apikey = $anon; 'Content-Type' = 'application/json' } -Body $bd -TimeoutSec 60
      $tok = $s.access_token
      Ok 'login ok - role authenticated'
    } catch {
      Er ('login: ' + $_.Exception.Message)
      if ($_.ErrorDetails.Message) { Inf $_.ErrorDetails.Message }
    }
  }

  if ($tok) {
    $hT = @{ apikey = $anon; Authorization = ('Bearer ' + $tok) }
    foreach ($t in $tabelas) {
      $x = Req ($base + '/rest/v1/' + $t + '?select=*&limit=1') $hT
      if ($x.Code -eq 200) { Inf ('  ' + $t.PadRight(26) + 'ok') }
      elseif ($x.Code -eq 401 -or $x.Code -eq 403) { Er ('  ' + $t.PadRight(26) + 'SEM ACESSO'); [void]$quebradas.Add($t); AddP ('authenticated sem acesso: ' + $t) }
      elseif ($x.Code -eq 404) { }
      else { Av ('  ' + $t.PadRight(26) + 'HTTP ' + $x.Code) }
    }

    foreach ($fn in @('contar_seguidores','relatorio_afiliado','alternar_seguir','alternar_bloqueio','registrar_indicacao')) {
      $x = Req ($base + '/rest/v1/rpc/' + $fn) @{ apikey = $anon; Authorization = ('Bearer ' + $tok); 'Content-Type' = 'application/json' } 'POST' '{}'
      if ($x.Code -eq 200) { Inf ('  rpc ' + $fn.PadRight(22) + '200') }
      elseif ($x.Code -eq 400) { Inf ('  rpc ' + $fn.PadRight(22) + 'existe') }
      elseif ($x.Code -eq 404) { Av ('  rpc ' + $fn.PadRight(22) + 'nao existe') }
      elseif ($x.Code -eq 401 -or $x.Code -eq 403) { Er ('  rpc ' + $fn.PadRight(22) + 'sem permissao'); AddP ('rpc sem permissao: ' + $fn) }
      else { Av ('  rpc ' + $fn.PadRight(22) + 'HTTP ' + $x.Code) }
    }
  }
} else {
  Av 'sem service_role ou anon - teste pulado'
}

# ============================================================
L '5. BANCO'
# ============================================================

$sqlOk = $false
$rGrant = @()
$rRls = @()
$rPol = @()

function Sql([string]$q) {
  $uri = 'https://api.supabase.com/v1/projects/' + $ref + '/database/query'
  $hh = @{ Authorization = ('Bearer ' + $pat); 'Content-Type' = 'application/json' }
  $bd = @{ query = $q } | ConvertTo-Json -Compress
  return Invoke-RestMethod -Uri $uri -Method Post -Headers $hh -Body $bd -TimeoutSec 120
}

function Rows($r) {
  if ($null -eq $r) { return @() }
  if ($r -is [System.Array]) { return @($r) }
  return @($r)
}

if ($pat -and $ref) {
  try { Sql 'select 1 as ok;' | Out-Null; $sqlOk = $true; Ok 'pat valido' }
  catch {
    $c = 0
    if ($_.Exception.Response) { $c = [int]$_.Exception.Response.StatusCode }
    Er ('pat invalido - HTTP ' + $c)
    AddP 'PAT invalido'
  }
} else {
  Av 'sem PAT - auditoria SQL pulada'
}

if ($sqlOk) {
  $qRls = "select c.relname as tabela from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity = false order by 1;"
  $rRls = @(Rows (Sql $qRls))
  if ($rRls.Count -eq 0) { Ok 'RLS ligado em todas as tabelas' }
  else { foreach ($l in $rRls) { Er ('RLS desligado: ' + $l.tabela); AddP ('RLS off: ' + $l.tabela) } }

  $qGrant = "select c.relname as tabela from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and not has_table_privilege('authenticated', c.oid, 'SELECT') order by 1;"
  $rGrant = @(Rows (Sql $qGrant))
  if ($rGrant.Count -eq 0) { Ok 'grant SELECT ok para authenticated' }
  else { foreach ($l in $rGrant) { Er ('sem SELECT: ' + $l.tabela); AddP ('sem grant: ' + $l.tabela) } }

  $qPol = "select tablename as tabela, policyname as policy, cmd, roles::text as papeis from pg_policies where schemaname = 'public' and (roles && array['anon','public']::name[]) order by 1,2;"
  $rPol = @(Rows (Sql $qPol))
  if ($rPol.Count -eq 0) { Ok 'nenhuma policy aberta a anon/public' }
  else { foreach ($l in $rPol) { Av ($l.tabela + ' / ' + $l.policy + ' / ' + $l.cmd + ' / ' + $l.papeis); AddP ('policy aberta: ' + $l.tabela + '.' + $l.policy) } }

  $qTrig = "select p.proname as funcao, pg_get_functiondef(p.oid) as definicao from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and (p.proname ilike '%proteger%' or p.proname ilike '%protege%' or p.proname ilike '%guard%');"
  $rTrig = @(Rows (Sql $qTrig))
  if ($rTrig.Count -eq 0) { Av 'nenhuma funcao de protecao' }
  else {
    foreach ($l in $rTrig) {
      $d = [string]$l.definicao
      if ($d -match 'service_role' -or $d -match 'current_user') { Ok ($l.funcao + ': tem bypass') }
      else { Er ($l.funcao + ': SEM bypass - webhook pode travar'); AddP ('trigger sem bypass: ' + $l.funcao) }
    }
  }

  $qFol = "select policyname as policy, cmd, roles::text as papeis from pg_policies where schemaname = 'public' and tablename = 'follows' order by 1;"
  $rFol = @(Rows (Sql $qFol))
  Inf 'policies de follows:'
  if ($rFol.Count -eq 0) { Inf '  nenhuma' } else { foreach ($l in $rFol) { Inf ('  ' + $l.policy + ' / ' + $l.cmd + ' / ' + $l.papeis) } }
}

# ============================================================
L '6. CORRECAO'
# ============================================================

$fixPath = Join-Path $Raiz 'FIX_GRANTS.sql'
$alvos = @()
foreach ($t in $quebradas) { $alvos += [string]$t }
foreach ($l in $rGrant) { $alvos += [string]$l.tabela }
$alvos = @($alvos | Sort-Object -Unique)

if ($alvos.Count -eq 0) {
  Ok 'nada a corrigir em grants'
} else {
  $linhas = @()
  $linhas += '-- restaura grants minimos para authenticated'
  $linhas += 'begin;'
  $linhas += 'grant usage on schema public to authenticated;'
  foreach ($t in $alvos) { $linhas += ('grant select, insert, update, delete on public.' + $t + ' to authenticated;') }
  $linhas += 'commit;'
  $linhas += ''
  $linhas += 'select c.relname as tabela'
  $linhas += '  from pg_class c join pg_namespace n on n.oid = c.relnamespace'
  $linhas += " where n.nspname = 'public' and c.relkind = 'r'"
  $linhas += "   and not has_table_privilege('authenticated', c.oid, 'SELECT')"
  $linhas += ' order by 1;'

  [System.IO.File]::WriteAllText($fixPath, ($linhas -join "`r`n"), $utf8)
  Av ('SQL gerado: ' + $fixPath)
  foreach ($t in $alvos) { Inf ('  ' + $t) }

  if ($Corrigir -and $sqlOk) {
    try { Sql ($linhas -join "`n") | Out-Null; Ok 'correcao aplicada' }
    catch { Er ('aplicar: ' + $_.Exception.Message); if ($_.ErrorDetails.Message) { Inf $_.ErrorDetails.Message } }
  } elseif (-not $Corrigir) {
    Inf 'rode com -Corrigir para aplicar'
  }
}

# ============================================================
L '7. BUNDLE'
# ============================================================

$dirBundle = Join-Path $Raiz 'dist\assets'
if (Test-Path -LiteralPath $dirBundle) {
  $maior = 0
  foreach ($f in (Get-ChildItem -LiteralPath $dirBundle -Filter *.js -ErrorAction SilentlyContinue)) {
    $kb = [math]::Round($f.Length / 1KB, 1)
    if ($kb -gt $maior) { $maior = $kb }
    $cor = 'DarkGray'
    if ($kb -gt 500) { $cor = 'Yellow' }
    Write-Host ('  ' + $f.Name.PadRight(34) + $kb.ToString().PadLeft(9) + ' kB') -ForegroundColor $cor
  }
  if ($maior -gt 500) { Av ('maior chunk ' + $maior + ' kB'); AddP 'bundle acima de 500 kB' }
  else { Ok 'chunks dentro do limite' }
} else {
  Av 'dist ausente'
}

if (-not $SemBuild) {
  Write-Host ''
  Inf 'rodando build...'
  & npm run build 2>&1 | Select-Object -Last 6 | ForEach-Object { Inf $_ }
  if ($LASTEXITCODE -eq 0) { Ok 'build ok' } else { Er ('build saiu com ' + $LASTEXITCODE); AddP 'build falhou' }
}

# ============================================================
L '8. LIMPEZA'
# ============================================================

if ($uid -and $skey) {
  if ($Manter) {
    Av ('usuario mantido: ' + $email)
    Inf ('id: ' + $uid)
  } else {
    try {
      Invoke-RestMethod -Uri ($base + '/auth/v1/admin/users/' + $uid) -Method Delete -Headers $hAdm -TimeoutSec 60 | Out-Null
      Ok 'usuario temporario removido'
      Inf ('id: ' + $uid)
    } catch {
      Av ('remover manualmente: ' + $email)
    }
  }
}

# ============================================================
L 'VEREDITO'
# ============================================================

if ($riscoGit) { Er 'GIT: chave possivelmente exposta' } else { Ok 'GIT: limpo' }

if ($expostas.Count -gt 0) { Er ('ANON: le em ' + ($expostas -join ', ')) }
elseif ($chaveValida) { Ok 'ANON: bloqueado em tudo' }
else { Av 'ANON: nao validado' }

if ($quebradas.Count -gt 0) { Er ('AUTH: sem acesso em ' + ($quebradas -join ', ')) }
elseif ($tok) { Ok 'AUTH: acesso ok' }
else { Av 'AUTH: nao testado' }

if ($sqlOk) { Ok 'BANCO: auditado' } else { Av 'BANCO: nao auditado (sem PAT)' }

Write-Host ''
if ($P.Count -eq 0) {
  Ok 'NENHUM PROBLEMA ENCONTRADO'
} else {
  Er ($P.Count.ToString() + ' PROBLEMA(S):')
  $i = 0
  foreach ($p in $P) { $i++; Write-Host ('   ' + $i + '. ' + $p) -ForegroundColor Red }
}

Pop-Location