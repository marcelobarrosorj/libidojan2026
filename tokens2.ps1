$raiz = 'C:\libidojan2026'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$rel  = Join-Path $raiz 'design-tokens.txt'

$excl = '\\node_modules\\|\\dist\\|\\\.git\\|backup-barra|\\shots\\'
$fontes = @(Get-ChildItem -LiteralPath $raiz -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch $excl -and $_.Extension -in @('.ts','.tsx','.css','.js','.json') })

$L = New-Object System.Collections.Generic.List[string]
$L.Add('TOKENS DE DESIGN - LIBIDO')
$L.Add('Gerado: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
$L.Add('Arquivos: ' + $fontes.Count)
$L.Add('')

$tot = @{}
$porArq = @{}

foreach ($f in $fontes) {
  $nome = $f.FullName.Substring($raiz.Length + 1)
  $ms = @(Select-String -LiteralPath $f.FullName -Pattern '#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b' -AllMatches -ErrorAction SilentlyContinue)
  foreach ($m in $ms) {
    foreach ($x in $m.Matches) {
      $k = $x.Value.ToLower()
      if ($tot.ContainsKey($k)) { $tot[$k]++ } else { $tot[$k] = 1 }
      if (-not $porArq.ContainsKey($k)) { $porArq[$k] = @{} }
      if ($porArq[$k].ContainsKey($nome)) { $porArq[$k][$nome]++ } else { $porArq[$k][$nome] = 1 }
    }
  }
}

$L.Add('--- CORES: ONDE APARECEM ---')
if ($tot.Count -eq 0) {
  $L.Add('  nenhuma cor hex literal')
} else {
  foreach ($e in ($tot.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 25)) {
    $L.Add('')
    $L.Add('  ' + $e.Key + '   (' + $e.Value + 'x)')
    foreach ($a in ($porArq[$e.Key].GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 6)) {
      $L.Add('     ' + $a.Value.ToString().PadLeft(3) + 'x  ' + $a.Key)
    }
  }
}

$grupos = @(
  @{ N='RAIOS';            R='rounded(-[a-z0-9\[\]]+)?' },
  @{ N='TAMANHO DE FONTE'; R='text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|\[[^\]]+\])' },
  @{ N='PESO DE FONTE';    R='font-(thin|light|normal|medium|semibold|bold|extrabold|black)' },
  @{ N='ESPACAMENTO';      R='(gap|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|space-[xy])-(\d|\[[^\]]+\])' },
  @{ N='CORES TAILWIND';   R='(bg|text|border|ring|from|to|via)-(zinc|neutral|stone|gray|slate|purple|pink|fuchsia|violet|orange|amber|red|green|emerald|blue|sky)-\d{2,3}' }
)

foreach ($g in $grupos) {
  $cnt = @{}
  foreach ($f in $fontes) {
    $ms = @(Select-String -LiteralPath $f.FullName -Pattern $g.R -AllMatches -ErrorAction SilentlyContinue)
    foreach ($m in $ms) {
      foreach ($x in $m.Matches) {
        $k = $x.Value
        if ($cnt.ContainsKey($k)) { $cnt[$k]++ } else { $cnt[$k] = 1 }
      }
    }
  }
  $L.Add('')
  $L.Add('--- ' + $g.N + ' ---')
  if ($cnt.Count -eq 0) {
    $L.Add('  nenhum')
  } else {
    foreach ($e in ($cnt.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 20)) {
      $L.Add('  ' + $e.Key.PadRight(30) + ' ' + $e.Value + 'x')
    }
  }
}

$L.Add('')
$L.Add('--- VARIAVEIS CSS ---')
$achouVar = $false
foreach ($css in @('src\index.css','src\App.css','src\styles.css')) {
  $p = Join-Path $raiz $css
  if (Test-Path -LiteralPath $p) {
    $achouVar = $true
    $L.Add('  [' + $css + ']')
    foreach ($v in @(Select-String -LiteralPath $p -Pattern '^\s*--[a-zA-Z0-9-]+\s*:' -ErrorAction SilentlyContinue)) {
      $L.Add('    ' + $v.Line.Trim())
    }
  }
}
if (-not $achouVar) { $L.Add('  nenhum css base encontrado') }

$L.Add('')
$L.Add('--- TAILWIND CONFIG ---')
$achouTw = $false
foreach ($tw in @('tailwind.config.js','tailwind.config.ts','tailwind.config.cjs')) {
  $p = Join-Path $raiz $tw
  if (Test-Path -LiteralPath $p) {
    $achouTw = $true
    $L.Add('  [' + $tw + ']')
    foreach ($l in (Get-Content -LiteralPath $p)) { $L.Add('    ' + $l) }
  }
}
if (-not $achouTw) { $L.Add('  nenhum tailwind.config (provavel Tailwind v4 via CSS)') }

$L.Add('')
$L.Add('--- FONT-FAMILY ---')
$ff = @()
foreach ($alvo in @((Join-Path $raiz 'src\index.css'), (Join-Path $raiz 'index.html'))) {
  if (Test-Path -LiteralPath $alvo) {
    $ff += @(Select-String -LiteralPath $alvo -Pattern 'font-family' -ErrorAction SilentlyContinue)
  }
}
if ($ff.Count -eq 0) {
  $L.Add('  nenhuma font-family explicita')
} else {
  foreach ($x in $ff) { $L.Add('  ' + $x.Line.Trim()) }
}

$L.Add('')
$L.Add('--- ARQUIVOS QUE MAIS CONCENTRAM COR ---')
$ranking = @()
foreach ($f in $fontes) {
  $soma = 0
  $q = @(Select-String -LiteralPath $f.FullName -Pattern '#[0-9a-fA-F]{6}\b' -AllMatches -ErrorAction SilentlyContinue)
  foreach ($m in $q) { $soma += $m.Matches.Count }
  if ($soma -gt 0) {
    $ranking += [pscustomobject]@{ Arq = $f.FullName.Substring($raiz.Length + 1); Qtd = $soma }
  }
}
foreach ($r in ($ranking | Sort-Object Qtd -Descending | Select-Object -First 12)) {
  $L.Add('  ' + $r.Qtd.ToString().PadLeft(4) + '  ' + $r.Arq)
}

[System.IO.File]::WriteAllText($rel, ($L -join "`r`n"), $utf8)

Write-Host ''
Write-Host ('  relatorio : ' + $rel) -ForegroundColor Green
Write-Host ('  cores     : ' + $tot.Count + ' distintas') -ForegroundColor Cyan
Write-Host ('  arquivos  : ' + $fontes.Count) -ForegroundColor Cyan
Write-Host ''
Write-Host '  Quem concentra cor:' -ForegroundColor Yellow
foreach ($r in ($ranking | Sort-Object Qtd -Descending | Select-Object -First 8)) {
  Write-Host ('   ' + $r.Qtd.ToString().PadLeft(4) + '  ' + $r.Arq) -ForegroundColor DarkGray
}
Write-Host ''
Write-Host '  Anexe: shots\home-mobile.png, shots\home-desktop.png, design-tokens.txt' -ForegroundColor Yellow