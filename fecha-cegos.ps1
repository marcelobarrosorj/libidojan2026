$raiz = 'C:\libidojan2026'

function T($t) { Write-Host ''; Write-Host ('=== ' + $t + ' ===') -ForegroundColor Cyan }
function Ok($t) { Write-Host ('  OK      ' + $t) -ForegroundColor Green }
function Aviso($t) { Write-Host ('  AVISO   ' + $t) -ForegroundColor Yellow }
function Falhou($t) { Write-Host ('  FALHOU  ' + $t) -ForegroundColor Red }

# ---------- 1. CREDENCIAIS ----------
T '1. CREDENCIAIS'

$cfg = @{}
$arquivosEnv = @(Get-ChildItem -LiteralPath $raiz -Recurse -File -Filter '.env*' -Force -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch '\\node_modules\\' })

foreach ($e in $arquivosEnv) {
  foreach ($l in (Get-Content -LiteralPath $e.FullName -ErrorAction SilentlyContinue)) {
    if ($l -match '^\s*([A-Za-z0-9_]+)\s*=\s*(.+?)\s*$') {
      $k = $Matches[1]; $v = $Matches[2].Trim().Trim('"').Trim("'")
      if (-not $cfg.ContainsKey($k)) { $cfg[$k] = $v }
    }
  }
}

$surl = $cfg['SUPABASE_URL']; if (-not $surl) { $surl = $cfg['VITE_SUPABASE_URL'] }
$skey = $cfg['SUPABASE_SERVICE_ROLE_KEY']; if (-not $skey) { $skey = $cfg['SERVICE_ROLE_KEY'] }

$akey = $null
foreach ($cand in @('VITE_SUPABASE_ANON_KEY','SUPABASE_ANON_KEY','VITE_SUPABASE_PUBLISHABLE_KEY','SUPABASE_PUBLISHABLE_KEY','VITE_SUPABASE_KEY')) {
  if ($cfg[$cand]) { $akey = $cfg[$cand]; break }
}

if (-not $akey) {
  $bnd = Join-Path $raiz 'dist\assets'
  if (Test-Path -LiteralPath $bnd) {
    $hit = @(Get-ChildItem -LiteralPath $bnd -Filter *.js -ErrorAction SilentlyContinue |
             Select-String -Pattern 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}' -AllMatches |
             Select-Object -First 1)
    if ($hit) {
      $token = [regex]::Match($hit.Line, 'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+').Value
      $payload = $token.Split('.')[1]
      $pad = $payload.Length % 4
      if ($pad -gt 0) { $payload = $payload + ('=' * (4 - $pad)) }
      try {
        $json = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($payload.Replace('-','+').Replace('_','/')))
        if ($json -match '"role"\s*:\s*"anon"') { $akey = $token; Ok 'anon key extraida do bundle dist/' }
      } catch { }
    }
  }
}

if (-not $surl) { Falhou 'SUPABASE_URL nao encontrada'; return }
if (-not $akey) { Aviso 'anon key nao localizada - teste RLS nao pode rodar'; return }
if (-not $skey) { Aviso 'service_role nao encontrada - teste de bucket nao pode rodar' }

$base = $surl.TrimEnd('/')
Ok ('base: ' + $base)
Ok ('anon key: ' + $akey.Substring(0,12) + '... (' + $akey.Length + ' chars)')

# ---------- 2. BUCKET (leitura corrigida) ----------
T '2. BUCKET photos'

if ($skey) {
  try {
    $r = Invoke-WebRequest -Uri ($base + '/storage/v1/bucket') -Headers @{ apikey=$skey; Authorization=('Bearer '+$skey) } -UseBasicParsing -TimeoutSec 60
    $raw = $r.Content | ConvertFrom-Json

    $lista = @()
    if ($null -ne $raw) {
      if ($raw -is [System.Array]) { $lista = $raw }
      else {
        $p = @($raw.PSObject.Properties.Name)
        if ($p -contains 'name' -or $p -contains 'id') { $lista = @($raw) }
        else { foreach ($x in $raw) { $lista += $x } }
      }
    }

    Write-Host ('  ' + $lista.Count + ' bucket(s) encontrado(s)') -ForegroundColor DarkGray
    foreach ($b in $lista) {
      $nome = $b.name
      $pub = $b.public
      $cor = if ($pub) { 'Red' } else { 'Green' }
      $txt = if ($pub) { 'PUBLICO  << leitura sem autenticacao' } else { 'privado' }
      Write-Host ('   ' + $nome.PadRight(22) + $txt) -ForegroundColor $cor
    }

    $ph = @($lista | Where-Object { $_.name -eq 'photos' })
    if ($ph.Count -gt 0) {
      if ($ph[0].public) {
        Falhou 'bucket photos = PUBLICO -> getPublicUrl entrega acesso permanente'
      } else {
        Ok 'bucket photos = privado'
      }
    } else {
      Aviso 'bucket photos nao listado'
    }
  } catch {
    Falhou ('listagem de buckets: ' + $_.Exception.Message)
  }
}

# ---------- 3. RLS COM ANON KEY ----------
T '3. RLS: LEITURA ANONIMA POR TABELA'

$hA = @{ apikey = $akey; Authorization = ('Bearer ' + $akey) }
$tabelas = @('users','posts','messages','photos','gallery','groups','events','reports','blocks','follows','profile_visits','payment_transactions','push_subscriptions','premium')

$expostas = @()

foreach ($tb in $tabelas) {
  try {
    $r = Invoke-WebRequest -Uri ($base + '/rest/v1/' + $tb + '?select=*&limit=3') -Headers $hA -UseBasicParsing -TimeoutSec 30
    $j = $r.Content | ConvertFrom-Json

    $n = 0
    if ($null -ne $j) {
      if ($j -is [System.Array]) { $n = $j.Count }
      else {
        $props = @($j.PSObject.Properties.Name)
        if ($props -contains 'id' -or $props -contains 'user_id') { $n = 1 }
      }
    }

    if ($n -gt 0) {
      Falhou ($tb.PadRight(22) + 'EXPOSTA (' + $n + ' linha(s) com anon key)')
      $expostas += $tb
    } else {
      Ok ($tb.PadRight(22) + 'protegida (0 linhas)')
    }
  } catch {
    $sc = 0
    if ($_.Exception.Response) { $sc = [int]$_.Exception.Response.StatusCode }
    if ($sc -eq 404 -or $sc -eq 406) {
      Write-Host ('  ' + $tb.PadRight(22) + 'nao existe') -ForegroundColor DarkGray
    } elseif ($sc -eq 401 -or $sc -eq 403) {
      Ok ($tb.PadRight(22) + 'bloqueada por RLS (' + $sc + ')')
    } else {
      Write-Host ('  ' + $tb.PadRight(22) + 'HTTP ' + $sc) -ForegroundColor DarkYellow
    }
  }
}

# ---------- 4. STORAGE PUBLICO ----------
T '4. LEITURA PUBLICA DE ARQUIVO'

if ($skey) {
  try {
    $body = @{ prefix = ''; limit = 20; offset = 0 } | ConvertTo-Json -Compress
    $r = Invoke-WebRequest -Uri ($base + '/storage/v1/object/list/photos') -Headers @{ apikey=$skey; Authorization=('Bearer '+$skey); 'Content-Type'='application/json' } -Method Post -Body $body -UseBasicParsing -TimeoutSec 60
    $js = $r.Content | ConvertFrom-Json
    $arqs = @()
    if ($js -is [System.Array]) { $arqs = @($js | Where-Object { $_.id }) }

    if ($arqs.Count -gt 0) {
      Write-Host ('  ' + $arqs.Count + ' pasta(s)/arquivo(s) na raiz do bucket') -ForegroundColor DarkGray
    } else {
      Aviso 'bucket vazio ou sem arquivos na raiz'
    }
  } catch {
    Aviso ('Storage: ' + $_.Exception.Message)
  }
}

# ---------- 5. RESUMO ----------
T '5. RESUMO'

if ($expostas.Count -gt 0) {
  Falhou ($expostas.Count.ToString() + ' tabela(s) legivel(is) por qualquer pessoa: ' + ($expostas -join ', '))
  Write-Host ''
  Write-Host '  Isso e IDOR por design: a anon key esta no bundle publico.' -ForegroundColor Yellow
} else {
  Ok 'nenhuma tabela testada respondeu com dados a leitura anonima'
}

Write-Host ''
Write-Host '  Copie esta saida e anexe junto com o RELATORIO_AUDITORIA.txt' -ForegroundColor Yellow