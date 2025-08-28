# Verify Restore Procedure

Use these steps on the destination machine after running one of the restore scripts.

## 1. Environment
Ensure psql available and you restored into database name you chose (e.g. phishnet_restored).

## 2. Quick Structural Checks
```powershell
psql -U postgres -h localhost -d phishnet_restored -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY 1 LIMIT 10;"
psql -U postgres -h localhost -d phishnet_restored -c "SELECT COUNT(*) AS users FROM users;"
psql -U postgres -h localhost -d phishnet_restored -c "SELECT COUNT(*) AS email_templates FROM email_templates;"
```

## 3. Ownership & Permissions
If objects owned by unexpected role:
```powershell
psql -U postgres -h localhost -d phishnet_restored -c "ALTER DATABASE phishnet_restored OWNER TO postgres;"
```
Use pg_restore with --no-owner on custom dump if needed.

## 4. Data Integrity Spot Check
```powershell
psql -U postgres -h localhost -d phishnet_restored -c "SELECT id,email,created_at FROM users ORDER BY id LIMIT 5;"
psql -U postgres -h localhost -d phishnet_restored -c "SELECT id,name,status FROM campaigns ORDER BY id LIMIT 5;"
```

## 5. Extensions (None Required)
Current dump shows no custom extensions; skip unless errors reference missing extensions.

## 6. Hash Verification
On the source you received a .sha256 manifest. To verify:
```powershell
Get-FileHash -Algorithm SHA256 phishnet_*_20250828_181748.* | ForEach-Object { $_.Hash + '  ' + (Split-Path -Leaf $_.Path) }
# Compare each line with phishnet_dumps_manifest_20250828_181748.sha256
```
Linux/macOS:
```bash
sha256sum phishnet_*_20250828_181748.*
```

## 7. Troubleshooting
| Issue | Action |
|-------|--------|
| Relation already exists | Drop DB and re-run restore script |
| Role missing | Create role then re-run failing step or use --no-owner |
| Encoding mismatch | Create DB with correct encoding: CREATE DATABASE phishnet_restored ENCODING 'UTF8'; |

## 8. Application Connection
Update app env: DATABASE_URL=postgres://postgres:PASS@localhost:5432/phishnet_restored

---
All checks passed => restore validated.
