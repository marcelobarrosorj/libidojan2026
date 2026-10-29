param(
  [switch]$ConfirmarExclusao,
  [string]$Pat  = '',
  [string]$PgConn = ''
)

$ErrorActionPreference = 'Continue'
$raiz   = 'C:\libidojan2026'
$utf8   = New-Object System.Text.UTF8Encoding($false)
$sqlPath = Join-Path $raiz 'EXECUTAR_NO_SUPABASE.sql'
$bk      = Join-Path $raiz '.backup_antes_correcao'
$stamp   = Get-Date -Format 'yyyyMMdd-HHmmss'

function T($t)      { Write-Host ''; Write-Host ('=== ' + $t + ' ===') -ForegroundColor Cyan }
function Ok($t)     { Write-Host ('  OK      ' + $t) -ForegroundColor Green }
function Info($t)   { Write-Host ('  INFO    ' + $t) -ForegroundColor Yellow }
function Aviso($t)  { Write-Host ('  AVISO   ' + $t) -ForegroundColor DarkYellow }
function Falhou($t) { Write-Host ('  FALHOU  ' + $t) -ForegroundColor Red }

# ------------------------------------------------------------
T '1. PREFLIGHT'
# ------------------------------------------------------------
if (-not (Test-Path -LiteralPath (Join-Path $raiz 'package.json'))) {
  Falhou ('raiz invalida: ' + $raiz); exit 1
}
if (-not (Test-Path -LiteralPath $sqlPath)) {
  Falhou ('EXECUTAR_NO_SUPABASE.sql ausente'); exit 1
}
Ok 'raiz e SQL encontrados'

if (-not (Test-Path -LiteralPath $bk)) { New-Item -ItemType Directory -Path $bk -Force | Out-Null }
Ok ('backup dir: ' + $bk)

# ------------------------------------------------------------
T '2. CREDENCIAIS'
# ------------------------------------------------------------
$cfg = @{}
foreach ($c in @('backend\.env','backend\.env.local','.env','.env.local')) {
  $p = Join-Path $raiz $c
  if (Test-Path -LiteralPath $p) {
    foreach ($l in (Get-Content -LiteralPath $p -ErrorAction SilentlyContinue)) {
      if ($l -match '^\s*([A-Za-z0-9_]+)\s*=\s*(.+?)\s*$') {
        $k = $Matches[1]; $v = $Matches[2].Trim().Trim('"').Trim("'")
        if (-not $cfg.ContainsKey($k)) { $cfg[$k] = $v }
      }
    }
  }
}

$surl = $cfg['SUPABASE_URL']; if (-not $surl) { $surl = $cfg['VITE_SUPABASE_URL'] }
$skey = $cfg['SUPABASE_SERVICE_ROLE_KEY']
if (-not $skey) { $skey = $cfg['SERVICE_ROLE_KEY'] }

if (-not $surl -or -not $skey) {
  Falhou 'SUPABASE_URL / SERVICE_ROLE_KEY nao encontrados em backend\.env'
  exit 1
}

$base = $surl.TrimEnd('/')
$rest = $base + '/rest/v1'
$sto  = $base + '/storage/v1'
$aad  = $base + '/auth/v1/admin'

$h  = @{ apikey = $skey; Authorization = ('Bearer ' + $skey) }
$hj = @{ apikey = $skey; Authorization = ('Bearer ' + $skey); 'Content-Type' = 'application/json' }

$ref = $null
if ($base -match 'https://([a-z0-9]+)\.supabase\.co') { $ref = $Matches[1] }

Ok ('base: ' + $base)
Ok ('ref : ' + $ref)

function RestGet([string]$caminho) {
  try {
    $r = Invoke-RestMethod -Uri ($rest + $caminho) -Headers $h -Method Get -TimeoutSec 90
    if ($null -eq $r) { return @() }
    if ($r -is [System.Array]) { return $r }
    return @($r)
  } catch { return $null }
}

# ------------------------------------------------------------
T '3. BACKUP'
# ------------------------------------------------------------
$alvos = @(
  'backend\src\controllers\paymentController.ts',
  'src\services\premium.ts',
  'src\services\posts.ts',
  'src\services\users.ts',
  'src\services\auth.ts',
  'src\components\Profile.tsx',
  'src\main.tsx'
)
$salvos = 0
foreach ($a in $alvos) {
  $p = Join-Path $raiz $a
  if (Test-Path -LiteralPath $p) {
    $dest = Join-Path $bk (($a -replace '[\\/]','__') + '.' + $stamp)
    Copy-Item -LiteralPath $p -Destination $dest -Force
    $salvos++
  }
}
Ok ($salvos.ToString() + ' arquivo(s) copiado(s)')

# ------------------------------------------------------------
T '4. EXECUCAO DO SQL'
# ------------------------------------------------------------
$sqlTexto = [System.IO.File]::ReadAllText($sqlPath, [System.Text.Encoding]::UTF8)
$sqlRodou = $false
$rota = 'nenhuma'

# Rota 1: psql
$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $sqlRodou -and $psql -and $PgConn.Trim() -ne '') {
  Info 'tentando rota 1: psql'
  & psql $PgConn -v ON_ERROR_STOP=1 -f $sqlPath 2>&1 | ForEach-Object { Write-Host ('   ' + $_) -ForegroundColor DarkGray }
  if ($LASTEXITCODE -eq 0) { $sqlRodou = $true; $rota = 'psql'; Ok 'SQL aplicado via psql' }
  else { Falhou ('psql retornou ' + $LASTEXITCODE) }
}
elseif (-not $psql) { Info 'psql nao instalado - rota 1 indisponivel' }
else { Info 'psql presente, mas -PgConn nao informado' }

# Rota 2: Management API
if (-not $sqlRodou -and $Pat.Trim() -ne '' -and $ref) {
  Info 'tentando rota 2: Management API'
  try {
    $uri = 'https://api.supabase.com/v1/projects/' + $ref + '/database/query'
    $body = @{ query = $sqlTexto } | ConvertTo-Json -Depth 3 -Compress
    $hh = @{ Authorization = ('Bearer ' + $Pat); 'Content-Type' = 'application/json' }
    $resp = Invoke-RestMethod -Uri $uri -Method Post -Headers $hh -Body $body -TimeoutSec 300
    $sqlRodou = $true; $rota = 'management-api'
    Ok 'SQL aplicado via Management API'
    if ($null -ne $resp) { $resp | ConvertTo-Json -Depth 4 -Compress | ForEach-Object { Write-Host ('   ' + $_) -ForegroundColor DarkGray } }
  } catch {
    Falhou ('Management API: ' + $_.Exception.Message)
    if ($_.ErrorDetails.Message) { Write-Host ('   ' + $_.ErrorDetails.Message) -ForegroundColor Red }
  }
}
elseif (-not $sqlRodou -and $Pat.Trim() -eq '') { Info 'PAT nao informado - rota 2 indisponivel' }

# Rota 3: manual
if (-not $sqlRodou) {
  Aviso 'SQL nao aplicado automaticamente. Rota manual.'
  Write-Host ''
  Write-Host '  Abra o SQL Editor do Supabase, cole o arquivo abaixo e clique RUN:' -ForegroundColor Yellow
  Write-Host ('    ' + $sqlPath) -ForegroundColor White
  Write-Host ''
  Write-Host '  Para automatizar na proxima vez:' -ForegroundColor Yellow
  Write-Host '    -File UNICO.ps1 -Pat "sbp_seu_token"' -ForegroundColor DarkGray
  Write-Host '    -File UNICO.ps1 -PgConn "postgresql://postgres.[ref]:[senha]@..."' -ForegroundColor DarkGray
  Start-Process notepad.exe -ArgumentList $sqlPath
  $rota = 'manual'
}
Ok ('rota final: ' + $rota)

# ------------------------------------------------------------
T '5. DIAGNOSTICO DE USUARIOS'
# ------------------------------------------------------------
$amostra = RestGet '/users?select=*&limit=1'
if ($null -eq $amostra -or $amostra.Count -eq 0) {
  Falhou 'consulta de users indisponivel'
  $cFoto = $null; $cId = $null; $semFoto = @()
} else {
  $cols = @($amostra[0].PSObject.Properties.Name)
  Write-Host ('  colunas: ' + ($cols -join ', ')) -ForegroundColor DarkGray

  $cId = 'user_id'
  if (-not ($cols -contains 'user_id') -and ($cols -contains 'id')) { $cId = 'id' }

  $cFoto = $null
  foreach ($c in @('photo_url','photo','avatar_url','foto','main_photo','picture','image','imagem')) {
    if ($cols -contains $c) { $cFoto = $c; break }
  }
  $cGal = $null
  foreach ($c in @('photos','galeria','gallery','fotos')) {
    if ($cols -contains $c) { $cGal = $c; break }
  }

  Ok ('id: ' + $cId + ' | foto: ' + $(if ($cFoto) { $cFoto } else { 'nao encontrada' }) + ' | galeria: ' + $(if ($cGal) { $cGal } else { 'nao encontrada' }))

  $todos = RestGet '/users?select=*&limit=1000'
  if ($null -eq $todos) { $todos = @() }

  $semFoto = @()
  foreach ($u in $todos) {
    $url = ''
    if ($cFoto) { $url = [string]$u.$cFoto }
    $temUrl = ($url.Trim() -ne '')

    $qtd = 0
    if ($cGal -and $null -ne $u.$cGal) {
      try { $qtd = @($u.$cGal).Count } catch { $qtd = 0 }
    }

    if (-not $temUrl -and $qtd -eq 0) {
      $nome = '?'
      foreach ($n in @('nickname','name','nome')) { if ($cols -contains $n) { $nome = $u.$n; break } }
      $semFoto += [pscustomobject]@{ Id = [string]$u.$cId; Nome = $nome; FotoUrl = $url; Fotos = $qtd }
    }
  }

  Write-Host ('  total: ' + $todos.Count + ' | sem foto alguma: ' + $semFoto.Count) -ForegroundColor Yellow
  foreach ($s in $semFoto) {
    Write-Host ('   ' + $s.Id + '  ' + $s.Nome) -ForegroundColor DarkGray
  }
}

# ------------------------------------------------------------
T '6. EXCLUSAO (GATED)'
# ------------------------------------------------------------
if ($semFoto.Count -eq 0) {
  Ok 'nenhum usuario a excluir'
}
elseif (-not $ConfirmarExclusao) {
  Aviso ($semFoto.Count.ToString() + ' candidato(s) identificado(s). EXCLUSAO NAO EXECUTADA.')
  Write-Host '  Esta operacao apaga arquivos, perfil e conta de autenticacao.' -ForegroundColor Yellow
  Write-Host '  Para executar de forma consciente:' -ForegroundColor Yellow
  Write-Host '    -File UNICO.ps1 -ConfirmarExclusao' -ForegroundColor White
}
else {
  $okCount = 0
  $falhas = @()

  foreach ($s in $semFoto) {
    $uid = $s.Id
    Write-Host ''
    Write-Host ('  excluindo ' + $uid + '  ' + $s.Nome) -ForegroundColor White

    # 6.1 storage
    try {
      $body = @{ prefix = $uid; limit = 1000; offset = 0 } | ConvertTo-Json -Compress
      $lista = Invoke-RestMethod -Uri ($sto + '/object/list/photos') -Headers $hj -Method Post -Body $body -TimeoutSec 60
      $arquivos = @($lista | Where-Object { $_.id })
      if ($arquivos.Count -gt 0) {
        $paths = @($arquivos | ForEach-Object { $uid + '/' + $_.name })
        $bdel = @{ prefixes = $paths } | ConvertTo-Json -Compress
        Invoke-RestMethod -Uri ($sto + '/object/photos') -Headers $hj -Method Delete -Body $bdel -TimeoutSec 60 | Out-Null
        Write-Host ('     storage: ' + $paths.Count + ' arquivo(s)') -ForegroundColor DarkGray
      } else {
        Write-Host '     storage: vazio' -ForegroundColor DarkGray
      }
    } catch { Write-Host ('     storage: ' + $_.Exception.Message) -ForegroundColor DarkYellow }

    # 6.2 tabelas filhas conhecidas
    foreach ($t in @(
      @{ N='posts'; C='user_id' }
      @{ N='post_likes'; C='user_id' }
      @{ N='post_comments'; C='user_id' }
      @{ N='profile_visits'; C='visitor_id' }
      @{ N='push_subscriptions'; C='user_id' }
      @{ N='user_roles'; C='user_id' }
      @{ N='payment_transactions'; C='user_id' }
    )) {
      try {
        Invoke-RestMethod -Uri ($rest + '/' + $t.N + '?' + $t.C + '=eq.' + $uid) -Headers $h -Method Delete -TimeoutSec 60 | Out-Null
      } catch { }
    }

    # 6.3 perfil
    try {
      Invoke-RestMethod -Uri ($rest + '/users?' + $cId + '=eq.' + $uid) -Headers $h -Method Delete -TimeoutSec 60 | Out-Null
      Write-Host '     perfil: removido' -ForegroundColor DarkGray
    } catch {
      $falhas += ($uid + ' perfil: ' + $_.Exception.Message)
      Write-Host ('     perfil: ' + $_.Exception.Message) -ForegroundColor Red
      continue
    }

    # 6.4 conta de autenticacao (Admin API)
    try {
      Invoke-RestMethod -Uri ($aad + '/users/' + $uid) -Headers $h -Method Delete -TimeoutSec 60 | Out-Null
      Write-Host '     auth: removido' -ForegroundColor DarkGray
      $okCount++
    } catch {
      $falhas += ($uid + ' auth: ' + $_.Exception.Message)
      Write-Host ('     auth: ' + $_.Exception.Message) -ForegroundColor Red
    }
  }

  Write-Host ''
  Ok ('excluidos: ' + $okCount + ' | falhas: ' + $falhas.Count)
  foreach ($f in $falhas) { Aviso $f }
}

# ------------------------------------------------------------
T '7. VERIFICACAO FINAL'
# ------------------------------------------------------------
$depois = RestGet '/users?select=*&limit=1000'
if ($null -ne $depois) {
  Write-Host ('  restaram ' + $depois.Count + ' perfil(is) em public.users') -ForegroundColor Cyan
} else {
  Aviso 'verificacao indisponivel'
}

foreach ($t in @('posts','users')) {
  $r = RestGet ('/' + $t + '?select=*&limit=1')
  if ($null -eq $r) { Write-Host ('  ' + $t.PadRight(10) + ' INACESSIVEL') -ForegroundColor Red }
  else { Write-Host ('  ' + $t.PadRight(10) + ' ok') -ForegroundColor Green }
}

# ------------------------------------------------------------
T '8. BUILD'
# ------------------------------------------------------------
Push-Location $raiz
& npm run build 2>&1 | ForEach-Object { Write-Host ('   ' + $_) -ForegroundColor DarkGray }
$buildOk = ($LASTEXITCODE -eq 0)
Pop-Location

if ($buildOk) { Ok 'build concluido' } else { Falhou 'build com erro - veja acima' }

# ------------------------------------------------------------
T 'RESUMO'
# ------------------------------------------------------------
Write-Host ('  SQL         : ' + $rota) -ForegroundColor Cyan
Write-Host ('  candidatos  : ' + $semFoto.Count) -ForegroundColor Cyan
Write-Host ('  exclusao    : ' + $(if ($ConfirmarExclusao) { 'EXECUTADA' } else { 'nao executada' })) -ForegroundColor $(if ($ConfirmarExclusao) { 'Yellow' } else { 'Green' })
Write-Host ('  build       : ' + $(if ($buildOk) { 'OK' } else { 'FALHOU' })) -ForegroundColor $(if ($buildOk) { 'Green' } else { 'Red' })
Write-Host ''
if ($rota -eq 'manual') {
  Write-Host '  PENDENTE: rode o .sql no Supabase antes de usar o app.' -ForegroundColor Yellow
}