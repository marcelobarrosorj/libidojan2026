$raiz = 'C:\libidojan2026'
$utf8 = New-Object System.Text.UTF8Encoding($false)

function T($t) { Write-Host ''; Write-Host ('=== ' + $t + ' ===') -ForegroundColor Cyan }
function Ok($t) { Write-Host ('  OK      ' + $t) -ForegroundColor Green }
function Info($t) { Write-Host ('  INFO    ' + $t) -ForegroundColor Yellow }
function Falhou($t) { Write-Host ('  FALHOU  ' + $t) -ForegroundColor Red }

# ---------- 1. CREDENCIAIS ----------
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

if (-not $url -or -not $key) { Falhou 'SUPABASE_URL + SERVICE_ROLE_KEY nao encontrados'; return }

$base = $url.TrimEnd('/')
$api  = $base + '/rest/v1'
$sto  = $base + '/storage/v1'
$h    = @{ apikey = $key; Authorization = ('Bearer ' + $key) }
$hj   = @{ apikey = $key; Authorization = ('Bearer ' + $key); 'Content-Type' = 'application/json' }

Write-Host ('  url : ' + $base) -ForegroundColor DarkGray

function GetTxt([string]$u) {
  return (Invoke-WebRequest -Uri $u -Headers $h -Method Get -UseBasicParsing -TimeoutSec 60).Content
}

# ---------- 2. SCHEMA REAL ----------
T '2. SCHEMA'

$spec = (GetTxt ($api + '/')) | ConvertFrom-Json
$tab  = @($spec.definitions.PSObject.Properties.Name)
$col  = @($spec.definitions.users.properties.PSObject.Properties.Name)

Write-Host ('  tabelas: ' + ($tab -join ', ')) -ForegroundColor DarkGray
Write-Host ''
Write-Host '  colunas de users:' -ForegroundColor Gray
Write-Host ('   ' + ($col -join ', ')) -ForegroundColor DarkGray

$idCol = 'user_id'
if (-not ($col -contains 'user_id') -and ($col -contains 'id')) { $idCol = 'id' }

$campoPres = $null
foreach ($c in @('last_seen','last_active','ultimo_acesso','is_online','online')) {
  if ($col -contains $c) { $campoPres = $c; break }
}

$campoFoto = $null
foreach ($c in @('photo','photo_url','avatar_url','foto','main_photo','picture','image','imagem')) {
  if ($col -contains $c) { $campoFoto = $c; break }
}

$campoGeo = $null
foreach ($c in @('lat','latitude')) { if ($col -contains $c) { $campoGeo = $c; break } }
$campoLng = $null
foreach ($c in @('lng','lon','longitude')) { if ($col -contains $c) { $campoLng = $c; break } }

Write-Host ''
Write-Host ('  id    : ' + $idCol) -ForegroundColor Gray
Write-Host ('  presenca : ' + $(if ($campoPres) { $campoPres } else { 'NENHUMA <<<' })) -ForegroundColor $(if ($campoPres) { 'Gray' } else { 'Red' })
Write-Host ('  foto     : ' + $(if ($campoFoto) { $campoFoto } else { 'NENHUMA <<<' })) -ForegroundColor $(if ($campoFoto) { 'Gray' } else { 'Red' })
Write-Host ('  geo      : ' + $(if ($campoGeo -and $campoLng) { ($campoGeo + ' / ' + $campoLng) } else { 'NENHUMA <<<' })) -ForegroundColor $(if ($campoGeo) { 'Gray' } else { 'Red' })

# ---------- 3. ULTIMOS CADASTROS ----------
T '3. ULTIMOS 6 CADASTROS'

$us = @((GetTxt ($api + '/users?select=*&order=created_at.desc&limit=6')) | ConvertFrom-Json)
Write-Host ('  ' + $us.Count + ' registro(s)') -ForegroundColor DarkGray

$alvos = @()
foreach ($u in $us) {
  $nome = '?'
  foreach ($c in @('nickname','name','nome')) { if ($u.PSObject.Properties.Name -contains $c) { $nome = $u.$c; break } }
  $id   = $u.$idCol
  $pr   = if ($campoPres) { $u.$campoPres } else { '-' }
  $fo   = if ($campoFoto) { $u.$campoFoto } else { '-' }
  $la   = if ($campoGeo)  { $u.$campoGeo }  else { '-' }
  $lo   = if ($campoLng)  { $u.$campoLng }  else { '-' }

  $foTxt = 'vazio'
  if ($fo -is [string] -and $fo.Length -gt 0) { $foTxt = $fo.Substring(0, [Math]::Min(45, $fo.Length)) + '...' }
  if ($fo -eq '-' -or $null -eq $fo) { $foTxt = 'NULL' }

  Write-Host ''
  Write-Host ('  ' + $nome) -ForegroundColor White
  Write-Host ('   id       : ' + $id) -ForegroundColor DarkGray
  Write-Host ('   presenca : ' + $pr) -ForegroundColor $(if ($null -eq $pr -or $pr -eq 'False' -or $pr -eq '-') { 'Red' } else { 'Gray' })
  Write-Host ('   geo      : ' + $la + ' / ' + $lo) -ForegroundColor $(if ($null -eq $la -or $la -eq '-') { 'Red' } else { 'Gray' })
  Write-Host ('   foto     : ' + $foTxt) -ForegroundColor $(if ($foTxt -eq 'NULL' -or $foTxt -eq 'vazio') { 'Red' } else { 'Gray' })

  $alvos += [pscustomobject]@{ Id = $id; Nome = $nome; Foto = $fo; Geo = $la }
}

# ---------- 4. ARQUIVOS NO STORAGE ----------
T '4. ARQUIVOS NO BUCKET photos'

function ListaBucket([string]$prefix) {
  $b = @{ prefix = $prefix; limit = 100; offset = 0 } | ConvertTo-Json -Compress
  try {
    $r = Invoke-WebRequest -Uri ($sto + '/object/list/photos') -Headers $hj -Method Post -Body $b -UseBasicParsing -TimeoutSec 60
    return @(($r.Content | ConvertFrom-Json) | Where-Object { $_.id })
  } catch {
    return @()
  }
}

foreach ($a in $alvos) {
  $arqs = ListaBucket $a.Id
  if ($arqs.Count -eq 0) { $arqs = ListaBucket ($a.Id + '/') }
  $a | Add-Member -NotePropertyName Arqs -NotePropertyValue $arqs -Force
  Write-Host ('  ' + $a.Nome.PadRight(28) + $arqs.Count.ToString().PadLeft(3) + ' arquivo(s)') -ForegroundColor $(if ($arqs.Count -gt 0) { 'Green' } else { 'Yellow' })
  foreach ($f in @($arqs | Select-Object -First 3)) {
    Write-Host ('     ' + $f.name) -ForegroundColor DarkGray
  }
}

# ---------- 5. CORRECAO DOS DADOS ----------
T '5. CORRECAO'

$agora = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
$okPres = 0
$okFoto = 0

if (-not $campoPres -and -not $campoFoto) {
  Falhou 'nem coluna de presenca nem de foto encontrada em users'
} else {
  foreach ($a in $alvos) {
    $p = @{}

    if ($campoPres) {
      if ($campoPres -like 'is_*' -or $campoPres -eq 'online') { $p[$campoPres] = $true }
      else { $p[$campoPres] = $agora }
    }

    $fotoNova = $false
    if ($campoFoto -and ($null -eq $a.Foto -or $a.Foto -eq '')) {
      $arq = @($a.Arqs | Where-Object { $_.name -match '\.(jpg|jpeg|png|webp)$' } | Select-Object -First 1)
      if ($arq.Count -eq 1) {
        $p[$campoFoto] = $base + '/storage/v1/object/public/photos/' + $a.Id + '/' + $arq[0].name
        $fotoNova = $true
      }
    }

    if ($p.Count -eq 0) {
      Info ($a.Nome + ': nada a corrigir')
      continue
    }

    $body = $p | ConvertTo-Json -Compress
    $uri  = $api + '/users?' + $idCol + '=eq.' + $a.Id

    try {
      Invoke-WebRequest -Uri $uri -Headers $hj -Method Patch -Body $body -UseBasicParsing -TimeoutSec 60 | Out-Null
      if ($campoPres) { $okPres++ }
      if ($fotoNova) {
        $okFoto++
        Write-Host ('  ' + $a.Nome + ': foto vinculada -> ' + $arq[0].name) -ForegroundColor Green
      } else {
        Write-Host ('  ' + $a.Nome + ': presenca atualizada') -ForegroundColor Green
      }
    } catch {
      Falhou ($a.Nome + ': ' + $_.Exception.Message)
      if ($_.ErrorDetails.Message) { Write-Host ('  ' + $_.ErrorDetails.Message) -ForegroundColor Red }
    }
  }
}

Write-Host ''
Write-Host ('  presenca gravada em ' + $okPres + ' usuario(s) | foto vinculada em ' + $okFoto) -ForegroundColor Cyan

# ---------- 6. MODULO DE PRESENCA NO CODIGO ----------
T '6. src/services/presenca.ts'

$supPath = Join-Path $raiz 'src\services\supabase.ts'
$nomeCli = $null

if (Test-Path -LiteralPath $supPath) {
  $stx = [System.IO.File]::ReadAllText($supPath, [System.Text.Encoding]::UTF8)
  if ($stx -match 'export\s+const\s+supabase\b') { $nomeCli = 'supabase' }
  elseif ($stx -match 'export\s+const\s+([A-Za-z0-9_]+)\s*=\s*createClient') { $nomeCli = $Matches[1] }
  elseif ($stx -match 'export\s*\{[^}]*\bsupabase\b') { $nomeCli = 'supabase' }
}

if (-not $nomeCli) {
  Info 'cliente supabase nao identificado - modulo nao gerado'
} elseif (-not $campoPres) {
  Info 'sem coluna de presenca - modulo nao gerado'
} else {
  $l = New-Object System.Collections.Generic.List[string]
  $l.Add("import { $nomeCli } from ""./supabase"";")
  $l.Add('')
  $l.Add('const TABELA = ""users"";')
  $l.Add('const ID_COL = ""' + $idCol + '"";')
  $l.Add('')
  $l.Add('function patch(): Record<string, unknown> {')
  $l.Add('  return {')
  if ($campoPres -like 'is_*' -or $campoPres -eq 'online') {
    $l.Add('    ' + $campoPres + ': true,')
  } else {
    $l.Add('    ' + $campoPres + ': new Date().toISOString(),')
  }
  $l.Add('  };')
  $l.Add('}')
  $l.Add('')
  $l.Add('let ativo = false;')
  $l.Add('let timer = 0;')
  $l.Add('')
  $l.Add('async function marcar(): Promise<void> {')
  $l.Add('  try {')
  $l.Add('    const { data } = await ' + $nomeCli + '.auth.getSession();')
  $l.Add('    const id = data.session?.user?.id;')
  $l.Add('    if (!id) return;')
  $l.Add('    await ' + $nomeCli + '.from(TABELA).update(patch()).eq(ID_COL, id);')
  $l.Add('  } catch {')
  $l.Add('    return;')
  $l.Add('  }')
  $l.Add('}')
  $l.Add('')
  $l.Add('export function iniciarPresenca(): void {')
  $l.Add('  if (ativo) return;')
  $l.Add('  ativo = true;')
  $l.Add('  void marcar();')
  $l.Add('  timer = window.setInterval(() => { void marcar(); }, 60000);')
  $l.Add('  document.addEventListener(""visibilitychange"", () => {')
  $l.Add('    if (document.visibilityState === ""visible"") void marcar();')
  $l.Add('  });')
  $l.Add('  window.addEventListener(""online"", () => { void marcar(); });')
  $l.Add('}')
  $l.Add('')
  $l.Add('export function pararPresenca(): void {')
  $l.Add('  if (timer) window.clearInterval(timer);')
  $l.Add('  ativo = false;')
  $l.Add('}')
  $l.Add('')
  $l.Add('iniciarPresenca();')

  $destino = Join-Path $raiz 'src\services\presenca.ts'
  [System.IO.File]::WriteAllText($destino, (($l -join "`n") + "`n"), $utf8)
  Ok ('gerado com ' + $nomeCli + ' | ' + $campoPres + ' | ' + $idCol)
}

# ---------- 7. IMPORT NO main.tsx ----------
T '7. main.tsx'

$main = Join-Path $raiz 'src\main.tsx'
if (Test-Path -LiteralPath $main) {
  $tx = [System.IO.File]::ReadAllText($main, [System.Text.Encoding]::UTF8)

  if ($tx -match 'services/presenca') {
    Info 'import ja presente'
  } elseif (-not (Test-Path -LiteralPath (Join-Path $raiz 'src\services\presenca.ts'))) {
    Info 'modulo ausente - import nao adicionado'
  } else {
    $nl = "`n"
    if ($tx.Contains("`r`n")) { $nl = "`r`n" }
    $anc = [regex]::Match($tx, "(?m)^[ \t]*import\s+'\./services/pushOff';[ \t]*\r?\n")
    if (-not $anc.Success) { $anc = [regex]::Match($tx, "(?m)^[ \t]*import\s+'\./services/push';[ \t]*\r?\n") }
    if (-not $anc.Success) { $anc = [regex]::Match($tx, "(?m)^[ \t]*import\s+'\./services/locationTracker';[ \t]*\r?\n") }
    if ($anc.Success) {
      $tx = $tx.Insert($anc.Index + $anc.Length, "import './services/presenca';" + $nl)
      [System.IO.File]::WriteAllText($main, $tx, $utf8)
      Ok 'import inserido apos o ultimo efeito'
    } else {
      Info 'ancora nao encontrada - import manual necessario'
    }
  }

  Get-Content -LiteralPath $main | Where-Object { $_ -match "^import\s+'" } |
    ForEach-Object { Write-Host ('   ' + $_) -ForegroundColor DarkGray }
}

# ---------- 8. BUILD ----------
T '8. BUILD'
Push-Location $raiz
& npm run build
$buildOk = ($LASTEXITCODE -eq 0)
Pop-Location

if ($buildOk) { Ok 'build concluido' } else { Falhou 'build falhou - nada sera publicado' }

# ---------- 9. VERIFICACAO ----------
if ($buildOk) {
  T '9. BUNDLE'
  $bnd = Join-Path $raiz 'dist\assets'
  foreach ($f in @(Get-ChildItem -LiteralPath $bnd -Filter *.js -ErrorAction SilentlyContinue)) {
    Write-Host ('   ' + $f.Name) -ForegroundColor DarkGray
  }
  $sr = @(Get-ChildItem -LiteralPath $bnd -Filter *.js | Select-String -Pattern 'service_role' -SimpleMatch -List)
  if ($sr.Count -eq 0) { Ok 'service_role fora do bundle' } else { Falhou 'service_role no bundle' }
}

# ---------- 10. RELEITURA ----------
T '10. ESTADO FINAL'
try {
  $us2 = @((GetTxt ($api + '/users?select=*&order=created_at.desc&limit=2')) | ConvertFrom-Json)
  foreach ($u in $us2) {
    $fo = if ($campoFoto) { $u.$campoFoto } else { '-' }
    $pr = if ($campoPres) { $u.$campoPres } else { '-' }
    $foTxt = 'NULL'
    if ($fo -is [string] -and $fo.Length -gt 0) { $foTxt = 'OK (' + $fo.Length + ' chars)' }
    Write-Host ('  ' + $u.$idCol + ' | presenca=' + $pr + ' | foto=' + $foTxt) -ForegroundColor $(if ($foTxt -eq 'NULL') { 'Red' } else { 'Green' })
  }
} catch { Info 'releitura falhou' }

# ---------- 11. PUBLICACAO ----------
T '11. PUBLICACAO'

if (-not $buildOk) { Falhou 'cancelada'; exit 1 }

Push-Location $raiz
& git add src/services/presenca.ts src/main.tsx
& git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  & git commit -m 'feat(presenca): heartbeat de presenca para radar e feed'
  if ($LASTEXITCODE -eq 0) { Ok 'commit criado' } else { Info 'sem commit' }
} else { Info 'nada novo no codigo' }
& git push
if ($LASTEXITCODE -eq 0) { Ok 'enviado' } else { Info 'push nao necessario' }
Write-Host ('  HEAD: ' + (& git log -1 --oneline)) -ForegroundColor Cyan
Pop-Location