param(
  [string]$Raiz = 'C:\libidojan2026',
  [switch]$SemBuild
)

$ErrorActionPreference = 'Continue'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$rel  = New-Object System.Collections.ArrayList

function L($t)   { Write-Host ''; Write-Host ('=== ' + $t + ' ===') -ForegroundColor Cyan; [void]$rel.Add(''); [void]$rel.Add('=== ' + $t + ' ===') }
function Ok($t)  { Write-Host ('  OK     ' + $t) -ForegroundColor Green; [void]$rel.Add('  OK     ' + $t) }
function Av($t)  { Write-Host ('  AVISO  ' + $t) -ForegroundColor Yellow; [void]$rel.Add('  AVISO  ' + $t) }
function Er($t)  { Write-Host ('  BUG    ' + $t) -ForegroundColor Red; [void]$rel.Add('  BUG    ' + $t) }
function Inf($t) { Write-Host ('         ' + $t) -ForegroundColor DarkGray; [void]$rel.Add('         ' + $t) }

if (-not (Test-Path -LiteralPath $Raiz)) { Write-Host 'raiz inexistente' -ForegroundColor Red; exit 1 }
Push-Location $Raiz

$dirs = @('src','backend\src')

function ListaFontes {
  $f = @()
  foreach ($d in $dirs) {
    $p = Join-Path $Raiz $d
    if (-not (Test-Path -LiteralPath $p)) { continue }
    $f += Get-ChildItem -LiteralPath $p -Recurse -File -Include *.ts,*.tsx,*.js,*.jsx -ErrorAction SilentlyContinue
  }
  return @($f)
}

function EhBackup([string]$nome) {
  return ($nome -match '\.(bak|bkp|old|orig)([-.]|$)')
}

# ============================================================
L '0. BACKUP INTEGRAL DE src/'
# ============================================================
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$bkpDir = Join-Path $Raiz ('.backup-limpeza-' + $stamp)
New-Item -ItemType Directory -Path $bkpDir -Force | Out-Null

$srcDir = Join-Path $Raiz 'src'
if (Test-Path -LiteralPath $srcDir) {
  Copy-Item -LiteralPath $srcDir -Destination $bkpDir -Recurse -Force -ErrorAction SilentlyContinue
  Ok ('copia integral em ' + $bkpDir)
} else {
  Er 'src/ nao encontrada'
  Pop-Location; exit 1
}

# ============================================================
L '1. INVENTARIO DA POLUICAO'
# ============================================================
$todos = ListaFontes
$bak   = @($todos | Where-Object { EhBackup $_.Name })
$real  = @($todos | Where-Object { -not (EhBackup $_.Name) })

Inf ('arquivos ativos    : ' + $real.Count)
Inf ('arquivos de backup : ' + $bak.Count)

if ($bak.Count -eq 0) {
  Ok 'nenhum backup dentro de src/'
} else {
  Er ($bak.Count.ToString() + ' copias de codigo competindo com a versao ativa')
  $grupos = @{}
  foreach ($b in $bak) {
    $base = ($b.Name -split '\.(bak|bkp|old|orig)')[0]
    if (-not $grupos.ContainsKey($base)) { $grupos[$base] = 0 }
    $grupos[$base] = $grupos[$base] + 1
  }
  foreach ($k in ($grupos.Keys | Sort-Object)) {
    Inf ('  ' + $k.PadRight(26) + $grupos[$k].ToString() + ' copia(s)')
  }
}

# ============================================================
L '2. ALGUM ARQUIVO ATIVO IMPORTA UM BACKUP?'
# ============================================================
$refs = @()
foreach ($f in $real) {
  $n = 0
  foreach ($ln in [System.IO.File]::ReadAllLines($f.FullName)) {
    $n++
    if ($ln -match 'from\s+[''"].*\.(bak|bkp|old|orig)') {
      $refs += [pscustomobject]@{ Arquivo = $f.Name; Linha = $n; Trecho = $ln.Trim() }
    }
    if ($ln -match 'require\(\s*[''"].*\.(bak|bkp|old|orig)') {
      $refs += [pscustomobject]@{ Arquivo = $f.Name; Linha = $n; Trecho = $ln.Trim() }
    }
  }
}

if ($refs.Count -eq 0) {
  Ok 'nenhum import aponta para backup - remocao e segura'
} else {
  Er ($refs.Count.ToString() + ' import(s) apontam para backup - NAO remover automaticamente')
  foreach ($r in $refs) { Inf ($r.Arquivo + ':' + $r.Linha + '  ' + $r.Trecho) }
}

# ============================================================
L '3. QUARENTENA'
# ============================================================
$quar = Join-Path $Raiz ('.quarentena-' + $stamp)
$movidos = 0

if ($refs.Count -gt 0) {
  Av 'quarentena cancelada: existem imports apontando para backup'
} elseif ($bak.Count -eq 0) {
  Av 'nada a mover'
} else {
  New-Item -ItemType Directory -Path $quar -Force | Out-Null
  foreach ($b in $bak) {
    $relPath = $b.FullName.Replace($Raiz, '').TrimStart('\')
    $dest    = Join-Path $quar $relPath
    $destDir = Split-Path -Parent $dest
    if (-not (Test-Path -LiteralPath $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
    try {
      Move-Item -LiteralPath $b.FullName -Destination $dest -Force -ErrorAction Stop
      $movidos++
    } catch {
      Av ('nao movi ' + $b.Name + ': ' + $_.Exception.Message)
    }
  }
  Ok ($movidos.ToString() + ' arquivo(s) movidos para ' + $quar)
}

$gi = Join-Path $Raiz '.gitignore'
if (Test-Path -LiteralPath $gi) {
  $txtGi = [System.IO.File]::ReadAllText($gi)
  if ($txtGi -notmatch '\.quarentena-') {
    [System.IO.File]::AppendAllText($gi, "`r`n.quarentena-*`r`n.backup-limpeza-*`r`n", $utf8)
    Ok '.gitignore atualizado'
  } else { Ok '.gitignore ja cobre' }
} else {
  [System.IO.File]::WriteAllText($gi, ".quarentena-*`r`n.backup-limpeza-*`r`n.env`r`n.env.*`r`n", $utf8)
  Ok '.gitignore criado'
}

# ============================================================
L '4. VALIDAR BUILD'
# ============================================================
if ($SemBuild) {
  Av 'build pulado por parametro'
} else {
  Inf 'rodando npm run build...'
  $saida = & npm run build 2>&1
  $cod = $LASTEXITCODE
  $saida | Select-Object -Last 8 | ForEach-Object { Inf $_ }
  if ($cod -eq 0) {
    Ok 'build OK - src/ consistente'
  } else {
    Er ('build falhou com codigo ' + $cod)
    Av 'revertendo quarentena'
    foreach ($f in (Get-ChildItem -LiteralPath $quar -Recurse -File -ErrorAction SilentlyContinue)) {
      $relPath = $f.FullName.Replace($quar, '').TrimStart('\')
      $dest    = Join-Path $Raiz $relPath
      $destDir = Split-Path -Parent $dest
      if (-not (Test-Path -LiteralPath $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
      Move-Item -LiteralPath $f.FullName -Destination $dest -Force -ErrorAction SilentlyContinue
    }
    Av 'backups devolvidos a src/'
    Pop-Location; exit 1
  }
}

# ============================================================
L '5. REEXAMINAR OS 7 BUGS COM src/ LIMPO'
# ============================================================
$todos2 = ListaFontes
$real2  = @($todos2 | Where-Object { -not (EhBackup $_.Name) })

function Contar {
  param([string[]]$Padroes)
  $n = 0
  foreach ($f in $real2) {
    foreach ($ln in [System.IO.File]::ReadAllLines($f.FullName)) {
      foreach ($pat in $Padroes) {
        if ($ln -match $pat) { $n++; break }
      }
    }
  }
  return $n
}

$c1 = Contar @('is_online\s*===\s*true', 'is_online\s*,\s*true', 'online\s*===\s*true')
$c2 = Contar @('last_location', 'last_seen', 'location_at', 'ultima_localizacao')
$c3 = Contar @('from\(\s*["'']photos', 'from\(\s*["'']fotos', 'storage\.from')
$c4 = Contar @('lifetime', 'vitalic', 'vitalici')
$c5 = Contar @('antiPrint', 'PrintScreen', 'visibilitychange')
$c6 = Contar @('isPosting', 'isSubmitting', 'enviando')
$c7 = Contar @('placeholder=\{\{', 'defaultImage', 'avatar-default', 'sem-foto', 'no-photo')

Inf ('1 mapa/online     : ' + $c1)
Inf ('2 staleness       : ' + $c2)
Inf ('3 fotos storage   : ' + $c3)
Inf ('4 vitalicio        : ' + $c4)
Inf ('5 anti-print      : ' + $c5)
Inf ('6 guard de envio  : ' + $c6)
Inf ('7 mock/placeholder: ' + $c7)

if ($c2 -eq 0)  { Er 'nenhum controle de idade de localizacao no codigo ativo' } else { Ok 'existe referencia de staleness' }
if ($c4 -eq 0)  { Er 'nenhum tratamento de acesso vitalicio no codigo ativo' } else { Ok 'vitalicio presente' }
if ($c6 -eq 0)  { Er 'nenhum guard de envio no codigo ativo' } else { Ok 'guard de envio presente' }

# ============================================================
L '6. DOSSIÊ PARA PATCH EXATO'
# ============================================================
$dos = Join-Path $Raiz ('dossie-bugs-' + $stamp + '.txt')
$out = New-Object System.Collections.ArrayList

function Bloco {
  param([string]$Relativo, [int]$De, [int]$Ate)
  $p = Join-Path $Raiz $Relativo
  if (-not (Test-Path -LiteralPath $p)) { [void]$out.Add(''); [void]$out.Add('--- AUSENTE: ' + $Relativo); return }
  $ls = [System.IO.File]::ReadAllLines($p)
  [void]$out.Add('')
  [void]$out.Add('============================================================')
  [void]$out.Add('ARQUIVO: ' + $Relativo + '   (' + $ls.Count + ' linhas)')
  [void]$out.Add('============================================================')
  $fim = $Ate
  if ($fim -gt $ls.Count) { $fim = $ls.Count }
  for ($i = $De; $i -le $fim; $i++) {
    [void]$out.Add(('{0,5}: {1}' -f $i, $ls[$i - 1]))
  }
}

[void]$out.Add('DOSSIÊ DE BUGS - ' + (Get-Date -Format 'dd/MM/yyyy HH:mm'))
[void]$out.Add('Gerado apos limpeza de ' + $movidos + ' arquivo(s) de backup')
[void]$out.Add('')

Bloco 'src\services\users.ts' 1 45
Bloco 'src\services\radarMapa.ts' 1 110
Bloco 'src\components\RadarMap.tsx' 170 230
Bloco 'src\components\Radar.tsx' 40 90
Bloco 'src\services\chat.ts' 1 60
Bloco 'src\services\premiumInvites.ts' 1 70
Bloco 'src\components\ViewProfile.tsx' 60 110

# trechos dos backups que contem correcoes nunca aplicadas
if (Test-Path -LiteralPath $quar) {
  [void]$out.Add('')
  [void]$out.Add('############################################################')
  [void]$out.Add('# CORRECOES EXISTENTES APENAS EM BACKUP (candidatas a aplicar)')
  [void]$out.Add('############################################################')
  foreach ($f in (Get-ChildItem -LiteralPath $quar -Recurse -File -Filter *.ts -ErrorAction SilentlyContinue)) {
    $ls = [System.IO.File]::ReadAllLines($f.FullName)
    $hits = @()
    $i = 0
    foreach ($ln in $ls) {
      $i++
      if ($ln -match 'ONLINE-HONESTO|VITALICIO-FIX|FIX:|CORRECAO:|HONESTO') {
        $hits += [pscustomobject]@{ Linha = $i; Texto = $ln.Trim() }
      }
    }
    if ($hits.Count -gt 0) {
      [void]$out.Add('')
      [void]$out.Add('>>> ' + $f.FullName.Replace($quar,'').TrimStart('\'))
      foreach ($h in $hits) { [void]$out.Add(('{0,5}: {1}' -f $h.Linha, $h.Texto)) }
    }
  }
}

[System.IO.File]::WriteAllText($dos, ($out -join "`r`n"), $utf8)
Ok ('dossie salvo: ' + $dos)

# ============================================================
L '7. SQL DO MAPA (offline com ultima localizacao)'
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

$sqlMapa = @()
$sqlMapa += '-- mapa: usuario offline continua visivel na ultima posicao'
$sqlMapa += 'alter table public.users add column if not exists last_location_at timestamptz;'
$sqlMapa += 'alter table public.users add column if not exists last_lat double precision;'
$sqlMapa += 'alter table public.users add column if not exists last_lng double precision;'
$sqlMapa += ''
$sqlMapa += 'update public.users'
$sqlMapa += '   set last_location_at = coalesce(last_location_at, updated_at, created_at, now())'
$sqlMapa += ' where last_location_at is null;'
$sqlMapa += ''
$sqlMapa += 'create index if not exists idx_users_last_loc on public.users (last_location_at desc nulls last);'
$sqlMapa += ''
$sqlMapa += '-- RPC: devolve todos, marcando quem esta online de verdade e quem e historico'
$sqlMapa += 'create or replace function public.mapa_proximos(raio_km double precision default 50)'
$sqlMapa += 'returns table ('
$sqlMapa += '  id uuid, nome text, idade int, foto text,'
$sqlMapa += '  lat double precision, lng double precision,'
$sqlMapa += '  online boolean, posicao_historica boolean, ultima_vez timestamptz'
$sqlMapa += ')'
$sqlMapa += 'language sql'
$sqlMapa += 'security definer'
$sqlMapa += 'set search_path = public'
$sqlMapa += 'as $fn$'
$sqlMapa += '  select u.id, u.nome, u.idade, u.foto,'
$sqlMapa += '         coalesce(u.lat, u.last_lat)  as lat,'
$sqlMapa += '         coalesce(u.lng, u.last_lng)  as lng,'
$sqlMapa += '         (u.is_online is true and u.updated_at > now() - interval ''5 minutes'') as online,'
$sqlMapa += '         (u.is_online is not true or u.updated_at <= now() - interval ''5 minutes'') as posicao_historica,'
$sqlMapa += '         coalesce(u.last_location_at, u.updated_at) as ultima_vez'
$sqlMapa += '    from public.users u'
$sqlMapa += '   where coalesce(u.lat, u.last_lat) is not null'
$sqlMapa += '     and coalesce(u.lng, u.last_lng) is not null'
$sqlMapa += '   order by ultima_vez desc nulls last;'
$sqlMapa += '$fn$;'
$sqlMapa += ''
$sqlMapa += 'revoke all on function public.mapa_proximos(double precision) from public, anon;'
$sqlMapa += 'grant execute on function public.mapa_proximos(double precision) to authenticated;'

$sqlPath = Join-Path $Raiz 'MAPEAR_OFFLINE.sql'
[System.IO.File]::WriteAllText($sqlPath, ($sqlMapa -join "`r`n"), $utf8)
Ok ('SQL do mapa: ' + $sqlPath)

if ($pat -and $ref) {
  try {
    $uri = 'https://api.supabase.com/v1/projects/' + $ref + '/database/query'
    $hh  = @{ Authorization = ('Bearer ' + $pat); 'Content-Type' = 'application/json' }
    $bd  = @{ query = ($sqlMapa -join "`n") } | ConvertTo-Json -Compress
    Invoke-RestMethod -Uri $uri -Method Post -Headers $hh -Body $bd -TimeoutSec 180 | Out-Null
    Ok 'SQL do mapa aplicado no banco'
  } catch {
    Av ('nao aplicado automaticamente: ' + $_.Exception.Message)
    Inf 'cole o arquivo MAPEAR_OFFLINE.sql no SQL Editor do Supabase'
  }
} else {
  Av 'sem SUPABASE_ACCESS_TOKEN - aplique MAPEAR_OFFLINE.sql manualmente'
}

# ============================================================
L 'VEREDITO'
# ============================================================
Inf ('backups movidos   : ' + $movidos)
Inf ('fontes ativas     : ' + $real2.Count)
Inf ('dossie            : ' + $dos)
Inf ('sql do mapa       : ' + $sqlPath)
Inf ('backup integral   : ' + $bkpDir)

[System.IO.File]::WriteAllText((Join-Path $Raiz ('relatorio-limpeza-' + $stamp + '.txt')), ($rel -join "`r`n"), $utf8)

Write-Host ''
Write-Host '  PROXIMO PASSO: envie o conteudo do dossie-bugs-*.txt' -ForegroundColor Yellow
Write-Host '  Ele traz o codigo real de cada arquivo, linha por linha.' -ForegroundColor Yellow

Pop-Location