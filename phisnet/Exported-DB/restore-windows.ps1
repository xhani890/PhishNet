param(
  [string]$Dump,
  [string]$Schema,
  [string]$Data,
  [string]$TargetDb = 'phishnet_restored',
  [string]$User = 'postgres',
  [string]$Host = 'localhost',
  [int]$Port = 5432,
  [string]$Password,
  [switch]$NoOwner
)

if($Password){ $env:PGPASSWORD = $Password }

if(-not $Dump -and (-not $Schema -or -not $Data)){
  Write-Error "Provide -Dump full.dump OR both -Schema schema.sql and -Data data.sql"; exit 1
}

Write-Host "Preparing target database $TargetDb" -ForegroundColor Cyan
psql -U $User -h $Host -p $Port -c "DROP DATABASE IF EXISTS \"$TargetDb\";" | Out-Null
psql -U $User -h $Host -p $Port -c "CREATE DATABASE \"$TargetDb\";" | Out-Null

if($Dump){
  Write-Host "Restoring full custom dump $Dump" -ForegroundColor Cyan
  $args = @('-U', $User, '-h', $Host, '-p', $Port, '-d', $TargetDb, '--clean')
  if($NoOwner){ $args += '--no-owner' }
  & pg_restore @args $Dump
} else {
  Write-Host "Restoring schema $Schema" -ForegroundColor Cyan
  psql -U $User -h $Host -p $Port -d $TargetDb -f $Schema | Out-Null
  Write-Host "Restoring data $Data" -ForegroundColor Cyan
  psql -U $User -h $Host -p $Port -d $TargetDb -f $Data | Out-Null
}

Write-Host "Restore complete." -ForegroundColor Green
