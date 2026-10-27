$raiz  = 'C:\libidojan2026'
$rel   = Join-Path $raiz 'auditoria-libido.txt'
$crit  = Join-Path $raiz 'auditoria-criticos.txt'
$utf8  = New-Object System.Text.UTF8Encoding($false)

function T($t) { Write-Host ''; Write-Host ('=== ' + $t + ' ===') -ForegroundColor Cyan }
function Ok($t) { Write-Host ('  OK      ' + $t) -ForegroundColor Green }
function Info($t) { Write-Host ('  INFO    ' + $t) -ForegroundColor Yellow }
function Falhou($t) { Write-Host ('  FALHOU  ' + $t) -ForegroundColor Red }

T '1. RELATORIO EXISTENTE'

if (-not (Test-Path -LiteralPath $rel)) { Falhou 'auditoria-libido.txt nao existe. Rode o ciclo1.ps1 primeiro.'; exit 1 }
Write-Host ('  ' + [math]::Round((Get-Item -LiteralPath $rel).Length/1KB) + ' KB') -ForegroundColor DarkGray

T '2. EXTRACAO DOS CRITICOS E ALTOS'

$linhas = [System.IO.File]::ReadAllLines($rel, [System.Text.Encoding]::UTF8)
$saida  = New-Object System.Collections.Generic.List[string]
$dentro = $false
$bloco  = ''
$qCrit  = 0
$qAlto  = 0

foreach ($l in $linhas) {
  if ($l -match '^\[(CRITICO|ALTO)\]') {
    $dentro = $true
    $bloco  = $l
    if ($l -match '^\[CRITICO\]') { $qCrit++ } else { $qAlto++ }
    $saida.Add('')
    $saida.Add('=' * 78)
    $saida.Add($l)
    continue
  }
  if ($dentro) {
    if ($l -match '^\[(MEDIO|BAIXO|INFO)\]') { $dentro = $false; continue }
    if ($l -match '^={10,}$' -and $saida.Count -gt 3 -and $saida[$saida.Count-1] -eq '') { continue }
    $saida.Add($l)
  }
}

$cab = @(
  'AUDITORIA LIBIDO - APENAS CRITICOS E ALTOS'
  ('Gerado: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
  ('Blocos CRITICO: ' + $qCrit + ' | Blocos ALTO: ' + $qAlto)
  ('Origem: ' + $rel)
  ''
)

[System.IO.File]::WriteAllText($crit, (($cab + $saida) -join "`r`n"), $utf8)
Ok ('arquivo enxuto: ' + $crit)
Write-Host ('  ' + [math]::Round((Get-Item -LiteralPath $crit).Length/1KB) + ' KB | ' + $saida.Count + ' linha(s)') -ForegroundColor DarkGray

T '3. getPublicUrl NO CODIGO FONTE'

$excl = '\\node_modules\\|\\dist\\|\\\.git\\|\\coverage\\|\\build\\'
$arqs = @(Get-ChildItem -LiteralPath $raiz -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch $excl -and $_.Extension -in @('.ts','.tsx','.js','.jsx') })

$total = 0
foreach ($a in $arqs) {
  $achados = @(Select-String -LiteralPath $a.FullName -Pattern 'getPublicUrl' -Context 8,8 -ErrorAction SilentlyContinue)
  if ($achados.Count -eq 0) { continue }
  $total += $achados.Count
  $rel2 = $a.FullName.Substring($raiz.Length + 1)
  foreach ($m in $achados) {
    Write-Host ''
    Write-Host ('--- ' + $rel2 + ':' + $m.LineNumber + ' ---') -ForegroundColor Cyan
    foreach ($p in $m.Context.PreContext)  { Write-Host ('      ' + $p) -ForegroundColor DarkGray }
    Write-Host ('  >>  ' + $m.Line) -ForegroundColor Yellow
    foreach ($q in $m.Context.PostContext) { Write-Host ('      ' + $q) -ForegroundColor DarkGray }
  }
}

if ($total -eq 0) { Falhou 'getPublicUrl nao encontrado no fonte (pode vir de dependencia)' }
else { Ok ($total.ToString() + ' ocorrencia(s) no codigo fonte') }

T '4. OUTROS CRITICOS E ALTOS REAIS'

$alvos = @(
  @{ N='service_role';  R='service_role|SUPABASE_SERVICE_ROLE' }
  @{ N='coordenada bruta'; R='\.select\([^)]*\b(lat|lon|lng|latitude|longitude)\b' }
  @{ N='is_premium';    R='is_premium|isPremium' }
  @{ N='is_owner/admin';R='is_owner|is_admin|isOwner|isAdmin' }
  @{ N='signed URL';    R='createSignedUrl' }
  @{ N='EXIF';          R='[Ee][Xx][Ii][Ff]' }
)

foreach ($alvo in $alvos) {
  $q = 0
  $primeiros = @()
  foreach ($a in $arqs) {
    $m = @(Select-String -LiteralPath $a.FullName -Pattern $alvo.R -ErrorAction SilentlyContinue)
    if ($m.Count -gt 0) {
      $q += $m.Count
      if ($primeiros.Count -lt 3) {
        $primeiros += ($a.FullName.Substring($raiz.Length + 1) + ':' + $m[0].LineNumber)
      }
    }
  }
  $cor = 'Gray'
  if ($q -gt 0) { $cor = 'Yellow' }
  Write-Host ('  ' + $alvo.N.PadRight(18) + $q.ToString().PadLeft(4) + '   ' + ($primeiros -join '  ')) -ForegroundColor $cor
}

T '5. GITIGNORE'

$gi = Join-Path $raiz '.gitignore'
$atual = ''
if (Test-Path -LiteralPath $gi) { $atual = [System.IO.File]::ReadAllText($gi) }
$add = @()
foreach ($a in @('ciclo1.ps1','auditoria-criticos.txt','*.ps1')) {
  if ($atual -notmatch [regex]::Escape($a)) { $add += $a }
}
if ($add.Count -gt 0) {
  $novo = $atual
  if ($novo.Length -gt 0 -and -not $novo.EndsWith("`n")) { $novo += "`n" }
  [System.IO.File]::WriteAllText($gi, ($novo + ($add -join "`n") + "`n"), $utf8)
  Ok ('adicionado: ' + ($add -join ', '))
} else { Info 'gitignore ja cobre tudo' }

Push-Location $raiz
& git rm --cached ciclo1.ps1 -q 2>$null
& git add .gitignore
& git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  & git commit -m 'chore: ignora scripts locais e extrai relatorio de criticos'
  if ($LASTEXITCODE -eq 0) { Ok 'commit criado' } else { Info 'sem alteracao' }
} else { Info 'nada para commitar' }
& git push
if ($LASTEXITCODE -eq 0) { Ok 'enviado' } else { Info 'push nao necessario' }
Write-Host ('  HEAD: ' + (& git log -1 --oneline)) -ForegroundColor Cyan
Pop-Location

T 'RESUMO'
Write-Host ('  Anexe: ' + $crit) -ForegroundColor Cyan