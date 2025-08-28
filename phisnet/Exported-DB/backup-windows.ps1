param(
  [string]$Host = "localhost",
  [int]$Port = 5432,
  [string]$Db = "phishnet",
  [string]$User = "postgres",
  [string]$Password,
  [switch]$Plain
)

if($Password){ $env:PGPASSWORD = $Password }
$timestamp = Get-Date -Format yyyyMMdd_HHmmss
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $dir

function Run($cmd){ Write-Host "==> $cmd" -ForegroundColor Cyan; iex $cmd; if($LASTEXITCODE -ne 0){ Write-Error "Command failed: $cmd"; exit 1 } }

$full = "phishnet_full_$timestamp.dump"
$schema = "phishnet_schema_$timestamp.sql"
$data = "phishnet_data_$timestamp.sql"
$globals = "phishnet_globals_$timestamp.sql"

Run "pg_dump -h $Host -p $Port -U $User -d $Db -Fc -f $full"
Run "pg_dump -h $Host -p $Port -U $User -d $Db -s -f $schema"
Run "pg_dump -h $Host -p $Port -U $User -d $Db -a -f $data"
Run "pg_dumpall -h $Host -p $Port -U $User --globals-only > $globals"

Compress-Archive -Path $schema,$data -DestinationPath "phishnet_schema_data_$timestamp.zip" -Force

if($Plain){
  Run "pg_dump -h $Host -p $Port -U $User -d $Db -f phishnet_plain_$timestamp.sql"
}

Write-Host "Backup complete:" -ForegroundColor Green
Get-ChildItem -File | Where-Object { $_.Name -like "phishnet_*_$timestamp*" } | Format-Table Name, Length
