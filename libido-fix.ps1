param(
  [string]$Raiz = 'C:\libidojan2026',
  [switch]$SemBuild
)

$ErrorActionPreference = 'Continue'
$utf8 = New-Object System.Text.UTF8Encoding($false)

function L($t)   { Write-Host ''; Write-Host ('=== ' + $t + ' ===') -ForegroundColor Cyan }
function Ok($t)  { Write-Host ('  OK     ' + $t) -ForegroundColor Green }
function Av($t)  { Write-Host ('  AVISO  ' + $t) -ForegroundColor Yellow }
function Er($t)  { Write-Host ('  BUG    ' + $t) -ForegroundColor Red }
function Inf($t) { Write-Host ('         ' + $t) -ForegroundColor DarkGray }

if (-not (Test-Path -LiteralPath $Raiz)) { Write-Host 'raiz inexistente' -ForegroundColor Red; exit 1 }
Push-Location $Raiz

$dirs = @('src','backend\src')

function Fontes {
  $f = @()
  foreach ($d in $dirs) {
    $p = Join-Path $Raiz $d
    if (Test-Path -LiteralPath $p) {
      $f += Get-ChildItem -LiteralPath $p -Recurse -File -Include *.ts,*.tsx,*.js,*.jsx -ErrorAction SilentlyContinue
    }
  }
  return @($f)
}

function EhBak([string]$n) { return ($n -match '\.(bak|bkp|old|orig)([-.]|$)') }

# ============================================================
L '0. BACKUP'
# ============================================================
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$bkp = Join-Path $Raiz ('.backup-fix-' + $stamp)
New-Item -ItemType Directory -Path $bkp -Force | Out-Null
$src = Join-Path $Raiz 'src'
if (Test-Path -LiteralPath $src) {
  Copy-Item -LiteralPath $src -Destination $bkp -Recurse -Force -ErrorAction SilentlyContinue
  Ok ('copia integral: ' + $bkp)
} else {
  Er 'src/ nao encontrada'
  Pop-Location; exit 1
}

# ============================================================
L '1. INVENTARIO'
# ============================================================
$todos = Fontes
$bak   = @($todos | Where-Object { EhBak $_.Name })
$ativo = @($todos | Where-Object { -not (EhBak $_.Name) })

Inf ('arquivos ativos   : ' + $ativo.Count)
Inf ('arquivos .bak     : ' + $bak.Count)

if ($bak.Count -gt 0) {
  $grp = @{}
  foreach ($b in $bak) {
    $b2 = ($b.Name -split '\.(bak|bkp|old|orig)')[0]
    if (-not $grp.ContainsKey($b2)) { $grp[$b2] = 0 }
    $grp[$b2] = $grp[$b2] + 1
  }
  foreach ($k in ($grp.Keys | Sort-Object)) { Inf ('  ' + $k.PadRight(28) + $grp[$k]) }
}

# ============================================================
L '2. QUARENTENA'
# ============================================================
$refs = @()
foreach ($f in $ativo) {
  $n = 0
  foreach ($ln in [System.IO.File]::ReadAllLines($f.FullName)) {
    $n++
    if ($ln -match 'from\s+["''].*\.(bak|bkp|old|orig)') {
      $refs += [pscustomobject]@{ A = $f.Name; L = $n; T = $ln.Trim() }
    }
  }
}

$quar = Join-Path $Raiz ('.quarentena-' + $stamp)
$movidos = 0

if ($refs.Count -gt 0) {
  Er 'imports apontam para backup - quarentena cancelada'
  foreach ($r in $refs) { Inf ($r.A + ':' + $r.L + '  ' + $r.T) }
} elseif ($bak.Count -eq 0) {
  Ok 'nada a mover'
} else {
  New-Item -ItemType Directory -Path $quar -Force | Out-Null
  foreach ($b in $bak) {
    $rel = $b.FullName.Replace($Raiz,'').TrimStart('\')
    $dst = Join-Path $quar $rel
    $dd  = Split-Path -Parent $dst
    if (-not (Test-Path -LiteralPath $dd)) { New-Item -ItemType Directory -Path $dd -Force | Out-Null }
    try { Move-Item -LiteralPath $b.FullName -Destination $dst -Force -ErrorAction Stop; $movidos++ }
    catch { Av ('nao movi ' + $b.Name) }
  }
  Ok ($movidos.ToString() + ' backup(s) em quarentena')
}

$gi = Join-Path $Raiz '.gitignore'
if (Test-Path -LiteralPath $gi) {
  $g = [System.IO.File]::ReadAllText($gi)
  if ($g -notmatch 'quarentena') {
    [System.IO.File]::AppendAllText($gi, "`r`n.quarentena-*`r`n.backup-fix-*`r`n", $utf8)
    Ok '.gitignore atualizado'
  }
} else {
  [System.IO.File]::WriteAllText($gi, ".quarentena-*`r`n.backup-fix-*`r`n.env`r`n.env.*`r`n", $utf8)
  Ok '.gitignore criado'
}

# ============================================================
L '3. BUILD'
# ============================================================
$npm = Get-Command npm -ErrorAction SilentlyContinue
if ($SemBuild -or -not $npm) {
  Av 'build pulado'
} else {
  $out = & npm run build 2>&1
  $cod = $LASTEXITCODE
  $out | Select-Object -Last 6 | ForEach-Object { Inf $_ }
  if ($cod -eq 0) {
    Ok 'build OK'
  } else {
    Er ('build falhou (' + $cod + ') - revertendo')
    if (Test-Path -LiteralPath $quar) {
      foreach ($f in (Get-ChildItem -LiteralPath $quar -Recurse -File -ErrorAction SilentlyContinue)) {
        $rel = $f.FullName.Replace($quar,'').TrimStart('\')
        $dst = Join-Path $Raiz $rel
        $dd  = Split-Path -Parent $dst
        if (-not (Test-Path -LiteralPath $dd)) { New-Item -ItemType Directory -Path $dd -Force | Out-Null }
        Move-Item -LiteralPath $f.FullName -Destination $dst -Force -ErrorAction SilentlyContinue
      }
    }
    Av 'backups restaurados'
  }
}

# ============================================================
L '4. DIAGNOSTICO NO CONSOLE'
# ============================================================
$ativo2 = @((Fontes) | Where-Object { -not (EhBak $_.Name) })

function Bloco {
  param([string]$Rel, [int]$De = 1, [int]$Ate = 99999)
  $p = Join-Path $Raiz $Rel
  if (-not (Test-Path -LiteralPath $p)) {
    Write-Host ('--- AUSENTE: ' + $Rel) -ForegroundColor DarkGray
    return
  }
  $ls = [System.IO.File]::ReadAllLines($p)
  Write-Host ''
  Write-Host ('##### ' + $Rel + '  (' + $ls.Count + ' linhas)') -ForegroundColor Magenta
  $fim = $Ate
  if ($fim -gt $ls.Count) { $fim = $ls.Count }
  for ($i = $De; $i -le $fim; $i++) {
    Write-Host ('{0,4}: {1}' -f $i, $ls[$i-1])
  }
}

function Contar {
  param([string[]]$Pat)
  $n = 0
  foreach ($f in $ativo2) {
    foreach ($ln in [System.IO.File]::ReadAllLines($f.FullName)) {
      foreach ($p in $Pat) { if ($ln -match $p) { $n++; break } }
    }
  }
  return $n
}

$b1 = Contar @('is_online\s*===\s*true','is_online\s*,\s*true','\.eq\(\s*["'']online')
$b2 = Contar @('last_location','last_seen','location_at','last_lat')
$b3 = Contar @('from\(\s*["'']photos','storage\.from')
$b4 = Contar @('lifetime','vitalic','vitalici')
$b5 = Contar @('antiPrint','PrintScreen','visibilitychange')
$b6 = Contar @('isPosting','isSubmitting','enviando')
$b7 = Contar @('avatar-default','sem-foto','no-photo','defaultImage')

Write-Host ''
Write-Host 'CONTAGEM NO CODIGO ATIVO' -ForegroundColor White
Inf ('1 filtro online     : ' + $b1)
Inf ('2 last_location     : ' + $b2)
Inf ('3 storage fotos     : ' + $b3)
Inf ('4 vitalicio          : ' + $b4)
Inf ('5 anti-print        : ' + $b5)
Inf ('6 guard de envio    : ' + $b6)
Inf ('7 fallback de foto  : ' + $b7)

if ($b2 -eq 0) { Er 'sem last_location: mapa nao consegue mostrar offline (bug 2)' }
if ($b4 -eq 0) { Er 'sem tratamento de vitalicio: chat bloqueia esse plano (bug 4)' }
if ($b6 -gt 0) { Ok 'existe guard de envio' }

Bloco 'src\services\users.ts' 1 60
Bloco 'src\services\radarMapa.ts' 1 120
Bloco 'src\components\RadarMap.tsx' 180 230
Bloco 'src\services\chat.ts' 1 70
Bloco 'src\services\premiumInvites.ts' 1 60

# ============================================================
L '5. SQL DO MAPA'
# ============================================================
$cfg = @{}
foreach ($f in @('.env','backend\.env')) {
  $p = Join-Path $Raiz $f
  if (-not (Test-Path -LiteralPath $p)) { continue }
  foreach ($ln in (Get-Content -LiteralPath $p -ErrorAction SilentlyContinue)) {
    if ($ln -match '^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$') {
      $k = $Matches[1]; $v = $Matches[2].Trim().Trim('"').Trim("'")
      if (-not $cfg.ContainsKey($k)) { $cfg[$k] = $v }
    }
  }
}

$base = $cfg['SUPABASE_URL']; if (-not $base) { $base = $cfg['VITE_SUPABASE_URL'] }
if ($base) { $base = $base.TrimEnd('/') }
$pat = $cfg['SUPABASE_ACCESS_TOKEN']
$ref = ''
if ($base -match 'https://([a-z0-9]+)\.supabase\.co') { $ref = $Matches[1] }

$sql = @()
$sql += '-- mapa: usuario offline visivel na ultima posicao conhecida'
$sql += 'alter table public.users add column if not exists last_location_at timestamptz;'
$sql += 'alter table public.users add column if not exists last_lat double precision;'
$sql += 'alter table public.users add column if not exists last_lng double precision;'
$sql += 'update public.users set last_location_at = coalesce(last_location_at, updated_at, created_at, now()) where last_location_at is null;'
$sql += 'create index if not exists idx_users_last_loc on public.users (last_location_at desc nulls last);'
$sql += 'create or replace function public.mapa_proximos()'
$sql += 'returns table (id uuid, nome text, idade int, foto text, lat double precision, lng double precision, online boolean, historico boolean, ultima_vez timestamptz)'
$sql += 'language sql security definer set search_path = public'
$sql += 'as $fn$'
$sql += '  select u.id, u.nome, u.idade, u.foto,'
$sql += '         coalesce(u.lat, u.last_lat) as lat,'
$sql += '         coalesce(u.lng, u.last_lng) as lng,'
$sql += '         (u.is_online is true and u.updated_at > now() - interval ''5 minutes'') as online,'
$sql += '         (u.is_online is not true or u.updated_at <= now() - interval ''5 minutes'') as historico,'
$sql += '         coalesce(u.last_location_at, u.updated_at) as ultima_vez'
$sql += '    from public.users u'
$sql += '   where coalesce(u.lat, u.last_lat) is not null'
$sql += '     and coalesce(u.lng, u.last_lng) is not null'
$sql += '   order by ultima_vez desc nulls last;'
$sql += '$fn$;'
$sql += 'revoke all on function public.mapa_proximos() from public, anon;'
$sql += 'grant execute on function public.mapa_proximos() to authenticated;'

$sqlPath = Join-Path $Raiz 'MAPEAR_OFFLINE.sql'
[System.IO.File]::WriteAllText($sqlPath, ($sql -join "`r`n"), $utf8)
Ok ('arquivo: ' + $sqlPath)

if ($pat -and $ref) {
  try {
    $uri = 'https://api.supabase.com/v1/projects/' + $ref + '/database/query'
    $hh  = @{ Authorization = ('Bearer ' + $pat); 'Content-Type' = 'application/json' }
    $bd  = @{ query = ($sql -join "`n") } | ConvertTo-Json -Compress
    Invoke-RestMethod -Uri $uri -Method Post -Headers $hh -Body $bd -TimeoutSec 180 | Out-Null
    Ok 'SQL aplicado no banco'
  } catch {
    Av ('nao aplicado: ' + $_.Exception.Message)
    Inf 'cole MAPEAR_OFFLINE.sql no SQL Editor do Supabase'
  }
} else {
  Av 'sem PAT - aplique MAPEAR_OFFLINE.sql manualmente'
}

# ============================================================
L 'VEREDITO'
# ============================================================
Inf ('backups movidos : ' + $movidos)
Inf ('fontes ativas   : ' + $ativo2.Count)
Inf ('backup integral : ' + $bkp)
Inf ('sql do mapa     : ' + $sqlPath)

Write-Host ''
Write-Host '  Copie a saida da secao 4 e 5 e cole no chat.' -ForegroundColor Yellow
Write-Host '  Esse e o codigo real de cada arquivo.' -ForegroundColor Yellow

Pop-Location