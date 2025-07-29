# HR & Admin Management System

A comprehensive React TypeScript application for managing employees, attendance, payroll, sales, and financial operations.

## 🚀 Features

### Core Modules
- **Dashboard** - Overview with key metrics and charts
- **Employee Management** - CRUD operations for employee data
- **Attendance Logs** - Track employee attendance and status
- **Payroll Management** - Salary calculations and deductions
- **Sales Tracking** - Sales targets and bonus calculations
- **Financial Summary** - Income, expenses, and reports
- **Chargeback Approval** - Refund request workflow
- **System Settings** - Role-based access control

### Role-Based Access
- **Admin** - Full access to all modules
- **HR** - Employee and attendance management
- **Accountant** - Financial and payroll access
- **Employee** - Limited dashboard access

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: CSS Modules + Custom CSS
- **State Management**: React Hooks
- **Date Handling**: date-fns
- **Build Tool**: Vite
- **Package Manager**: npm

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components

│   │   ├── StatusBadge.tsx
│   │   ├── Modal.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Dropdown.css
│   │   ├── Notification.tsx
│   │   ├── Notification.css
│   │   ├── Kanban.tsx
│   │   ├── Kanban.css
│   │   ├── Chart.tsx
│   │   ├── Chart.css
│   │   ├── ChatBox.tsx
│   │   ├── ChatBox.css
│   │   ├── FilterBar.tsx
│   │   └── FilterBar.css
│   │   └── ...
│   ├── Layout.tsx          # Main layout wrapper
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── Header.tsx          # Top header bar
│   └── DashboardCard.tsx   # Dashboard metric cards
├── pages/                  # Page components
│   ├── DashboardPage.tsx
│   ├── EmployeesPage.tsx
│   ├── AttendancePage.tsx
│   ├── PayrollPage.tsx
│   ├── SalesPage.tsx
│   ├── FinancialPage.tsx
│   ├── ChargebacksPage.tsx
│   └── SettingsPage.tsx
├── types/                  # TypeScript type definitions
│   └── index.ts
├── utils/                  # Utility functions
│   ├── constants.ts        # App constants
│   └── helpers.ts          # Helper functions
├── hooks/                  # Custom React hooks
├── services/               # API services
├── styles/                 # Global styles
└── assets/                 # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm 8+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crm-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎯 Development Guidelines

### Component Structure
- Use functional components with TypeScript
- Implement proper prop interfaces
- Follow naming conventions: PascalCase for components
- Keep components focused and reusable

### Styling Guidelines
- Use CSS Modules for component-specific styles
- Follow BEM methodology for class naming
- Maintain consistent color scheme and spacing
- Ensure responsive design for all components

### State Management
- Use React hooks for local state
- Implement proper error handling
- Follow React best practices for state updates
- Use context for global state when needed

### TypeScript Best Practices
- Define proper interfaces for all data structures
- Use type guards for runtime type checking
- Avoid `any` type - use proper typing
- Export types from dedicated type files

## 📋 Component Development Checklist

### For Each New Component:
- [ ] Create TypeScript interface for props
- [ ] Implement proper error boundaries
- [ ] Add loading states where needed
- [ ] Include proper accessibility attributes
- [ ] Test responsive behavior
- [ ] Add hover and focus states
- [ ] Implement proper keyboard navigation
- [ ] Add proper ARIA labels

### For Each New Page:
- [ ] Implement role-based access control
- [ ] Add proper page title and meta tags
- [ ] Include breadcrumb navigation
- [ ] Add proper error handling
- [ ] Implement loading states
- [ ] Add proper form validation
- [ ] Include success/error notifications

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=HR Admin System
VITE_APP_VERSION=1.0.0
```

### Constants Configuration
Update `src/utils/constants.ts` for:
- Company information
- Default settings
- API endpoints
- Role permissions

## 📊 Data Models

### Employee
```typescript
interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  salary: number;
  startDate: string;
  isActive: boolean;
  managerId?: string;
  avatar?: string;
}
```

### Attendance
```typescript
interface AttendanceLog {
  id: string;
  employeeId: string;
  date: string;
  status: 'present' | 'late' | 'absent' | 'remote' | 'leave';
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}
```

### Payroll
```typescript
interface SalaryRecord {
  id: string;
  employeeId: string;
  month: string;
  year: string;
  baseSalary: number;
  deductions: number;
  bonuses: number;
  finalSalary: number;
  status: 'pending' | 'approved' | 'paid';
}
```

## 🎨 UI Components

### StatusBadge
```tsx
<StatusBadge 
  status="present" 
  type="attendance" 
  size="md" 
  showIcon={true} 
/>
```

### Dropdown
```tsx
<Dropdown
  options={countries}
  value={selectedCountry}
  placeholder="Select a country..."
  searchable={true}
  onChange={handleChange}
/>
```

### Notification
```tsx
<Notification
  visible={isVisible}
  type="success"
  title="Success!"
  message="Operation completed successfully."
  position="top-right"
  autoDismiss={true}
  dismissTimeout={5000}
  onClose={handleClose}
/>
```

### Kanban Board
```tsx
<Kanban
  board={board}
  draggable={true}
  allowAddCards={true}
  allowDeleteCards={true}
  onCardAdd={handleCardAdd}
  onCardMove={handleCardMove}
  onCardDelete={handleCardDelete}
/>
```

### Chart Component
```tsx
<Chart
  config={chartConfig}
  title="Sales Data"
  interactive={true}
  showLegend={true}
  onSend={handleSend}
/>
```

### ChatBox Component
```tsx
<ChatBox
  messages={messages}
  currentUser={currentUser}
  title="Team Chat"
  onSend={handleSend}
  onReceive={handleReceive}
  allowFileUpload={true}
/>
```

### FilterBar Component
```tsx
<FilterBar
  title="Product Filters"
  filters={filterItems}
  layout="horizontal"
  theme="default"
  showReset={true}
  showSubmit={true}
  onChange={handleFilterChange}
  onSubmit={handleSubmit}
/>
```
### Modal
```tsx
<Modal 
  isOpen={isOpen} 
  onClose={onClose} 
  title="Add Employee" 
  size="lg"
>
  {/* Modal content */}
</Modal>
```

## 🔐 Role-Based Access Control

### Permission System
- Each role has specific permissions
- Permissions are checked at component level
- Unauthorized access shows appropriate messages
- Admin can manage role permissions

### Role Permissions
```typescript
const ROLE_PERMISSIONS = {
  admin: ['view_dashboard', 'manage_employees', 'manage_payroll', ...],
  hr: ['view_dashboard', 'manage_employees', 'view_attendance', ...],
  accountant: ['view_dashboard', 'view_financial', 'manage_payroll', ...],
  employee: ['view_dashboard']
};
```

## 📱 Responsive Design

### Breakpoints
- Mobile: < 480px
- Tablet: 480px - 768px
- Desktop: > 768px

### Mobile-First Approach
- Design for mobile first
- Use CSS Grid and Flexbox
- Implement touch-friendly interactions
- Optimize for different screen sizes

## 🧪 Testing Strategy

### Unit Testing
- Test individual components
- Test utility functions
- Test custom hooks
- Use React Testing Library

### Integration Testing
- Test component interactions
- Test form submissions
- Test navigation flows
- Test API integrations

## 🚀 Deployment

### Build Process
```bash
npm run build
```

### Production Considerations
- Optimize bundle size
- Implement code splitting
- Add proper caching headers
- Configure CDN for static assets

## 🤝 Contributing

### Development Workflow
1. Create feature branch from `main`
2. Implement feature with proper testing
3. Update documentation
4. Create pull request
5. Code review and approval
6. Merge to main branch

### Code Review Checklist
- [ ] TypeScript types are properly defined
- [ ] Components are properly tested
- [ ] Styling follows design system
- [ ] Accessibility requirements met
- [ ] Performance considerations addressed
- [ ] Documentation updated

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)

### Design System
- Color palette defined in constants
- Typography scale established
- Spacing system implemented
- Component library documented

## 🐛 Troubleshooting

### Common Issues
1. **TypeScript errors**: Check type definitions in `src/types/`
2. **Styling issues**: Verify CSS class names and specificity
3. **Build errors**: Clear node_modules and reinstall dependencies
4. **Performance issues**: Check bundle size and implement code splitting

### Debug Tools
- React Developer Tools
- TypeScript compiler
- Browser DevTools
- Vite DevTools

## 📞 Support

For questions or issues:
1. Check existing documentation
2. Review component examples
3. Consult team members
4. Create issue in repository

---

**Happy Coding! 🎉**
