# Finance Analytics API Requirements

Complete list of analytics endpoints needed for comprehensive financial insights across all 4 modules: Revenue, Expenses, Assets, and Liabilities.

---

## 📊 **1. REVENUE ANALYTICS APIs**

### 1.1 Time-Based Revenue Analytics
```
GET /accountant/revenue/analytics/time-series
```
**Query Parameters:**
- `period` - daily | weekly | monthly | quarterly | yearly
- `fromDate` - Start date (ISO 8601)
- `toDate` - End date (ISO 8601)
- `groupBy` - day | week | month | quarter | year
- `category` - Filter by revenue category
- `source` - Filter by revenue source (Client Payment, Product Sales, etc.)
- `clientId` - Filter by specific client

**Response:**
```json
{
  "status": "success",
  "data": {
    "timeSeries": [
      {
        "period": "2024-01",
        "totalRevenue": 125000,
        "transactionCount": 45,
        "averageTransaction": 2777.78,
        "growth": 12.5,
        "categories": {
          "Client Payment": 80000,
          "Product Sales": 30000,
          "Service Revenue": 15000
        }
      }
    ],
    "summary": {
      "total": 856000,
      "average": 71333.33,
      "highest": 125000,
      "lowest": 45000
    }
  }
}
```

### 1.2 Revenue by Category Analytics
```
GET /accountant/revenue/analytics/by-category
```
**Query Parameters:**
- `fromDate` - Start date
- `toDate` - End date
- `sortBy` - amount | count | growth
- `sortOrder` - asc | desc
- `limit` - Number of categories to return

**Response:**
```json
{
  "status": "success",
  "data": {
    "categories": [
      {
        "category": "Client Payment",
        "totalRevenue": 450000,
        "percentage": 52.5,
        "transactionCount": 125,
        "averageTransaction": 3600,
        "growth": 15.2,
        "trend": "up"
      }
    ],
    "totalRevenue": 856000
  }
}
```

### 1.3 Revenue by Source Analytics
```
GET /accountant/revenue/analytics/by-source
```
**Query Parameters:**
- `fromDate` - Start date
- `toDate` - End date
- `source` - Filter by specific source

**Response:**
```json
{
  "status": "success",
  "data": {
    "sources": [
      {
        "source": "Client Payment",
        "totalRevenue": 450000,
        "percentage": 52.5,
        "count": 125,
        "topClients": [
          {
            "clientId": "client_123",
            "clientName": "TechCorp Inc.",
            "totalPaid": 85000
          }
        ]
      }
    ]
  }
}
```

### 1.4 Revenue Growth Analytics
```
GET /accountant/revenue/analytics/growth
```
**Query Parameters:**
- `period` - monthly | quarterly | yearly
- `fromDate` - Start date
- `toDate` - End date
- `compareWith` - previous_period | previous_year | custom

**Response:**
```json
{
  "status": "success",
  "data": {
    "currentPeriod": {
      "total": 856000,
      "startDate": "2024-01-01",
      "endDate": "2024-03-31"
    },
    "comparisonPeriod": {
      "total": 765000,
      "startDate": "2023-10-01",
      "endDate": "2023-12-31"
    },
    "growth": {
      "absolute": 91000,
      "percentage": 11.9,
      "trend": "up"
    }
  }
}
```

### 1.5 Top Revenue Generators
```
GET /accountant/revenue/analytics/top-generators
```
**Query Parameters:**
- `fromDate` - Start date
- `toDate` - End date
- `groupBy` - client | employee | category | source
- `limit` - Number of results (default: 10)

**Response:**
```json
{
  "status": "success",
  "data": {
    "topGenerators": [
      {
        "id": "client_123",
        "name": "TechCorp Inc.",
        "totalRevenue": 125000,
        "percentage": 14.6,
        "transactionCount": 15,
        "lastPayment": "2024-03-15"
      }
    ]
  }
}
```

### 1.6 Revenue Forecasting
```
GET /accountant/revenue/analytics/forecast
```
**Query Parameters:**
- `months` - Number of months to forecast (1-12)
- `basedOn` - historical | trend | custom
- `historicalMonths` - Months of historical data to use (default: 6)

**Response:**
```json
{
  "status": "success",
  "data": {
    "forecast": [
      {
        "month": "2024-04",
        "predictedRevenue": 92000,
        "confidenceInterval": {
          "low": 85000,
          "high": 99000
        }
      }
    ],
    "accuracy": 87.5,
    "trend": "increasing"
  }
}
```

### 1.7 Revenue vs Target Analytics
```
GET /accountant/revenue/analytics/vs-target
```
**Query Parameters:**
- `fromDate` - Start date
- `toDate` - End date
- `period` - monthly | quarterly | yearly

**Response:**
```json
{
  "status": "success",
  "data": {
    "periods": [
      {
        "period": "2024-01",
        "actual": 125000,
        "target": 120000,
        "variance": 5000,
        "achievement": 104.2
      }
    ],
    "overall": {
      "totalActual": 856000,
      "totalTarget": 900000,
      "achievement": 95.1
    }
  }
}
```

---

## 💸 **2. EXPENSES ANALYTICS APIs**

### 2.1 Time-Based Expense Analytics
```
GET /accountant/expenses/analytics/time-series
```
**Query Parameters:**
- `period` - daily | weekly | monthly | quarterly | yearly
- `fromDate` - Start date
- `toDate` - End date
- `groupBy` - day | week | month | quarter | year
- `category` - Filter by expense category
- `relatedVendorId` - Filter by vendor
- `createdBy` - Filter by employee who created

**Response:**
```json
{
  "status": "success",
  "data": {
    "timeSeries": [
      {
        "period": "2024-01",
        "totalExpenses": 95000,
        "transactionCount": 125,
        "averageExpense": 760,
        "growth": -5.2,
        "categories": {
          "Office Supplies": 15000,
          "Utilities": 8500,
          "Software": 12000
        }
      }
    ],
    "summary": {
      "total": 456000,
      "average": 38000,
      "highest": 95000,
      "lowest": 28000
    }
  }
}
```

### 2.2 Expense by Category Analytics
```
GET /accountant/expenses/analytics/by-category
```
**Query Parameters:**
- `fromDate` - Start date
- `toDate` - End date
- `sortBy` - amount | count | growth
- `sortOrder` - asc | desc
- `limit` - Number of categories

**Response:**
```json
{
  "status": "success",
  "data": {
    "categories": [
      {
        "category": "Office Supplies",
        "totalExpenses": 125000,
        "percentage": 27.4,
        "transactionCount": 85,
        "averageExpense": 1470.59,
        "growth": -3.5,
        "trend": "down",
        "budget": 150000,
        "budgetUsed": 83.3
      }
    ],
    "totalExpenses": 456000
  }
}
```

### 2.3 Expense by Vendor Analytics
```
GET /accountant/expenses/analytics/by-vendor
```
**Query Parameters:**
- `fromDate` - Start date
- `toDate` - End date
- `limit` - Number of vendors
- `sortBy` - amount | count

**Response:**
```json
{
  "status": "success",
  "data": {
    "vendors": [
      {
        "vendorId": "vendor_123",
        "vendorName": "Office Depot",
        "totalExpenses": 45000,
        "percentage": 9.9,
        "transactionCount": 25,
        "lastTransaction": "2024-03-15",
        "categories": [
          {
            "category": "Office Supplies",
            "amount": 35000
          }
        ]
      }
    ]
  }
}
```

### 2.4 Expense Trend Analysis
```
GET /accountant/expenses/analytics/trends
```
**Query Parameters:**
- `period` - monthly | quarterly | yearly
- `fromDate` - Start date
- `toDate` - End date
- `category` - Filter by category

**Response:**
```json
{
  "status": "success",
  "data": {
    "trend": "decreasing",
    "averageChange": -2.5,
    "totalSavings": 15000,
    "insights": [
      {
        "type": "cost_reduction",
        "message": "Office Supplies expenses reduced by 15% this quarter",
        "impact": "positive"
      }
    ]
  }
}
```

### 2.5 Budget vs Actual Expenses
```
GET /accountant/expenses/analytics/budget-comparison
```
**Query Parameters:**
- `fromDate` - Start date
- `toDate` - End date
- `category` - Filter by category
- `period` - monthly | quarterly | yearly

**Response:**
```json
{
  "status": "success",
  "data": {
    "periods": [
      {
        "period": "2024-01",
        "budget": 100000,
        "actual": 95000,
        "variance": -5000,
        "percentageUsed": 95,
        "status": "under_budget"
      }
    ],
    "categories": [
      {
        "category": "Office Supplies",
        "budget": 150000,
        "actual": 125000,
        "variance": -25000,
        "percentageUsed": 83.3
      }
    ],
    "overall": {
      "totalBudget": 500000,
      "totalActual": 456000,
      "totalVariance": -44000,
      "status": "under_budget"
    }
  }
}
```

### 2.6 Top Expense Categories
```
GET /accountant/expenses/analytics/top-categories
```
**Query Parameters:**
- `fromDate` - Start date
- `toDate` - End date
- `limit` - Number of categories (default: 10)

**Response:**
```json
{
  "status": "success",
  "data": {
    "topCategories": [
      {
        "category": "Office Supplies",
        "totalAmount": 125000,
        "percentage": 27.4,
        "transactionCount": 85,
        "growthRate": -3.5
      }
    ]
  }
}
```

### 2.7 Expense Forecasting
```
GET /accountant/expenses/analytics/forecast
```
**Query Parameters:**
- `months` - Number of months to forecast
- `category` - Filter by category

**Response:**
```json
{
  "status": "success",
  "data": {
    "forecast": [
      {
        "month": "2024-04",
        "predictedExpense": 88000,
        "confidenceInterval": {
          "low": 82000,
          "high": 94000
        }
      }
    ]
  }
}
```

---

## 🏢 **3. ASSETS ANALYTICS APIs**

### 3.1 Assets Overview Analytics
```
GET /accountant/assets/analytics/overview
```
**Query Parameters:**
- `category` - Filter by asset category
- `status` - Filter by status (Active, Inactive, Maintenance, Disposed)
- `location` - Filter by location
- `assignedTo` - Filter by assigned employee

**Response:**
```json
{
  "status": "success",
  "data": {
    "totalAssets": 125,
    "totalValue": 856000,
    "averageValue": 6848,
    "byStatus": {
      "Active": {
        "count": 95,
        "value": 756000
      },
      "Maintenance": {
        "count": 15,
        "value": 65000
      },
      "Inactive": {
        "count": 10,
        "value": 25000
      },
      "Disposed": {
        "count": 5,
        "value": 10000
      }
    }
  }
}
```

### 3.2 Asset Depreciation Analytics
```
GET /accountant/assets/analytics/depreciation
```
**Query Parameters:**
- `fromDate` - Start date
- `toDate` - End date
- `category` - Filter by category
- `groupBy` - month | quarter | year

**Response:**
```json
{
  "status": "success",
  "data": {
    "periods": [
      {
        "period": "2024-01",
        "originalValue": 856000,
        "currentValue": 728000,
        "depreciation": 128000,
        "depreciationRate": 14.95
      }
    ],
    "totalDepreciation": 245000,
    "assetsByDepreciation": [
      {
        "assetId": "asset_123",
        "name": "Dell Laptop - John Doe",
        "originalValue": 1500,
        "currentValue": 900,
        "depreciation": 600,
        "depreciationRate": 40
      }
    ]
  }
}
```

### 3.3 Asset by Category Analytics
```
GET /accountant/assets/analytics/by-category
```
**Query Parameters:**
- `includeDisposed` - true | false (default: false)

**Response:**
```json
{
  "status": "success",
  "data": {
    "categories": [
      {
        "category": "Electronics",
        "count": 45,
        "totalValue": 125000,
        "averageValue": 2777.78,
        "percentage": 14.6,
        "depreciationRate": 18.5,
        "subcategories": [
          {
            "name": "Laptops",
            "count": 25,
            "value": 75000
          }
        ]
      }
    ]
  }
}
```

### 3.4 Asset Utilization Analytics
```
GET /accountant/assets/analytics/utilization
```
**Query Parameters:**
- `category` - Filter by category
- `location` - Filter by location

**Response:**
```json
{
  "status": "success",
  "data": {
    "utilizationRate": 87.5,
    "assigned": 95,
    "unassigned": 15,
    "inMaintenance": 10,
    "disposed": 5,
    "byCategory": [
      {
        "category": "Electronics",
        "total": 45,
        "assigned": 42,
        "utilizationRate": 93.3
      }
    ]
  }
}
```

### 3.5 Asset Lifecycle Analytics
```
GET /accountant/assets/analytics/lifecycle
```
**Query Parameters:**
- `category` - Filter by category
- `fromDate` - Purchased from date
- `toDate` - Purchased to date

**Response:**
```json
{
  "status": "success",
  "data": {
    "averageAge": 2.5,
    "ageDistribution": {
      "0-1 years": 35,
      "1-3 years": 45,
      "3-5 years": 25,
      "5+ years": 20
    },
    "replacementNeeded": [
      {
        "assetId": "asset_456",
        "name": "HP Printer - Marketing",
        "age": 6.5,
        "status": "Active",
        "recommendedAction": "Replace within 6 months"
      }
    ]
  }
}
```

### 3.6 Asset Value Trends
```
GET /accountant/assets/analytics/value-trends
```
**Query Parameters:**
- `period` - monthly | quarterly | yearly
- `fromDate` - Start date
- `toDate` - End date

**Response:**
```json
{
  "status": "success",
  "data": {
    "trends": [
      {
        "period": "2024-01",
        "totalValue": 856000,
        "newAssets": 5,
        "newAssetsValue": 25000,
        "disposed": 2,
        "disposedValue": 5000,
        "depreciation": 15000,
        "netChange": 5000
      }
    ]
  }
}
```

### 3.7 Asset Maintenance Analytics
```
GET /accountant/assets/analytics/maintenance
```
**Query Parameters:**
- `fromDate` - Start date
- `toDate` - End date
- `category` - Filter by category

**Response:**
```json
{
  "status": "success",
  "data": {
    "totalMaintenanceCost": 45000,
    "maintenanceCount": 125,
    "averageCost": 360,
    "byCategory": [
      {
        "category": "Vehicles",
        "totalCost": 25000,
        "count": 45,
        "averageCost": 555.56
      }
    ],
    "upcomingMaintenance": [
      {
        "assetId": "asset_789",
        "name": "Company Van",
        "nextMaintenanceDate": "2024-04-15",
        "estimatedCost": 1500
      }
    ]
  }
}
```

### 3.8 Asset ROI Analytics
```
GET /accountant/assets/analytics/roi
```
**Query Parameters:**
- `category` - Filter by category
- `fromDate` - Start date
- `toDate` - End date

**Response:**
```json
{
  "status": "success",
  "data": {
    "assets": [
      {
        "assetId": "asset_123",
        "name": "Production Machine A",
        "initialCost": 50000,
        "currentValue": 35000,
        "revenueGenerated": 125000,
        "maintenanceCost": 8500,
        "netReturn": 116500,
        "roi": 233
      }
    ],
    "averageROI": 156.5
  }
}
```

---

## ⚠️ **4. LIABILITIES ANALYTICS APIs**

### 4.1 Liabilities Overview Analytics
```
GET /accountant/liabilities/analytics/overview
```
**Query Parameters:**
- `isPaid` - Filter by paid status
- `category` - Filter by category
- `relatedVendorId` - Filter by vendor

**Response:**
```json
{
  "status": "success",
  "data": {
    "totalLiabilities": 456000,
    "paid": {
      "count": 85,
      "totalAmount": 256000,
      "percentage": 56.1
    },
    "unpaid": {
      "count": 45,
      "totalAmount": 200000,
      "percentage": 43.9
    },
    "byCategory": {
      "Short-term Loan": 125000,
      "Long-term Loan": 200000,
      "Accounts Payable": 85000,
      "Other": 46000
    }
  }
}
```

### 4.2 Liabilities Payment Timeline
```
GET /accountant/liabilities/analytics/payment-timeline
```
**Query Parameters:**
- `fromDate` - Start date
- `toDate` - End date
- `isPaid` - Filter by paid status

**Response:**
```json
{
  "status": "success",
  "data": {
    "timeline": [
      {
        "period": "2024-04",
        "dueAmount": 125000,
        "paidAmount": 95000,
        "remainingAmount": 30000,
        "count": 15,
        "onTimePayments": 12,
        "latePayments": 3
      }
    ],
    "upcomingPayments": [
      {
        "liabilityId": "liability_123",
        "name": "Bank Loan - Q2",
        "amount": 25000,
        "dueDate": "2024-04-15",
        "vendor": "Chase Bank",
        "daysUntilDue": 5,
        "status": "upcoming"
      }
    ],
    "overdue": [
      {
        "liabilityId": "liability_456",
        "name": "Vendor Payment",
        "amount": 5000,
        "dueDate": "2024-03-25",
        "daysOverdue": 5,
        "status": "overdue"
      }
    ]
  }
}
```

### 4.3 Liabilities by Category Analytics
```
GET /accountant/liabilities/analytics/by-category
```
**Query Parameters:**
- `fromDate` - Start date
- `toDate` - End date
- `isPaid` - Filter by paid status

**Response:**
```json
{
  "status": "success",
  "data": {
    "categories": [
      {
        "category": "Short-term Loan",
        "totalAmount": 125000,
        "percentage": 27.4,
        "count": 25,
        "paid": 85000,
        "unpaid": 40000,
        "averageAmount": 5000
      }
    ]
  }
}
```

### 4.4 Liabilities by Vendor Analytics
```
GET /accountant/liabilities/analytics/by-vendor
```
**Query Parameters:**
- `fromDate` - Start date
- `toDate` - End date
- `isPaid` - Filter by paid status

**Response:**
```json
{
  "status": "success",
  "data": {
    "vendors": [
      {
        "vendorId": "vendor_123",
        "vendorName": "Chase Bank",
        "totalLiabilities": 200000,
        "paid": 150000,
        "unpaid": 50000,
        "count": 12,
        "nextPaymentDue": "2024-04-15",
        "nextPaymentAmount": 25000
      }
    ]
  }
}
```

### 4.5 Debt-to-Asset Ratio Analytics
```
GET /accountant/liabilities/analytics/debt-ratio
```
**Query Parameters:**
- `asOfDate` - Calculate as of date (default: today)

**Response:**
```json
{
  "status": "success",
  "data": {
    "totalLiabilities": 456000,
    "totalAssets": 856000,
    "debtToAssetRatio": 0.533,
    "interpretation": "healthy",
    "trend": "improving",
    "historicalRatios": [
      {
        "period": "2024-01",
        "ratio": 0.565
      },
      {
        "period": "2024-02",
        "ratio": 0.548
      }
    ]
  }
}
```

### 4.6 Payment Performance Analytics
```
GET /accountant/liabilities/analytics/payment-performance
```
**Query Parameters:**
- `fromDate` - Start date
- `toDate` - End date

**Response:**
```json
{
  "status": "success",
  "data": {
    "totalPayments": 125,
    "onTimePayments": 105,
    "latePayments": 15,
    "missedPayments": 5,
    "onTimeRate": 84,
    "averageDelayDays": 3.5,
    "totalLateFees": 2500,
    "byVendor": [
      {
        "vendorId": "vendor_123",
        "vendorName": "Chase Bank",
        "onTimeRate": 95,
        "totalPayments": 25
      }
    ]
  }
}
```

### 4.7 Liabilities Forecast
```
GET /accountant/liabilities/analytics/forecast
```
**Query Parameters:**
- `months` - Number of months to forecast
- `category` - Filter by category

**Response:**
```json
{
  "status": "success",
  "data": {
    "forecast": [
      {
        "month": "2024-04",
        "expectedPayments": 125000,
        "scheduledPayments": [
          {
            "dueDate": "2024-04-15",
            "amount": 25000,
            "vendor": "Chase Bank",
            "category": "Short-term Loan"
          }
        ]
      }
    ],
    "totalUpcoming": 456000,
    "cashFlowImpact": -125000
  }
}
```

---

## 📈 **5. CROSS-MODULE ANALYTICS APIs**

### 5.1 Comprehensive Financial Dashboard
```
GET /accountant/analytics/dashboard
```
**Query Parameters:**
- `fromDate` - Start date
- `toDate` - End date
- `period` - monthly | quarterly | yearly

**Response:**
```json
{
  "status": "success",
  "data": {
    "summary": {
      "totalRevenue": 2800000,
      "totalExpenses": 1200000,
      "netProfit": 1600000,
      "profitMargin": 57.14,
      "totalAssets": 856000,
      "totalLiabilities": 456000,
      "netWorth": 400000
    },
    "kpis": {
      "revenueGrowth": 12.5,
      "expenseReduction": 2.1,
      "profitGrowth": 18.3,
      "debtToAssetRatio": 0.533,
      "currentRatio": 1.88
    }
  }
}
```

### 5.2 Profit & Loss Analytics
```
GET /accountant/analytics/profit-loss
```
**Query Parameters:**
- `fromDate` - Start date
- `toDate` - End date
- `groupBy` - month | quarter | year
- `compareWith` - previous_period | previous_year

**Response:**
```json
{
  "status": "success",
  "data": {
    "periods": [
      {
        "period": "2024-Q1",
        "revenue": {
          "total": 856000,
          "bySource": {
            "Client Payment": 450000,
            "Product Sales": 256000,
            "Service Revenue": 150000
          }
        },
        "expenses": {
          "total": 456000,
          "byCategory": {
            "Operating": 250000,
            "Marketing": 100000,
            "Administrative": 106000
          }
        },
        "grossProfit": 400000,
        "netProfit": 320000,
        "profitMargin": 37.4
      }
    ],
    "comparison": {
      "revenueChange": 12.5,
      "expenseChange": -2.1,
      "profitChange": 18.3
    }
  }
}
```

### 5.3 Cash Flow Analytics
```
GET /accountant/analytics/cash-flow
```
**Query Parameters:**
- `fromDate` - Start date
- `toDate` - End date
- `groupBy` - day | week | month

**Response:**
```json
{
  "status": "success",
  "data": {
    "periods": [
      {
        "period": "2024-01",
        "cashInflow": {
          "revenue": 856000,
          "assetSales": 25000,
          "other": 15000,
          "total": 896000
        },
        "cashOutflow": {
          "expenses": 456000,
          "liabilityPayments": 125000,
          "assetPurchases": 75000,
          "total": 656000
        },
        "netCashFlow": 240000,
        "openingBalance": 500000,
        "closingBalance": 740000
      }
    ],
    "summary": {
      "totalInflow": 896000,
      "totalOutflow": 656000,
      "netFlow": 240000,
      "burnRate": 456000
    }
  }
}
```

### 5.4 Financial Ratios Analytics
```
GET /accountant/analytics/financial-ratios
```
**Query Parameters:**
- `asOfDate` - Calculate as of date

**Response:**
```json
{
  "status": "success",
  "data": {
    "profitability": {
      "grossProfitMargin": 62.5,
      "netProfitMargin": 37.4,
      "returnOnAssets": 37.4,
      "returnOnEquity": 80.0
    },
    "liquidity": {
      "currentRatio": 1.88,
      "quickRatio": 1.65,
      "cashRatio": 0.95
    },
    "efficiency": {
      "assetTurnoverRatio": 3.27,
      "inventoryTurnover": 8.5,
      "receivablesTurnover": 12.3
    },
    "leverage": {
      "debtToAssetRatio": 0.533,
      "debtToEquityRatio": 1.14,
      "equityMultiplier": 2.14
    }
  }
}
```

### 5.5 Budget vs Actual Comparison
```
GET /accountant/analytics/budget-comparison
```
**Query Parameters:**
- `fromDate` - Start date
- `toDate` - End date
- `period` - monthly | quarterly | yearly

**Response:**
```json
{
  "status": "success",
  "data": {
    "revenue": {
      "budget": 900000,
      "actual": 856000,
      "variance": -44000,
      "achievement": 95.1
    },
    "expenses": {
      "budget": 500000,
      "actual": 456000,
      "variance": -44000,
      "achievement": 91.2
    },
    "profit": {
      "budget": 400000,
      "actual": 400000,
      "variance": 0,
      "achievement": 100
    },
    "byCategory": [
      {
        "category": "Revenue - Client Payment",
        "budget": 500000,
        "actual": 450000,
        "variance": -50000,
        "achievement": 90
      }
    ]
  }
}
```

### 5.6 Year-over-Year Comparison
```
GET /accountant/analytics/year-over-year
```
**Query Parameters:**
- `year` - Current year to analyze
- `compareWith` - Year to compare with
- `metrics` - revenue | expenses | profit | all

**Response:**
```json
{
  "status": "success",
  "data": {
    "currentYear": {
      "year": 2024,
      "revenue": 2800000,
      "expenses": 1200000,
      "profit": 1600000
    },
    "previousYear": {
      "year": 2023,
      "revenue": 2400000,
      "expenses": 1150000,
      "profit": 1250000
    },
    "growth": {
      "revenueGrowth": 16.67,
      "expenseGrowth": 4.35,
      "profitGrowth": 28.0
    },
    "monthlyComparison": [
      {
        "month": "January",
        "revenue2024": 250000,
        "revenue2023": 220000,
        "growth": 13.64
      }
    ]
  }
}
```

### 5.7 Financial Health Score
```
GET /accountant/analytics/health-score
```
**Query Parameters:**
- `asOfDate` - Calculate as of date

**Response:**
```json
{
  "status": "success",
  "data": {
    "overallScore": 85,
    "rating": "Excellent",
    "components": {
      "profitability": {
        "score": 90,
        "weight": 30,
        "status": "excellent"
      },
      "liquidity": {
        "score": 85,
        "weight": 25,
        "status": "good"
      },
      "efficiency": {
        "score": 80,
        "weight": 20,
        "status": "good"
      },
      "leverage": {
        "score": 85,
        "weight": 15,
        "status": "good"
      },
      "growth": {
        "score": 88,
        "weight": 10,
        "status": "excellent"
      }
    },
    "recommendations": [
      {
        "priority": "high",
        "message": "Consider reducing debt-to-asset ratio to below 0.5",
        "impact": "Improve leverage score"
      }
    ]
  }
}
```

### 5.8 Trend Analysis (All Modules)
```
GET /accountant/analytics/trends
```
**Query Parameters:**
- `fromDate` - Start date
- `toDate` - End date
- `metrics` - Array of metrics to analyze
- `period` - monthly | quarterly | yearly

**Response:**
```json
{
  "status": "success",
  "data": {
    "trends": [
      {
        "metric": "revenue",
        "direction": "up",
        "strength": "strong",
        "averageGrowth": 12.5,
        "volatility": "low"
      },
      {
        "metric": "expenses",
        "direction": "down",
        "strength": "moderate",
        "averageGrowth": -2.1,
        "volatility": "low"
      }
    ],
    "correlations": [
      {
        "metric1": "revenue",
        "metric2": "expenses",
        "correlation": 0.75,
        "interpretation": "strong positive"
      }
    ]
  }
}
```

---

## 🔧 **6. COMMON FILTER PARAMETERS** (Apply to All Analytics)

### Standard Filters:
- `fromDate` - Start date (ISO 8601 format)
- `toDate` - End date (ISO 8601 format)
- `period` - Time grouping (daily, weekly, monthly, quarterly, yearly)
- `groupBy` - Grouping dimension (category, vendor, employee, etc.)
- `sortBy` - Sort field
- `sortOrder` - asc | desc
- `limit` - Number of results to return
- `offset` - Pagination offset
- `page` - Page number
- `pageSize` - Results per page

### Module-Specific Filters:

**Revenue:**
- `category` - Revenue category
- `source` - Revenue source
- `clientId` - Specific client
- `paymentMethod` - Payment method
- `createdBy` - Employee who created

**Expenses:**
- `category` - Expense category
- `relatedVendorId` - Vendor ID
- `paymentMethod` - Payment method
- `createdBy` - Employee who created
- `isRecurring` - Recurring expense filter

**Assets:**
- `category` - Asset category
- `status` - Asset status (Active, Inactive, Maintenance, Disposed)
- `location` - Asset location
- `assignedTo` - Employee assigned to
- `purchaseFromDate` - Purchase date range start
- `purchaseToDate` - Purchase date range end

**Liabilities:**
- `category` - Liability category
- `isPaid` - Payment status
- `relatedVendorId` - Vendor ID
- `dueDateFrom` - Due date range start
- `dueDateTo` - Due date range end
- `createdBy` - Employee who created

---

## 📝 **7. EXPORT & REPORTING APIs**

### 7.1 Export Financial Data
```
POST /accountant/analytics/export
```
**Request Body:**
```json
{
  "reportType": "revenue | expenses | assets | liabilities | profit_loss | cash_flow",
  "format": "csv | xlsx | pdf | json",
  "fromDate": "2024-01-01",
  "toDate": "2024-03-31",
  "filters": {
    "category": "Client Payment",
    "vendor": "vendor_123"
  },
  "includeCharts": true,
  "templateId": "template_123" // Optional custom template
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "downloadUrl": "https://api.example.com/downloads/report_abc123.xlsx",
    "expiresAt": "2024-03-31T23:59:59Z",
    "fileSize": 245678,
    "recordCount": 1250
  }
}
```

### 7.2 Schedule Recurring Reports
```
POST /accountant/analytics/schedule-report
```
**Request Body:**
```json
{
  "reportType": "profit_loss",
  "frequency": "daily | weekly | monthly | quarterly",
  "format": "pdf",
  "recipients": ["finance@company.com"],
  "filters": {},
  "enabled": true
}
```

---

## 🎯 **Summary of Analytics Needed**

### **Revenue (7 APIs):**
1. Time-Series Analytics
2. By Category Analytics
3. By Source Analytics
4. Growth Analytics
5. Top Generators
6. Forecasting
7. vs Target

### **Expenses (7 APIs):**
1. Time-Series Analytics
2. By Category Analytics
3. By Vendor Analytics
4. Trend Analysis
5. Budget Comparison
6. Top Categories
7. Forecasting

### **Assets (8 APIs):**
1. Overview Analytics
2. Depreciation Analytics
3. By Category Analytics
4. Utilization Analytics
5. Lifecycle Analytics
6. Value Trends
7. Maintenance Analytics
8. ROI Analytics

### **Liabilities (7 APIs):**
1. Overview Analytics
2. Payment Timeline
3. By Category Analytics
4. By Vendor Analytics
5. Debt-to-Asset Ratio
6. Payment Performance
7. Forecast

### **Cross-Module (8 APIs):**
1. Dashboard Summary
2. Profit & Loss
3. Cash Flow
4. Financial Ratios
5. Budget vs Actual
6. Year-over-Year
7. Health Score
8. Trend Analysis

### **Export/Reports (2 APIs):**
1. Export Data
2. Schedule Reports

---

## **TOTAL: 39 Analytics Endpoints** + Standard CRUD = **Complete Financial Analytics System**


