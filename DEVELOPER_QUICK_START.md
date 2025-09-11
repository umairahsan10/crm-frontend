# 🚀 Developer Quick Start Guide

## 🎯 Getting Started

### 1. Understanding the Structure
- **Pages**: Each main feature has its own page (Dashboard, Employees, etc.)
- **Components**: Each page has skeleton components to start with
- **Role-Based**: Same page shows different content based on user role
- **URLs**: Each page has its own URL (e.g., `/dashboard`, `/employees`)
- **Navigation**: Main pages in sidebar, Profile/Settings in dropdown

### 2. Available User Roles for Testing
```
Admin: admin@company.com / admin123
HR: hr@company.com / hr123  
Accountant: accountant@company.com / acc123
Employee: employee@company.com / emp123
```

### 3. Page Access by Role
| Page | Admin | HR | Accountant | Employee | Access Method |
|------|-------|----|-----------|----------|---------------| 
| Dashboard | ✅ | ✅ | ✅ | ✅ | Sidebar |
| Employees | ✅ | ✅ | ❌ | ❌ | Sidebar |
| Attendance | ✅ | ✅ | ❌ | ✅ | Sidebar |
| Deals | ✅ | ✅ | ❌ | ✅ | Sidebar |
| Sales | ✅ | ✅ | ❌ | ❌ | Sidebar |
| Leads | ✅ | ✅ | ❌ | ❌ | Sidebar |
| Settings | ✅ | ❌ | ❌ | ❌ | Dropdown only |
| Profile | ✅ | ✅ | ✅ | ✅ | Dropdown + Header |

## 🛠️ Development Workflow

### Step 1: Pick Your Page
Choose which page you want to work on:
- `src/pages/Dashboard/` - Main dashboard (DashboardPage.tsx)
- `src/pages/Employees/` - Employee management (EmployeesPage.tsx)
- `src/pages/Attendance/` - Attendance tracking (AttendancePage.tsx)
- `src/pages/Deals/` - Deal management (DealsPage.tsx)
- `src/pages/Sales/` - Sales reports (ReportsPage.tsx)
- `src/pages/Leads/` - Lead management (LeadsPage.tsx)
- `src/pages/Settings/` - System settings (SettingsPage.tsx)
- `src/pages/Profile/` - User profile (coming soon)

### Step 2: Understand the Structure
Each page follows this pattern:
```
PageName/
├── PageNamePage.tsx       # Main page (handles role-based rendering)
├── PageNamePage.css       # Page styles
└── components/
    ├── Component1.tsx     # First skeleton component
    └── Component2.tsx     # Second skeleton component
```

### Step 3: Build Your Components
1. **Edit the main page** (`PageNamePage.tsx`) to add your logic
2. **Build components** in the `components/` folder
3. **Reuse existing components** from `src/components/common/`

### Step 4: Test with Different Roles
1. **Start the app** → Should land on login page
2. **Login with different user roles** → Should see appropriate content
3. **Test navigation** → Sidebar and dropdown should work
4. **Test access control** → Unauthorized pages should show access denied

## 🧩 Component Development

### Reusing Existing Components
Before building new components, check these locations:
- `src/components/common/DataTable/` - For tables
- `src/components/common/Form/` - For forms
- `src/components/common/Button/` - For buttons
- `src/components/common/Modal/` - For modals

### Example: Building a Data Table
```typescript
import { DataTable } from '../../components/common/DataTable/DataTable';

const EmployeeList = () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department' },
  ];

  const data = [
    { id: 1, name: 'John Doe', email: 'john@company.com', department: 'HR' },
    // ... more data
  ];

  return (
    <DataTable 
      data={data}
      columns={columns}
      onRowClick={(row) => console.log('Clicked:', row)}
    />
  );
};
```

### Example: Building a Form
```typescript
import { Form } from '../../components/common/Form/Form';

const EmployeeForm = () => {
  const fields = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'department', label: 'Department', type: 'select', options: [
      { value: 'hr', label: 'HR' },
      { value: 'sales', label: 'Sales' },
    ]},
  ];

  return (
    <Form 
      fields={fields}
      onSubmit={(data) => console.log('Form data:', data)}
    />
  );
};
```

## 🔐 Role-Based Development

### Understanding Role-Based Rendering
Each page checks the user's role and renders different components:

```typescript
const renderPage = () => {
  switch (user.role) {
    case 'admin':
      return <AdminView />;      // Full access
    case 'hr':
      return <HRView />;         // HR permissions
    case 'employee':
      return <EmployeeView />;   // Limited access
    default:
      return <AccessDenied />;   // No access
  }
};
```

### Testing Different Roles
1. **Login as Admin**: See all features
2. **Login as HR**: See HR-related features
3. **Login as Employee**: See limited features
4. **Login as Accountant**: See financial features

## 📝 Common Tasks

### Adding a New Page
1. Create folder: `src/pages/NewPage/`
2. Create main file: `NewPagePage.tsx`
3. Create CSS file: `NewPagePage.css`
4. Create components folder: `components/`
5. Add to navigation: `constants.ts` (if needed)
6. Add route: `App.tsx`

### Adding a New Component
1. Create file: `ComponentName.tsx`
2. Import and use in page
3. Follow naming conventions
4. Add TypeScript types

### Modifying Existing Components
1. Check if it's used elsewhere
2. Make changes carefully
3. Test with different roles
4. Update documentation if needed

### Profile and Settings Pages
- **Profile**: Accessible via dropdown and header button
- **Settings**: Only accessible via dropdown (admin only)
- **No sidebar navigation**: These don't appear in main navigation

## 🐛 Troubleshooting

### Page Not Loading
- Check if route exists in `App.tsx`
- Verify user has permission
- Check browser console for errors
- Ensure you're logged in (should redirect to login if not)

### Component Not Rendering
- Check import statements
- Verify component is exported
- Check user role permissions
- Ensure AuthContext is properly set up

### Navigation Issues
- Check if path is correct in `constants.ts`
- Verify React Router setup
- Check user permissions
- Test both sidebar and dropdown navigation

### Role-Based Access Issues
- Verify user role in AuthContext
- Check role permissions in constants
- Ensure proper role checking logic
- Test with different user roles

### Profile/Settings Access Issues
- Check if user is admin (for Settings)
- Verify dropdown is working
- Test header profile button
- Check if pages are properly routed

## 📚 Resources

### Documentation
- `FRONTEND_ARCHITECTURE_GUIDE.md` - Complete architecture guide
- `DEVELOPER_QUICK_START.md` - This file
- Component documentation in each component folder

### Useful Links
- [React Router Documentation](https://reactrouter.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Team Communication
- Use clear commit messages
- Document your changes
- Ask questions when unsure
- Share knowledge with team

## 🎯 Success Checklist

Before considering your work complete:
- [ ] Page loads correctly
- [ ] Role-based rendering works
- [ ] Navigation functions properly (sidebar + dropdown)
- [ ] Components are reusable
- [ ] TypeScript types are correct
- [ ] No console errors
- [ ] Responsive design works
- [ ] Tested with multiple user roles
- [ ] Login flow works (redirects to login first)
- [ ] Profile/Settings access works (dropdown + header)
- [ ] Access control works (unauthorized users see access denied)

---

**Happy Coding! 🚀**

Remember: This is a team effort. Don't hesitate to ask for help or share your knowledge with others.
