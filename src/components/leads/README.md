# Leads Creation Components

This directory contains components for creating leads in the CRM system, including both manual creation and bulk CSV upload functionality.

## Components

### LeadsCreationPage
The main page component that provides access to leads creation functionality. It includes:
- Role-based access control (restricted to sales managers)
- Toggle between manual creation and CSV upload modes
- Clean, user-friendly interface

**Access Requirements:**
- Admin users
- Department managers
- Team leads
- Users with sales department access

### CreateLeadForm
Reusable form component for manually creating individual leads. Features:
- Form validation
- Integration with sales units API
- Success/error handling
- Responsive design

**Required Fields:**
- Full Name
- Email Address
- Phone Number
- Lead Source (PPC, SMM)
- Lead Type (warm, cold)
- Sales Unit

### CsvUploadComponent
Advanced CSV upload component with comprehensive validation and processing. Features:

**Upload Process:**
1. File selection with CSV format validation
2. Automatic parsing and preview
3. Data validation against business rules
4. Batch processing with individual error handling
5. Success/failure reporting

**Validation Features:**
- Required field checking
- Email format validation
- Phone number format validation
- Enum value validation (source, type, sales unit)
- Row-by-row error reporting
- Data preview before upload

**CSV Format Requirements:**
```
Required columns: name, email, phone, source, type, salesunit

Source options: PPC, SMM
Type options: warm, cold
Sales Unit options: [Dynamic from API]
```

### CsvTemplateDownload
Utility component that provides a downloadable CSV template with:
- Correct column headers
- Sample data
- Proper formatting
- One-click download functionality

## Usage

### Manual Lead Creation
1. Navigate to `/leads/create`
2. Select "Manual Creation" mode
3. Fill out the form with lead information
4. Click "Create Lead"

### CSV Upload
1. Navigate to `/leads/create`
2. Select "CSV Upload" mode
3. Download the CSV template (optional)
4. Prepare your CSV file with the required format
5. Click "Choose CSV File" and select your file
6. Review validation results and preview data
7. Click "Upload X Leads" to process

## API Integration

The components integrate with the following APIs:
- `createLeadApi`: Creates individual leads
- `getSalesUnitsApi`: Fetches available sales units

## Error Handling

### Manual Creation
- Form validation errors
- API error responses
- Network connectivity issues

### CSV Upload
- File format validation
- Column header validation
- Data type validation
- Individual row validation
- Batch processing errors
- API response errors

## Security

- Role-based access control
- Input validation and sanitization
- File type restrictions (CSV only)
- Data format validation
- Error message sanitization

## Performance

- Lazy loading of sales units
- Batch processing with progress indication
- Memory-efficient CSV parsing
- Optimized re-renders
- Error boundary protection

## Accessibility

- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Responsive design
- Clear error messaging

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- File API support required for CSV upload
- ES6+ features utilized
- Responsive design for mobile devices