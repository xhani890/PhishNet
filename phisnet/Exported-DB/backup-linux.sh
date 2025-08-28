#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 -h host -p port -d database -U user [-w password]" >&2
  exit 1
}

while getopts "h:p:d:U:w:" opt; do
  case $opt in
    h) HOST=$OPTARG ;;
    p) PORT=$OPTARG ;;
    d) DB=$OPTARG ;;
    U) USER=$OPTARG ;;
    w) PGPASSWORD=$OPTARG ; export PGPASSWORD ;;
    *) usage ;;
  esac
done

: "${HOST:?host required}" "${PORT:?port required}" "${DB:?database required}" "${USER:?user required}"

TS=$(date +%Y%m%d_%H%M%S)
PREFIX=phishnet
OUT=.

set -x
pg_dump -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -Fc -f "$OUT/${PREFIX}_full_${TS}.dump"
pg_dump -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -s  -f "$OUT/${PREFIX}_schema_${TS}.sql"
pg_dump -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -a  -f "$OUT/${PREFIX}_data_${TS}.sql"
pg_dumpall -h "$HOST" -p "$PORT" -U "$USER" --globals-only > "$OUT/${PREFIX}_globals_${TS}.sql"
zip -q "$OUT/${PREFIX}_schema_data_${TS}.zip" "$OUT/${PREFIX}_schema_${TS}.sql" "$OUT/${PREFIX}_data_${TS}.sql"
set +x

echo "Backup complete: ${TS}"
