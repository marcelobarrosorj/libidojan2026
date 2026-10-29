param(
  [string]$Raiz = 'C:\libidojan2026',
  [switch]$Aplicar,
  [switch]$SemBackup
)

$ErrorActionPreference = 'Continue'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$rel = New-Object System.Collections.ArrayList

function L($t)   { Write-Host ''; Write-Host ('=== ' + $t + ' ===') -ForegroundColor Cyan; [void]$rel.Add(''); [void]$rel.Add('=== ' + $t + ' ===') }
function Ok($t)  { Write-Host ('  OK     ' + $t) -ForegroundColor Green; [void]$rel.Add('  OK     ' + $t) }
function Av($t)  { Write-Host ('  AVISO  ' + $t) -ForegroundColor Yellow; [void]$rel.Add('  AVISO  ' + $t) }
function Er($t)  { Write-Host ('  BUG    ' + $t) -ForegroundColor Red; [void]$rel.Add('  BUG    ' + $t) }
function Inf($t) { Write-Host ('         ' + $t) -ForegroundColor DarkGray; [void]$rel.Add('         ' + $t) }

if (-not (Test-Path -LiteralPath $Raiz)) { Write-Host 'raiz inexistente' -ForegroundColor Red; exit 1 }
Push-Location $Raiz

# ============================================================
L '0. BACKUP'
# ============================================================
if (-not $SemBackup) {
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $bkp = Join-Path $Raiz ('.backup-bugs-' + $stamp)
  New-Item -ItemType Directory -Path $bkp -Force | Out-Null
  $origem = Join-Path $Raiz 'src'
  if (Test-Path -LiteralPath $origem) {
    Copy-Item -LiteralPath $origem -Destination $bkp -Recurse -Force -ErrorAction SilentlyContinue
    Ok ('backup de src/ em ' + $bkp)
  } else { Av 'pasta src/ nao encontrada' }
} else { Av 'backup desativado por parametro' }

# ============================================================
# BUSCADOR DE CODIGO
# ============================================================
function Buscar {
  param([string[]]$Padroes, [string[]]$Pastas = @('src','backend\src'), [string]$Rotulo)
  $achados = @()
  foreach ($d in $Pastas) {
    $p = Join-Path $Raiz $d
    if (-not (Test-Path -LiteralPath $p)) { continue }
    foreach ($f in (Get-ChildItem -LiteralPath $p -Recurse -File -Include *.ts,*.tsx,*.js,*.jsx -ErrorAction SilentlyContinue)) {
      $n = 0
      foreach ($linha in [System.IO.File]::ReadAllLines($f.FullName)) {
        $n++
        foreach ($pat in $Padroes) {
          if ($linha -match $pat) {
            $achados += [pscustomobject]@{
              Arquivo = $f.FullName.Replace($Raiz,'').TrimStart('\')
              Linha   = $n
              Trecho  = ($linha.Trim() -replace '\s+',' ')
            }
            break
          }
        }
      }
    }
  }
  if ($Rotulo) { Inf ('[' + $Rotulo + '] ' + $achados.Count + ' ocorrencia(s)') }
  return $achados
}

function Mostrar {
  param($Lista, [int]$Max = 12)
  if (-not $Lista -or $Lista.Count -eq 0) { Inf '(nada encontrado)'; return }
  $i = 0
  foreach ($a in $Lista) {
    $i++
    if ($i -gt $Max) { Inf ('... +' + ($Lista.Count - $Max) + ' ocorrencia(s)'); break }
    $t = $a.Trecho
    if ($t.Length -gt 110) { $t = $t.Substring(0,110) + '...' }
    Inf ($a.Arquivo + ':' + $a.Linha)
    Inf ('    ' + $t)
  }
}

# ============================================================
L '1. MAPA: LOCALIZACAO FALSA E USUARIOS OFFLINE'
# ============================================================
$qOnline = Buscar -Padroes @("is_online'\s*,\s*true", 'is_online\s*===?\s*true', "\.eq\(\s*'online'", 'online.*=.*true') -Rotulo 'filtro online'
$qCoord  = Buscar -Padroes @('latitude', 'longitude', 'coords', 'geopoint', 'lat\b', 'lng\b') -Rotulo 'coordenadas'
$qStale  = Buscar -Padroes @('last_seen', 'ultima_localizacao', 'last_location', 'location_at', 'updated_at.*location') -Rotulo 'timestamp local'

Mostrar $qOnline 10
Mostrar $qCoord 8

if ($qOnline.Count -gt 0) {
  Er 'filtro por online encontrado: usuarios offline somem do mapa (bug 2)'
  Inf 'correcao: trocar o filtro por ultima localizacao conhecida + flag de staleness'
} else { Ok 'nenhum filtro duro por online' }

if ($qStale.Count -eq 0) {
  Er 'nenhum controle de idade da coordenada: posicao antiga vira posicao real (bug 1)'
} else { Ok 'existe referencia a timestamp de localizacao' }

# ============================================================
L '2. GALERIA DE FOTOS'
# ============================================================
$qFoto = Buscar -Padroes @('from\(\s*.photos', 'from\(\s*.fotos', 'storage\.from', 'uploadPhoto', 'gallery', 'galeria') -Rotulo 'fotos'
$qFiltroFoto = Buscar -Padroes @("\.eq\(\s*'ativo'", "\.eq\(\s*'deleted'", "\.is\(\s*'deleted_at'", "\.not\(\s*'url'") -Rotulo 'filtro fotos'

Mostrar $qFoto 14
Mostrar $qFiltroFoto 10

if ($qFiltroFoto.Count -gt 0) {
  Av 'filtro em fotos detectado: conferir se nao esconde registros validos'
} else {
  Er 'nenhum filtro de fotos: pode estar listando apenas a primeira ou ignorando soft delete'
}

# ============================================================
L '3. CHAT: LINK VITALICIO'
# ============================================================
$qVida = Buscar -Padroes @('lifetime', 'vitalic', 'vitalici', 'is_lifetime', 'acesso_vital', 'link_vital') -Rotulo 'vitalicio'
$qChat = Buscar -Padroes @('from\(\s*.messages', 'from\(\s*.chat', 'sendMessage', 'enviarMensagem') -Rotulo 'chat'

Mostrar $qVida 12
Mostrar $qChat 10

if ($qVida.Count -eq 0) {
  Er 'nenhuma referencia a acesso vitalicio no codigo: o front nao reconhece esse plano (bug 4)'
} else {
  Av 'acesso vitalicio referenciado: conferir se a policy de INSERT em messages valida o mesmo criterio'
}

# ============================================================
L '4. ANTI-PRINT'
# ============================================================
$qPrint = Buscar -Padroes @('antiPrint', 'visibilitychange', 'user-select', 'printScreen', 'keydown.*PrintScreen', 'blur') -Rotulo 'anti-print'
Mostrar $qPrint 12

if ($qPrint.Count -eq 0) {
  Er 'nenhuma protecao de captura ativa (bug 5)'
} else {
  Av 'protecao presente: verificar cobertura em todas as telas sensiveis'
}
Inf 'limite real: navegador nao bloqueia print do sistema operacional'

# ============================================================
L '5. DUPLO TOQUE AO POSTAR'
# ============================================================
$qPost = Buscar -Padroes @('handlePost', 'handleSubmit', 'postar', 'publicar', 'createPost', 'onClick=.*[Pp]ost') -Rotulo 'postar'
Mostrar $qPost 14

$temGuard = Buscar -Padroes @('disabled=\{', 'isPosting', 'isSubmitting', 'enviando', 'loading\}') -Rotulo 'guard'
if ($temGuard.Count -eq 0) {
  Er 'nenhum guard de envio: duplo toque cria registro duplicado (bug 6)'
} else { Ok 'existe guard de envio - conferir se cobre o botao de postar' }

# ============================================================
L '6. MOCK NO LUGAR DA FOTO'
# ============================================================
$qMock = Buscar -Padroes @('placeholder', 'mock', 'avatar-default', 'no-photo', 'sem-foto', 'defaultImage', 'dummy') -Rotulo 'mock'
Mostrar $qMock 14

if ($qMock.Count -gt 0) {
  Av 'referencias a imagem padrao encontradas: conferir fallback apos upload (bug 7)'
} else { Ok 'nenhum placeholder explicito' }

# ============================================================
L '7. BANCO: CORRECOES ADITIVAS'
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

function Sql([string]$q) {
  $uri = 'https://api.supabase.com/v1/projects/' + $ref + '/database/query'
  $hh = @{ Authorization = ('Bearer ' + $pat); 'Content-Type' = 'application/json' }
  $bd = @{ query = $q } | ConvertTo-Json -Compress
  return Invoke-RestMethod -Uri $uri -Method Post -Headers $hh -Body $bd -TimeoutSec 120
}

$sqlOk = $false
if ($pat -and $ref) {
  try { Sql 'select 1 as ok;' | Out-Null; $sqlOk = $true; Ok 'banco acessivel' }
  catch { Er ('pat invalido: ' + $_.Exception.Message) }
} else {
  Av 'sem SUPABASE_ACCESS_TOKEN - bloco de banco pulado'
}

if ($sqlOk) {
  try {
    $cols = @(Sql "select column_name as c from information_schema.columns where table_schema='public' and table_name='users';")
    $nomes = @()
    foreach ($c in $cols) { $nomes += [string]$c.c }
    Inf ('colunas de users: ' + ($nomes -join ', '))

    $temLat = ($nomes -contains 'latitude') -or ($nomes -contains 'lat')
    $temLng = ($nomes -contains 'longitude') -or ($nomes -contains 'lng')
    $temLoc = ($nomes -contains 'last_location_at')

    if (-not $temLoc) {
      if ($Aplicar) {
        Sql "alter table public.users add column if not exists last_location_at timestamptz;" | Out-Null
        Sql "update public.users set last_location_at = coalesce(updated_at, created_at, now()) where last_location_at is null;" | Out-Null
        Ok 'coluna last_location_at criada e preenchida'
      } else {
        Av 'last_location_at ausente (rode com -Aplicar para criar)'
      }
    } else { Ok 'last_location_at ja existe' }

    if ($temLat -and $temLng -and $Aplicar) {
      Sql "create index if not exists idx_users_geo on public.users (latitude, longitude);" | Out-Null
      Ok 'indice geografico criado'
    }
  } catch {
    Av ('consulta de schema falhou: ' + $_.Exception.Message)
  }
}

# ============================================================
L '8. RELATORIO'
# ============================================================
$saida = Join-Path $Raiz ('relatorio-bugs-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.txt')
[System.IO.File]::WriteAllText($saida, ($rel -join "`r`n"), $utf8)
Ok ('relatorio salvo: ' + $saida)

Write-Host ''
Write-Host '  Proximo passo: abra o relatorio e me envie o conteudo.' -ForegroundColor Yellow
Write-Host '  Ele traz arquivo e linha exata de cada bug.' -ForegroundColor Yellow

Pop-Location