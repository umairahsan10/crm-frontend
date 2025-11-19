# Error Boundary Component

A robust React Error Boundary implementation that catches component errors and displays user-friendly error messages.

## 📖 What Does It Do?

### **The Problem It Solves:**
Without Error Boundaries, when a React component crashes:
- ❌ **White screen of death** - User sees blank page
- ❌ **No error message** - User doesn't know what happened
- ❌ **App completely broken** - User has to refresh manually
- ❌ **No recovery options** - User is stuck

### **What Error Boundary Provides:**
- ✅ **Friendly error UI** - User sees a nice error message
- ✅ **Recovery options** - "Try Again", "Reload Page", "Go to Dashboard" buttons
- ✅ **Error logging** - Errors are logged for debugging
- ✅ **Automatic reset** - Resets when you navigate to a new page
- ✅ **Development details** - Shows error stack in development mode

## Features

- ✅ **Page-level and Component-level** error boundaries
- ✅ **Automatic error logging** with context
- ✅ **User-friendly error UI** with retry options
- ✅ **Reset on navigation** - automatically resets when route changes
- ✅ **Development mode** - shows detailed error stack traces
- ✅ **Production ready** - ready for error tracking service integration (Sentry, etc.)

---

## 🧪 How to Test

### **Method 1: Using the Test Component (Easiest)**

1. **Add the test component to any page temporarily:**

```tsx
// In any page file (e.g., src/pages/Dashboard/DashboardPage.tsx)
import ErrorBoundaryTest from '@/components/common/ErrorBoundary/ErrorBoundaryTest';

function DashboardPage() {
  return (
    <div>
      {/* Your existing content */}
      
      {/* Add this temporarily for testing */}
      <ErrorBoundaryTest />
    </div>
  );
}
```

2. **Run your app:**
```bash
npm run dev
```

3. **Navigate to the page** where you added the test component

4. **Click "Throw Error" button** - You should see the Error Boundary UI

5. **Click "Try Again"** - Component resets and works again

6. **Remove the test component** when done testing

### **Method 2: Manual Test in Any Component**

Add this code temporarily to any component:

```tsx
// Add this at the top of any component's render/return
const [testError, setTestError] = useState(false);

// Add this button somewhere in your JSX
<button onClick={() => setTestError(true)}>
  Test Error Boundary
</button>

// Add this condition that throws an error
{testError && (() => {
  throw new Error('Test error - Error Boundary should catch this!');
})()}
```

### **What You Should See When It Works:**

1. **Error UI appears** with:
   - ⚠️ Warning icon
   - "Oops! Something went wrong" message
   - Error message
   - Three buttons: "Try Again", "Reload Page", "Go to Dashboard"

2. **In Development Mode:**
   - Expandable "Error Details" section
   - Full error stack trace
   - Component stack trace

3. **In Browser Console:**
   - Error logged with 🚨 emoji
   - Full error details with context

---

## Usage

### Page-Level Error Boundary

Wrap your entire app or major sections:

```tsx
import { PageErrorBoundary } from '@/components/common/ErrorBoundary';

function App() {
  return (
    <PageErrorBoundary>
      <YourApp />
    </PageErrorBoundary>
  );
}
```

### Component-Level Error Boundary

Wrap individual components that might fail:

```tsx
import { ComponentErrorBoundary } from '@/components/common/ErrorBoundary';

function MyComponent() {
  return (
    <ComponentErrorBoundary>
      <ComplexComponent />
    </ComponentErrorBoundary>
  );
}
```

### Advanced Usage

#### Custom Fallback UI

```tsx
<ErrorBoundary
  fallback={
    <div>
      <h2>Custom Error Message</h2>
      <button onClick={handleRetry}>Retry</button>
    </div>
  }
>
  <YourComponent />
</ErrorBoundary>
```

#### Reset on Route Change

```tsx
<PageErrorBoundary resetKeys={[location.pathname]}>
  <Routes>
    {/* Routes */}
  </Routes>
</PageErrorBoundary>
```

#### Reset on Props Change

```tsx
<ErrorBoundary resetOnPropsChange resetKeys={[userId]}>
  <UserProfile userId={userId} />
</ErrorBoundary>
```

#### Error Callback

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Custom error handling
    console.log('Caught error:', error);
    // Send to analytics, etc.
  }}
>
  <YourComponent />
</ErrorBoundary>
```

---

## Examples

### Wrapping a Table Component

```tsx
import { ComponentErrorBoundary } from '@/components/common/ErrorBoundary';

function DataTablePage() {
  return (
    <div>
      <h1>Data Table</h1>
      <ComponentErrorBoundary>
        <DynamicTable data={data} columns={columns} />
      </ComponentErrorBoundary>
    </div>
  );
}
```

### Wrapping Dashboard Widgets

```tsx
function Dashboard() {
  return (
    <div className="dashboard-grid">
      <ComponentErrorBoundary>
        <RevenueWidget />
      </ComponentErrorBoundary>
      
      <ComponentErrorBoundary>
        <SalesChart />
      </ComponentErrorBoundary>
      
      <ComponentErrorBoundary>
        <ActivityFeed />
      </ComponentErrorBoundary>
    </div>
  );
}
```

---

## Error Logging

Errors are automatically logged via `errorLogger`. In development, errors are logged to console. In production, you can integrate with error tracking services.

### Integration with Sentry (Example)

```typescript
// src/utils/errorLogger.ts
import * as Sentry from '@sentry/react';

// In the logError method:
if (IS_PRODUCTION) {
  Sentry.captureException(errorInfo.error, {
    contexts: { 
      react: { 
        componentStack: errorInfo.errorInfo?.componentStack 
      } 
    },
    extra: errorInfo.context,
  });
}
```

---

## API Reference

### ErrorBoundary Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Components to wrap |
| `fallback` | `ReactNode` | `undefined` | Custom error UI |
| `onError` | `(error: Error, errorInfo: ErrorInfo) => void` | `undefined` | Error callback |
| `resetKeys` | `Array<string \| number>` | `[]` | Keys that trigger reset |
| `resetOnPropsChange` | `boolean` | `false` | Reset when props change |
| `level` | `'page' \| 'component'` | `'component'` | Error boundary level |

### Convenience Components

- `PageErrorBoundary` - Pre-configured for page-level errors
- `ComponentErrorBoundary` - Pre-configured for component-level errors

---

## Best Practices

1. **Wrap at the App level** - Always have a page-level boundary at the root
2. **Wrap critical components** - Add component-level boundaries for complex components
3. **Use resetKeys** - Reset boundaries when relevant data changes
4. **Don't overuse** - Too many boundaries can hide real issues
5. **Test error scenarios** - Verify boundaries work in development

---

## Real-World Scenarios

### Scenario 1: API Data Error
```tsx
// Component tries to access undefined data
function UserProfile({ userId }) {
  const user = users.find(u => u.id === userId);
  return <div>{user.name}</div>; // Crashes if user is undefined
}
```

**Without Error Boundary:** White screen  
**With Error Boundary:** Nice error UI with retry option

### Scenario 2: Rendering Error
```tsx
// Component tries to render invalid data
function PriceDisplay({ price }) {
  return <div>${price.toFixed(2)}</div>; // Crashes if price is null
}
```

**Without Error Boundary:** White screen  
**With Error Boundary:** Error UI, user can try again

---

## Notes

- Error boundaries **do not catch** errors in:
  - Event handlers
  - Asynchronous code (setTimeout, promises)
  - Server-side rendering
  - Errors thrown in the error boundary itself

- For these cases, use try-catch blocks or error handling in your code.

---

## Troubleshooting

### Error Boundary not catching errors?
- Make sure error is thrown during **render** (not in event handler)
- Check that ErrorBoundary wraps the component
- Verify error is a React component error (not async/event handler)

### Still seeing white screen?
- Check browser console for errors
- Verify ErrorBoundary is imported correctly
- Make sure ErrorBoundary CSS is loaded

### Error UI not showing?
- Check if custom fallback is provided
- Verify CSS file is imported
- Check browser console for CSS errors

---

## Quick Test Checklist

- [ ] Add test component to a page
- [ ] Click "Throw Error" button
- [ ] See Error Boundary UI (not white screen)
- [ ] Check console for error log
- [ ] Click "Try Again" - component resets
- [ ] Navigate to different page - error resets
- [ ] Remove test component
- [ ] ✅ Error Boundary is working!
