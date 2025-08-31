# Workflows

1. [Setup Environment](./dev/setupEnvironment.md)
2. [Deploy SOSM](./dev/deploySOSM.md)
3. (Optional) [Deploy test data](./dev/deployTestData.md)
4. [Run SOSM](./dev/runSOSM.md)
5. (Optional) [Backup test data](./dev/backupTestData.md)


## [Setup environment](./dev/setupEnvironment.md)
This workflow describes the activities and prerequisites necessary to setup the environment ready for the [deployment of SOSM.](./dev/deploySOSM.md)

## [Deploy SOSM](./dev/deploySOSM.md)
This workflow describes the steps necessary to deploy SOSM from github to the target environment.

## [Deploy test data (Optional)](./dev/deployTestData.md)
This workflow describes the steps required to populate the deployed SOSM instance with the test data residing in /testData/. Workflow is captured in the script /scripts/deployTestData.md

## [Run SOSM](./dev/runSOSM.md)
This guide explains how to run SOSM.

## [Update running instance](./dev/)
- Back up DB.
- Deploy new app:
  - Build or load new image
  - `docker compose up -d`
- Apply migrations: `docker compose exec app node tools/migrate.js` (or SQL)

## [Backup test data](./dev/backupTestData.md)
This guide explains how to backup the running config to either:
1. /testData/
2. Folder of the users choosing

## Database sanitisation (requirement TBC)
- Dump prod: `mysqldump ... > prod.sql`
- Sanitize: run `tools/sanitize.sql` (masks names, emails, tokens).
- Import to staging: `mysql ... < prod_sanitized.sql`

## Packaging for production deployment
- Build image locally: `docker build -t sosm-app:<ver> ./www`
- (Air-gapped) Save/load: `docker save -o sosm-app-<ver>.tar sosm-app:<ver>`