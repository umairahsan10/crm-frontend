# JWT Authentication Integration Setup

This document explains how to integrate your frontend with the JWT authentication backend.

## Backend Integration

### 1. API Configuration

The frontend is configured to connect to your JWT backend. Update the API URL in `src/apis/login.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000
```

### 3. Backend Endpoints Expected

The frontend expects these endpoints from your backend:

- `POST /auth/login` - User login
- `POST /auth/logout` - User logout  
- `POST /auth/verify` - Token verification

### 4. Login Response Format

The frontend expects this response format from `/auth/login`:

```typescript
{
  access_token: string;
  user: {
    sub: number;           // User ID
    role: string;          // User role
    type: 'admin' | 'employee';
    department?: string;   // Department name (for employees)
    permissions?: Record<string, boolean>; // User permissions
  };
}
```

## User Types and Routing

### Admin Users
- Type: `admin`
- Redirected to: `/dashboard/admin`
- No department required

### Employee Users
- Type: `employee`
- Redirected based on department:
  - `Sales` → `/dashboard/sales`
  - `Production` → `/dashboard/production`
  - `Marketing` → `/dashboard/marketing`
  - `HR` → `/dashboard/hr`
  - `Accounts` → `/dashboard/accountant`

## Dashboard Components

Each department has its own dashboard component with relevant dummy data:

- `AdminDashboard` - Overall system statistics
- `SalesDashboard` - Sales performance, deals, targets
- `HRDashboard` - Employee management, attendance, requests
- `ProductionDashboard` - Project management, team performance
- `MarketingDashboard` - Campaigns, leads, content performance
- `AccountantDashboard` - Financial data, budgets, transactions

## Testing the Integration

1. Start your JWT backend server
2. Update the API URL if needed
3. Run the frontend: `npm run dev`
4. Try logging in with valid credentials from your database
5. Check browser console for any API errors

## Troubleshooting

- **CORS Issues**: Ensure your backend allows requests from the frontend URL
- **API URL**: Verify the `VITE_API_URL` environment variable is correct
- **Token Storage**: Tokens are stored in localStorage as `crm_token`
- **User Data**: User data is stored in localStorage as `crm_user`

## Security Notes

- Tokens are automatically verified on app load
- Expired tokens are cleared from storage
- All API calls include the Authorization header when authenticated
- Logout clears both token and user data from storage
