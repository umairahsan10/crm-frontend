# Top Performers API Requirements

## Overview
API endpoint to fetch top performing team members data for the Sales Dashboard. This will replace the hardcoded top performers data currently displayed in the dashboard.

---

## 📊 **API Endpoint**

### **GET /dashboard/top-performers**

Fetches top performing team members based on the authenticated user's role and department.

**Authentication:** Required (JWT token in Authorization header)
- Backend should automatically determine user's department and role from JWT token
- Sales department managers see top performers across all units
- Unit heads see top performers in their specific unit
- Team leads see top performers in their team
- Employees see only their own performance (if applicable)

---

## 🔧 **Query Parameters**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | `5` | Number of top performers to return (max: 20) |
| `period` | string | No | `monthly` | Time period: `daily`, `weekly`, `monthly`, `quarterly`, `yearly` |
| `fromDate` | string (ISO 8601) | No | Current period start | Start date for data range |
| `toDate` | string (ISO 8601) | No | Current date | End date for data range |
| `unit` | string | No | All units | Filter by specific sales unit (only for department managers) |
| `metric` | string | No | `deals` | Performance metric: `deals`, `revenue`, `conversion_rate`, `leads` |

**Examples:**
- `/dashboard/top-performers?limit=5&period=monthly`
- `/dashboard/top-performers?limit=10&period=monthly&metric=revenue`
- `/dashboard/top-performers?limit=5&period=monthly&unit=North%20Unit`

---

## 📤 **Response Structure**

### **Success Response (200 OK)**

```json
{
  "status": "success",
  "department": "Sales",
  "role": "dep_manager",
  "period": "monthly",
  "metric": "deals",
  "summary": {
    "totalTeamMembers": 25,
    "periodStart": "2024-01-01",
    "periodEnd": "2024-01-31",
    "averagePerformance": 8.5
  },
  "data": [
    {
      "employeeId": 123,
      "employeeName": "Sarah Johnson",
      "value": 18,
      "metric": "deals",
      "additionalMetrics": {
        "revenue": 450000,
        "leads": 45,
        "conversionRate": 40.0,
        "averageDealSize": 25000
      },
      "rank": 1,
      "change": {
        "value": 3,
        "percentage": 20.0,
        "trend": "up"
      }
    },
    {
      "employeeId": 124,
      "employeeName": "Mike Chen",
      "value": 15,
      "metric": "deals",
      "additionalMetrics": {
        "revenue": 380000,
        "leads": 38,
        "conversionRate": 39.5,
        "averageDealSize": 25333
      },
      "rank": 2,
      "change": {
        "value": 2,
        "percentage": 15.4,
        "trend": "up"
      }
    },
    {
      "employeeId": 125,
      "employeeName": "Lisa Wilson",
      "value": 12,
      "metric": "deals",
      "additionalMetrics": {
        "revenue": 300000,
        "leads": 35,
        "conversionRate": 34.3,
        "averageDealSize": 25000
      },
      "rank": 3,
      "change": {
        "value": -1,
        "percentage": -7.7,
        "trend": "down"
      }
    },
    {
      "employeeId": 126,
      "employeeName": "David Brown",
      "value": 10,
      "metric": "deals",
      "additionalMetrics": {
        "revenue": 250000,
        "leads": 32,
        "conversionRate": 31.3,
        "averageDealSize": 25000
      },
      "rank": 4,
      "change": {
        "value": 0,
        "percentage": 0.0,
        "trend": "neutral"
      }
    },
    {
      "employeeId": 127,
      "employeeName": "Emma Davis",
      "value": 8,
      "metric": "deals",
      "additionalMetrics": {
        "revenue": 200000,
        "leads": 28,
        "conversionRate": 28.6,
        "averageDealSize": 25000
      },
      "rank": 5,
      "change": {
        "value": 1,
        "percentage": 14.3,
        "trend": "up"
      }
    }
  ],
  "metadata": {
    "generatedAt": "2024-12-15T10:30:00Z"
  }
}
```

### **Error Response (400/401/403/500)**

```json
{
  "status": "error",
  "message": "Error message describing what went wrong",
  "code": "ERROR_CODE"
}
```

---

## 📋 **Field Descriptions**

### **Summary Object**
- `totalTeamMembers`: Total number of team members in scope
- `periodStart`: Start date of the performance period
- `periodEnd`: End date of the performance period
- `averagePerformance`: Average performance value across all team members

### **Data Array Items**
- `employeeId`: Unique identifier for the employee
- `employeeName`: Full name of the employee
- `value`: Primary performance metric value (e.g., number of deals, revenue amount)
- `metric`: The metric being used for ranking (`deals`, `revenue`, `conversion_rate`, `leads`)
- `additionalMetrics`: Additional performance data for context
  - `revenue`: Total revenue generated
  - `leads`: Total leads handled
  - `conversionRate`: Conversion rate percentage
  - `averageDealSize`: Average size of deals
- `rank`: Ranking position (1 = best)
- `change`: Comparison with previous period
  - `value`: Absolute change
  - `percentage`: Percentage change
  - `trend`: Direction of change (`up`, `down`, `neutral`)

### **Metadata Object**
- `generatedAt`: Timestamp when data was generated

---

## 🔍 **Data Source Requirements**

The backend should aggregate data from:
1. **Deals/Leads Table**: Closed/won deals assigned to employees
2. **Employees Table**: Employee information and team assignments
3. **Sales Units/Teams**: For filtering by unit/team based on user role
4. **Invoices/Payments**: For revenue calculations (if metric is revenue)

**Key Calculations:**
- **Deals Metric**: Count of closed/won deals in the period
- **Revenue Metric**: Sum of revenue from closed deals in the period
- **Conversion Rate**: (Closed Deals / Total Leads) × 100
- **Leads Metric**: Total number of leads handled in the period

---

## 🎯 **Role-Based Access Control**

| User Role | Access Level | Data Scope |
|-----------|-------------|------------|
| `sales` (Sales Dept Manager) | Full Access | Top performers across all units |
| `dep_manager` (Unit Head) | Unit-Specific | Top performers in their assigned unit only |
| `team_lead` | Team-Specific | Top performers in their team only |
| `junior` / `senior` (Sales Rep) | Personal | Their own performance (if in top N) |

**Note:** Backend should automatically filter data based on the user's role and department from the JWT token.

---

## 📅 **Period Handling**

### **Monthly Period (Default)**
- Calculate performance for the current month
- Compare with previous month for change calculations

### **Daily Period**
- Calculate performance for the current day
- Compare with previous day

### **Weekly Period**
- Calculate performance for the current week
- Compare with previous week

### **Quarterly Period**
- Calculate performance for the current quarter
- Compare with previous quarter

### **Yearly Period**
- Calculate performance for the current year
- Compare with previous year

---

## 🚨 **Error Handling**

The API should handle:
- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: User doesn't have access to sales performance data
- **400 Bad Request**: Invalid query parameters (e.g., limit > 20, invalid date format)
- **500 Internal Server Error**: Database or server errors

---

## ✅ **Validation Rules**

1. **Limit**: Must be between 1 and 20 (default: 5)
2. **Period**: Must be one of: `daily`, `weekly`, `monthly`, `quarterly`, `yearly`
3. **Date Format**: Dates must be in ISO 8601 format (YYYY-MM-DD)
4. **Metric**: Must be one of: `deals`, `revenue`, `conversion_rate`, `leads`
5. **Unit Filter**: Only valid for department managers, must match existing sales units

---

## 🔄 **Caching Recommendations**

- Cache results for 5 minutes (data doesn't change frequently)
- Invalidate cache when new deals are closed or performance data is updated
- Use user role + department + period + metric + limit as cache key

---

## 📝 **Implementation Notes**

1. **Ranking**: Sort by the selected metric in descending order (highest first)
2. **Ties**: If multiple employees have the same value, rank them by:
   - Secondary metric (revenue if metric is deals, or vice versa)
   - Employee name (alphabetically) as final tiebreaker
3. **Empty Data**: If no performance data exists, return empty array (not null)
4. **Performance**: Use database aggregation queries (GROUP BY, ORDER BY) for efficiency
5. **Currency**: All revenue values should be in the base currency

---

## 🧪 **Test Cases**

### Test Case 1: Default Top 5 Performers (Monthly, by Deals)
```
GET /dashboard/top-performers
Expected: Top 5 performers by deals for current month
```

### Test Case 2: Top 10 by Revenue
```
GET /dashboard/top-performers?limit=10&metric=revenue
Expected: Top 10 performers by revenue for current month
```

### Test Case 3: Unit Filter (Department Manager)
```
GET /dashboard/top-performers?limit=5&unit=North%20Unit
Expected: Top 5 performers in North Unit only
```

### Test Case 4: Custom Date Range
```
GET /dashboard/top-performers?fromDate=2024-01-01&toDate=2024-03-31
Expected: Top performers for Q1 2024
```

### Test Case 5: Quarterly Period
```
GET /dashboard/top-performers?period=quarterly&limit=5
Expected: Top 5 performers for current quarter
```

### Test Case 6: Unauthorized Access
```
GET /dashboard/top-performers (without token or invalid token)
Expected: 401 Unauthorized
```

### Test Case 7: Invalid Limit
```
GET /dashboard/top-performers?limit=25
Expected: 400 Bad Request (limit exceeds maximum)
```

---

## 📞 **Questions for Backend Team**

1. What is the exact field name for "closed/won" deal status in the database?
2. How are employees linked to deals/leads? (employee_id field, assignee, etc.)
3. Should revenue be based on deal amounts or actual payments received?
4. How are sales units structured? (table name, relationship to employees)
5. What is the base currency for revenue calculations?
6. Should we include employees with zero performance, or only those with activity?

---

## 🔗 **Related Endpoints**

This endpoint follows the same pattern as:
- `/dashboard/sales-trends` (Sales Trends)
- `/dashboard/attendance-trends` (HR Dashboard)

Consistency in response structure and authentication is important for frontend implementation.

