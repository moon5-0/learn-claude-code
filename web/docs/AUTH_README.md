# Authentication System Implementation

## Overview

This is a secure, test-driven implementation of user authentication for a Next.js application. The implementation follows security best practices and includes comprehensive testing.

## Features

### Security Features
- ✅ **Password Hashing**: bcrypt with cost factor of 12
- ✅ **SQL Injection Protection**: Parameterized queries via Prisma ORM
- ✅ **XSS Protection**: Input sanitization and output encoding
- ✅ **CSRF Protection**: Built-in Next.js CSRF protection
- ✅ **Rate Limiting**: Prevents brute force attacks (5 attempts per 15 minutes)
- ✅ **Session Management**: Secure session tokens with expiration
- ✅ **Input Validation**: Comprehensive validation with sanitizer
- ✅ **Timing Attack Prevention**: Constant-time password comparison

### Functionality
- User registration with email/username
- Secure login
- Session management
- Logout functionality
- Password strength validation
- Rate limiting with lockout

## Architecture

### Threat Model
See [AUTH_THREAT_MODEL.md](./AUTH_THREAT_MODEL.md) for comprehensive threat analysis and security controls.

### Directory Structure
```
web/
├── src/
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── validation.ts      # Input validation & sanitization
│   │   │   ├── password.ts        # Password hashing utilities
│   │   │   ├── session.ts         # Session management
│   │   │   └── rate-limiter.ts    # Brute force protection
│   │   └── db.ts                   # Database connection
│   ├── components/
│   │   └── auth/
│   │       ├── LoginForm.tsx       # Login form component
│   │       └── RegisterForm.tsx    # Registration form component
│   ├── app/
│   │   ├── api/auth/
│   │   │   ├── register/route.ts  # Registration endpoint
│   │   │   ├── login/route.ts     # Login endpoint
│   │   │   └── logout/route.ts    # Logout endpoint
│   │   └── [locale]/(auth)/
│   │       ├── login/page.tsx     # Login page
│   │       └── register/page.tsx  # Registration page
│   └── __tests__/
│       └── auth/
│           ├── security.test.ts   # Security tests
│           ├── api.test.ts        # API route tests
│           └── components.test.tsx # UI component tests
├── prisma/
│   └── schema.prisma               # Database schema
└── docs/
    └── AUTH_THREAT_MODEL.md        # Threat model documentation
```

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL or MySQL database
- npm or yarn

### Installation

1. Install dependencies:
```bash
cd web
npm install
```

2. Set up environment variables (see `.env.example`):
```bash
cp .env.example .env
```

Required environment variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

3. Set up database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Run development server:
```bash
npm run dev
```

### Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

## API Endpoints

### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "testuser",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "username": "testuser",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "username": "testuser"
  }
}
```

### POST /api/auth/logout
Logout current user.

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Password Requirements

Passwords must meet the following criteria:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*(),.?":{}|<>)
- Cannot be a common weak password

## Security Considerations

### Implemented Security Controls

1. **Password Security**
   - bcrypt hashing with cost factor 12
   - Minimum password strength requirements
   - Passwords never returned in API responses

2. **Input Validation**
   - All inputs sanitized to prevent XSS
   - Email format validation
   - Username format validation
   - Parameterized queries prevent SQL injection

3. **Session Security**
   - Cryptographically secure session tokens
   - HttpOnly, Secure, SameSite cookies
   - Session expiration (24 hours)
   - Session invalidation on logout

4. **Rate Limiting**
   - Maximum 5 login attempts per 15 minutes
   - 15-minute lockout after excessive attempts
   - Prevents brute force attacks

5. **User Enumeration Prevention**
   - Generic error messages
   - Consistent response times
   - No indication if email exists

### Testing Coverage

The implementation includes:
- **Security Tests**: SQL injection, XSS, CSRF, timing attacks
- **API Tests**: Registration, login, logout, error handling
- **Component Tests**: Form validation, submission, error handling
- **Integration Tests**: End-to-end authentication flows

Run `npm run test:coverage` to see detailed coverage metrics.

## Production Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `DATABASE_URL` with SSL
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up proper session secret
- [ ] Review rate limiting settings
- [ ] Enable logging and monitoring
- [ ] Set up backup for database
- [ ] Review threat model
- [ ] Perform security audit

## Future Enhancements

Potential improvements for future iterations:
- Email verification
- Password reset functionality
- Two-factor authentication (2FA)
- OAuth integration (Google, GitHub, etc.)
- Session management dashboard
- Audit logging
- Advanced monitoring
- Content Security Policy headers

## Troubleshooting

### Common Issues

**Database connection errors:**
```bash
# Check DATABASE_URL in .env
# Ensure database is running
npx prisma generate
```

**Tests failing:**
```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules
npm install
```

**Session not persisting:**
- Check cookie settings
- Verify HTTPS is enabled in production
- Check session expiration settings

## References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [Prisma Documentation](https://www.prisma.io/docs)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)

## Testing Summary

### Test Coverage
- **Unit Tests**: Validation utilities, password hashing, session management
- **Integration Tests**: API routes, database interactions
- **Component Tests**: Login and registration forms
- **Security Tests**: SQL injection, XSS, CSRF, rate limiting

### Running Tests
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Generate coverage report
```

All tests follow TDD principles and were written before implementation.
