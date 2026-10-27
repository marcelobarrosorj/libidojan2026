$raiz = 'C:\libidojan2026'

function T($t) { Write-Host ''; Write-Host ('=== ' + $t + ' ===') -ForegroundColor Cyan }
function Ok($t) { Write-Host ('  OK      ' + $t) -ForegroundColor Green }
function Info($t) { Write-Host ('  INFO    ' + $t) -ForegroundColor Yellow }
function Falhou($t) { Write-Host ('  FALHOU  ' + $t) -ForegroundColor Red }

T '1. CREDENCIAIS'

$cands = @(
  (Join-Path $raiz 'backend\.env'),
  (Join-Path $raiz 'backend\.env.local'),
  (Join-Path $raiz '.env'),
  (Join-Path $raiz '.env.local')
) | Where-Object { Test-Path -LiteralPath $_ }

$cfg = @{}
foreach ($c in $cands) {
  foreach ($l in (Get-Content -LiteralPath $c -ErrorAction SilentlyContinue)) {
    if ($l -match '^\s*([A-Za-z0-9_]+)\s*=\s*(.+?)\s*$') {
      $k = $Matches[1]
      $v = $Matches[2].Trim().Trim('"').Trim("'")
      if (-not $cfg.ContainsKey($k)) { $cfg[$k] = $v }
    }
  }
}

$url = $cfg['SUPABASE_URL']; if (-not $url) { $url = $cfg['VITE_SUPABASE_URL'] }
$key = $cfg['SUPABASE_SERVICE_ROLE_KEY']
if (-not $key) { $key = $cfg['SERVICE_ROLE_KEY'] }
if (-not $key) { $key = $cfg['SUPABASE_SERVICE_KEY'] }

if (-not $url -or -not $key) {
  Falhou 'nao encontrei SUPABASE_URL + SERVICE_ROLE_KEY'
  Write-Host '  me diga o caminho do .env do backend' -ForegroundColor Yellow
  return
}
Write-Host ('  url : ' + $url) -ForegroundColor DarkGray
Write-Host ('  key : ' + $key.Substring(0,8) + '... (' + $key.Length + ' chars)') -ForegroundColor DarkGray

$h   = @{ apikey = $key; Authorization = ('Bearer ' + $key); 'Content-Type' = 'application/json' }
$api = $url.TrimEnd('/') + '/rest/v1'

T '2. ULTIMOS 2 CADASTROS'

try {
  $us = @(Invoke-RestMethod -Uri ($api + '/users?select=*&order=created_at.desc&limit=2') -Headers $h -Method Get -TimeoutSec 60)
} catch {
  Falhou ('GET users: ' + $_.Exception.Message)
  if ($_.ErrorDetails.Message) { Write-Host ('  ' + $_.ErrorDetails.Message) -ForegroundColor Red }
  return
}

if ($us.Count -eq 0) { Falhou 'nenhum usuario retornado'; return }

$col = @($us[0].PSObject.Properties.Name)
Write-Host ('  colunas: ' + ($col -join ', ')) -ForegroundColor DarkGray

$idCol = 'user_id'
if (-not ($col -contains 'user_id') -and ($col -contains 'id')) { $idCol = 'id' }

$cPres = @('is_online','online','last_seen','last_active','updated_at')
$cGeo  = @('lat','lng','latitude','longitude','location','cidade','city','geo','posicao')
$cFoto = @('photo','photo_url','foto','avatar','avatar_url','image','imagem','picture','main_photo','photos')

function Mostra($u, $lista) {
  foreach ($f in $lista) {
    if ($col -contains $f) {
      $v = $u.$f
      $txt = 'NULL'
      if ($null -ne $v) {
        $txt = [string]$v
        if ($txt -eq '') { $txt = 'vazio' }
        if ($txt.Length -gt 70) { $txt = $txt.Substring(0,70) + '...' }
      }
      $cor = 'DarkGray'
      if ($txt -eq 'NULL' -or $txt -eq 'vazio' -or $txt -eq '[]') { $cor = 'Red' }
      Write-Host ('   ' + $f.PadRight(12) + ': ' + $txt) -ForegroundColor $cor
    }
  }
}

foreach ($u in $us) {
  Write-Host ''
  Write-Host ('  --- ' + $u.nickname + '  |  ' + $u.$idCol + ' ---') -ForegroundColor White
  if ($col -contains 'created_at') { Write-Host ('   created_at  : ' + $u.created_at) -ForegroundColor DarkGray }
  Write-Host '   presenca:' -ForegroundColor Gray
  Mostra $u $cPres
  Write-Host '   localizacao:' -ForegroundColor Gray
  Mostra $u $cGeo
  Write-Host '   foto:' -ForegroundColor Gray
  Mostra $u $cFoto
}

T '3. REATIVAR PRESENCA'

$patch = @{}
$agora = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')

if ($col -contains 'is_online')   { $patch['is_online']   = $true }
if ($col -contains 'online')      { $patch['online']      = $true }
if ($col -contains 'last_seen')   { $patch['last_seen']   = $agora }
if ($col -contains 'last_active') { $patch['last_active'] = $agora }

if ($patch.Count -eq 0) {
  Info 'nenhuma coluna de presenca reconhecida'
} else {
  $body = $patch | ConvertTo-Json -Compress
  $ids  = @($us | ForEach-Object { $_.$idCol })
  $filtro = $idCol + '=in.(' + ($ids -join ',') + ')'

  try {
    Invoke-RestMethod -Uri ($api + '/users?' + $filtro) -Headers $h -Method Patch -Body $body -TimeoutSec 60 | Out-Null
    Ok ('presenca reativada em ' + $ids.Count + ' usuario(s): ' + $body)
  } catch {
    Falhou ('PATCH: ' + $_.Exception.Message)
    if ($_.ErrorDetails.Message) { Write-Host ('  ' + $_.ErrorDetails.Message) -ForegroundColor Red }
  }
}

T '4. BUCKET photos'

try {
  $bs = @(Invoke-RestMethod -Uri ($url.TrimEnd('/') + '/storage/v1/bucket') -Headers $h -Method Get -TimeoutSec 60)
  $ph = @($bs | Where-Object { $_.name -eq 'photos' -or $_.id -eq 'photos' })

  if ($ph.Count -eq 0) {
    Info 'bucket photos nao listado (nome diferente ou sem permissao)'
  } else {
    $b = $ph[0]
    if ($b.public) {
      Falhou 'bucket photos = PUBLICO -> getPublicUrl vira link permanente'
    } else {
      Falhou 'bucket photos = PRIVADO -> getPublicUrl gera link quebrado (foto nao renderiza)'
    }
    Write-Host ('   limite: ' + $b.file_size_limit + ' bytes | mimes: ' + ($b.allowed_mime_types -join ',')) -ForegroundColor DarkGray
  }
} catch {
  Info ('listagem de buckets indisponivel: ' + $_.Exception.Message)
}

T '5. LEITURA'

Write-Host '  foto = NULL        -> upload falhou no cliente ou RLS de storage' -ForegroundColor Gray
Write-Host '  foto com valor     -> link quebrado por bucket privado + getPublicUrl' -ForegroundColor Gray
Write-Host '  lat/lng = NULL     -> radar nao posiciona (geolocalizacao nao gravada)' -ForegroundColor Gray
Write-Host '  presenca reativada -> aparece no radar assim que tiver foto valida' -ForegroundColor Gray