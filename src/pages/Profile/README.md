# Profile Page

This directory contains the complete profile management functionality for the CRM application.

## Components

### ProfilePage.tsx
The main profile page component that displays and manages user profile information.

**Features:**
- View profile information (personal and work details)
- Edit profile with form validation
- Change password functionality
- Theme toggle (Dark/Light mode)
- Avatar upload
- Responsive design with Tailwind CSS

### ProfileEditForm.tsx
A comprehensive form component for editing profile details.

**Fields:**
- Personal Information: Name, Email, Phone, Address
- Work Information: Department, Role, Employee ID, Start Date, Manager
- Preferences: Theme selection
- Avatar upload with image preview

**Validation:**
- Required field validation
- Email format validation
- Phone number format validation
- Real-time error feedback

## Navigation

The profile page is accessible through:
1. **Header Dropdown**: Click on the user avatar/name in the top-right corner
2. **Sidebar Navigation**: Available in the main navigation menu for all roles
3. **Direct URL**: `/profile`

## Permissions

All user roles can access their own profile page:
- Admin
- HR
- Accountant
- Sales
- Production
- Marketing
- Department Manager
- Employee

## Theme Integration

The profile page integrates with the global theme context:
- Theme toggle switches between light and dark modes
- Theme preference is saved to localStorage
- All components support both light and dark themes

## API Integration

The profile page is designed to work with backend APIs for:
- Fetching user profile data
- Updating profile information
- Changing passwords
- Uploading avatars

Currently uses mock data and console logging for demonstration purposes.

## Styling

Uses Tailwind CSS for responsive design:
- Mobile-first approach
- Dark mode support
- Consistent with the application's design system
- Custom CSS animations and transitions

## Usage

```tsx
import ProfilePage from './pages/Profile/ProfilePage';

// In your routing
<Route path="/profile" element={<ProfilePage />} />
```

The profile page automatically loads user data from the AuthContext and provides a complete profile management interface.
