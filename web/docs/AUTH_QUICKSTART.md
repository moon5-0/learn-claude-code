# Quick Start Guide - Authentication System

## Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] PostgreSQL database available
- [ ] npm or yarn package manager

## Setup Steps (5 minutes)

### 1. Install Dependencies
```bash
cd web
npm install
```

This will install:
- Authentication dependencies (bcryptjs, validator, @prisma/client)
- Testing libraries (jest, @testing-library/react)
- Type definitions

### 2. Configure Environment
```bash
# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# Example for local PostgreSQL:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb"
```

### 3. Initialize Database
```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 4. Run Tests
```bash
# Run all authentication tests
npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode during development
npm run test:watch
```

### 5. Start Development Server
```bash
npm run dev
```

## Test the Authentication

### Registration
```bash
# Visit: http://localhost:3000/register
# Create a new account:
# - Email: test@example.com
# - Username: testuser
# - Password: SecurePass123!
```

### Login
```bash
# Visit: http://localhost:3000/login
# Login with your credentials
```

### Logout
```bash
# Call the logout API
curl -X POST http://localhost:3000/api/auth/logout
```

## API Testing with curl

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout
```

## Troubleshooting

### "jest: command not found"
```bash
# Jest not installed yet, run:
npm install
```

### "Can't reach database server"
```bash
# Check DATABASE_URL in .env
# Ensure PostgreSQL is running
# Check firewall settings
```

### "Prisma Client could not be generated"
```bash
# Regenerate Prisma Client
npx prisma generate
```

### "Table doesn't exist"
```bash
# Run migrations
npx prisma migrate dev
```

## Development Workflow

### Make Changes
1. Write/update tests first (TDD)
2. Run tests: `npm test`
3. Implement code changes
4. Verify tests pass
5. Check coverage: `npm run test:coverage`

### Database Changes
1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name description`
3. Update code to use new schema
4. Test changes

### View Database
```bash
# Open Prisma Studio GUI
npx prisma studio
```

## Common Issues

### Password Requirements
Passwords must have:
- ✓ At least 8 characters
- ✓ Uppercase letter
- ✓ Lowercase letter
- ✓ Number
- ✓ Special character (!@#$%^&*(),.?":{}|<>)

### Rate Limiting
- Maximum 5 login attempts per 15 minutes
- 15-minute lockout after too many failures
- Clear rate limits by waiting or restart server

### Test Failures
```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

After setup:
1. ✓ Run tests - verify all pass
2. ✓ Test registration manually
3. ✓ Test login manually
4. ✓ Test logout manually
5. ✓ Try invalid inputs - verify validation
6. ✓ Try wrong passwords - verify rate limiting
7. ✓ Review security tests to understand protections

## Files to Know

### Core Implementation
- `src/lib/auth/` - Authentication logic
- `src/app/api/auth/` - API routes
- `src/components/auth/` - React components
- `prisma/schema.prisma` - Database schema

### Tests
- `src/__tests__/auth/security.test.ts` - Security tests
- `src/__tests__/auth/api.test.ts` - API tests
- `src/__tests__/auth/components.test.tsx` - Component tests

### Documentation
- `docs/AUTH_THREAT_MODEL.md` - Security analysis
- `docs/AUTH_README.md` - Full documentation
- `docs/AUTH_TASK_SUMMARY.md` - Implementation summary

## Need Help?

1. Check AUTH_README.md for detailed documentation
2. Review test files for expected behavior
3. Check AUTH_THREAT_MODEL.md for security rationale
4. Review error messages in console
5. Check database logs

## Production Deployment

Before deploying:
- [ ] Change DATABASE_URL to production database
- [ ] Set strong SESSION_SECRET
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Review rate limiting settings
- [ ] Run all tests
- [ ] Check security checklist in AUTH_README.md

## Time Estimate

- Initial setup: 5 minutes
- Testing locally: 5 minutes
- Understanding code: 15-30 minutes
- Integrating: Depends on your app

Ready to test! 🚀
