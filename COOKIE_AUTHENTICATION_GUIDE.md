# Cookie-Based Authentication System

This document explains the new cookie-based authentication system that replaces localStorage for improved security and session management.

## Overview

The authentication system has been upgraded from localStorage to secure cookies with the following improvements:

- **Security**: HttpOnly cookies prevent XSS attacks
- **Session Management**: Automatic token refresh and validation
- **Multi-tab Sync**: Consistent authentication state across all tabs
- **Route Protection**: Smart redirections based on authentication state
- **Error Handling**: Graceful handling of token expiration and API errors

## Key Components

### 1. Cookie Utilities (`src/utils/cookieUtils.ts`)

Provides secure cookie management functions:

```typescript
// Set authentication cookies
setAuthCookies(token, userData, refreshToken);

// Get authentication data
const { token, userData, refreshToken } = getAuthData();

// Clear all auth cookies
clearAuthCookies();

// Check authentication status
const isAuth = isAuthenticated();

// Token validation
const isExpired = isTokenExpired(token);
const needsRefresh = needsTokenRefresh(token);
```

### 2. API Client (`src/utils/apiClient.ts`)

Handles authenticated API requests with automatic token inclusion:

```typescript
// Make authenticated requests
const data = await apiGetJson<User[]>('/api/users');
const result = await apiPostJson<Response>('/api/data', payload);

// Request options
const response = await apiRequest('/api/endpoint', {
  requireAuth: true,  // Default: true
  timeout: 10000,     // Default: 10s
  headers: { 'Custom-Header': 'value' }
});
```

### 3. Enhanced AuthContext (`src/context/AuthContext.tsx`)

Provides the same interface as before but with improved functionality:

```typescript
const { 
  user, 
  isLoggedIn, 
  isLoading, 
  login, 
  logout, 
  hasPermission, 
  canAccessPage, 
  getDashboardRoute 
} = useAuth();
```

## New Features

### 1. Automatic Session Validation

- Validates tokens on app startup
- Checks token expiration before API calls
- Automatically refreshes tokens when needed

### 2. Token Refresh Mechanism

- Proactive token refresh (5 minutes before expiration)
- Automatic refresh on token expiry
- Fallback to logout if refresh fails

### 3. Multi-tab Synchronization

- Login/logout in one tab affects all tabs
- Consistent authentication state across tabs
- Uses localStorage events for cross-tab communication

### 4. Smart Route Protection

- Login page redirects if already authenticated
- Proper loading states during authentication checks
- Role-based dashboard redirections

## Security Improvements

### 1. HttpOnly Cookies

```typescript
// JWT tokens are stored in HttpOnly cookies
setCookie('crm_token', token, {
  httpOnly: true,    // Not accessible via JavaScript
  secure: true,      // HTTPS only
  sameSite: 'strict' // CSRF protection
});
```

### 2. Automatic Token Expiration

- Tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Automatic cleanup on expiration

### 3. CSRF Protection

- SameSite cookie attribute prevents CSRF attacks
- Secure cookie flag for HTTPS environments

## Usage Examples

### 1. Making Authenticated API Calls

```typescript
// Old way (localStorage)
const token = localStorage.getItem('crm_token');
const response = await fetch('/api/data', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// New way (automatic)
const data = await apiGetJson('/api/data');
```

### 2. Login Flow

```typescript
// Login function now includes refresh token
const { login } = useAuth();
login(userData, accessToken, refreshToken);
```

### 3. Error Handling

```typescript
try {
  const data = await apiGetJson('/api/data');
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      // Token expired, user will be automatically logged out
    }
  }
}
```

## Migration Notes

### What Changed

1. **Storage Method**: localStorage → HttpOnly cookies
2. **Token Management**: Manual → Automatic
3. **Session Validation**: None → Automatic
4. **Multi-tab Sync**: None → Automatic
5. **Route Protection**: Basic → Enhanced

### What Stayed the Same

1. **AuthContext Interface**: All existing code works unchanged
2. **Component Logic**: No changes needed in components
3. **Permission System**: Role-based permissions work identically
4. **Dashboard Routing**: Same routing logic

## Configuration

### Environment Variables

```env
VITE_API_URL=http://localhost:3000
```

### Cookie Settings

Cookies are configured with secure defaults:

- **Path**: `/` (available site-wide)
- **Secure**: `true` (HTTPS only in production)
- **SameSite**: `strict` (CSRF protection)
- **HttpOnly**: `true` (for tokens, false for user data)

## Troubleshooting

### Common Issues

1. **Token Expired Errors**
   - Check if refresh token is available
   - Verify token expiration times
   - Check network connectivity

2. **Multi-tab Issues**
   - Ensure localStorage events are working
   - Check browser security settings
   - Verify cookie settings

3. **API Call Failures**
   - Check if token is being included
   - Verify API endpoint URLs
   - Check network connectivity

### Debug Mode

Enable debug logging by setting:

```typescript
localStorage.setItem('debug_auth', 'true');
```

This will log authentication events to the console.

## Best Practices

1. **Always use the API client** for authenticated requests
2. **Handle ApiError exceptions** properly
3. **Don't access cookies directly** - use utility functions
4. **Test multi-tab scenarios** during development
5. **Monitor token refresh** in production

## Backend Requirements

The backend should support:

1. **JWT Token Generation** with proper expiration
2. **Refresh Token Endpoint** (`POST /auth/refresh`)
3. **Token Verification** (`POST /auth/verify`)
4. **Logout Endpoint** (`POST /auth/logout`)

## Performance Considerations

- **Token Refresh**: Happens proactively to avoid interruptions
- **API Calls**: Include timeout handling (10s default)
- **Memory Usage**: Minimal overhead compared to localStorage
- **Network**: Reduced API calls due to better caching

## Security Considerations

- **XSS Protection**: HttpOnly cookies prevent token theft
- **CSRF Protection**: SameSite attribute prevents cross-site attacks
- **Token Rotation**: Refresh tokens should be rotated on use
- **Secure Transport**: Always use HTTPS in production

This authentication system provides a robust, secure, and user-friendly experience while maintaining backward compatibility with existing code.
