param([string]$Raiz='C:\libidojan2026',[switch]$SemBuild)
$ErrorActionPreference='Continue'
$utf8=New-Object System.Text.UTF8Encoding($false)
$ok=0;$sk=0;$er=0
function T($t){Write-Host '';Write-Host ('=== '+$t+' ===') -ForegroundColor Cyan}
function OK($t){Write-Host ('  OK     '+$t) -ForegroundColor Green;$script:ok++}
function SK($t){Write-Host ('  PULADO '+$t) -ForegroundColor Yellow;$script:sk++}
function ER($t){Write-Host ('  FALHA  '+$t) -ForegroundColor Red;$script:er++}
function IN($t){Write-Host ('         '+$t) -ForegroundColor DarkGray}
Push-Location $Raiz

T '0. BACKUP'
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$bkp=Join-Path $Raiz ('.backup-fix-'+$stamp)
New-Item -ItemType Directory -Path $bkp -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $Raiz 'src') -Destination $bkp -Recurse -Force -ErrorAction SilentlyContinue
OK ('backup: '+$bkp)

T '1. PATCHES DE CODIGO'
function Rep([string]$rel,[string]$velho,[string]$novo,[string]$rot){
  $p=Join-Path $Raiz $rel
  if(-not(Test-Path -LiteralPath $p)){SK ($rot+' - arquivo ausente');return}
  $t=[IO.File]::ReadAllText($p)
  if($t.Contains($novo)){SK ($rot+' - ja aplicado');return}
  if(-not $t.Contains($velho)){SK ($rot+' - ancora nao encontrada');return}
  [IO.File]::WriteAllText($p,$t.Replace($velho,$novo),$utf8)
  OK $rot
}

Rep 'src\services\users.ts' `
 'Array.isArray(data.photos) ? data.photos : (Array.isArray(data.gallery) ? data.gallery : [])' `
 'Array.isArray(data.photos) && data.photos.length > 0 ? data.photos : (Array.isArray(data.gallery) && data.gallery.length > 0 ? data.gallery : [])' `
 'BUG3 users.ts - galeria preservada'

Rep 'src\services\radarMapa.ts' `
 'Array.isArray(u.photos) ? u.photos : []' `
 'Array.isArray(u.photos) && u.photos.length > 0 ? u.photos : (Array.isArray(u.gallery) ? u.gallery : [])' `
 'BUG3 radarMapa.ts - galeria nao descarta usuario'

Rep 'src\services\radarMapa.ts' `
 'latPin: u.lat != null ? Number(u.lat) : null,' `
 'latPin: u.lat != null ? Number(u.lat) : (u.last_lat != null ? Number(u.last_lat) : null),' `
 'BUG2 radarMapa.ts - latPin com ultima localizacao'

Rep 'src\services\radarMapa.ts' `
 'lonPin: u.lon != null ? Number(u.lon) : null,' `
 'lonPin: u.lon != null ? Number(u.lon) : (u.last_lng != null ? Number(u.last_lng) : null),' `
 'BUG2 radarMapa.ts - lonPin com ultima localizacao'

Rep 'src\services\radarMapa.ts' `
 'if (existente.latPin === null && u.lat != null && u.lon != null) {' `
 'if (existente.latPin === null && (u.lat != null || u.last_lat != null) && (u.lon != null || u.last_lng != null)) {' `
 'BUG2 radarMapa.ts - condicao considera ultima'

Rep 'src\services\radarMapa.ts' `
 'existente.latPin = Number(u.lat);' `
 'existente.latPin = Number(u.lat != null ? u.lat : u.last_lat);' `
 'BUG2 radarMapa.ts - valor do latPin'

Rep 'src\services\radarMapa.ts' `
 'existente.lonPin = Number(u.lon);' `
 'existente.lonPin = Number(u.lon != null ? u.lon : u.last_lng);' `
 'BUG2 radarMapa.ts - valor do lonPin'

Rep 'src\services\radarMapa.ts' `
 'if (p.online && p.latPin !== null && p.lonPin !== null) {' `
 'if (p.latPin !== null && p.lonPin !== null) {' `
 'BUG1 radarMapa.ts - posicao real prevalece'

Rep 'src\services\radarMapa.ts' `
 'return Array.from(mapa.values()).sort((a, b) => {' `
 'return Array.from(mapa.values()).filter((p) => p.latPin !== null && p.lonPin !== null).sort((a, b) => {' `
 'BUG1 radarMapa.ts - remove pino sem coordenada'

Rep 'src\components\RadarMap.tsx' `
 'lat: u?.lat != null ? Number(u.lat) : null,' `
 'lat: u?.lat != null ? Number(u.lat) : (u?.last_lat != null ? Number(u.last_lat) : null),' `
 'BUG2 RadarMap.tsx - lat com ultima localizacao'

Rep 'src\components\RadarMap.tsx' `
 'lon: u?.lon != null ? Number(u.lon) : null' `
 'lon: u?.lon != null ? Number(u.lon) : (u?.last_lng != null ? Number(u.last_lng) : null)' `
 'BUG2 RadarMap.tsx - lon com ultima localizacao'

Rep 'src\components\RadarMap.tsx' `
 'const online = u?.isOnline === true || u?.is_online === true;' `
 'const online = u?.isOnline === true || u?.is_online === true; void online;' `
 'BUG1 RadarMap.tsx - preserva variavel online'

Rep 'src\components\RadarMap.tsx' `
 'if ((d.lat === null || d.lon === null || !online) && meuPonto) {' `
 'if ((d.lat === null || d.lon === null) && meuPonto) {' `
 'BUG1 RadarMap.tsx - offline mantem coordenada real'

# BUG7 - remove URL de banco de imagens usada como fallback
$p=Join-Path $Raiz 'src\components\RadarMap.tsx'
if(Test-Path -LiteralPath $p){
  $t=[IO.File]::ReadAllText($p)
  if($t -match 'images\.unsplash\.com'){
    $t=[regex]::Replace($t,'https://images\.unsplash\.com/photo-1599566150163[^\x27\x22]*','')
    [IO.File]::WriteAllText($p,$t,$utf8)
    OK 'BUG7 RadarMap.tsx - mock unsplash removido'
  } else { SK 'BUG7 ja aplicado' }
}

# BUG4 - falha do chat deixa de ser reportada como enviada
$p=Join-Path $Raiz 'src\services\chat.ts'
if(Test-Path -LiteralPath $p){
  $t=[IO.File]::ReadAllText($p)
  if($t -match "fallback:msg:"){
    $t=[regex]::Replace($t,"id: 'fallback:msg:'\s*\+\s*Date\.now\(\),\s*status: 'sent'","id: 'falha:msg:' + Date.now(), status: 'failed'")
    [IO.File]::WriteAllText($p,$t,$utf8)
    OK 'BUG4 chat.ts - falha visivel'
  } else { SK 'BUG4 ja aplicado' }
}

T '2. SQL'
$cfg=@{}
foreach($f in @('.env','backend\.env')){
  $pp=Join-Path $Raiz $f
  if(-not(Test-Path -LiteralPath $pp)){continue}
  foreach($ln in (Get-Content -LiteralPath $pp -ErrorAction SilentlyContinue)){
    if($ln -match '^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$'){
      $k=$Matches[1];$v=$Matches[2].Trim().Trim('"').Trim("'")
      if(-not $cfg.ContainsKey($k)){$cfg[$k]=$v}
    }
  }
}
$base=$cfg['SUPABASE_URL']; if(-not $base){$base=$cfg['VITE_SUPABASE_URL']}
if($base){$base=$base.TrimEnd('/')}
$pat=$cfg['SUPABASE_ACCESS_TOKEN']
$ref=''
if($base -match 'https://([a-z0-9]+)\.supabase\.co'){$ref=$Matches[1]}

$sql=@()
$sql+='-- LIBIDO - correcoes de causa raiz'
$sql+='alter table public.users add column if not exists last_location_at timestamptz;'
$sql+='alter table public.users add column if not exists last_lat double precision;'
$sql+='alter table public.users add column if not exists last_lng double precision;'
$sql+='update public.users set last_lat = lat, last_lng = lon, last_location_at = now() where last_lat is null and lat is not null and lon is not null;'
$sql+='create or replace function public.salvar_ultima_localizacao() returns trigger language plpgsql as $fn$ begin if new.lat is not null and new.lon is not null then new.last_lat := new.lat; new.last_lng := new.lon; new.last_location_at := now(); end if; return new; end; $fn$;'
$sql+='drop trigger if exists trg_ultima_localizacao on public.users;'
$sql+='create trigger trg_ultima_localizacao before update of lat, lon on public.users for each row execute function public.salvar_ultima_localizacao();'
$sql+='select column_name as coluna, data_type as tipo from information_schema.columns where table_schema = ''public'' and table_name = ''users'' order by ordinal_position;'
$sql+='select policyname, cmd, roles::text as papeis, qual, with_check from pg_policies where schemaname = ''public'' and tablename = ''messages'' order by cmd, policyname;'

$sqlPath=Join-Path $Raiz 'CORRIGIR_CAUSA_RAIZ.sql'
[IO.File]::WriteAllText($sqlPath,($sql -join "`r`n"),$utf8)
OK ('SQL gerado: '+$sqlPath)

if($pat -and $ref){
  $uri='https://api.supabase.com/v1/projects/'+$ref+'/database/query'
  $hh=@{Authorization=('Bearer '+$pat);'Content-Type'='application/json'}
  $bd=@{query=($sql -join "`n")}|ConvertTo-Json -Compress
  try{
    $r=Invoke-RestMethod -Uri $uri -Method Post -Headers $hh -Body $bd -TimeoutSec 180
    OK 'SQL aplicado'
    if($r){
      IN 'diagnostico:'
      foreach($x in @($r)){ IN ('  '+($x | ConvertTo-Json -Compress -Depth 3)) }
    }
  }catch{
    ER ('SQL nao aplicado: '+$_.Exception.Message)
    if($_.ErrorDetails.Message){IN $_.ErrorDetails.Message}
  }
}else{
  SK 'sem PAT - aplique CORRIGIR_CAUSA_RAIZ.sql manualmente'
}

T '3. BUILD'
if($SemBuild){SK 'build pulado'}
else{
  $out=& npm run build 2>&1
  $cod=$LASTEXITCODE
  $out|Select-Object -Last 5|ForEach-Object{IN $_}
  if($cod -eq 0){OK 'build OK'}
  else{
    ER ('build falhou ('+$cod+') - revertendo')
    foreach($rel in @('src\services\users.ts','src\services\radarMapa.ts','src\components\RadarMap.tsx','src\services\chat.ts')){
      $o=Join-Path $bkp $rel
      $d=Join-Path $Raiz $rel
      if(Test-Path -LiteralPath $o){Copy-Item -LiteralPath $o -Destination $d -Force -ErrorAction SilentlyContinue}
    }
    SK 'arquivos restaurados'
    Pop-Location
    exit 1
  }
}

T 'VEREDITO'
Write-Host ('  aplicados: '+$ok) -ForegroundColor Green
Write-Host ('  pulados  : '+$sk) -ForegroundColor Yellow
Write-Host ('  falhas   : '+$er) -ForegroundColor Red
IN ('backup: '+$bkp)
IN ('sql   : '+$sqlPath)
Write-Host ''
Write-Host '  PENDENTE: bug 5 (print) e bug 6 (duplo toque) - precisam de App.tsx.' -ForegroundColor Yellow

Pop-Location