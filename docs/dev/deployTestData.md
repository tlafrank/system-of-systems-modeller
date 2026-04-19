# Deploy Test Data

`/scripts/deployTestData.sh` performs the following actions:
- Loads `.env` for database name and credentials.
- Detects whether Docker Compose is available.
- If Docker is available and `db` is not running, attempts to start `db` automatically.
- If Docker DB is unavailable, falls back to host MySQL (`mysql` CLI required).
- Checks database connectivity.
- Prompts for a test case folder from `/testData`.
- Applies all `.sql` files in the selected folder.
- Copies images from the selected case's `/images` folder into `/public/images`.

## Typical usage
```bash
./scripts/deployTestData.sh
```

## If host MySQL fallback is used
Install the MySQL client first:
```bash
sudo apt-get update && sudo apt-get install -y mysql-client
```
