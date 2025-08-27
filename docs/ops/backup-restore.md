# Backups
Nightly cron:
`docker compose exec -T db mysqldump -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" > backups/db-$(date +%F).sql`

# Restore
`docker compose exec -T db mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" < backups/db-YYYY-MM-DD.sql`
