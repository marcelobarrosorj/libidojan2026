# ============================================================
#  LIBIDO - CENTRAL DE CONVITES PREMIUM (ferramenta do dono)
#  Executar com: powershell -File C:\libidojan2026\convites-premium.ps1
# ============================================================
$envVars = @{}
Get-Content C:\libidojan2026\.env | ForEach-Object { if ($_ -match '^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$') { $envVars[$Matches[1]] = $Matches[2].Trim('"').Trim("'") } }
$url = $envVars['SUPABASE_URL']
$key = $envVars['SUPABASE_SERVICE_ROLE_KEY']
$hdr = @{ apikey = $key; Authorization = "Bearer $key" }

function Obter-Usuario {
  param([string]$email)
  $enc = [uri]::EscapeDataString($email)
  try {
    return Invoke-RestMethod -Uri "$url/rest/v1/users?select=user_id,nickname,email,premium,plan,premium_until&email=eq.$enc" -Headers $hdr
  } catch { Write-Host "  Erro: $($_.Exception.Message)" -ForegroundColor Red; return $null }
}

function Conceder {
  param([string]$email, [string]$tipo, [int]$horas)
  $u = Obter-Usuario $email
  if (-not $u -or @($u).Count -eq 0) { Write-Host "  Usuario nao encontrado: $email" -ForegroundColor Red; return }
  $uid = $u[0].user_id
  $until = $null
  if ($horas -gt 0) { $until = (Get-Date).ToUniversalTime().AddHours($horas).ToString('yyyy-MM-ddTHH:mm:ssZ') }
  $enc = [uri]::EscapeDataString($email)
  $body = @{ premium = $true; plan = 'premium'; premium_until = $until } | ConvertTo-Json
  try {
    Invoke-RestMethod -Method Patch -Uri "$url/rest/v1/users?email=eq.$enc" -Headers $hdr -ContentType 'application/json' -Body $body | Out-Null
    $grant = @{ grant_type = $tipo; target_email = $email; target_user_id = $uid }
    if ($horas -gt 0) { $grant.duration_hours = $horas }
    $gj = $grant | ConvertTo-Json
    try { Invoke-RestMethod -Method Post -Uri "$url/rest/v1/premium_grants" -Headers $hdr -ContentType 'application/json' -Body $gj | Out-Null } catch {}
    if ($horas -gt 0) { Write-Host "  OK: $email e PREMIUM por $horas h (ate $until)" -ForegroundColor Green }
    else { Write-Host "  OK: $email e PREMIUM ETERNO" -ForegroundColor Green }
    Write-Host '  A pessoa ve o premium ao reabrir o app' -ForegroundColor DarkGray
  } catch { Write-Host "  Erro ao conceder: $($_.Exception.Message)" -ForegroundColor Red }
}

function Revogar {
  param([string]$email)
  $enc = [uri]::EscapeDataString($email)
  $body = @{ premium = $false; plan = 'free'; premium_until = $null } | ConvertTo-Json
  try {
    Invoke-RestMethod -Method Patch -Uri "$url/rest/v1/users?email=eq.$enc" -Headers $hdr -ContentType 'application/json' -Body $body | Out-Null
    Write-Host "  OK: premium revogado de $email" -ForegroundColor Green
  } catch { Write-Host "  Erro: $($_.Exception.Message)" -ForegroundColor Red }
}

function Listar {
  try {
    $r = Invoke-RestMethod -Uri "$url/rest/v1/users?select=nickname,email,plan,premium_until&premium=eq.true" -Headers $hdr
    Write-Host "  Premium ativos: $(@($r).Count)" -ForegroundColor Cyan
    foreach ($u in $r) {
      $exp = if ($u.premium_until) { "ate $($u.premium_until)" } else { 'ETERNO' }
      Write-Host "    $($u.nickname) | $($u.email) | $exp" -ForegroundColor Green
    }
  } catch { Write-Host "  Erro: $($_.Exception.Message)" -ForegroundColor Red }
}

function Historico {
  try {
    $r = Invoke-RestMethod -Uri "$url/rest/v1/premium_grants?select=grant_type,duration_hours,target_email,created_at&order=created_at.desc&limit=20" -Headers $hdr
    Write-Host "  Ultimos convites: $(@($r).Count)" -ForegroundColor Cyan
    foreach ($g in $r) {
      $d = if ($g.duration_hours) { "$($g.duration_hours) h" } else { 'eterno' }
      Write-Host "    $($g.created_at) | $($g.target_email) | $($g.grant_type) ($d)" -ForegroundColor Green
    }
  } catch { Write-Host "  Erro: $($_.Exception.Message)" -ForegroundColor Red }
}

while ($true) {
  Write-Host ''
  Write-Host '================ CENTRAL DE CONVITES PREMIUM ================' -ForegroundColor Cyan
  Write-Host ' 1) Convite PREMIUM ETERNO (nunca expira)'
  Write-Host ' 2) Convite PREMIUM 24 HORAS'
  Write-Host ' 3) Convite PREMIUM 7 DIAS'
  Write-Host ' 4) Convite PRAZO PERSONALIZADO (horas ou dias)'
  Write-Host ' 5) Listar premium ativos'
  Write-Host ' 6) Historico de convites'
  Write-Host ' 7) REVOGAR premium de alguem'
  Write-Host ' 0) Sair'
  $op = Read-Host 'Escolha uma opcao'
  switch ($op) {
    '1' { $e = Read-Host 'E-mail da conta'; Conceder $e 'eterno' 0 }
    '2' { $e = Read-Host 'E-mail da conta'; Conceder $e '24h' 24 }
    '3' { $e = Read-Host 'E-mail da conta'; Conceder $e '7d' 168 }
    '4' { $e = Read-Host 'E-mail da conta'
          $p = Read-Host 'Duracao (ex: 48 = horas | 30d = dias)'
          if ($p -match '^\s*(\d+)\s*d') { Conceder $e "custom-$($Matches[1])d" ([int]$Matches[1] * 24) }
          elseif ($p -match '^\s*(\d+)\s*h') { Conceder $e 'custom-h' ([int]$Matches[1]) }
          else { Write-Host '  Formato nao reconhecido (use 48 ou 30d)' -ForegroundColor Red } }
    '5' { Listar }
    '6' { Historico }
    '7' { $e = Read-Host 'E-mail da conta'; Revogar $e }
    '0' { break }
  }
}
Write-Host 'Central fechada. Ate a proxima!' -ForegroundColor Cyan