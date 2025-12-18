# NestJS API with Role-Based Access Control (RBAC)

A production-ready REST API built with **NestJS**, **Prisma ORM**, and **PostgreSQL** featuring JWT authentication and role-based access control (RBAC). Designed for mobile and desktop applications with enterprise-grade security patterns.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Authentication Flow](#authentication-flow)
- [Authorization & RBAC](#authorization--rbac)
- [API Endpoints](#api-endpoints)
- [Security Features](#security-features)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)
- [Architecture Decisions](#architecture-decisions)

---

## 🎯 Overview

This API provides a complete authentication and authorization system with:
- **JWT Bearer Token Authentication** for stateless API access
- **Role-Based Access Control (RBAC)** with single role per user
- **Password hashing** using bcrypt
- **Database** management with Prisma and PostgreSQL (Neon)
- **Input validation** using class-validator
- **Security hardening** with Helmet, CORS, and rate limiting

**Target Use Case:** Mobile apps, desktop applications, and SPA clients requiring secure API access.

---

## ✨ Features

- ✅ **JWT Authentication** - Stateless bearer token authentication
- ✅ **User Registration & Login** - Secure account creation and login
- ✅ **Role-Based Access Control** - Single role per user (USER, ADMIN)
- ✅ **Password Security** - Bcrypt hashing (10 rounds)
- ✅ **Request Validation** - Automatic DTO validation with class-validator
- ✅ **Security Headers** - Helmet.js for HTTP security headers
- ✅ **Rate Limiting** - Throttling to prevent abuse (10 req/min default)
- ✅ **CORS Support** - Configured for cross-origin requests
- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **Database Migrations** - Prisma migration system
- ✅ **Global API Prefix** - All routes prefixed with `/api`

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | NestJS 11.x |
| **Language** | TypeScript 5.x |
| **Database** | PostgreSQL (Neon) |
| **ORM** | Prisma 6.x |
| **Authentication** | Passport JWT + @nestjs/jwt |
| **Validation** | class-validator + class-transformer |
| **Security** | Helmet, @nestjs/throttler |
| **Password Hashing** | bcrypt |
| **Runtime** | Node.js 18+ |

---

## 📁 Project Structure

```
my-nestjs-app/
├── prisma/
│   ├── schema.prisma          # Prisma schema with User model and Role enum
│   └── migrations/            # Database migrations
│       └── 20251218141913_init_rbac/
│           └── migration.sql  # Initial RBAC migration
├── src/
│   ├── auth/                  # Authentication module
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts   # Extract user from request
│   │   │   └── roles.decorator.ts          # @Roles() metadata decorator
│   │   ├── dto/
│   │   │   ├── login.dto.ts               # Login validation
│   │   │   └── register.dto.ts            # Registration validation
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts          # JWT authentication guard
│   │   │   └── roles.guard.ts             # Role-based authorization guard
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts            # Passport JWT strategy
│   │   ├── auth.controller.ts             # Auth endpoints (login, register, me)
│   │   ├── auth.service.ts                # Auth business logic
│   │   └── auth.module.ts                 # Auth module configuration
│   ├── users/                 # Users module
│   │   ├── users.controller.ts            # User CRUD endpoints
│   │   ├── users.service.ts               # User business logic
│   │   └── users.module.ts                # Users module configuration
│   ├── prisma/                # Prisma module
│   │   ├── prisma.service.ts              # Prisma client service
│   │   └── prisma.module.ts               # Global Prisma module
│   ├── app.controller.ts      # Demo protected routes
│   ├── app.service.ts         # App service
│   ├── app.module.ts          # Root module (ConfigModule, ThrottlerModule)
│   └── main.ts                # Bootstrap (ValidationPipe, Helmet, CORS)
├── .env                       # Environment variables
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ installed
- **npm** or **yarn**
- **PostgreSQL** database (or use Neon/Supabase)

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd my-nestjs-app
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="15m"
```

4. **Run database migrations**

```bash
npx prisma migrate dev
```

5. **Generate Prisma Client**

```bash
npx prisma generate
```

6. **Start the development server**

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

---

## 🔐 Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` | ✅ Yes |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your-secret-key` | ✅ Yes |
| `JWT_EXPIRES_IN` | Token expiration time | `15m`, `1h`, `7d` | ❌ No (default: 15m) |
| `PORT` | Server port | `3000` | ❌ No (default: 3000) |

**Security Note:** 
- Use a strong random string for `JWT_SECRET` (at least 32 characters)
- In production, use environment-specific secrets
- Never commit `.env` to version control

---

## 🔑 Authentication Flow

### 1. User Registration

**Endpoint:** `POST /api/auth/register`

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "USER"  // Optional: USER (default) or ADMIN
}
```

**Process:**
1. Validates email and password (min 6 characters)
2. Checks if email already exists
3. Hashes password with bcrypt (10 rounds)
4. Creates user in database
5. Returns user object + JWT access token

**Response:**
```json
{
  "user": {
    "id": "cm4xyz...",
    "email": "user@example.com",
    "role": "USER",
    "createdAt": "2025-12-18T...",
    "updatedAt": "2025-12-18T..."
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. User Login

**Endpoint:** `POST /api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Process:**
1. Finds user by email
2. Compares password hash
3. Signs JWT with payload: `{ sub: userId, email, role }`
4. Returns access token

**Response:** Same as registration

### 3. Using JWT Tokens

**For all protected endpoints, include the token in the Authorization header:**

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Payload Structure:**
```json
{
  "sub": "cm4xyz...",      // User ID
  "email": "user@example.com",
  "role": "USER",
  "iat": 1702917600,       // Issued at
  "exp": 1702918500        // Expires at
}
```

### 4. Token Validation

The `JwtStrategy` extracts and validates tokens on every protected request:
- Verifies signature using `JWT_SECRET`
- Checks expiration
- Attaches user object to `request.user`

---

## 🛡️ Authorization & RBAC

### Role System

This API uses a **single-role-per-user** model with two roles:

| Role | Description | Capabilities |
|------|-------------|--------------|
| `USER` | Default role | Access to own profile, protected routes |
| `ADMIN` | Administrator | All USER capabilities + admin-only routes |

### Role Enum (Prisma)

```prisma
enum Role {
  USER
  ADMIN
}
```

### How RBAC Works

1. **Guards**: Two guards work together for authorization

   - **`JwtAuthGuard`**: Ensures user is authenticated
     ```typescript
     @UseGuards(JwtAuthGuard)
     ```

   - **`RolesGuard`**: Checks if user has required role
     ```typescript
     @UseGuards(JwtAuthGuard, RolesGuard)
     @Roles(Role.ADMIN)
     ```

2. **`@Roles()` Decorator**: Sets metadata for required roles

   ```typescript
   @Roles(Role.ADMIN)              // Admin only
   @Roles(Role.USER, Role.ADMIN)   // Either role
   ```

3. **`@GetCurrentUser()` Decorator**: Extracts user from request

   ```typescript
   @Get('profile')
   getProfile(@GetCurrentUser() user: CurrentUser) {
     return user; // { userId, email, role }
   }
   ```

### Example: Protected Controller

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)  // Apply to all routes
export class AdminController {
  
  @Get('dashboard')
  @Roles(Role.ADMIN)  // Only ADMIN can access
  getDashboard() {
    return { message: 'Admin dashboard' };
  }

  @Get('users')
  @Roles(Role.ADMIN)
  getAllUsers() {
    return this.usersService.findAll();
  }
}
```

---

## 📡 API Endpoints

All endpoints are prefixed with `/api`

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ Public | Register new user |
| `POST` | `/api/auth/login` | ❌ Public | Login and get JWT token |
| `GET` | `/api/auth/me` | ✅ JWT | Get current user profile |

### User Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/api/users` | ✅ JWT | ADMIN | List all users |
| `GET` | `/api/users/:id` | ✅ JWT | Any | Get user by ID |

### Demo Endpoints (App Controller)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/api` | ❌ Public | - | Health check |
| `GET` | `/api/protected` | ✅ JWT | Any | Protected route example |
| `GET` | `/api/admin-only` | ✅ JWT | ADMIN | Admin-only route example |

---

## 🔒 Security Features

### 1. Password Security
- **Bcrypt hashing** with 10 salt rounds
- Passwords never stored in plaintext
- Constant-time comparison to prevent timing attacks

### 2. JWT Security
- **Stateless authentication** (no session storage)
- Tokens expire after 15 minutes (configurable)
- Signed with `HS256` algorithm
- Secret key stored in environment variable

### 3. Input Validation
- **class-validator** DTOs for all inputs
- Whitelist only known properties
- Reject unknown properties
- Auto-transform types

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // Strip unknown properties
    forbidNonWhitelisted: true,   // Reject if unknown properties present
    transform: true,              // Auto-transform types
  }),
);
```

### 4. HTTP Security Headers (Helmet)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HSTS)

### 5. Rate Limiting
- **10 requests per minute** per IP (global)
- Prevents brute-force attacks
- Configurable per route

```typescript
ThrottlerModule.forRoot([{
  ttl: 60000,   // 1 minute
  limit: 10,    // 10 requests
}])
```

### 6. CORS
- Configured for cross-origin requests
- In production, restrict to specific origins:

```typescript
app.enableCors({
  origin: ['https://your-app.com'],  // Whitelist domains
  credentials: true,
});
```

### 7. Error Handling
- Generic error messages to avoid information leakage
- "Invalid credentials" instead of "User not found" or "Wrong password"

---

## 🗄️ Database Schema

### User Model

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  role         Role     @default(USER)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("users")
}

enum Role {
  USER
  ADMIN
}
```

### Database Commands

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio (GUI)
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

---

## 🧪 Testing

### Manual Testing with cURL

**1. Register a User**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}'
```

**2. Register an Admin**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123","role":"ADMIN"}'
```

**3. Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}'
```

Copy the `accessToken` from the response.

**4. Access Protected Route**
```bash
curl http://localhost:3000/api/protected \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**5. Try Admin-Only Route (will fail for USER role)**
```bash
curl http://localhost:3000/api/admin-only \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

**6. Access Admin Route with Admin Token**
```bash
curl http://localhost:3000/api/admin-only \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Automated Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 🚢 Deployment

### Environment Setup

1. Set production environment variables
2. Use strong `JWT_SECRET` (32+ random characters)
3. Configure `DATABASE_URL` for production database
4. Set `NODE_ENV=production`

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Production Checklist

- [ ] Use HTTPS/TLS for all traffic
- [ ] Restrict CORS to specific origins
- [ ] Enable database connection pooling
- [ ] Configure proper logging
- [ ] Set up monitoring (health checks)
- [ ] Use secrets manager for `JWT_SECRET`
- [ ] Enable database backups
- [ ] Configure rate limiting per route
- [ ] Review security headers
- [ ] Set up CI/CD pipeline

### Recommended Platforms

- **Backend**: Railway, Render, AWS Elastic Beanstalk, DigitalOcean
- **Database**: Neon, Supabase, AWS RDS, Railway Postgres

---

## 📚 Architecture Decisions

### Why Single Role Per User?

- **Simpler implementation** for MVP/small projects
- **Easier to reason about** authorization logic
- **Lower database complexity** (no join table needed)
- **Sufficient for most applications** (USER/ADMIN distinction)

**To migrate to multi-role:**
1. Create `UserRole` join table
2. Update guards to check role array
3. Modify JWT payload to include role array

### Why Bearer Tokens?

- **Stateless** - No session storage required
- **Mobile-friendly** - Works across platforms
- **Scalable** - No server-side session management
- **Standard** - OAuth 2.0 compatible

### Why Short Token Expiration?

- **Security** - Limits damage if token is stolen
- **Recommended for mobile apps** - Implement refresh tokens if needed

---

## 🔗 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Passport JWT Strategy](http://www.passportjs.org/packages/passport-jwt/)
- [class-validator](https://github.com/typestack/class-validator)
- [Helmet.js](https://helmetjs.github.io/)

---

**Built with ❤️ using NestJS, Prisma, and PostgreSQL**
