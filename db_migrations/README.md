# Database Migrations
Providing a migration facility for the database which should replace the ../sql/schemaUpdates.sql file.

This allows incremental updates and, once changes are rolled into here first, the migration of data can be controlled with logic, defaults and so on.

## History
Migrations from init to 1.0.8 are probably correct but are not gaurenteed to preserve data.
From 1.0.9 onwards they should aim to preserve entered data through any changes.

## Use
See nodejs db-migrations for details.

Typically use the _db-m -e <dev|prod> up_ command to update to the latest version.

Use of the _clone_db.sh_ can help with testing by cloning the in use DB to a temporary.

## User accounts
Scripts and config are set to use the ${USER} environment variable for both username and password.