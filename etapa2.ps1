param([string]$Raiz='C:\libidojan2026')
$ErrorActionPreference='Continue'
Push-Location $Raiz

function H($t){Write-Host '';Write-Host ('=== '+$t+' ===') -ForegroundColor Cyan}
function OK($t){Write-Host ('  OK     '+$t) -ForegroundColor Green}
function ER($t){Write-Host ('  FALHA  '+$t) -ForegroundColor Red}
function AV($t){Write-Host ('  AVISO  '+$t) -ForegroundColor Yellow}
function IN($t){Write-Host ('         '+$t) -ForegroundColor DarkGray}

$cfg=@{}
foreach($f in @('.env','backend\.env')){
  $p=Join-Path $Raiz $f
  if(-not(Test-Path -LiteralPath $p)){continue}
  foreach($ln in (Get-Content -LiteralPath $p -ErrorAction SilentlyContinue)){
    if($ln -match '^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$'){
      $k=$Matches[1];$v=$Matches[2].Trim().Trim('"').Trim("'")
      if(-not $cfg.ContainsKey($k)){$cfg[$k]=$v}
    }
  }
}
$base=$cfg['SUPABASE_URL']; if(-not $base){$base=$cfg['VITE_SUPABASE_URL']}
if($base){$base=$base.TrimEnd('/')}
$skey=$cfg['SUPABASE_SERVICE_ROLE_KEY']; if(-not $skey){$skey=$cfg['SERVICE_ROLE_KEY']}
$pat=$cfg['SUPABASE_ACCESS_TOKEN']

H '1. AS COLUNAS EXISTEM NO BANCO?'
if($base -and $skey){
  $u=$base+'/rest/v1/users?select=last_lat,last_lng,last_location_at&limit=1'
  try{
    $r=Invoke-WebRequest -Uri $u -Headers @{apikey=$skey;Authorization=('Bearer '+$skey)} -UseBasicParsing -TimeoutSec 30
    OK 'colunas last_lat / last_lng / last_location_at existem'
    IN 'bug 2 tem onde gravar historico'
  }catch{
    $c=0; if($_.Exception.Response){$c=[int]$_.Exception.Response.StatusCode}
    $body=''
    if($_.ErrorDetails.Message){$body=$_.ErrorDetails.Message}
    if($c -eq 400 -and ($body -match 'does not exist|42703')){
      ER 'COLUNAS NAO EXISTEM - o SQL nao foi aplicado'
      IN 'sem elas, o bug 2 (offline na ultima posicao) permanece'
      IN 'arquivo pronto: CORRIGIR_CAUSA_RAIZ.sql'
    }else{
      AV ('HTTP '+$c+' - nao foi possivel concluir')
      if($body){IN $body}
    }
  }
}else{
  AV 'sem URL ou service_role no .env'
}

H '2. O QUE MUDOU NO CODIGO'
$st=@(git status --porcelain 2>$null)
if($st.Count -eq 0){IN 'nenhuma alteracao pendente'}
else{foreach($s in $st){IN $s}}

H '3. BUG 5 (ANTI-PRINT) - App.tsx'
$app=Join-Path $Raiz 'src\App.tsx'
if(Test-Path -LiteralPath $app){
  $ls=[IO.File]::ReadAllLines($app)
  IN ('App.tsx: '+$ls.Count+' linhas')
  $alvos=@()
  for($i=0;$i -lt $ls.Count;$i++){
    if($ls[$i] -match 'visibilitychange|blurTimeout|user-select|antiPrint|PAUSA-REMOVIDA|PrintScreen|oncontextmenu'){
      $alvos+=$i
    }
  }
  if($alvos.Count -eq 0){AV 'nenhuma referencia anti-print encontrada'}
  else{
    $de=[Math]::Max(0,($alvos[0]-8))
    $ate=[Math]::Min(($ls.Count-1),($alvos[0]+120))
    Write-Host ''
    Write-Host ('##### src\App.tsx  linhas '+($de+1)+'-'+($ate+1)) -ForegroundColor Magenta
    for($i=$de;$i -le $ate;$i++){
      Write-Host ('{0,5}: {1}' -f ($i+1),$ls[$i])
    }
  }
}else{AV 'App.tsx ausente'}

H '4. BUG 6 (DUPLO TOQUE) - onde a foto e postada'
$src=Join-Path $Raiz 'src'
$cand=@()
foreach($f in (Get-ChildItem -LiteralPath $src -Recurse -File -Include *.tsx,*.ts -ErrorAction SilentlyContinue)){
  $n=$f.Name
  if($n -match '\.(bak|bkp|old|orig)'){continue}
  $t=[IO.File]::ReadAllText($f.FullName)
  if($t -match 'uploadPhoto|\.storage\s*\.\s*from'){
    $cand+=$f
  }
}
if($cand.Count -eq 0){AV 'nenhum arquivo com upload de foto'}
foreach($f in $cand){
  $ls=[IO.File]::ReadAllLines($f.FullName)
  $hits=@()
  for($i=0;$i -lt $ls.Count;$i++){
    if($ls[$i] -match 'uploadPhoto\('){$hits+=$i}
  }
  if($hits.Count -eq 0){continue}
  $rel=$f.FullName.Replace($Raiz,'').TrimStart('\')
  foreach($h in $hits){
    $de=[Math]::Max(0,($h-50))
    $ate=[Math]::Min(($ls.Count-1),($h+70))
    Write-Host ''
    Write-Host ('##### '+$rel+'  linhas '+($de+1)+'-'+($ate+1)+'  (upload na linha '+($h+1)+')') -ForegroundColor Magenta
    for($i=$de;$i -le $ate;$i++){
      Write-Host ('{0,5}: {1}' -f ($i+1),$ls[$i])
    }
  }
}

H '5. RESUMO'
IN ('arquivos com upload: '+$cand.Count)
IN ('sql pendente      : '+$(if(Test-Path -LiteralPath (Join-Path $Raiz 'CORRIGIR_CAUSA_RAIZ.sql')){'CORRIGIR_CAUSA_RAIZ.sql'}else{'ausente'}))
Write-Host ''
Write-Host '  Copie as secoes 3 e 4 e cole no chat.' -ForegroundColor Yellow
Write-Host '  Sao os dois bugs que faltam fechar.' -ForegroundColor Yellow

Pop-Location