#!/usr/bin/env bash
set -euo pipefail

usage(){
  cat >&2 <<EOF
Usage: $0 [-f full.dump] [-s schema.sql -a data.sql] -t targetdb -U user -h host [-p port] [--globals globals.sql]
Examples:
  $0 -f phishnet_full_20250828_181748.dump -t phishnet_restored -U postgres -h localhost
  $0 -s phishnet_schema_20250828_181748.sql -a phishnet_data_20250828_181748.sql -t phishnet_restored -U postgres -h localhost
EOF
  exit 1
}

FULL=""; SCHEMA=""; DATA=""; TARGET=""; USERNAME=""; HOST=""; PORT=5432; GLOBALS=""; PASSWORD=""; NOOWNER=0

while [[ $# -gt 0 ]]; do
  case $1 in
    -f) FULL=$2; shift 2;;
    -s) SCHEMA=$2; shift 2;;
    -a) DATA=$2; shift 2;;
    -t) TARGET=$2; shift 2;;
    -U) USERNAME=$2; shift 2;;
    -h) HOST=$2; shift 2;;
    -p) PORT=$2; shift 2;;
    --globals) GLOBALS=$2; shift 2;;
    -w) PASSWORD=$2; export PGPASSWORD=$PASSWORD; shift 2;;
    --no-owner) NOOWNER=1; shift;;
    *) usage;;
  esac
done

[[ -z "$TARGET" || -z "$USERNAME" || -z "$HOST" ]] && usage

if [[ -n "$FULL" && ( -n "$SCHEMA" || -n "$DATA" ) ]]; then
  echo "Use either -f OR (-s -a)." >&2; exit 1;
fi

# Restore globals first if provided
if [[ -n "$GLOBALS" ]]; then
  echo "Restoring globals: $GLOBALS" >&2
  psql -U "$USERNAME" -h "$HOST" -p "$PORT" -f "$GLOBALS"
fi

psql -U "$USERNAME" -h "$HOST" -p "$PORT" -c "DROP DATABASE IF EXISTS \"$TARGET\";"
psql -U "$USERNAME" -h "$HOST" -p "$PORT" -c "CREATE DATABASE \"$TARGET\";"

if [[ -n "$FULL" ]]; then
  echo "Restoring full custom dump: $FULL" >&2
  args=( -U "$USERNAME" -h "$HOST" -p "$PORT" -d "$TARGET" --clean )
  [[ $NOOWNER -eq 1 ]] && args+=( --no-owner )
  pg_restore "${args[@]}" "$FULL"
else
  [[ -z "$SCHEMA" || -z "$DATA" ]] && { echo "Need both -s and -a for schema+data restore" >&2; exit 1; }
  echo "Loading schema: $SCHEMA" >&2
  psql -U "$USERNAME" -h "$HOST" -p "$PORT" -d "$TARGET" -f "$SCHEMA"
  echo "Loading data: $DATA" >&2
  psql -U "$USERNAME" -h "$HOST" -p "$PORT" -d "$TARGET" -f "$DATA"
fi

echo "Restore complete."
