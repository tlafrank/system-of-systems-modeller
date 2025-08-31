# Backup Test Data
/scripts/backupTestData.sh performs the following actions:
- Checks for the presence of the grep command (required to run the script).
- Loads the .env for the database name and credentials
- Identifies the environment in which the script exists (database running natively or in a container)
- Checks database connectivity
- Asks the user if they want to continue
  - If yes: Rebuilds the schema, loads test data into the database and copies images from /testData/images/ to /www/images
