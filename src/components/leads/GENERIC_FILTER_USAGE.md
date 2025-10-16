# Generic Leads Filter System - Usage Guide

## 🎉 Before vs After

### ❌ OLD WAY (940 lines!):
```typescript
<LeadsSearchFilters
  config={regularLeadsConfig}  // Complex config object
  onSearch={handleRegularSearch}
  onStatusFilter={handleStatusFilter}
  onTypeFilter={handleTypeFilter}
  onSalesUnitFilter={handleSalesUnitFilter}
  onAssignedToFilter={handleAssignedToFilter}
  onDateRangeFilter={handleDateRangeFilter}
  onClearFilters={handleRegularClearFilters}
/>
```

### ✅ NEW WAY (Just configuration!):
```typescript
<GenericLeadsFilters
  showFilters={{
    status: true,
    type: true,
    salesUnit: true,
    assignedTo: true,
    dateRange: true
  }}
  onFiltersChange={(filters) => fetchLeads(1, filters)}
  onClearFilters={() => fetchLeads(1, {})}
  searchPlaceholder="Search leads..."
  theme={{ 
    primary: 'bg-indigo-600', 
    secondary: 'hover:bg-indigo-700',
    ring: 'ring-indigo-500',
    bg: 'bg-indigo-100',
    text: 'text-indigo-800'
  }}
/>
```

---

## 📋 How to Use in LeadsManagementPage.tsx

### **1. Regular Leads Tab**

```typescript
{activeTab === 'leads' && (
  <GenericLeadsFilters
    showFilters={{
      status: true,
      type: true,
      salesUnit: true,
      assignedTo: true,
      dateRange: true
    }}
    onFiltersChange={(filters) => {
      setFilters(filters);
      fetchRegularLeads(1, filters);
    }}
    onClearFilters={() => {
      setFilters({});
      fetchRegularLeads(1, {});
    }}
    searchPlaceholder="Search leads by name, email, phone..."
    theme={{
      primary: 'bg-indigo-600',
      secondary: 'hover:bg-indigo-700',
      ring: 'ring-indigo-500',
      bg: 'bg-indigo-100',
      text: 'text-indigo-800'
    }}
  />
)}
```

### **2. Cracked Leads Tab**

```typescript
{activeTab === 'crack' && (
  <GenericLeadsFilters
    showFilters={{
      industry: true,
      amountRange: true,
      closedBy: true,
      currentPhase: true,
      totalPhases: true
    }}
    onFiltersChange={(filters) => {
      setFilters(filters);
      fetchCrackedLeads(1, filters);
    }}
    onClearFilters={() => {
      setFilters({});
      fetchCrackedLeads(1, {});
    }}
    searchPlaceholder="Search cracked leads..."
    theme={{
      primary: 'bg-green-600',
      secondary: 'hover:bg-green-700',
      ring: 'ring-green-500',
      bg: 'bg-green-100',
      text: 'text-green-800'
    }}
  />
)}
```

### **3. Archived Leads Tab**

```typescript
{activeTab === 'archive' && (
  <GenericLeadsFilters
    showFilters={{
      salesUnit: true,
      assignedTo: true,
      source: true,
      outcome: true,
      qualityRating: true,
      archivedDateRange: true
    }}
    onFiltersChange={(filters) => {
      setFilters(filters);
      fetchArchivedLeads(1, filters);
    }}
    onClearFilters={() => {
      setFilters({});
      fetchArchivedLeads(1, {});
    }}
    searchPlaceholder="Search archived leads..."
    theme={{
      primary: 'bg-gray-600',
      secondary: 'hover:bg-gray-700',
      ring: 'ring-gray-500',
      bg: 'bg-gray-100',
      text: 'text-gray-800'
    }}
  />
)}
```

---

## 🚀 Benefits

### **Code Reduction:**
- Old: 940 lines in LeadsSearchFilters.tsx
- New: 350 lines in GenericLeadsFilters.tsx
- **Savings: 590 lines (62% reduction!)**

### **Simplicity:**
- ✅ Just configure what filters to show
- ✅ One callback for all filters (not 15 separate callbacks!)
- ✅ Automatic active filter counting
- ✅ Automatic clear functionality

### **Future-Proof:**
Need a new filter? Just add it to `showFilters`:
```typescript
showFilters={{
  status: true,
  newFilterType: true  // ← Just add this, no coding needed!
}}
```

### **Flexibility:**
- Different themes per tab
- Different filters per tab
- All automatic!

---

## 🔄 Migration Steps

1. Import new component:
```typescript
import GenericLeadsFilters from '../../components/leads/GenericLeadsFilters';
```

2. Replace old LeadsSearchFilters with new GenericLeadsFilters

3. Delete old LeadsSearchFilters.tsx (optional - keep as backup initially)

4. Test all 3 tabs

---

## ✅ Testing Checklist

- [ ] Regular tab: Search works
- [ ] Regular tab: All filters work (status, type, salesUnit, assignedTo, dateRange)
- [ ] Regular tab: Clear filters works
- [ ] Cracked tab: Industry, amount, closedBy, phase filters work
- [ ] Archived tab: All filters work
- [ ] Filter counts show correctly
- [ ] Theme colors applied correctly per tab

---

## 🎯 Next Steps

Once this works for Leads:
1. Create similar components for Revenue, Expenses, Assets, Liabilities
2. Each will be even simpler since they have fewer filter types
3. Eventual goal: Single FilterContainer that all modules use!


