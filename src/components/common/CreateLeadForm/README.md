# CreateLeadForm Component

A dynamic form component for creating new leads in the CRM system.

## Features

- **Dynamic Form Fields**: Uses the reusable Form component with predefined field configurations
- **API Integration**: Connects to the backend `/leads` endpoint for lead creation
- **Validation**: Built-in form validation with error handling
- **Sales Unit Integration**: Fetches and displays available sales units
- **Responsive Design**: Mobile-friendly form layout
- **Loading States**: Shows loading indicators during API calls

## Usage

```tsx
import CreateLeadForm from '../../components/common/CreateLeadForm/CreateLeadForm';

<CreateLeadForm
  onSuccess={(lead) => console.log('Lead created:', lead)}
  onError={(error) => console.error('Error:', error)}
  className="custom-class"
/>
```

## Props

- `onSuccess?: (lead: Lead) => void` - Callback when lead is successfully created
- `onError?: (error: string) => void` - Callback when an error occurs
- `className?: string` - Additional CSS classes

## Form Fields

The form includes the following fields based on the API specification:

1. **Name** (required) - Lead's full name
2. **Email** (required) - Lead's email address with validation
3. **Phone** (required) - Lead's phone number
4. **Source** (required) - Lead source (PPC, Organic, Referral, etc.)
5. **Type** (required) - Lead type (warm, hot, cold, qualified, unqualified)
6. **Sales Unit** (required) - Assigned sales unit (fetched from API)

## API Integration

The component integrates with the following endpoints:

- `POST /leads` - Create a new lead
- `GET /sales-units` - Fetch available sales units

## Styling

The component uses CSS modules with the following key classes:

- `.create-lead-form` - Main container
- `.form-loading` - Loading state
- `.loading-spinner` - Spinner animation

## Error Handling

- Network errors are caught and passed to the `onError` callback
- Form validation errors are displayed inline
- API errors are handled gracefully with user-friendly messages
