# Sales Trends API Requirements

## Overview
API endpoint to fetch monthly sales trend data for the Sales Dashboard. This will replace the hardcoded sales trend data currently displayed in the dashboard.

---

## 📊 **API Endpoint**

### **GET /dashboard/sales-trends**

Fetches sales trend data based on the authenticated user's role and department.

**Authentication:** Required (JWT token in Authorization header)
- Backend should automatically determine user's department and role from JWT token
- Sales department managers see all sales data
- Unit heads see data for their specific unit
- Team leads see data for their team
- Employees see only their own data

---

## 🔧 **Query Parameters**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `period` | string | No | `monthly` | Time period: `daily`, `weekly`, `monthly`, `quarterly`, `yearly` |
| `fromDate` | string (ISO 8601) | No | Last 12 months | Start date for data range |
| `toDate` | string (ISO 8601) | No | Current date | End date for data range |
| `unit` | string | No | All units | Filter by specific sales unit (only for department managers) |

**Examples:**
- `/dashboard/sales-trends?period=monthly`
- `/dashboard/sales-trends?period=monthly&fromDate=2024-01-01&toDate=2024-12-31`
- `/dashboard/sales-trends?period=monthly&unit=North%20Unit`

---

## 📤 **Response Structure**

### **Success Response (200 OK)**

```json
{
  "status": "success",
  "department": "Sales",
  "role": "dep_manager",
  "period": "monthly",
  "summary": {
    "currentPeriod": {
      "totalRevenue": 5400000,
      "totalDeals": 47,
      "averageDealSize": 114893,
      "conversionRate": 23.5,
      "bestMonth": {
        "date": "2024-03",
        "revenue": 650000,
        "label": "March 2024"
      },
      "worstMonth": {
        "date": "2024-01",
        "revenue": 420000,
        "label": "January 2024"
      }
    },
    "previousPeriod": {
      "totalRevenue": 4800000,
      "totalDeals": 42,
      "averageDealSize": 114286,
      "conversionRate": 21.0
    },
    "change": {
      "revenue": 600000,
      "revenuePercentage": 12.5,
      "deals": 5,
      "dealsPercentage": 11.9,
      "trend": "up"
    }
  },
  "data": [
    {
      "date": "2024-01",
      "label": "Jan",
      "fullLabel": "January 2024",
      "revenue": 420000,
      "deals": 8,
      "conversionRate": 20.0,
      "averageDealSize": 52500,
      "chartValue": 420000,
      "monthNumber": 1,
      "year": 2024
    },
    {
      "date": "2024-02",
      "label": "Feb",
      "fullLabel": "February 2024",
      "revenue": 480000,
      "deals": 10,
      "conversionRate": 22.5,
      "averageDealSize": 48000,
      "chartValue": 480000,
      "monthNumber": 2,
      "year": 2024
    },
    {
      "date": "2024-03",
      "label": "Mar",
      "fullLabel": "March 2024",
      "revenue": 650000,
      "deals": 12,
      "conversionRate": 25.0,
      "averageDealSize": 54167,
      "chartValue": 650000,
      "monthNumber": 3,
      "year": 2024
    }
  ],
  "metadata": {
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-12-31"
    },
    "totalMonths": 12,
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
- `currentPeriod`: Statistics for the requested time period
- `previousPeriod`: Statistics for the previous equivalent period (for comparison)
- `change`: Calculated differences and trends

### **Data Array Items**
- `date`: ISO date string (YYYY-MM format for monthly)
- `label`: Short label for chart display (e.g., "Jan", "Feb")
- `fullLabel`: Full label for tooltips (e.g., "January 2024")
- `revenue`: Total revenue for the period (in base currency, e.g., USD)
- `deals`: Number of closed/won deals
- `conversionRate`: Percentage of leads converted to deals
- `averageDealSize`: Average revenue per deal
- `chartValue`: Value to display on chart (typically same as revenue)
- `monthNumber`: Month number (1-12) for sorting
- `year`: Year for sorting

### **Metadata Object**
- `dateRange`: Start and end dates of the data
- `totalMonths`: Number of months in the dataset
- `generatedAt`: Timestamp when data was generated

---

## 🔍 **Data Source Requirements**

The backend should aggregate data from:
1. **Deals/Leads Table**: Closed/won deals with revenue amounts
2. **Invoices/Payments Table**: Actual payments received (if different from deal amounts)
3. **Leads Table**: Total leads for conversion rate calculation
4. **Sales Units/Teams**: For filtering by unit/team based on user role

**Key Calculations:**
- **Revenue**: Sum of all closed deal amounts (or payments received) in the period
- **Deals**: Count of closed/won deals in the period
- **Conversion Rate**: (Closed Deals / Total Leads) × 100
- **Average Deal Size**: Total Revenue / Number of Deals

---

## 🎯 **Role-Based Access Control**

| User Role | Access Level | Data Scope |
|-----------|-------------|------------|
| `sales` (Sales Dept Manager) | Full Access | All sales data across all units |
| `dep_manager` (Unit Head) | Unit-Specific | Data for their assigned unit only |
| `team_lead` | Team-Specific | Data for their team only |
| `junior` / `senior` (Sales Rep) | Personal | Only their own deals/revenue |

**Note:** Backend should automatically filter data based on the user's role and department from the JWT token.

---

## 📅 **Period Handling**

### **Monthly Period (Default)**
- Group data by month (YYYY-MM format)
- Return last 12 months by default
- Each data point represents one month

### **Daily Period**
- Group data by day (YYYY-MM-DD format)
- Return last 30 days by default
- Each data point represents one day

### **Weekly Period**
- Group data by week (YYYY-WW format)
- Return last 12 weeks by default
- Each data point represents one week

### **Quarterly Period**
- Group data by quarter (YYYY-Q format)
- Return last 4 quarters by default
- Each data point represents one quarter

### **Yearly Period**
- Group data by year (YYYY format)
- Return last 5 years by default
- Each data point represents one year

---

## 🚨 **Error Handling**

The API should handle:
- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: User doesn't have access to sales data
- **400 Bad Request**: Invalid query parameters
- **500 Internal Server Error**: Database or server errors

---

## ✅ **Validation Rules**

1. **Date Range**: `fromDate` must be before `toDate`
2. **Period**: Must be one of: `daily`, `weekly`, `monthly`, `quarterly`, `yearly`
3. **Date Format**: Dates must be in ISO 8601 format (YYYY-MM-DD)
4. **Unit Filter**: Only valid for department managers, must match existing sales units

---

## 🔄 **Caching Recommendations**

- Cache results for 5 minutes (data doesn't change frequently)
- Invalidate cache when new deals are closed or payments are received
- Use user role + department + period + date range as cache key

---

## 📝 **Implementation Notes**

1. **Currency**: All revenue values should be in the base currency (backend should handle currency conversion if needed)
2. **Timezone**: Use server timezone for date calculations
3. **Null Handling**: If no data exists for a period, return 0 values (not null)
4. **Performance**: Use database aggregation queries (GROUP BY) for efficiency
5. **Sorting**: Data should be sorted chronologically (oldest to newest)

---

## 🧪 **Test Cases**

### Test Case 1: Monthly Sales Trend (Default)
```
GET /dashboard/sales-trends?period=monthly
Expected: Last 12 months of sales data
```

### Test Case 2: Custom Date Range
```
GET /dashboard/sales-trends?period=monthly&fromDate=2024-01-01&toDate=2024-06-30
Expected: 6 months of data (Jan-Jun 2024)
```

### Test Case 3: Unit Filter (Department Manager)
```
GET /dashboard/sales-trends?period=monthly&unit=North%20Unit
Expected: Monthly data for North Unit only
```

### Test Case 4: Daily Period
```
GET /dashboard/sales-trends?period=daily
Expected: Last 30 days of daily sales data
```

### Test Case 5: Unauthorized Access
```
GET /dashboard/sales-trends (without token or invalid token)
Expected: 401 Unauthorized
```

---

## 📞 **Questions for Backend Team**

1. What is the exact field name for "closed/won" deal status in the database?
2. Should revenue be based on deal amounts or actual payments received?
3. How are sales units structured? (table name, relationship to deals)
4. What is the base currency for revenue calculations?
5. Are there any specific business rules for calculating conversion rates?

---

## 🔗 **Related Endpoints**

This endpoint follows the same pattern as:
- `/dashboard/attendance-trends` (HR Dashboard)
- `/accountant/analytics/dashboard` (Finance Dashboard)

Consistency in response structure and authentication is important for frontend implementation.

