[CmdletBinding()]
param(
  [string[]]$Dominios = @('https://www.libidoapp.com.br','https://libido2026.vercel.app'),
  [string]$Marcador = 'listar_conversas'
)
$ErrorActionPreference='Continue'
function OK($m){ Write-Host "  OK       $m" -ForegroundColor Green }
function NG($m){ Write-Host "  FALHA    $m" -ForegroundColor Red; $script:Err++ }
function IN($m){ Write-Host "  INFO     $m" -ForegroundColor DarkGray }
$script:Err = 0

function Get-Ip {
  param([string]$Host_)
  return @(Resolve-DnsName $Host_ -Server 1.1.1.1 -Type A -ErrorAction SilentlyContinue |
           Where-Object { $_.IPAddress } | Select-Object -First 1).IPAddress
}

function Fetch {
  param([string]$Url)
  $h = ([uri]$Url).Host
  $ip = Get-Ip $h
  if(-not $ip){ return @{ Ok=$false; Code='DNS'; Size=0; Text='' } }
  $tmp = Join-Path $env:TEMP ("pc-" + [guid]::NewGuid().ToString('N') + ".bin")
  $c = & curl.exe -sSL --compressed --max-time 60 --resolve "${h}:443:${ip}" -o $tmp -w "%{http_code}" $Url 2>$null
  $code = (@($c) -join '').Trim()
  $sz = if(Test-Path $tmp){ (Get-Item $tmp).Length } else { 0 }
  $txt = if($sz -gt 0 -and $sz -lt 5MB){ Get-Content $tmp -Raw -ErrorAction SilentlyContinue } else { '' }
  Remove-Item $tmp -Force -ErrorAction SilentlyContinue
  return @{ Ok=($code -eq '200' -and $sz -gt 0); Code=$code; Size=$sz; Text=$txt }
}

foreach($d in $Dominios){
  Write-Host ''
  Write-Host "=== $d ===" -ForegroundColor Cyan
  $v = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  $r = Fetch "$d/?v=$v"
  if(-not $r.Ok){ NG "HTML HTTP $($r.Code)"; continue }
  OK "HTML 200 ($($r.Size) bytes)"

  $assets = @([regex]::Matches($r.Text,'(?:src|href)="([^"]+\.(?:js|css)[^"]*)"') |
              ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique)
  IN "$($assets.Count) asset(s)"

  $main = $null
  foreach($a in $assets){
    $url = if($a -match '^https?://'){ $a } else { $d.TrimEnd('/') + '/' + $a.TrimStart('/') }
    $b = Fetch $url
    $nome = ($url -split '/')[-1]
    if(-not $b.Ok){ NG "$nome HTTP $($b.Code)"; continue }
    if($nome -match '^index-.*\.js$'){ $main = @{ Nome=$nome; Size=$b.Size; Text=$b.Text } }
    IN "$nome 200 ($($b.Size) bytes)"
  }

  if(-not $main){ NG 'bundle principal nao encontrado'; continue }
  if($main.Text -match 'useCallback is not defined'){ NG "$($main.Nome) contem erro de hook" }
  elseif($main.Text -match [regex]::Escape($Marcador)){ OK "$($main.Nome) contem '$Marcador'" }
  else { NG "$($main.Nome) sem '$Marcador'" }
}

Write-Host ''
if($script:Err -eq 0){ OK 'producao saudavel'; exit 0 } else { NG "$($script:Err) falha(s)"; exit 1 }