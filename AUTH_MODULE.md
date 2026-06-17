# Authentication Module Documentation

## Overview

The Auth Module provides a complete JWT-based authentication system for the LogiQuest API. It handles user registration, login, password hashing with bcrypt, and provides JWT token validation through guards.

## Features

- ✅ User registration with username, email, and password
- ✅ Secure login with JWT token generation
- ✅ Password hashing using bcrypt (10 rounds)
- ✅ JWT token validation via `JwtAuthGuard`
- ✅ Configurable token expiry via environment variables
- ✅ Proper error handling with descriptive messages
- ✅ UUID-based user IDs for scalability

## Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/logiquest
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=7d
PORT=3000
```

**JWT_EXPIRY** can be set to:
- `1h` - 1 hour
- `7d` - 7 days (default)
- `24h` - 24 hours
- Any valid [ms](https://github.com/vercel/ms) format duration

## API Endpoints

### Register a New User

**POST** `/auth/register`

Request body:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

Success response (201):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

Error responses:
- `400 Bad Request` - Invalid input format
- `409 Conflict` - Username or email already exists

---

### Login

**POST** `/auth/login`

Request body:
```json
{
  "username": "john_doe",
  "password": "securepassword123"
}
```

Success response (200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

Error responses:
- `401 Unauthorized` - Invalid username or password

---

## Using JwtAuthGuard

Protect routes by applying the `JwtAuthGuard` to controller methods:

```typescript
import { UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return req.user; // Returns the authenticated user
  }
}
```

### Protecting Entire Controllers

```typescript
import { UseGuards, Controller } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  // All routes in this controller are protected
}
```

---

## Making Authenticated Requests

Include the JWT token in the `Authorization` header:

```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Using Axios (JavaScript)

```typescript
const token = response.data.accessToken;
const config = {
  headers: {
    Authorization: `Bearer ${token}`
  }
};

axios.get('/users/profile', config);
```

### Using Fetch API

```javascript
const token = response.accessToken;
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

fetch('/users/profile', { headers });
```

---

## Module Structure

```
src/auth/
├── auth.module.ts              # Main module definition
├── auth.controller.ts          # API endpoints (register, login)
├── auth.service.ts             # Business logic
├── dto/
│   ├── register.dto.ts         # Registration request DTO
│   └── login.dto.ts            # Login request DTO
├── entities/
│   └── user.entity.ts          # User database entity
├── guards/
│   └── jwt-auth.guard.ts       # JWT authentication guard
└── strategies/
    └── jwt.strategy.ts         # Passport JWT strategy
```

---

## Database Schema

The `users` table is automatically created with:

| Column      | Type      | Constraints           |
|-------------|-----------|----------------------|
| id          | UUID      | PRIMARY KEY           |
| username    | VARCHAR   | UNIQUE, NOT NULL      |
| email       | VARCHAR   | UNIQUE, NOT NULL      |
| password    | VARCHAR   | NOT NULL (hashed)     |
| createdAt   | TIMESTAMP | Auto-set on creation  |
| updatedAt   | TIMESTAMP | Auto-update on change |

---

## Token Payload

The JWT token contains the following claims:

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",  // User ID
  "username": "john_doe",
  "email": "john@example.com",
  "iat": 1705314600,                              // Issued at
  "exp": 1706000000                               // Expiration
}
```

---

## Error Handling

The auth module returns standardized error responses:

### 401 Unauthorized - Invalid Credentials

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 401 Unauthorized - Missing/Invalid Token

```json
{
  "statusCode": 401,
  "message": "Unauthorized access - valid JWT token required",
  "error": "Unauthorized"
}
```

### 409 Conflict - User Exists

```json
{
  "statusCode": 409,
  "message": "Username or email already exists",
  "error": "Conflict"
}
```

---

## Security Considerations

1. **Password Hashing**: Passwords are hashed with bcrypt using 10 rounds
2. **Token Storage**: Store tokens securely in HTTP-only cookies or secure storage
3. **HTTPS**: Always use HTTPS in production
4. **Secret Management**: Use strong, randomly generated JWT_SECRET
5. **Token Expiry**: Set appropriate expiry times (7 days recommended)
6. **CORS**: Configure CORS appropriately for your frontend

---

## Integration with Other Modules

Once the auth module is set up, other modules can protect their endpoints:

```typescript
// Example: In any controller
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('scoring')
export class ScoringController {
  @Post('submit')
  @UseGuards(JwtAuthGuard)
  submitScore(@Req() req) {
    const userId = req.user.id;
    // ... rest of implementation
  }
}
```

---

## Testing the Auth Module

### Register a user

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

### Access a protected route

```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer <your-access-token>"
```

---

## Running the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production build
npm run build

# Production mode
npm run start:prod
```

---

## Troubleshooting

### Token validation fails
- Ensure `JWT_SECRET` matches between token generation and validation
- Check token hasn't expired (verify `JWT_EXPIRY` configuration)
- Verify Authorization header format: `Bearer <token>`

### Database connection issues
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check user permissions and database existence

### bcrypt errors
- Ensure bcrypt is installed: `npm list bcrypt`
- Rebuild native modules if needed: `npm rebuild bcrypt`

---

## Next Steps

1. Add email verification for registration
2. Implement password reset functionality
3. Add refresh token mechanism
4. Implement role-based access control (RBAC)
5. Add rate limiting on auth endpoints
6. Implement two-factor authentication (2FA)
