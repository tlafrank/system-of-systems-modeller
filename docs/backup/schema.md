# SOSM Database Schema Workflow (Hybrid Development)
- Used to make changes to the database schema running in a container

**Audience:** Developers working on SOSM with **MySQL in Docker** and the **Node app on the host** (or in a dev container).
**Goal:** Safe, repeatable schema changes now, easy migration to **PostgreSQL** later.

---

## TL;DR (Checklist)

1. Create a migration file in `sql/migrations/mysql/` (and later `postgres/`).
2. Apply it to the running MySQL container with `docker compose exec db mysql …`.
3. Record it in `schema_migrations` (once per migration).
4. Test the app (nodemon picks up code changes automatically).
5. Commit the migration + code; document the change.
6. **Prod:** take backup → apply → deploy app → smoke test → done.
7. Keep SQL **additive and portable** to make the PG move easy.

---

## 0) Concepts & Ground Rules

- **Init scripts run once:** Files in `/docker-entrypoint-initdb.d/*.sql` only execute on **first** boot of a **new** DB volume.
- **Migrations, not edits:** Never change prior migrations; always add a **new** numbered file.
- **Additive first:** Prefer *add columns/tables → backfill → tighten constraints* over destructive changes.
- **Portability:** Use unquoted `lower_snake_case` identifiers, `CURRENT_TIMESTAMP` defaults, and avoid MySQL-only types like `ENUM`.

---

## 1) Pre-requisites

- MySQL runs via Docker Compose (service name `db`) with a persistent volume:
  ```yaml
  services:
    db:
      image: mysql:8.0
      environment:
        MYSQL_DATABASE: db_sosm
        MYSQL_USER: sosmUser
        MYSQL_PASSWORD: sosm_pass
        MYSQL_ROOT_PASSWORD: rootpass
      volumes:
        - dbdata:/var/lib/mysql
      ports: ["3306:3306"]
  volumes: { dbdata: {} }
