$raiz = 'C:\libidojan2026'
$utf8 = New-Object System.Text.UTF8Encoding($false)

function T($t) { Write-Host ''; Write-Host ('=== ' + $t + ' ===') -ForegroundColor Cyan }
function Ok($t) { Write-Host ('  OK      ' + $t) -ForegroundColor Green }
function Info($t) { Write-Host ('  INFO    ' + $t) -ForegroundColor Yellow }
function Falhou($t) { Write-Host ('  FALHOU  ' + $t) -ForegroundColor Red }

# ---------- 1. media.ts : DESTRAVA O BUILD ----------
T '1. src/services/media.ts'

$media = @(
  '/**'
  ' * Sanitiza a imagem antes do upload.'
  ' * Reencoda via canvas: remove EXIF/GPS, modelo de camera e data.'
  ' */'
  'function carregarImagem(src: string): Promise<HTMLImageElement> {'
  '  return new Promise((resolve, reject) => {'
  '    const img = new Image();'
  '    img.onload = () => resolve(img);'
  '    img.onerror = () => reject(new Error("FALHA_AO_CARREGAR_IMAGEM"));'
  '    img.src = src;'
  '  });'
  '}'
  ''
  'export async function sanitizarImagem('
  '  file: File,'
  '  maxLado = 1600,'
  '  qualidade = 0.85'
  '): Promise<File> {'
  '  if (!file.type.startsWith("image/")) return file;'
  '  if (file.type === "image/gif") return file;'
  '  if (file.size <= 0) return file;'
  ''
  '  const url = URL.createObjectURL(file);'
  ''
  '  try {'
  '    const img = await carregarImagem(url);'
  '    const larguraOriginal = img.naturalWidth || 1;'
  '    const alturaOriginal = img.naturalHeight || 1;'
  '    const maior = Math.max(larguraOriginal, alturaOriginal);'
  '    const escala = maior > maxLado ? maxLado / maior : 1;'
  '    const largura = Math.max(1, Math.round(larguraOriginal * escala));'
  '    const altura = Math.max(1, Math.round(alturaOriginal * escala));'
  ''
  '    const canvas = document.createElement("canvas");'
  '    canvas.width = largura;'
  '    canvas.height = altura;'
  ''
  '    const ctx = canvas.getContext("2d");'
  '    if (!ctx) return file;'
  ''
  '    ctx.drawImage(img, 0, 0, largura, altura);'
  ''
  '    const tipo = file.type === "image/png" ? "image/png" : "image/jpeg";'
  '    const blob = await new Promise<Blob | null>((resolve) => {'
  '      canvas.toBlob(resolve, tipo, qualidade);'
  '    });'
  ''
  '    if (!blob) return file;'
  ''
  '    const base = (file.name || "foto").replace(/\.[^.]+$/, "");'
  '    const extensao = tipo === "image/png" ? ".png" : ".jpg";'
  ''
  '    return new File([blob], base + extensao, { type: tipo });'
  '  } catch {'
  '    return file;'
  '  } finally {'
  '    URL.revokeObjectURL(url);'
  '  }'
  '}'
) -join "`n"

$mediaPath = Join-Path $raiz 'src\services\media.ts'
[System.IO.File]::WriteAllText($mediaPath, ($media + "`n"), $utf8)
Ok 'media.ts gravado'

# ---------- 2. IMPORTS ORFAOS ----------
T '2. IMPORTS DE ./media'

$excl = '\\node_modules\\|\\dist\\|\\\.git\\|\\coverage\\|\\build\\|backup-barra'
$fontes = @(Get-ChildItem -LiteralPath (Join-Path $raiz 'src') -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch $excl -and $_.Extension -in @('.ts','.tsx') })

foreach ($f in $fontes) {
  $imp = @(Select-String -LiteralPath $f.FullName -Pattern 'services/media|from ''\./media''' -ErrorAction SilentlyContinue)
  if ($imp.Count -gt 0) {
    Ok ($f.Name + ': ' + $imp.Count + ' import(s)')
    foreach ($x in $imp) { Write-Host ('     L' + $x.LineNumber + ': ' + $x.Line.Trim()) -ForegroundColor DarkGray }
  }
}

# ---------- 3. CREDENCIAIS ----------
T '3. CREDENCIAIS'

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

$bancoOk = $false
if ($url -and $key) {
  $base = $url.TrimEnd('/')
  $api  = $base + '/rest/v1'
  $h    = @{ apikey = $key; Authorization = ('Bearer ' + $key) }
  $hj   = @{ apikey = $key; Authorization = ('Bearer ' + $key); 'Content-Type' = 'application/json' }
  $bancoOk = $true
  Ok ('conectado: ' + $base)
} else {
  Info 'credenciais ausentes - correcao de dados sera pulada'
}

function Lista([string]$caminho) {
  try {
    $r = Invoke-RestMethod -Uri ($api + $caminho) -Headers $h -Method Get -TimeoutSec 60
    if ($null -eq $r) { return @() }
    if ($r -is [System.Array]) { return $r }
    $t = @()
    $t += $r
    return $t
  } catch {
    return $null
  }
}

# ---------- 4. COLUNAS REAIS ----------
$idCol = $null
$campoPres = $null
$campoFoto = $null
$campoGeo = $null
$campoLng = $null
$alvos = @()

if ($bancoOk) {
  T '4. COLUNAS REAIS'

  $amostra = Lista '/users?select=*&limit=1'

  if ($null -eq $amostra -or $amostra.Count -eq 0) {
    Info 'nenhum usuario retornado'
  } else {
    $u0 = $amostra[0]
    $col = @($u0.PSObject.Properties.Name)
    Write-Host ('  colunas (' + $col.Count + '):') -ForegroundColor Gray
    Write-Host ('   ' + ($col -join ', ')) -ForegroundColor DarkGray

    if ($col -contains 'user_id') { $idCol = 'user_id' }
    elseif ($col -contains 'id') { $idCol = 'id' }

    foreach ($c in @('last_seen','last_active','ultimo_acesso','is_online','online','updated_at')) {
      if ($col -contains $c) { $campoPres = $c; break }
    }

    foreach ($c in @('photo','photo_url','avatar_url','foto','main_photo','picture','image','imagem')) {
      if ($col -contains $c) { $campoFoto = $c; break }
    }

    foreach ($c in @('lat','latitude')) { if ($col -contains $c) { $campoGeo = $c; break } }
    foreach ($c in @('lng','lon','longitude')) { if ($col -contains $c) { $campoLng = $c; break } }

    Write-Host ''
    Write-Host ('  id       : ' + $(if ($idCol) { $idCol } else { 'NAO ENCONTRADO' })) -ForegroundColor $(if ($idCol) { 'Gray' } else { 'Red' })
    Write-Host ('  presenca : ' + $(if ($campoPres) { $campoPres } else { 'NAO ENCONTRADO' })) -ForegroundColor $(if ($campoPres) { 'Gray' } else { 'Red' })
    Write-Host ('  foto     : ' + $(if ($campoFoto) { $campoFoto } else { 'NAO ENCONTRADO' })) -ForegroundColor $(if ($campoFoto) { 'Gray' } else { 'Red' })
    Write-Host ('  geo      : ' + $(if ($campoGeo -and $campoLng) { ($campoGeo + ' / ' + $campoLng) } else { 'NAO ENCONTRADA em users' })) -ForegroundColor $(if ($campoGeo) { 'Gray' } else { 'Yellow' })

    if ($idCol) {
      $regs = Lista ('/users?select=*&order=created_at.desc&limit=6')
      if ($regs -and $regs.Count -gt 0) {
        T '5. ULTIMOS CADASTROS'
        foreach ($u in $regs) {
          $nome = '?'
          foreach ($c in @('nickname','name','nome')) { if ($u.PSObject.Properties.Name -contains $c) { $nome = $u.$c; break } }
          $pr = if ($campoPres) { [string]$u.$campoPres } else { '-' }
          $fo = if ($campoFoto) { [string]$u.$campoFoto } else { '-' }
          $foTxt = 'NULL'
          if ($fo -is [string] -and $fo.Length -gt 0) { $foTxt = 'preenchido (' + $fo.Length + ' chars)' }
          Write-Host ''
          Write-Host ('  ' + $nome) -ForegroundColor White
          Write-Host ('   id       : ' + $u.$idCol) -ForegroundColor DarkGray
          Write-Host ('   presenca : ' + $pr) -ForegroundColor $(if ($pr -eq '-' -or $pr -eq 'False' -or $pr -eq '') { 'Red' } else { 'Gray' })
          Write-Host ('   foto     : ' + $foTxt) -ForegroundColor $(if ($foTxt -eq 'NULL') { 'Red' } else { 'Green' })
          $alvos += [pscustomobject]@{
            Id = [string]$u.$idCol
            Nome = $nome
            Foto = if ($campoFoto) { [string]$u.$campoFoto } else { '' }
            Arqs = @()
          }
        }
        Write-Host ''
        Ok ($regs.Count.ToString() + ' cadastro(s) lido(s)')
      }
    }
  }

  # ---------- 6. ONDE ESTA A LOCALIZACAO ----------
  T '6. SONDAGEM DE TABELAS'

  foreach ($t in @('locations','user_locations','presence','online_users','radar','visits','photos','messages')) {
    $r = Lista ('/' + $t + '?select=*&limit=1')
    if ($null -eq $r) {
      Write-Host ('  ' + $t.PadRight(16) + ' ausente') -ForegroundColor DarkGray
    } else {
      $cols = ''
      if ($r.Count -gt 0) { $cols = ' | ' + (@($r[0].PSObject.Properties.Name) -join ',') }
      Write-Host ('  ' + $t.PadRight(16) + ' EXISTE (' + $r.Count + ' amostra)' + $cols) -ForegroundColor Green
    }
  }

  # ---------- 7. ARQUIVOS NO BUCKET ----------
  T '7. ARQUIVOS NO BUCKET photos'

  $sto = $base + '/storage/v1'

  foreach ($a in $alvos) {
    $arqs = @()
    foreach ($pref in @($a.Id, ($a.Id + '/'))) {
      $b = @{ prefix = $pref; limit = 100; offset = 0 } | ConvertTo-Json -Compress
      try {
        $r = Invoke-WebRequest -Uri ($sto + '/object/list/photos') -Headers $hj -Method Post -Body $b -UseBasicParsing -TimeoutSec 60
        $lista = $r.Content | ConvertFrom-Json
        $tmp = @()
        if ($null -ne $lista) {
          if ($lista -is [System.Array]) { $tmp = $lista } else { $tmp += $lista }
        }
        $arqs = @($tmp | Where-Object { $_.id })
      } catch { $arqs = @() }
      if ($arqs.Count -gt 0) { break }
    }
    $a.Arqs = $arqs
    Write-Host ('  ' + $a.Nome.PadRight(26) + $arqs.Count.ToString().PadLeft(3) + ' arquivo(s)') -ForegroundColor $(if ($arqs.Count -gt 0) { 'Green' } else { 'Yellow' })
    foreach ($f in @($arqs | Select-Object -First 3)) { Write-Host ('     ' + $f.name) -ForegroundColor DarkGray }
  }

  # ---------- 8. CORRECAO ----------
  T '8. CORRECAO'

  if (-not $campoPres -and -not $campoFoto) {
    Falhou 'sem coluna de presenca nem de foto em users - nada a corrigir'
  } else {
    $agora = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
    $qP = 0
    $qF = 0

    foreach ($a in $alvos) {
      $p = @{}

      if ($campoPres) {
        if ($campoPres -like 'is_*' -or $campoPres -eq 'online') { $p[$campoPres] = $true }
        else { $p[$campoPres] = $agora }
      }

      if ($campoFoto -and (-not $a.Foto -or $a.Foto -eq '')) {
        $img = @($a.Arqs | Where-Object { $_.name -match '\.(jpg|jpeg|png|webp)$' } | Select-Object -First 1)
        if ($img.Count -eq 1) {
          $p[$campoFoto] = $base + '/storage/v1/object/public/photos/' + $a.Id + '/' + $img[0].name
        }
      }

      if ($p.Count -eq 0) { Info ($a.Nome + ': nada a corrigir'); continue }

      $body = $p | ConvertTo-Json -Compress
      $uri  = $api + '/users?' + $idCol + '=eq.' + $a.Id

      try {
        Invoke-WebRequest -Uri $uri -Headers $hj -Method Patch -Body $body -UseBasicParsing -TimeoutSec 60 | Out-Null
        if ($campoPres) { $qP++ }
        if ($p.ContainsKey($campoFoto)) { $qF++; Ok ($a.Nome + ': foto vinculada') }
        else { Ok ($a.Nome + ': presenca atualizada') }
      } catch {
        Falhou ($a.Nome + ': ' + $_.Exception.Message)
        if ($_.ErrorDetails.Message) { Write-Host ('  ' + $_.ErrorDetails.Message) -ForegroundColor Red }
      }
    }

    Write-Host ''
    Write-Host ('  presenca: ' + $qP + ' | foto: ' + $qF) -ForegroundColor Cyan
  }
}

# ---------- 9. BUILD ----------
T '9. BUILD'

Push-Location $raiz
& npm run build 2>&1 | ForEach-Object { Write-Host ('   ' + $_) -ForegroundColor DarkGray }
$buildOk = ($LASTEXITCODE -eq 0)
Pop-Location

if ($buildOk) { Ok 'build concluido' } else { Falhou 'build falhou' }

# ---------- 10. VERIFICACAO ----------
if ($buildOk) {
  T '10. BUNDLE'
  $bnd = Join-Path $raiz 'dist\assets'
  foreach ($f in @(Get-ChildItem -LiteralPath $bnd -Filter *.js -ErrorAction SilentlyContinue)) {
    Write-Host ('   ' + $f.Name + '  ' + [math]::Round($f.Length/1KB) + ' KB') -ForegroundColor DarkGray
  }
  $sr = @(Get-ChildItem -LiteralPath $bnd -Filter *.js | Select-String -Pattern 'service_role' -SimpleMatch -List)
  if ($sr.Count -eq 0) { Ok 'service_role fora do bundle' } else { Falhou 'service_role no bundle' }
}

# ---------- 11. PUBLICACAO ----------
T '11. PUBLICACAO'

if (-not $buildOk) { Falhou 'cancelada - corrija o erro de build acima'; exit 1 }

Push-Location $raiz
& git add -A
& git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  & git commit -m 'fix(build): recria media.ts e corrige vinculo de foto/presenca'
  if ($LASTEXITCODE -eq 0) { Ok 'commit criado' } else { Info 'sem commit' }
} else { Info 'nada novo para commitar' }
& git push
if ($LASTEXITCODE -eq 0) { Ok 'enviado' } else { Info 'push recusado' }
Write-Host ('  HEAD: ' + (& git log -1 --oneline)) -ForegroundColor Cyan
Pop-Location