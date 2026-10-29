$raiz = 'C:\libidojan2026'

function T($t) { Write-Host ''; Write-Host ('=== ' + $t + ' ===') -ForegroundColor Cyan }
function Ok($t) { Write-Host ('  OK      ' + $t) -ForegroundColor Green }
function Aviso($t) { Write-Host ('  AVISO   ' + $t) -ForegroundColor Yellow }
function Falhou($t) { Write-Host ('  FALHOU  ' + $t) -ForegroundColor Red }

function Formato([string]$v) {
  if (-not $v) { return 'vazio' }
  if ($v -like 'sb_publishable_*') { return 'NOVO publishable' }
  if ($v -like 'sb_secret_*')      { return 'NOVO secret' }
  if ($v -match '^eyJ')            { return 'JWT antigo' }
  return 'desconhecido'
}

function Papel([string]$v) {
  if (-not $v) { return '?' }
  if ($v -match '^eyJ') {
    try {
      $p = $v.Split('.')[1]
      $m = $p.Length % 4
      if ($m -gt 0) { $p = $p + ('=' * (4 - $m)) }
      $j = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($p.Replace('-','+').Replace('_','/')))
      if ($j -match '"role"\s*:\s*"([a-z_]+)"') { return $Matches[1] }
    } catch { }
  }
  if ($v -like 'sb_publishable_*') { return 'anon' }
  if ($v -like 'sb_secret_*')      { return 'service_role' }
  return '?'
}

# ---------- 1. ARQUIVOS .env ----------
T '1. ARQUIVOS .env ENCONTRADOS'

$envFiles = @(Get-ChildItem -LiteralPath $raiz -Recurse -File -Force -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -like '.env*' -and $_.FullName -notmatch '\\node_modules\\|\\dist\\' })

if ($envFiles.Count -eq 0) {
  Falhou 'nenhum .env encontrado fora de node_modules'
} else {
  foreach ($f in $envFiles) {
    Write-Host ('  ' + $f.FullName.Substring($raiz.Length + 1)) -ForegroundColor White
  }
}

# ---------- 2. NOMES E FORMATO ----------
T '2. VARIAVEIS (somente nomes e formato)'

$cfg = @{}
foreach ($f in $envFiles) {
  foreach ($l in (Get-Content -LiteralPath $f.FullName -ErrorAction SilentlyContinue)) {
    if ($l -match '^\s*([A-Za-z0-9_]+)\s*=\s*(.+?)\s*$') {
      $k = $Matches[1]
      $v = $Matches[2].Trim().Trim('"').Trim("'")
      if (-not $cfg.ContainsKey($k)) { $cfg[$k] = $v }
    }
  }
}

if ($cfg.Count -eq 0) {
  Falhou 'nenhuma variavel lida'
} else {
  foreach ($k in ($cfg.Keys | Sort-Object)) {
    $v = $cfg[$k]
    if ($k -match 'SUPABASE|KEY|ANON|PUBLISH|SECRET|SERVICE') {
      $fmt = Formato $v
      $rol = Papel $v
      $cor = 'Gray'
      if ($rol -eq 'anon') { $cor = 'Cyan' }
      if ($rol -eq 'service_role') { $cor = 'DarkYellow' }
      Write-Host ('   ' + $k.PadRight(38) + $fmt.PadRight(18) + 'papel=' + $rol) -ForegroundColor $cor
    } else {
      Write-Host ('   ' + $k.PadRight(38) + '(nao relacionada a chave)') -ForegroundColor DarkGray
    }
  }
}

# ---------- 3. BUNDLE E INDEX ----------
T '3. BUNDLE E index.html'

$jsFiles = @(Get-ChildItem -LiteralPath $raiz -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $_.Extension -in @('.js','.html') -and $_.FullName -notmatch '\\node_modules\\' })

Write-Host ('  ' + $jsFiles.Count + ' arquivo(s) .js/.html varrido(s)') -ForegroundColor DarkGray

$achadoBundle = $null
$formatoBundle = 'nenhum'

foreach ($f in $jsFiles) {
  $txt = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)

  if ($txt -match 'sb_publishable_[A-Za-z0-9_-]{8,}') {
    $achadoBundle = $Matches[0]
    $formatoBundle = 'NOVO publishable'
    Write-Host ('   ' + $f.FullName.Substring($raiz.Length + 1) + ' -> sb_publishable_') -ForegroundColor Cyan
    break
  }

  if ($txt -match '"role"\s*:\s*"anon"') {
    $m = [regex]::Match($txt, 'eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}')
    if ($m.Success) {
      $achadoBundle = $m.Value
      $formatoBundle = 'JWT antigo'
      Write-Host ('   ' + $f.FullName.Substring($raiz.Length + 1) + ' -> JWT anon') -ForegroundColor Cyan
      break
    }
  }
}

if ($achadoBundle) {
  Ok ('anon key encontrada no bundle: ' + $formatoBundle + ' (' + $achadoBundle.Length + ' chars)')
} else {
  Aviso 'anon key ausente do bundle local'
  Write-Host '  Isso indica dist/ desatualizado ou config vinda do servidor.' -ForegroundColor DarkGray
}

# ---------- 4. DECISAO ----------
T '4. DECISAO'

$akey = $null
foreach ($k in $cfg.Keys) {
  if ((Papel $cfg[$k]) -eq 'anon') { $akey = $cfg[$k]; Ok ('anon de ' + $k); break }
}
if (-not $akey -and $achadoBundle) { $akey = $achadoBundle; Ok 'anon do bundle' }

$surl = $cfg['SUPABASE_URL']; if (-not $surl) { $surl = $cfg['VITE_SUPABASE_URL'] }
$skey = $cfg['SUPABASE_SERVICE_ROLE_KEY']
if (-not $skey) { $skey = $cfg['SERVICE_ROLE_KEY'] }

if (-not $surl) {
  Falhou 'SUPABASE_URL ausente - abortando'
  return
}

$base = $surl.TrimEnd('/')

if (-not $akey) {
  Falhou 'anon key NAO encontrada em nenhuma fonte'
  Write-Host ''
  Write-Host '  Conclusao: a chave publica nao esta no repositorio.' -ForegroundColor Yellow
  Write-Host '  Ela existe em: Vercel > Settings > Environment Variables.' -ForegroundColor Yellow
  Write-Host ''
  Write-Host '  Para rodar o teste sem ela, use o modo autenticado:' -ForegroundColor Yellow
  Write-Host '    -File verifica-rls.ps1 -TestarAutenticado' -ForegroundColor White
  Write-Host '  (cria e remove contas temporarias, usa so a service_role)' -ForegroundColor DarkGray
  return
}

# ---------- 5. TESTE DE RLS ----------
T '5. RLS COM ANON KEY'

$hA = @{ apikey = $akey; Authorization = ('Bearer ' + $akey) }
$tabelas = @('users','posts','messages','photos','groups','events','reports','blocks','follows','payment_transactions','push_subscriptions')
$expostas = @()

foreach ($tb in $tabelas) {
  try {
    $r = Invoke-WebRequest -Uri ($base + '/rest/v1/' + $tb + '?select=*&limit=3') -Headers $hA -UseBasicParsing -TimeoutSec 30
    $j = $r.Content | ConvertFrom-Json
    $n = 0
    if ($null -ne $j) {
      if ($j -is [System.Array]) { $n = $j.Count }
      else {
        $p = @($j.PSObject.Properties.Name)
        if ($p -contains 'id' -or $p -contains 'user_id') { $n = 1 }
      }
    }
    if ($n -gt 0) {
      Falhou ($tb.PadRight(22) + 'EXPOSTA (' + $n + ' linha(s))')
      $expostas += $tb
    } else {
      Ok ($tb.PadRight(22) + 'protegida')
    }
  } catch {
    $sc = 0
    if ($_.Exception.Response) { $sc = [int]$_.Exception.Response.StatusCode }
    if ($sc -eq 404 -or $sc -eq 406) {
      Write-Host ('  ' + $tb.PadRight(22) + 'nao existe') -ForegroundColor DarkGray
    } elseif ($sc -eq 401 -or $sc -eq 403) {
      Ok ($tb.PadRight(22) + 'bloqueada (' + $sc + ')')
    } else {
      Write-Host ('  ' + $tb.PadRight(22) + 'HTTP ' + $sc) -ForegroundColor DarkYellow
    }
  }
}

T '6. RESUMO'
if ($expostas.Count -gt 0) {
  Falhou ($expostas.Count.ToString() + ' tabela(s) legivel(is) sem login: ' + ($expostas -join ', '))
} else {
  Ok 'nenhuma tabela respondeu a leitura anonima'
}