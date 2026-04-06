# Database Migrations

This directory contains database migration files and configuration for Prisma ORM.

## Setup

### 1. Configure Database URL

Create a `.env` file in the web directory with your database connection string:

```bash
# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

# MySQL
DATABASE_URL="mysql://user:password@localhost:3306/mydb"

# SQLite (for development)
DATABASE_URL="file:./dev.db"
```

### 2. Install Dependencies

```bash
cd web
npm install
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

## Migration Commands

### Create a Migration

After modifying the Prisma schema (`schema.prisma`), create a migration:

```bash
npm run db:migrate
```

This will:
- Create a new migration file in `migrations/`
- Apply the migration to your database
- Regenerate the Prisma client

### Create Migration Only (Don't Apply)

To create a migration without applying it:

```bash
npx prisma migrate dev --create-only --name migration_name
```

### Apply Migrations

To apply all pending migrations:

```bash
npm run db:migrate:deploy
```

### Reset Database

⚠️ **Warning: This will delete all data!**

```bash
npm run db:reset
```

## Development Workflow

### 1. Development with Auto-Reset

For development with automatic database resets:

```bash
npm run db:studio
```

This opens Prisma Studio at `http://localhost:5555` to view and edit data.

### 2. Seed Database

To populate the database with initial/test data:

```bash
npm run db:seed
```

### 3. View Database Schema

To view the current database schema:

```bash
npx prisma db pull
```

## Production Deployment

### 1. Generate Prisma Client

```bash
npm run db:generate
```

### 2. Deploy Migrations

```bash
npm run db:migrate:deploy
```

### 3. Verify Migrations

```bash
npx prisma migrate status
```

## Migration Files

Migration files are stored in the `migrations/` directory with timestamps:

```
migrations/
├── 20240101000000_init/
│   └── migration.sql
├── 20240102000000_add_user_sessions/
│   └── migration.sql
```

## Schema Changes

When you modify `schema.prisma`:

1. Update the model in `schema.prisma`
2. Create a migration: `npm run db:migrate`
3. Name the migration appropriately (e.g., "add_user_avatar")
4. Review the generated SQL
5. Commit both the schema and migration files

## Best Practices

1. **Always use migrations** - Never modify the database directly
2. **Test migrations** - Test both up and down migrations
3. **Version control** - Always commit migration files
4. **Backup first** - Always backup before running migrations in production
5. **Review generated SQL** - Check the migration SQL before applying

## Troubleshooting

### Migration Failed

If a migration fails:

```bash
# Check migration status
npx prisma migrate status

# Mark migration as applied (use with caution)
npx prisma migrate resolve --applied migration_name

# Rollback to previous state
npm run db:reset
```

### Prisma Client Issues

If you encounter Prisma client issues:

```bash
# Regenerate the client
npm run db:generate

# Clear Prisma cache
npx prisma generate --force-reset
```

### Database Connection Issues

1. Verify DATABASE_URL in `.env`
2. Check database server is running
3. Verify network connectivity
4. Check database credentials

## Useful Commands

```bash
# View Prisma schema in browser
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Check database connection
npx prisma db pull

# Show current migrations
npx prisma migrate status

# Create SQL dump
npx prisma db pull --print
```

## Environment Variables

Required environment variables:

```bash
# Database connection
DATABASE_URL="postgresql://user:password@host:port/database"

# Optional: Shadow database for testing (CI)
SHADOW_DATABASE_URL="postgresql://user:password@host:port/shadow_database"
```

## CI/CD Integration

Add these steps to your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Install dependencies
  run: npm ci

- name: Generate Prisma Client
  run: npm run db:generate

- name: Run migrations
  run: npm run db:migrate:deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```
