# PhishNet Database Backup & Restore

This folder contains database export artifacts (JSON table snapshots, CSVs, etc.) plus helper scripts to create and restore PostgreSQL dumps.

## Contents
- `backup-windows.ps1` – Create full, schema-only, data-only, globals dumps (timestamped) (+ optional plain full SQL with -Plain)
- `backup-linux.sh` – Same as above for Linux/macOS
- `restore-windows.ps1` – Restore from a selected dump (full custom format or schema+data SQL)
- `restore-linux.sh` – Same for Linux/macOS (supports --no-owner)
- `README-RESTORE.md` – This instructions file
- `VERIFY-RESTORE.md` – Post-restore verification steps
- `phishnet_dumps_manifest_<timestamp>.sha256` – SHA256 checksums for integrity

> NOTE: If the earlier pg_dump command required a password and none was supplied, the dump files may not have been created. Re-run the backup script.

## Generated File Naming
```
phishnet_full_YYYYMMDD_HHMMSS.dump        # Custom format (use pg_restore)
phishnet_schema_YYYYMMDD_HHMMSS.sql       # Schema-only
phishnet_data_YYYYMMDD_HHMMSS.sql         # Data-only
phishnet_globals_YYYYMMDD_HHMMSS.sql      # Cluster globals (roles etc.)
phishnet_schema_data_YYYYMMDD_HHMMSS.zip  # Convenience archive of schema + data SQL
```

## 1. Creating a Backup (Windows PowerShell)
Run:
```powershell
./backup-windows.ps1 -Host localhost -Port 5432 -Db phishnet -User postgres
```
Add `-Password 'yourpass'` to avoid interactive prompt (secure handling: prefer env var).

## 2. Creating a Backup (Linux/macOS)
```bash
chmod +x backup-linux.sh
./backup-linux.sh -h localhost -p 5432 -d phishnet -U postgres
```
Use `-W` flag (script prompts) or set `PGPASSWORD` env var.

## 3. Restoring (Full Custom Dump) – Windows
```powershell
./restore-windows.ps1 -Dump phishnet_full_20250828_181748.dump -TargetDb phishnet_restored -User postgres -Host localhost
```

## 4. Restoring (Schema + Data SQL) – Windows
```powershell
./restore-windows.ps1 -Schema phishnet_schema_20250828_181748.sql -Data phishnet_data_20250828_181748.sql -TargetDb phishnet_restored -User postgres -Host localhost
```

## 5. Restoring (Linux/macOS)
```bash
./restore-linux.sh -f phishnet_full_20250828_181748.dump -t phishnet_restored -U postgres -h localhost
# or schema+data
./restore-linux.sh -s phishnet_schema_20250828_181748.sql -a phishnet_data_20250828_181748.sql -t phishnet_restored -U postgres -h localhost
```

## 6. Verifying
```powershell
psql -U postgres -h localhost -d phishnet_restored -c "\dt" | Select-String users
psql -U postgres -h localhost -d phishnet_restored -c "SELECT COUNT(*) FROM users;"
```

## 7. Common Issues
| Symptom | Cause | Fix |
| ------- | ----- | --- |
| role "xyz" does not exist | Globals not restored or custom role missing | Create role then re-run failing statements |
| permission denied | Using non-superuser for objects owned by other roles | Use superuser or remap ownership |
| duplicate key constraint on restore | Restoring into non-empty DB | Drop/recreate destination DB or use `--clean` |

## 8. Security Notes
- Dumps may contain hashed passwords and sensitive template HTML. Share securely.
- Remove or encrypt dumps after transfer if not needed long-term.

## 9. Remapping Ownership (Optional)
Use pg_restore with `--no-owner` and `--role targetrole` when restoring custom format:
```powershell
pg_restore -U postgres -h localhost -d phishnet_restored --clean --no-owner --role=app_user phishnet_full_YYYYMMDD_HHMMSS.dump
```

## 10. Plain Text Full Dump (Optional)
Generate:
```powershell
pg_dump -h localhost -U postgres -d phishnet -f phishnet_plain_YYYYMMDD_HHMMSS.sql
```

## 11. Integrity Verification
Compare SHA256 hashes:
```powershell
Get-Content .\phishnet_dumps_manifest_YYYYMMDD_HHMMSS.sha256
Get-FileHash -Algorithm SHA256 phishnet_*_YYYYMMDD_HHMMSS.* | ForEach-Object { "${_.Hash}  " + (Split-Path -Leaf $_.Path) }
```
See `VERIFY-RESTORE.md` for deeper validation.

## 12. Development Onboarding (GitHub Distribution)
Preferred approach is to use migrations plus a minimal seed instead of sharing full dumps to every developer.

Quick steps:
```powershell
# Apply migrations
for %f in (migrations\*.sql) do psql -U postgres -h localhost -d phishnet_dev -f %f
# Seed minimal data
psql -U postgres -h localhost -d phishnet_dev -f scripts/seed-dev.sql
```
Schema snapshot auto-updated by GitHub Action: `.github/workflows/schema-snapshot.yml` writing to `docs/db/schema.sql`.

---
Prepared helper assets to standardize backup/restore.
