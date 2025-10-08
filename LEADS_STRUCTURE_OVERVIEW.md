# 🎯 Complete Leads Structure Overview

## Table of Contents
1. [Database Architecture](#database-architecture)
2. [Data Models & Types](#data-models--types)
3. [API Structure](#api-structure)
4. [Frontend Components](#frontend-components)
5. [Business Logic & Workflows](#business-logic--workflows)
6. [Lead Lifecycle](#lead-lifecycle)

---

## Database Architecture

### Primary Tables

#### 1. **`leads`** - Main Lead Records
The core table storing all lead information.

| Column | Type | Description | Default Value |
|--------|------|-------------|---------------|
| `id` | INT (PK) | Unique lead identifier | Auto-increment |
| `name` | VARCHAR | Lead's full name | NULL |
| `email` | VARCHAR | Lead's email address | NULL |
| `phone` | VARCHAR | Lead's phone number | NULL |
| `source` | ENUM | Lead source: 'PPC', 'SMM' | NULL |
| `type` | ENUM | Lead type: 'warm', 'cold', 'upsell', 'push' | Required |
| `status` | ENUM | Current status | 'new' |
| `outcome` | ENUM | Last outcome | NULL |
| `failedCount` | INT | Number of denied attempts | 0 |
| `assignedToId` | INT (FK) | ID of assigned employee | NULL |
| `startedById` | INT (FK) | ID of employee who started | NULL |
| `crackedById` | INT (FK) | ID of employee who cracked | NULL |
| `closedById` | INT (FK) | ID of employee who closed | NULL |
| `salesUnitId` | INT (FK) | ID of sales unit | Required |
| `createdAt` | TIMESTAMP | Creation timestamp | Auto |
| `updatedAt` | TIMESTAMP | Last update timestamp | Auto |
| `closedAt` | TIMESTAMP | Completion timestamp | NULL |

**Relationships:**
- `assignedToId` → `employees.id`
- `startedById` → `employees.id`
- `crackedById` → `employees.id`
- `closedById` → `employees.id`
- `salesUnitId` → `sales_units.id`

---

#### 2. **`lead_comments`** - Lead Comments & Notes
Stores all comments and notes associated with leads.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Unique comment identifier |
| `leadId` | INT (FK) | Associated lead ID |
| `commentBy` | INT (FK) | Employee who made comment |
| `commentText` | TEXT | Comment content |
| `createdAt` | TIMESTAMP | Comment timestamp |
| `updatedAt` | TIMESTAMP | Last update timestamp |

**Relationships:**
- `leadId` → `leads.id`
- `commentBy` → `employees.id`

**Includes Employee Data:**
```typescript
employee: {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
```

---

#### 3. **`lead_outcome_history`** - Audit Trail
Tracks all outcome changes for complete audit trail.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Unique history record ID |
| `leadId` | INT (FK) | Associated lead ID |
| `outcome` | VARCHAR | Outcome value at that time |
| `changedBy` | INT (FK) | Employee who made the change |
| `commentId` | INT (FK) | Associated comment ID |
| `createdAt` | TIMESTAMP | Change timestamp |

**Relationships:**
- `leadId` → `leads.id`
- `changedBy` → `employees.id`
- `commentId` → `lead_comments.id`

**Includes Full Context:**
```typescript
changedByUser: {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
comment: {
  id: number;
  commentText: string;
  createdAt: string;
}
```

---

#### 4. **`cracked_leads`** - Converted Leads
Stores details of successfully converted leads (deals).

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Unique cracked lead identifier |
| `leadId` | INT (FK) | Original lead ID |
| `closedBy` | INT (FK) | Employee who closed the deal |
| `amount` | DECIMAL | Total deal amount |
| `commissionRate` | DECIMAL(5,2) | Commission percentage (5.0 = 5%) |
| `remainingAmount` | DECIMAL | Amount remaining to be paid |
| `industryId` | INT (FK) | Industry category ID |
| `description` | TEXT | Deal description |
| `totalPhases` | INT | Total project phases |
| `currentPhase` | INT | Current phase number |
| `crackedAt` | TIMESTAMP | Conversion timestamp |
| `createdAt` | TIMESTAMP | Record creation |
| `updatedAt` | TIMESTAMP | Last update |

**Relationships:**
- `leadId` → `leads.id`
- `closedBy` → `employees.id`
- `industryId` → `industries.id`

**Commission Calculation:**
```javascript
commission_amount = total_amount × (commission_rate ÷ 100)
```

---

#### 5. **`archive_leads`** - Failed Lead Archive
Stores leads that failed after 4 denied attempts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Archive record ID |
| `leadId` | INT | Original lead ID |
| `unitId` | INT | Sales unit ID |
| `source` | VARCHAR | Lead source |
| `outcome` | VARCHAR | Final outcome |
| `assignedTo` | INT | Last assigned employee |
| `qualityRating` | ENUM | Quality rating |
| `archivedAt` | TIMESTAMP | Archive timestamp |

**Quality Ratings:** 'excellent', 'very_good', 'good', 'bad', 'useless'

---

### Related Tables

#### **`sales_units`**
| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Sales unit ID |
| `name` | VARCHAR | Unit name |
| `description` | TEXT | Unit description |

#### **`employees`**
| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Employee ID |
| `firstName` | VARCHAR | First name |
| `lastName` | VARCHAR | Last name |
| `email` | VARCHAR | Email address |
| `phone` | VARCHAR | Phone number |
| `role` | ENUM | Employee role |
| `departmentId` | INT | Department ID |

#### **`industries`**
| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Industry ID |
| `name` | VARCHAR | Industry name |
| `description` | TEXT | Industry description |
| `isActive` | BOOLEAN | Active status |

#### **`sales_departments`**
| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Department ID |
| `name` | VARCHAR | Department name |
| `commissionRate` | DECIMAL | Default commission rate |

#### **`teams`**
| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Team ID |
| `name` | VARCHAR | Team name |
| `completedLeads` | INT | Count of completed leads |

---

## Data Models & Types

### TypeScript Interfaces

#### **Lead Interface** (Main Model)
```typescript
interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;           // 'PPC' | 'SMM'
  type?: LeadType;              // 'warm' | 'cold' | 'upsell' | 'push'
  salesUnitId: number;
  status?: LeadStatus;          // See LeadStatus below
  outcome?: LeadOutcome | null; // See LeadOutcome below
  createdAt: string;
  updatedAt: string;
  assignedTo?: string | { firstName: string; lastName: string };
  notes?: string;
}
```

#### **Lead Enums**

**LeadSource:**
- `'PPC'` - Pay-Per-Click advertising
- `'SMM'` - Social Media Marketing

**LeadType:**
- `'warm'` - Pre-qualified, interested leads
- `'cold'` - New, unqualified leads
- `'upsell'` - Existing customers for additional services
- `'push'` - Leads requiring senior sales rep attention

**LeadStatus:**
- `'new'` - Just created, unassigned
- `'in_progress'` - Assigned and being worked on
- `'completed'` - Successfully completed
- `'payment_link_generated'` - Payment link sent
- `'failed'` - Marked as failed
- `'cracked'` - Converted to deal

**LeadOutcome:**
- `'voice_mail'` - Left voicemail
- `'interested'` - Customer showed interest
- `'not_answered'` - No answer
- `'busy'` - Customer busy
- `'denied'` - Customer declined

#### **Create Lead Request**
```typescript
interface CreateLeadRequest {
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  type: LeadType;
  salesUnitId: number;
}
```

#### **Cracked Lead Interface**
```typescript
interface CrackLeadRequest {
  status: 'cracked';
  comment: string;
  totalAmount: number;
  industryId: number;
  description: string;
  totalPhases: number;
  currentPhase: number;
}
```

#### **Push Lead Interface**
```typescript
interface PushLeadRequest {
  action: 'push';
  comment: string;
}
```

---

## API Structure

### Base URL
```
http://localhost:3000/leads
```

### Authentication
All endpoints require JWT authentication:
```http
Authorization: Bearer <jwt_token>
```

### Endpoint Summary

| Method | Endpoint | Purpose | Access |
|--------|----------|---------|--------|
| **POST** | `/leads` | Create new lead | Sales, Admin |
| **GET** | `/leads` | Get all leads | Sales, HR, Admin |
| **GET** | `/leads/:id` | Get single lead | Sales, HR, Admin |
| **PUT** | `/leads/:id` | Update lead | Sales, Admin |
| **GET** | `/leads/my-leads` | Get user's leads | Sales |
| **POST** | `/leads/request` | Request 10 leads | Sales |
| **GET** | `/leads/cracked` | Get cracked leads | Sales, HR, Admin |
| **GET** | `/leads/cracked/:id` | Get single cracked lead | Sales, HR, Admin |
| **PUT** | `/leads/cracked/:id` | Update cracked lead | Sales, Admin |
| **GET** | `/leads/archived` | Get archived leads | Sales, HR, Admin |
| **POST** | `/leads/bulk-update` | Bulk update leads | Sales, Admin |
| **POST** | `/leads/bulk-delete` | Bulk delete leads | Admin |
| **GET** | `/leads/statistics/overview` | Get lead statistics | Sales, HR, Admin |
| **GET** | `/leads/filter-options/sales-units` | Get sales units | All |
| **GET** | `/leads/filter-options/employees` | Get employees | All |

### Role-Based Access Matrix

| User Type | Create | View | Update | Delete | Types Visible |
|-----------|--------|------|--------|--------|---------------|
| **Sales (Junior)** | ✅ | ✅ | ✅ | ❌ | warm, cold |
| **Sales (Senior)** | ✅ | ✅ | ✅ | ❌ | warm, cold, push |
| **Sales Manager** | ✅ | ✅ | ✅ | ✅ | All types |
| **HR** | ❌ | ✅ | ❌ | ❌ | All types |
| **Admin** | ✅ | ✅ | ✅ | ✅ | All types |
| **Other Depts** | ❌ | ❌ | ❌ | ❌ | None |

---

## Frontend Components

### Component Structure
```
src/
├── pages/Leads/
│   ├── LeadsPage.tsx                 # Main leads management page
│   ├── LeadsManagementPage.tsx       # Advanced management features
│   ├── LeadsCreationPage.tsx         # Lead creation page
│   └── components/
│       ├── LeadsList.tsx             # Leads list view
│       └── LeadsForm.tsx             # Lead form
│
└── components/leads/
    ├── LeadsTable.tsx                # Main leads table
    ├── CrackLeadsTable.tsx           # Cracked leads table
    ├── ArchiveLeadsTable.tsx         # Archived leads table
    ├── LeadDetailsDrawer.tsx         # Lead details sidebar
    ├── LeadsFilters.tsx              # Filter controls
    ├── LeadsSearchFilters.tsx        # Search & filter
    ├── LeadsStatistics.tsx           # Statistics dashboard
    ├── RequestLeadModal.tsx          # Request leads modal
    ├── BulkActions.tsx               # Bulk operations
    ├── CsvUploadComponent.tsx        # CSV upload
    ├── CsvTemplateDownload.tsx       # Template download
    ├── tableConfigs.ts               # Table configurations
    ├── filterConfigs.ts              # Filter configurations
    └── README.md                     # Component documentation
```

### Key Components

#### **LeadsTable.tsx**
Main table component displaying leads with:
- Contact information (name, email, phone)
- Status badges (color-coded)
- Type badges (warm/cold/push/upsell)
- Outcome badges
- Assigned employee
- Action buttons (view, edit)
- Sorting and pagination

#### **LeadDetailsDrawer.tsx**
Comprehensive sidebar showing:
- **Details Tab**: Full lead information
- **Timeline Tab**: Outcome history with timestamps
- **Comments Tab**: All comments with employee info
- **Update Tab**: Forms for updating outcome, status, or pushing lead

#### **CrackLeadsTable.tsx**
Specialized table for converted leads showing:
- Contact information
- Deal amount with currency formatting
- Phase progress (current/total)
- Commission calculation
- Industry information
- Closed by employee

#### **ArchiveLeadsTable.tsx**
Archive view showing:
- Contact information
- Source and outcome
- Quality rating
- Archived date
- Last assigned employee

#### **LeadsStatistics.tsx**
Dashboard statistics displaying:
- Total leads count
- Active leads
- Completed leads
- Failed leads
- Conversion rate
- Completion rate
- Breakdown by status (new, in_progress, completed, failed)
- Breakdown by type (warm, cold, push, upsell)
- Today's statistics (new, completed, in_progress)

#### **RequestLeadModal.tsx**
Modal for requesting new leads:
- Shows current assigned leads
- Allows selecting leads to keep
- Checkbox for including push leads
- Shows lead breakdown (warm/cold vs push)
- Displays total active leads count

#### **CsvUploadComponent.tsx**
Advanced CSV upload with:
- File validation (CSV only)
- Column header validation
- Data validation (email, phone, enums)
- Row-by-row error reporting
- Preview before upload
- Batch processing
- Success/failure reporting

---

## Business Logic & Workflows

### 1. Lead Creation Workflow
```
Create Lead → Assign to Sales Unit → Request Leads → Start Working
```

**Process:**
1. Sales manager creates lead (manual or CSV)
2. Lead gets `status: 'new'`, `type: 'warm' or 'cold'`
3. Lead sits in pool waiting for assignment
4. Salesperson requests leads
5. Lead gets assigned and `status` changes to `'in_progress'`

---

### 2. Lead Request Workflow
```
Request Leads → Keep Some → Circulate Others → Get New → Total = 10
```

**Process:**
1. Salesperson has active leads
2. Opens "Request Leads" modal
3. Selects which leads to keep
4. System circulates non-kept leads to pool
5. System assigns new leads to reach total of 10
6. New leads get `status: 'in_progress'`
7. Priority: warm leads first, then cold leads

**Business Rules:**
- Always maintain exactly 10 active leads per salesperson
- Only circulate leads without outcomes
- Circulated leads return to pool (`status: 'new'`, `assignedTo: null`)
- Warm leads assigned before cold leads

---

### 3. Lead Update Workflow
```
Update Outcome → Add Comment → Track in History
```

**Process:**
1. Salesperson contacts lead
2. Updates outcome (interested, denied, busy, etc.)
3. **Must** add comment explaining outcome
4. System creates record in `lead_outcome_history`
5. System links comment to history record
6. Timestamps automatically recorded

**Outcome Options:**
- `interested` → Potential for conversion
- `denied` → Customer declined (increments failedCount)
- `voice_mail` → Left message
- `busy` → Customer busy, try again
- `not_answered` → No response

---

### 4. Failed Lead Workflow
```
Denied Outcome → Increment failedCount → At 4 → Archive Lead
```

**Process:**
1. Lead gets outcome `'denied'`
2. `failedCount` incremented
3. Comment required explaining why
4. History record created
5. If `failedCount >= 4`:
   - Lead moved to `archive_leads` table
   - Lead removed from active leads
   - Quality rating assigned
   - Available for future analysis

---

### 5. Crack Lead Workflow (Conversion)
```
Interested Outcome → Crack Lead → Create Deal → Update Commission
```

**Process:**
1. Lead has outcome `'interested'`
2. Salesperson clicks "Crack Lead"
3. Fills out deal details:
   - Total amount
   - Industry
   - Description
   - Total phases
   - Current phase (usually 1)
4. System creates record in `cracked_leads` table
5. Lead `status` changes to `'cracked'`
6. `crackedById` set to current user
7. Commission rate fetched from sales department
8. Team's `completedLeads` count incremented

**Required Fields:**
- `totalAmount` - Deal value
- `industryId` - Industry category
- `description` - Deal description
- `totalPhases` - Number of project phases
- `currentPhase` - Current phase (1 to start)
- `comment` - Success comment

---

### 6. Complete Lead Workflow
```
Cracked Lead → Complete Phases → Mark Completed → Auto-Upsell
```

**Process:**
1. Cracked lead in progress
2. Phases completed one by one
3. When all phases done, update `status: 'completed'`
4. System automatically changes `type: 'upsell'`
5. Lead becomes available for upselling
6. Commission finalized
7. `closedAt` timestamp set

**Auto-Conversion:**
- Completed leads automatically become upsell opportunities
- Can be reassigned to sales team
- Targets existing customers for additional services

---

### 7. Push Lead Workflow
```
Difficult Lead → Push → Senior Rep → Status Reset
```

**Process:**
1. Junior salesperson struggling with lead
2. Clicks "Push Lead"
3. Adds comment explaining why push needed
4. System changes:
   - `type: 'push'`
   - `status: 'new'`
   - `assignedTo: null`
5. Lead visible only to senior sales reps
6. Senior rep requests leads including push leads
7. Senior rep takes over

**When to Push:**
- Lead too complex for junior rep
- Customer requires senior expertise
- Deal value too high for junior level
- Special requirements or considerations

---

### 8. Bulk Operations Workflow
```
Select Multiple → Choose Action → Apply → Individual Results
```

**Process:**
1. Select multiple leads (checkboxes)
2. Choose bulk action:
   - Update status
   - Update outcome
   - Push leads
   - Delete leads (admin only)
3. Fill in required data (e.g., comment)
4. System processes in parallel
5. Returns individual results for each lead
6. Shows success/failure counts

**Benefits:**
- Time-saving for repetitive operations
- Consistent updates across leads
- Error handling per lead
- Audit trail maintained

---

## Lead Lifecycle

### Complete Lead Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    LEAD LIFECYCLE DIAGRAM                       │
└─────────────────────────────────────────────────────────────────┘

1. CREATION
   ┌──────────────┐
   │ Manual Entry │
   │  or CSV      │──→ status: 'new'
   │   Upload     │    type: 'warm' or 'cold'
   └──────────────┘    assignedTo: null

                ↓

2. ASSIGNMENT
   ┌──────────────┐
   │   Request    │
   │    Leads     │──→ status: 'in_progress'
   │  (Get 10)    │    assignedTo: salesperson_id
   └──────────────┘

                ↓

3. WORKING LEAD
   ┌──────────────────────────────────────┐
   │  Contact → Update Outcome → Comment  │
   └──────────────────────────────────────┘
                ↓                ↓
        ┌───────────┐      ┌─────────┐
        │ Positive  │      │ Negative│
        │ Outcomes  │      │ Outcomes│
        └───────────┘      └─────────┘
                ↓                ↓

4A. SUCCESS PATH              4B. FAILURE PATH
   ┌──────────────┐           ┌──────────────┐
   │  Interested  │           │    Denied    │
   │   Outcome    │           │ (failedCount │
   └──────────────┘           │  increment)  │
        ↓                     └──────────────┘
   ┌──────────────┐                 ↓
   │  Crack Lead  │           ┌──────────────┐
   │ Create Deal  │           │ failedCount  │
   └──────────────┘           │   >= 4 ?     │
        ↓                     └──────────────┘
   status: 'cracked'                ↓
        ↓                     ┌──────────────┐
   ┌──────────────┐           │   Archive    │
   │Work on Phases│           │     Lead     │
   └──────────────┘           └──────────────┘
        ↓                           END
   ┌──────────────┐
   │All Phases    │
   │  Complete    │
   └──────────────┘
        ↓
   status: 'completed'
   type: 'upsell'
        ↓
   ┌──────────────┐
   │  Available   │
   │for Upselling │
   └──────────────┘

4C. ESCALATION PATH
   ┌──────────────┐
   │ Lead Too     │
   │  Complex     │
   └──────────────┘
        ↓
   ┌──────────────┐
   │  Push Lead   │
   │to Senior Rep │
   └──────────────┘
        ↓
   type: 'push'
   status: 'new'
   assignedTo: null
        ↓
   Senior rep requests
   and takes over
```

### Status Transitions

```
NEW
 ├──→ IN_PROGRESS (when assigned)
 │
IN_PROGRESS
 ├──→ CRACKED (when successfully converted)
 ├──→ FAILED (when outcome = denied 4 times)
 ├──→ NEW (when pushed or circulated)
 │
CRACKED
 ├──→ COMPLETED (when all phases done)
 │
COMPLETED
 └──→ type becomes UPSELL (automatic)
```

### Type Transitions

```
WARM/COLD (initial)
 ├──→ PUSH (when pushed by junior)
 ├──→ UPSELL (when completed)

PUSH (senior attention needed)
 └──→ Can be worked like warm/cold

UPSELL (existing customer)
 └──→ Special handling for upselling
```

---

## Data Flow Examples

### Example 1: Creating a New Lead

**API Call:**
```json
POST /leads
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "source": "PPC",
  "type": "warm",
  "salesUnitId": 1
}
```

**Database Insert:**
```sql
INSERT INTO leads (
  name, email, phone, source, type, 
  status, outcome, assignedToId, salesUnitId, failedCount
) VALUES (
  'John Doe', 'john@example.com', '+1234567890', 'PPC', 'warm',
  'new', NULL, NULL, 1, 0
);
```

**Frontend State:**
```typescript
{
  id: "123",
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  source: "PPC",
  type: "warm",
  status: "new",
  outcome: null,
  salesUnitId: 1,
  createdAt: "2025-01-15T10:00:00.000Z",
  updatedAt: "2025-01-15T10:00:00.000Z"
}
```

---

### Example 2: Requesting Leads

**API Call:**
```json
POST /leads/request
{
  "keptLeadIds": [1, 2, 3],
  "includePushLeads": false
}
```

**Backend Logic:**
```typescript
1. Get current user's active leads
2. Separate kept vs circulated leads
3. Circulate non-kept leads:
   - SET assignedToId = NULL, status = 'new'
   - WHERE id IN (circulatedIds)
4. Count kept leads
5. Calculate needed = 10 - kept.length
6. Query for new leads:
   - WHERE status = 'new' 
   - AND assignedToId IS NULL
   - AND type IN (warm, cold)
   - ORDER BY type ASC (warm first)
   - LIMIT needed
7. Assign new leads:
   - SET assignedToId = currentUserId, status = 'in_progress'
8. Return combined: kept + newly assigned
```

---

### Example 3: Updating Lead Outcome

**API Call:**
```json
PUT /leads/123
{
  "outcome": "interested",
  "comment": "Customer very interested. Scheduled demo for next week."
}
```

**Backend Logic:**
```typescript
1. Validate lead exists
2. Validate comment provided
3. Create comment:
   INSERT INTO lead_comments (leadId, commentBy, commentText)
   VALUES (123, currentUserId, 'Customer very interested...')
4. Update lead:
   UPDATE leads SET outcome = 'interested' WHERE id = 123
5. Create history:
   INSERT INTO lead_outcome_history (leadId, outcome, changedBy, commentId)
   VALUES (123, 'interested', currentUserId, commentId)
6. Return updated lead
```

---

### Example 4: Cracking a Lead

**API Call:**
```json
PUT /leads/123
{
  "status": "cracked",
  "outcome": "interested",
  "comment": "Deal closed! Customer signed contract.",
  "totalAmount": 50000,
  "industryId": 1,
  "description": "Enterprise software solution",
  "totalPhases": 3,
  "currentPhase": 1
}
```

**Backend Logic:**
```typescript
1. Validate lead has outcome = 'interested'
2. Get commission rate from sales_department
3. Create comment
4. Update lead status:
   UPDATE leads SET 
     status = 'cracked',
     crackedById = currentUserId
   WHERE id = 123
5. Create cracked lead:
   INSERT INTO cracked_leads (
     leadId, closedBy, amount, commissionRate,
     industryId, description, totalPhases, currentPhase
   ) VALUES (
     123, currentUserId, 50000, 5.0,
     1, 'Enterprise software...', 3, 1
   )
6. Update team statistics:
   UPDATE teams SET completedLeads = completedLeads + 1
   WHERE id = team_id
7. Create history record
8. Return updated lead with cracked lead info
```

---

## Statistics & Analytics

### Available Metrics

#### **Overall Statistics**
```typescript
{
  totalLeads: number;          // Total leads in system
  activeLeads: number;         // Leads in progress
  completedLeads: number;      // Successfully completed
  failedLeads: number;         // Failed/archived
  conversionRate: string;      // (cracked / total) * 100
  completionRate: string;      // (completed / total) * 100
}
```

#### **By Status Breakdown**
```typescript
{
  byStatus: {
    new: number;               // Unassigned leads
    inProgress: number;        // Currently being worked
    completed: number;         // All phases done
    failed: number;           // Archived as failed
  }
}
```

#### **By Type Breakdown**
```typescript
{
  byType: {
    warm: number;              // Pre-qualified leads
    cold: number;              // New, unqualified leads
    push: number;              // Escalated to seniors
    upsell: number;            // Existing customers
  }
}
```

#### **Today's Activity**
```typescript
{
  today: {
    new: number;               // Leads created today
    completed: number;         // Leads completed today
    inProgress: number;        // Leads started today
  }
}
```

---

## Security & Permissions

### Authentication
- All endpoints require JWT authentication
- Token passed in `Authorization: Bearer <token>` header
- Token validated on every request
- User info extracted from token

### Role-Based Access Control (RBAC)

#### **Lead Creation**
- ✅ Sales Team (all levels)
- ✅ Admin
- ❌ HR
- ❌ Other departments

#### **Lead Viewing**
- ✅ Sales Team (role-based filtering)
- ✅ HR (read-only)
- ✅ Admin (full access)
- ❌ Other departments

#### **Lead Updating**
- ✅ Sales Team (assigned leads only)
- ✅ Admin (all leads)
- ❌ HR
- ❌ Other departments

#### **Type Visibility by Role**
- **Junior**: warm, cold
- **Senior**: warm, cold, push
- **Manager+**: warm, cold, push, upsell

### Guards Implementation

```typescript
@UseGuards(JwtAuthGuard, LeadsAccessGuard)
// Ensures user is authenticated AND has permission

@UseGuards(JwtAuthGuard, LeadCreationGuard)
// Ensures user can create leads
```

---

## Performance Optimizations

### Database Indexes
- Primary keys on all ID columns
- Foreign keys with indexes
- Indexes on frequently queried columns:
  - `leads.status`
  - `leads.type`
  - `leads.assignedToId`
  - `leads.salesUnitId`
  - `leads.createdAt`

### Query Optimizations
- Lightweight list format (minimal joins)
- Comprehensive detail format (all joins)
- Pagination on all list endpoints
- Selective field loading
- Eager loading of related entities

### Frontend Optimizations
- React memoization for expensive components
- Lazy loading of tables
- Virtual scrolling for large lists
- Debounced search inputs
- Optimistic UI updates
- Cache management

---

## Error Handling

### Common Error Responses

**400 Bad Request**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["type must be one of: warm, cold, upsell, push"]
}
```

**401 Unauthorized**
```json
{
  "statusCode": 401,
  "message": "No authentication token found"
}
```

**403 Forbidden**
```json
{
  "statusCode": 403,
  "message": "Access denied. Insufficient permissions."
}
```

**404 Not Found**
```json
{
  "statusCode": 404,
  "message": "Lead not found"
}
```

### Business Logic Errors

**Missing Comment**
```json
{
  "statusCode": 400,
  "message": "Comment is required when updating outcome"
}
```

**Missing Crack Fields**
```json
{
  "statusCode": 400,
  "message": "totalAmount, industryId, and description are required for cracked leads"
}
```

**Invalid Status Transition**
```json
{
  "statusCode": 400,
  "message": "Cannot mark as cracked without interested outcome"
}
```

---

## Testing & Development

### Sample Test Data

**Create Test Lead:**
```bash
curl -X POST http://localhost:3000/leads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Lead",
    "email": "test@example.com",
    "phone": "+1234567890",
    "source": "PPC",
    "type": "warm",
    "salesUnitId": 1
  }'
```

**Request Leads:**
```bash
curl -X POST http://localhost:3000/leads/request \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "keptLeadIds": [1, 2, 3],
    "includePushLeads": false
  }'
```

**Update Outcome:**
```bash
curl -X PUT http://localhost:3000/leads/123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "outcome": "interested",
    "comment": "Customer interested in our services"
  }'
```

---

## Conclusion

The Leads Management System is a comprehensive solution for tracking and managing sales leads through their entire lifecycle. It features:

✅ **Complete Database Schema** with proper relationships and constraints
✅ **Role-Based Access Control** for security
✅ **Comprehensive Audit Trail** via history tables
✅ **Business Logic Automation** (auto-archiving, auto-upselling)
✅ **RESTful API** with proper error handling
✅ **Modern Frontend** with React and TypeScript
✅ **Performance Optimizations** throughout the stack
✅ **Extensive Documentation** for developers

---

*Last Updated: January 2025*
*Version: 1.0*

