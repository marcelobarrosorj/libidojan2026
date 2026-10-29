$raiz = 'C:\libidojan2026'
$utf8 = New-Object System.Text.UTF8Encoding($false)

function T($t) { Write-Host ''; Write-Host ('=== ' + $t + ' ===') -ForegroundColor Cyan }
function Ok($t) { Write-Host ('  OK      ' + $t) -ForegroundColor Green }
function Aviso($t) { Write-Host ('  AVISO   ' + $t) -ForegroundColor Yellow }
function Falhou($t) { Write-Host ('  FALHOU  ' + $t) -ForegroundColor Red }

Push-Location $raiz

# ---------- 1. .env NO GIT ----------
T '1. ARQUIVOS .env VERSIONADOS'

$arquivos = @(& git ls-files 2>$null)
Write-Host ('  ' + $arquivos.Count + ' arquivo(s) no indice do git') -ForegroundColor DarkGray

$venv = @($arquivos | Where-Object { $_ -match '(^|/)\.env' })

if ($venv.Count -eq 0) {
  Ok 'nenhum .env versionado - risco controlado'
} else {
  Falhou ($venv.Count.ToString() + ' arquivo(s) .env VERSIONADO(S):')
  foreach ($v in $venv) { Write-Host ('    ' + $v) -ForegroundColor Red }
  Write-Host ''
  Write-Host '  Se contem SUPABASE_SERVICE_ROLE_KEY, a chave esta no historico.' -ForegroundColor Yellow
  Write-Host '  Acao: revogar a chave no Supabase e reescrever o historico.' -ForegroundColor Yellow
}

# historico
T '1b. .env NO HISTORICO'

$hist = @(& git log --all --oneline --name-only --diff-filter=A 2>$null | Where-Object { $_ -match '\.env' })
if ($hist.Count -eq 0) {
  Ok 'nenhum .env adicionado no historico'
} else {
  Falhou ($hist.Count.ToString() + ' entrada(s) no historico - chaves antigas permanecem recuperaveis')
  foreach ($h in @($hist | Select-Object -First 10)) { Write-Host ('    ' + $h) -ForegroundColor DarkGray }
}

# ---------- 2. GITIGNORE ----------
T '2. GITIGNORE'

$gi = Join-Path $raiz '.gitignore'
if (Test-Path -LiteralPath $gi) {
  $linhas = @(Get-Content -LiteralPath $gi -ErrorAction SilentlyContinue)
  $envRules = @($linhas | Where-Object { $_ -match 'env' })
  if ($envRules.Count -eq 0) {
    Falhou 'nenhuma regra de .env no gitignore'
  } else {
    Ok ($envRules.Count.ToString() + ' regra(s):')
    foreach ($r in $envRules) { Write-Host ('    ' + $r) -ForegroundColor DarkGray }
  }

  if (-not ($linhas -match '^\s*\*\.bak')) {
    Aviso 'sem regra para *.bak - os .env.bak-* podem entrar no git'
  }
} else {
  Falhou '.gitignore ausente'
}

# ---------- 3. CHAVES POR ARQUIVO ----------
T '3. CHAVES EM CADA BACKUP (nomes e papel)'

function Formato([string]$v) {
  if (-not $v) { return 'vazio' }
  if ($v -like 'sb_publishable_*') { return 'publishable' }
  if ($v -like 'sb_secret_*')      { return 'secret' }
  if ($v -match '^eyJ')            { return 'JWT' }
  return 'outro'
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
  if ($v -like 'sb_secret_*') { return 'service_role' }
  if ($v -like 'sb_publishable_*') { return 'anon' }
  return '?'
}

$envFiles = @(Get-ChildItem -LiteralPath $raiz -Recurse -File -Force -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -like '.env*' -and $_.FullName -notmatch '\\node_modules\\|\\dist\\' })

foreach ($f in $envFiles) {
  $nome = $f.FullName.Substring($raiz.Length + 1)
  $chaves = @()
  $temServico = $false
  $temPagBank = $false
  $temDemo = $false

  foreach ($l in (Get-Content -LiteralPath $f.FullName -ErrorAction SilentlyContinue)) {
    if ($l -match '^\s*([A-Za-z0-9_]+)\s*=\s*(.+?)\s*$') {
      $k = $Matches[1]; $v = $Matches[2].Trim().Trim('"').Trim("'")
      if ($k -match 'KEY|SECRET|TOKEN') {
        $rol = Papel $v
        $chaves += ($k + '=' + (Formato $v) + '/' + $rol)
        if ($rol -eq 'service_role') { $temServico = $true }
      }
      if ($k -match 'PAGBANK') { $temPagBank = $true }
      if ($k -match 'DEMO') { $temDemo = $true }
    }
  }

  $marcas = @()
  if ($temServico) { $marcas += 'SERVICE_ROLE' }
  if ($temPagBank) { $marcas += 'PagBank' }
  if ($temDemo) { $marcas += 'DEMO' }

  $cor = if ($temServico) { 'Red' } else { 'DarkGray' }
  Write-Host ''
  Write-Host ('  ' + $nome) -ForegroundColor White
  Write-Host ('    chaves: ' + $chaves.Count + '  ' + ($marcas -join ', ')) -ForegroundColor $cor
  foreach ($c in $chaves) { Write-Host ('      ' + $c) -ForegroundColor DarkGray }
}

# ---------- 4. USO DE follows ----------
T '4. TABELA follows NO CODIGO'

$src = @(Get-ChildItem -LiteralPath (Join-Path $raiz 'src') -Recurse -File -ErrorAction SilentlyContinue |
         Where-Object { $_.Extension -in @('.ts','.tsx') })
$bak = @(Get-ChildItem -LiteralPath (Join-Path $raiz 'backend') -Recurse -File -ErrorAction SilentlyContinue |
         Where-Object { $_.Extension -in @('.ts','.tsx') })
$todos = $src + $bak

$hitFollows = @($todos | Select-String -Pattern 'from\(["'']follows["'']\)|["'']follows["'']' -ErrorAction SilentlyContinue)

if ($hitFollows.Count -eq 0) {
  Aviso 'follows NAO e usada no codigo - candidata a DROP TABLE'
} else {
  Ok ($hitFollows.Count.ToString() + ' referencia(s):')
  foreach ($h in @($hitFollows | Select-Object -First 8)) {
    Write-Host ('    ' + $h.Filename + ':' + $h.LineNumber + '  ' + $h.Line.Trim()) -ForegroundColor DarkGray
  }
}

# ---------- 5. SQL ----------
T '5. SQL PARA INSPECIONAR follows'

$sql = @(
  '-- Inspecionar follows'
  'select column_name, data_type'
  '  from information_schema.columns'
  ' where table_schema = ''public'' and table_name = ''follows'''
  ' order by ordinal_position;'
  ''
  'select relname, relrowsecurity'
  '  from pg_class c join pg_namespace n on n.oid = c.relnamespace'
  ' where n.nspname = ''public'' and c.relname = ''follows'';'
  ''
  'select policyname, cmd, roles, qual, with_check'
  '  from pg_policies'
  ' where schemaname = ''public'' and tablename = ''follows'';'
  ''
  'select grantee, privilege_type'
  '  from information_schema.role_table_grants'
  ' where table_schema = ''public'' and table_name = ''follows'''
  '   and grantee in (''anon'',''authenticated'');'
  ''
  '-- Se nao houver GRANT para anon e ainda assim ler, o problema e policy.'
  '-- Correcao imediata (descomente):'
  '-- alter table public.follows enable row level security;'
  '-- drop policy if exists follows_anon on public.follows;'
  '-- revoke all on public.follows from anon;'
) -join "`r`n"

$sqlPath = Join-Path $raiz 'INSPECIONAR_FOLLOWS.sql'
[System.IO.File]::WriteAllText($sqlPath, $sql, $utf8)
Ok $sqlPath

Pop-Location

T 'RESUMO'
Write-Host '  Cole a saida acima e o resultado do SQL.' -ForegroundColor Yellow
Write-Host '  O SQL responde se follows se corrige com policy ou com DROP.' -ForegroundColor DarkGray