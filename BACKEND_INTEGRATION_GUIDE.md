# Backend Integration Guide

This guide explains how the frontend authentication system integrates with your NestJS backend.

## Backend API Endpoints Required

Your backend already has the necessary endpoints. Here's how they're used:

### 1. Login Endpoint
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "sub": 1,
    "role": "admin",
    "type": "admin",
    "department": "admin",
    "permissions": {
      "attendance_permission": true,
      "salary_permission": false,
      // ... other permissions
    }
  }
}
```

### 2. Profile Endpoint (Token Verification)
```
GET /auth/profile
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": 1,
  "role": "admin",
  "type": "admin",
  "department": "admin",
  "permissions": {
    "attendance_permission": true,
    "salary_permission": false
  }
}
```

### 3. Logout Endpoint
```
POST /auth/logout
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Successfully logged out",
  "success": true
}
```

## Frontend-Backend Integration

### 1. Token Management
- **JWT Expiration**: 7 days (matches your backend configuration)
- **Storage**: HttpOnly cookies for security
- **Validation**: Uses `/auth/profile` endpoint to verify token validity

### 2. Authentication Flow
1. User submits login credentials
2. Frontend calls `POST /auth/login`
3. Backend validates credentials and returns JWT + user data
4. Frontend stores JWT and user data in secure cookies
5. All subsequent API calls include JWT in Authorization header

### 3. Session Management
- **Token Validation**: Every 30 minutes, frontend validates token with `/auth/profile`
- **Expiration Handling**: If token is expired, user is automatically logged out
- **Multi-tab Sync**: Login/logout in one tab affects all tabs

## Security Features

### 1. Cookie Security
```typescript
// JWT token stored in HttpOnly cookie
setCookie('crm_token', token, {
  httpOnly: true,    // Not accessible via JavaScript
  secure: true,      // HTTPS only in production
  sameSite: 'strict' // CSRF protection
});
```

### 2. API Request Security
- All API requests automatically include JWT token
- Token validation before each request
- Automatic logout on token expiration

## Environment Configuration

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

### Backend (.env)
```env
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## Error Handling

### 1. Authentication Errors
- **401 Unauthorized**: Token expired or invalid → Auto logout
- **403 Forbidden**: Insufficient permissions → Show error message
- **Network Error**: Connection issues → Retry or show error

### 2. Token Expiration
- Frontend checks token expiration before API calls
- If expired, user is automatically logged out
- No manual refresh needed (7-day tokens)

## Testing the Integration

### 1. Login Flow
```bash
# Test login with your backend
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### 2. Token Verification
```bash
# Test token verification
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 3. Logout
```bash
# Test logout
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Frontend API Client Usage

### 1. Making Authenticated Requests
```typescript
// Automatic token inclusion
const users = await apiGetJson<User[]>('/api/users');
const result = await apiPostJson('/api/data', payload);
```

### 2. Error Handling
```typescript
try {
  const data = await apiGetJson('/api/protected-endpoint');
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      // User will be automatically logged out
      console.log('Token expired');
    }
  }
}
```

## Backend Recommendations

### 1. CORS Configuration
Ensure your backend allows credentials:
```typescript
app.enableCors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true, // Important for cookies
});
```

### 2. JWT Configuration
Your current configuration is perfect:
```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: '7d' },
})
```

### 3. Additional Endpoints (Optional)
Consider adding these for better UX:
- `POST /auth/refresh` - For token refresh (if needed)
- `GET /auth/verify` - Dedicated token verification endpoint

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `credentials: true` in CORS config
   - Check origin URLs match exactly

2. **Cookie Not Set**
   - Check if backend is running on HTTPS in production
   - Verify cookie domain settings

3. **Token Validation Fails**
   - Check JWT secret matches between frontend/backend
   - Verify token format and expiration

4. **API Calls Fail**
   - Check if Authorization header is included
   - Verify token is not expired

### Debug Mode
Enable debug logging:
```typescript
localStorage.setItem('debug_auth', 'true');
```

This will log all authentication events to the console.

## Production Considerations

### 1. HTTPS Required
- Cookies with `secure: true` require HTTPS
- Ensure your production backend uses HTTPS

### 2. Domain Configuration
- Set proper cookie domain for production
- Consider subdomain authentication if needed

### 3. Token Security
- Use strong JWT secrets
- Consider token rotation for high-security applications
- Monitor for suspicious authentication patterns

## Support

If you encounter any issues:
1. Check browser console for errors
2. Verify backend API responses
3. Test with curl commands
4. Check network tab for failed requests

The frontend is designed to work seamlessly with your existing backend API structure!
