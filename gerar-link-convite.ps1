# LIBIDO - GERADOR DE CONVITES PREMIUM (uso unico, so o dono tem)
# Executar com: powershell -File C:\libidojan2026\gerar-link-convite.ps1
$envVars = @{}
Get-Content C:\libidojan2026\.env | ForEach-Object { if ($_ -match '^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$') { $envVars[$Matches[1]] = $Matches[2].Trim('"').Trim("'") } }
$url = $envVars['SUPABASE_URL']; $key = $envVars['SUPABASE_SERVICE_ROLE_KEY']
$hdr = @{ apikey = $key; Authorization = "Bearer $key" }

Write-Host '===== GERADOR DE CONVITES PREMIUM (LIB-PREM-) =====' -ForegroundColor Cyan
Write-Host 'Duracao do premium que o convite entrega:' -ForegroundColor White
Write-Host ' 1) ETERNO   2) 24 horas   3) 7 dias   4) Personalizado'
$op = Read-Host 'Opcao'
$horas = $null
switch ($op) {
  '1' { $horas = $null }
  '2' { $horas = 24 }
  '3' { $horas = 168 }
  '4' { $p = Read-Host 'Duracao (ex: 48 = horas | 30d = dias)'
        if ($p -match '^\s*(\d+)\s*d') { $horas = [int]$Matches[1] * 24 }
        elseif ($p -match '^\s*(\d+)\s*h') { $horas = [int]$Matches[1] }
        else { Write-Host 'Formato invalido' -ForegroundColor Red; exit } }
  default { Write-Host 'Opcao invalida' -ForegroundColor Red; exit }
}
$suf = -join ((1..6) | ForEach-Object { 'ABCDEFGHJKLMNPQRSTUVWXYZ234569'[(Get-Random -Maximum 30)] })
$code = "LIB-PREM-$suf"
$body = @{ code = $code; duration_hours = $horas; max_uses = 1 } | ConvertTo-Json
try {
  Invoke-RestMethod -Method Post -Uri "$url/rest/v1/premium_invite_codes" -Headers $hdr -ContentType 'application/json' -Body $body | Out-Null
  Write-Host ''
  Write-Host '================ CONVITE CRIADO ================' -ForegroundColor Green
  Write-Host "  Link para enviar: https://libidoapp.com.br/invite/$code" -ForegroundColor Yellow
  $dur = if ($horas) { "$horas horas" } else { 'ETERNO' }
  Write-Host "  Duracao: $dur | Uso: UNICO" -ForegroundColor Green
  Write-Host '================================================' -ForegroundColor Green
} catch { Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red }
Read-Host 'Pressione ENTER para fechar'