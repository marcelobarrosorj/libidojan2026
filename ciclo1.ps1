$raiz = 'C:\libidojan2026'
$rel  = Join-Path $raiz 'auditoria-libido.txt'
$bnd  = Join-Path $raiz 'dist\assets'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$MAX  = 40

function T($t) { Write-Host ''; Write-Host ('=== ' + $t + ' ===') -ForegroundColor Cyan }
function Ok($t) { Write-Host ('  OK      ' + $t) -ForegroundColor Green }
function Info($t) { Write-Host ('  INFO    ' + $t) -ForegroundColor Yellow }
function Falhou($t) { Write-Host ('  FALHOU  ' + $t) -ForegroundColor Red }

T '1. INVENTARIO'

$excl = '\\node_modules\\|\\dist\\|\\\.git\\|\\coverage\\|\\build\\|\\\.vercel\\'
$arqs = @(Get-ChildItem -LiteralPath $raiz -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object {
    $_.FullName -notmatch $excl -and
    $_.Extension.ToLower() -in @('.ts','.tsx','.js','.jsx','.sql','.json','.html')
  })
Write-Host ('  ' + $arqs.Count + ' arquivo(s) analisado(s)') -ForegroundColor DarkGray

$blocos = @(
  @{ S='CRITICO'; P='1 Midia';    M='service_role no cliente';        R='service_role|SERVICE_ROLE|SUPABASE_SERVICE' }
  @{ S='CRITICO'; P='1 Midia';    M='getPublicUrl (anula o PIN)';     R='getPublicUrl' }
  @{ S='ALTO';    P='1 Midia';    M='signed URL - conferir expireIn'; R='createSignedUrl' }
  @{ S='ALTO';    P='1 Midia';    M='EXIF / metadados no upload';     R='[Ee][Xx][Ii][Ff]|XMP|xmp' }
  @{ S='MEDIO';   P='1 Midia';    M='desfoque de rosto no feed';      R='blur-|filter: blur|backdrop-blur' }
  @{ S='INFO';    P='1 Midia';    M='bloqueio de menu de contexto';   R='contextmenu' }
  @{ S='INFO';    P='1 Midia';    M='bloqueio de arrasto de imagem';  R='draggable|dragstart' }
  @{ S='INFO';    P='2 Ghost';    M='perda de foco (suspensao)';      R='visibilitychange' }
  @{ S='ALTO';    P='2 Ghost';    M='service worker / cache offline'; R='caches\.open|cache\.addAll|precache|workbox' }
  @{ S='INFO';    P='2 Ghost';    M='troca de document.title';        R='document\.title' }
  @{ S='INFO';    P='2 Ghost';    M='limpeza de storage';             R='localStorage\.(clear|removeItem)|sessionStorage\.(clear|removeItem)' }
  @{ S='MEDIO';   P='2 Ghost';    M='troca de favicon';               R='rel=.icon|favicon' }
  @{ S='ALTO';    P='3 RLS';      M='coordenada bruta em consulta';   R='select[^\n]*(lat|lon|lng|latitude|longitude)' }
  @{ S='ALTO';    P='3 Paywall';  M='is_premium no cliente';          R='is_premium|isPremium' }
  @{ S='ALTO';    P='3 RLS';      M='flag de privilegio no cliente';  R='is_owner|is_admin|isOwner|isAdmin' }
  @{ S='MEDIO';   P='3 Paywall';  M='pix / webhook';                  R='pix|PIX|webhook' }
  @{ S='MEDIO';   P='3 RLS';      M='filtro de bloqueio no cliente';  R='blocked|bloquead' }
  @{ S='INFO';    P='4 LGPD';     M='exclusao de conta';              R='deleteUser|excluirConta|delete_account' }
  @{ S='INFO';    P='4 LGPD';     M='remocao no storage';             R='\.remove\(' }
  @{ S='MEDIO';   P='4 Moderacao';M='upsert (race condition)';        R='upsert|onConflict' }
  @{ S='CRITICO'; P='5 Realtime'; M='canal realtime';                 R='\.channel\(' }
  @{ S='MEDIO';   P='5 Realtime'; M='cleanup de canal';               R='removeChannel|\.unsubscribe\(' }
  @{ S='MEDIO';   P='5 Perf';     M='setInterval';                    R='setInterval' }
  @{ S='MEDIO';   P='5 Perf';     M='addEventListener';               R='addEventListener' }
  @{ S='INFO';    P='5 Perf';     M='paginacao / infinite scroll';    R='IntersectionObserver|fetchMore|hasMore' }
  @{ S='MEDIO';   P='6 Tipagem';  M='uso de any';                     R=':\s*any\b|as any\b' }
  @{ S='BAIXO';   P='6 Qualidade';M='console.log em producao';        R='console\.(log|debug)' }
  @{ S='MEDIO';   P='6 Qualidade';M='catch vazio';                    R='catch\s*\([^)]*\)\s*\{\s*\}' }
)

$txt = New-Object System.Collections.Generic.List[string]
$tot = @{ CRITICO=0; ALTO=0; MEDIO=0; BAIXO=0; INFO=0 }
$resumo = New-Object System.Collections.Generic.List[object]

foreach ($b in $blocos) {
  $achados = @()
  foreach ($a in $arqs) {
    $r = @(Select-String -LiteralPath $a.FullName -Pattern $b.R -Context 5,5 -ErrorAction SilentlyContinue)
    foreach ($m in $r) {
      $achados += [pscustomobject]@{ Arquivo = $a.FullName.Substring($raiz.Length + 1); Linha = $m.LineNumber; Obj = $m }
    }
  }
  if ($achados.Count -eq 0) { continue }

  $tot[$b.S] += $achados.Count
  $resumo.Add([pscustomobject]@{ Sev=$b.S; Pilar=$b.P; Item=$b.M; Qtd=$achados.Count })

  $txt.Add('')
  $txt.Add('=' * 78)
  $txt.Add('[' + $b.S + '] ' + $b.P + ' | ' + $b.M + '  (' + $achados.Count + ')')
  $txt.Add('regex: ' + $b.R)
  $txt.Add('=' * 78)

  $i = 0
  foreach ($x in $achados) {
    $i++
    if ($i -gt $MAX) { $txt.Add('  ... +' + ($achados.Count - $MAX) + ' ocorrencia(s) omitida(s)'); break }
    $txt.Add('')
    $txt.Add('--- ' + $x.Arquivo + ':' + $x.Linha + ' ---')
    foreach ($p in $x.Obj.Context.PreContext)  { $txt.Add('      ' + $p) }
    $txt.Add('  >>  ' + $x.Obj.Line)
    foreach ($q in $x.Obj.Context.PostContext) { $txt.Add('      ' + $q) }
  }
}

$can = 0; $rem = 0
foreach ($a in $arqs) {
  $can += @(Select-String -LiteralPath $a.FullName -Pattern '\.channel\(' -ErrorAction SilentlyContinue).Count
  $rem += @(Select-String -LiteralPath $a.FullName -Pattern 'removeChannel|\.unsubscribe\(' -ErrorAction SilentlyContinue).Count
}

$cab = New-Object System.Collections.Generic.List[string]
$cab.Add('RELATORIO DE AUDITORIA ESTATICA - LIBIDO')
$cab.Add('Gerado : ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
$cab.Add('Raiz   : ' + $raiz)
$cab.Add('Arquivos: ' + $arqs.Count)
$cab.Add('Formato : numero de linha + 5 linhas de contexto')
$cab.Add('')
$cab.Add('--- RESUMO POR BLOCO ---')
foreach ($r in ($resumo | Sort-Object @{E={switch($_.Sev){'CRITICO'{0}'ALTO'{1}'MEDIO'{2}'BAIXO'{3}default{4}}}})) {
  $cab.Add(('  ' + $r.Sev.PadRight(8) + $r.Pilar.PadRight(14) + $r.Item.PadRight(34) + $r.Qtd))
}
$cab.Add('')
$cab.Add('channel() : ' + $can)
$cab.Add('cleanup   : ' + $rem)
if ($can -gt $rem) { $cab.Add('VEREDITO  : subscription sem encerramento') }
else { $cab.Add('VEREDITO  : subscriptions parecem encerradas') }

[System.IO.File]::WriteAllText($rel, (($cab + $txt) -join "`r`n"), $utf8)

Ok ('relatorio: ' + $rel)
Write-Host ''
foreach ($s in @('CRITICO','ALTO','MEDIO','BAIXO','INFO')) {
  $cor = 'Gray'
  if ($s -eq 'CRITICO') { $cor = 'Red' } elseif ($s -eq 'ALTO') { $cor = 'Yellow' } elseif ($s -eq 'MEDIO') { $cor = 'DarkYellow' }
  Write-Host ('  ' + $s.PadRight(8) + $tot[$s]) -ForegroundColor $cor
}
if ($can -gt $rem) { Falhou ('channel()=' + $can + ' | cleanup=' + $rem) } else { Ok ('channel()=' + $can + ' | cleanup=' + $rem) }

T '2. BUILD'

Push-Location $raiz
& npm run build
$buildOk = ($LASTEXITCODE -eq 0)
Pop-Location

if ($buildOk) { Ok 'build concluido' } else { Falhou 'build falhou' }

if ($buildOk) {
  T '3. VERIFICACAO'
  $js = @(Get-ChildItem -LiteralPath $bnd -Filter *.js -ErrorAction SilentlyContinue)
  foreach ($f in $js) { Write-Host ('   ' + $f.Name) -ForegroundColor DarkGray }

  if ($js.Count -gt 0) {
    $sr = @(Get-ChildItem -LiteralPath $bnd -Filter *.js -Recurse | Select-String -Pattern 'service_role|SUPABASE_SERVICE_ROLE' -SimpleMatch -List)
    if ($sr.Count -eq 0) { Ok 'nenhuma service_role no bundle' } else { Falhou 'service_role presente no bundle' }

    $gp = @(Get-ChildItem -LiteralPath $bnd -Filter *.js -Recurse | Select-String -Pattern 'getPublicUrl' -SimpleMatch -List)
    if ($gp.Count -eq 0) { Ok 'nenhum getPublicUrl no bundle' } else { Falhou 'getPublicUrl presente no bundle' }

    $pa = @(Get-ChildItem -LiteralPath $bnd -Filter *.js -Recurse | Select-String -Pattern 'conteudo pausado' -SimpleMatch -List)
    if ($pa.Count -eq 0) { Ok 'frase de pausa ausente' } else { Falhou 'frase de pausa presente' }
  }
}

T '4. PUBLICACAO'

if (-not $buildOk) { Falhou 'cancelada por falha no build'; exit 1 }

$gi = Join-Path $raiz '.gitignore'
$atual = ''
if (Test-Path -LiteralPath $gi) { $atual = [System.IO.File]::ReadAllText($gi) }
$add = @()
foreach ($a in @('auditoria-libido.txt','auditoria.sql','auditar.sh','auditar.ps1','verificar.ps1','subir.ps1','push-ordem*.ps1','ler-push.ps1')) {
  if ($atual -notmatch [regex]::Escape($a)) { $add += $a }
}
if ($add.Count -gt 0) {
  $novo = $atual
  if ($novo.Length -gt 0 -and -not $novo.EndsWith("`n")) { $novo += "`n" }
  [System.IO.File]::WriteAllText($gi, ($novo + ($add -join "`n") + "`n"), $utf8)
  Ok ('gitignore: ' + ($add -join ', '))
}

Push-Location $raiz
& git add -A
& git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  & git commit -m 'chore: relatorio de auditoria e artefatos locais'
  if ($LASTEXITCODE -eq 0) { Ok 'commit criado' } else { Info 'commit nao criado' }
} else {
  Info 'nada novo para commitar'
}
& git push
if ($LASTEXITCODE -eq 0) { Ok 'enviado' } else { Info 'push nao necessario ou recusado' }
Write-Host ('  HEAD: ' + (& git log -1 --oneline)) -ForegroundColor Cyan
Pop-Location