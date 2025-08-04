// // Global Search Service for searching across all website content

// export interface SearchResult {
//   id: string;
//   type: 'employee' | 'lead' | 'deal' | 'customer' | 'attendance' | 'report';
//   title: string;
//   subtitle?: string;
//   description?: string;
//   url?: string;
//   icon?: string;
//   metadata?: Record<string, any>;
//   relevance: number; // Higher number = more relevant
// }

// // Sample data - in a real app, this would come from APIs or database
// const sampleEmployees = [
//   { id: '1', name: 'Sarah Chen', role: 'Sales Representative', email: 'sarah.chen@company.com', department: 'Sales' },
//   { id: '2', name: 'Mike Rodriguez', role: 'Software Engineer', email: 'mike.rodriguez@company.com', department: 'Engineering' },
//   { id: '3', name: 'Alex Thompson', role: 'Senior Developer', email: 'alex.thompson@company.com', department: 'Engineering' },
//   { id: '4', name: 'Emma Wilson', role: 'Marketing Manager', email: 'emma.wilson@company.com', department: 'Marketing' },
//   { id: '5', name: 'David Brown', role: 'Product Manager', email: 'david.brown@company.com', department: 'Product' },
// ];

// const sampleLeads = [
//   { id: 'LD001', name: 'Alice Cooper', email: 'alice.cooper@example.com', company: 'TechCorp', status: 'New' },
//   { id: 'LD002', name: 'Bob Anderson', email: 'bob.anderson@example.com', company: 'InnovateInc', status: 'Contacted' },
//   { id: 'LD003', name: 'Carol White', email: 'carol.white@example.com', company: 'StartupXYZ', status: 'Qualified' },
//   { id: 'LD004', name: 'Daniel Lee', email: 'daniel.lee@example.com', company: 'EnterpriseCo', status: 'Proposal' },
// ];

// const sampleDeals = [
//   { id: 'DEAL001', title: 'TechCorp Enterprise License', value: 50000, stage: 'Negotiation', customer: 'TechCorp' },
//   { id: 'DEAL002', title: 'InnovateInc Software Package', value: 25000, stage: 'Proposal', customer: 'InnovateInc' },
//   { id: 'DEAL003', title: 'StartupXYZ Consulting', value: 15000, stage: 'Qualification', customer: 'StartupXYZ' },
// ];

// const sampleCustomers = [
//   { id: 'CUST001', name: 'TechCorp', industry: 'Technology', contact: 'Alice Cooper', email: 'alice.cooper@techcorp.com' },
//   { id: 'CUST002', name: 'InnovateInc', industry: 'Software', contact: 'Bob Anderson', email: 'bob.anderson@innovateinc.com' },
//   { id: 'CUST003', name: 'StartupXYZ', industry: 'Startup', contact: 'Carol White', email: 'carol.white@startupxyz.com' },
// ];

// // Helper function to calculate search relevance
// const calculateRelevance = (query: string, text: string, field: string): number => {
//   const lowerQuery = query.toLowerCase();
//   const lowerText = text.toLowerCase();
  
//   // Exact match gets highest score
//   if (lowerText === lowerQuery) return 100;
  
//   // Starts with query gets high score
//   if (lowerText.startsWith(lowerQuery)) return 90;
  
//   // Contains query gets medium score
//   if (lowerText.includes(lowerQuery)) return 70;
  
//   // Partial word match gets lower score
//   const words = lowerQuery.split(' ');
//   const textWords = lowerText.split(' ');
  
//   let wordMatches = 0;
//   words.forEach(word => {
//     if (textWords.some(textWord => textWord.includes(word))) {
//       wordMatches++;
//     }
//   });
  
//   if (wordMatches > 0) {
//     return 50 + (wordMatches / words.length) * 20;
//   }
  
//   return 0;
// };

// // Search through employees
// const searchEmployees = (query: string): SearchResult[] => {
//   return sampleEmployees
//     .map(employee => {
//       const nameRelevance = calculateRelevance(query, employee.name, 'name');
//       const roleRelevance = calculateRelevance(query, employee.role, 'role');
//       const emailRelevance = calculateRelevance(query, employee.email, 'email');
//       const departmentRelevance = calculateRelevance(query, employee.department, 'department');
      
//       const maxRelevance = Math.max(nameRelevance, roleRelevance, emailRelevance, departmentRelevance);
      
//       if (maxRelevance > 0) {
//         return {
//           id: employee.id,
//           type: 'employee' as const,
//           title: employee.name,
//           subtitle: employee.role,
//           description: `${employee.department} • ${employee.email}`,
//           url: `/employees/${employee.id}`,
//           icon: '👤',
//           metadata: employee,
//           relevance: maxRelevance
//         };
//       }
//       return null;
//     })
//     .filter((result): result is SearchResult => result !== null)
//     .sort((a, b) => b.relevance - a.relevance);
// };

// // Search through leads
// const searchLeads = (query: string): SearchResult[] => {
//   return sampleLeads
//     .map(lead => {
//       const nameRelevance = calculateRelevance(query, lead.name, 'name');
//       const emailRelevance = calculateRelevance(query, lead.email, 'email');
//       const companyRelevance = calculateRelevance(query, lead.company, 'company');
//       const statusRelevance = calculateRelevance(query, lead.status, 'status');
      
//       const maxRelevance = Math.max(nameRelevance, emailRelevance, companyRelevance, statusRelevance);
      
//       if (maxRelevance > 0) {
//         return {
//           id: lead.id,
//           type: 'lead' as const,
//           title: lead.name,
//           subtitle: lead.company,
//           description: `${lead.status} • ${lead.email}`,
//           url: `/leads/${lead.id}`,
//           icon: '🎯',
//           metadata: lead,
//           relevance: maxRelevance
//         };
//       }
//       return null;
//     })
//     .filter((result): result is SearchResult => result !== null)
//     .sort((a, b) => b.relevance - a.relevance);
// };

// // Search through deals
// const searchDeals = (query: string): SearchResult[] => {
//   return sampleDeals
//     .map(deal => {
//       const titleRelevance = calculateRelevance(query, deal.title, 'title');
//       const customerRelevance = calculateRelevance(query, deal.customer, 'customer');
//       const stageRelevance = calculateRelevance(query, deal.stage, 'stage');
      
//       const maxRelevance = Math.max(titleRelevance, customerRelevance, stageRelevance);
      
//       if (maxRelevance > 0) {
//         return {
//           id: deal.id,
//           type: 'deal' as const,
//           title: deal.title,
//           subtitle: `$${deal.value.toLocaleString()}`,
//           description: `${deal.stage} • ${deal.customer}`,
//           url: `/deals/${deal.id}`,
//           icon: '💰',
//           metadata: deal,
//           relevance: maxRelevance
//         };
//       }
//       return null;
//     })
//     .filter((result): result is SearchResult => result !== null)
//     .sort((a, b) => b.relevance - a.relevance);
// };

// // Search through customers
// const searchCustomers = (query: string): SearchResult[] => {
//   return sampleCustomers
//     .map(customer => {
//       const nameRelevance = calculateRelevance(query, customer.name, 'name');
//       const industryRelevance = calculateRelevance(query, customer.industry, 'industry');
//       const contactRelevance = calculateRelevance(query, customer.contact, 'contact');
//       const emailRelevance = calculateRelevance(query, customer.email, 'email');
      
//       const maxRelevance = Math.max(nameRelevance, industryRelevance, contactRelevance, emailRelevance);
      
//       if (maxRelevance > 0) {
//         return {
//           id: customer.id,
//           type: 'customer' as const,
//           title: customer.name,
//           subtitle: customer.industry,
//           description: `${customer.contact} • ${customer.email}`,
//           url: `/customers/${customer.id}`,
//           icon: '🏢',
//           metadata: customer,
//           relevance: maxRelevance
//         };
//       }
//       return null;
//     })
//     .filter((result): result is SearchResult => result !== null)
//     .sort((a, b) => b.relevance - a.relevance);
// };

// // Main search function
// export const performGlobalSearch = (query: string): SearchResult[] => {
//   if (!query || query.trim().length < 2) {
//     return [];
//   }

//   const trimmedQuery = query.trim();
  
//   // Search across all data types
//   const employeeResults = searchEmployees(trimmedQuery);
//   const leadResults = searchLeads(trimmedQuery);
//   const dealResults = searchDeals(trimmedQuery);
//   const customerResults = searchCustomers(trimmedQuery);
  
//   // Combine all results and sort by relevance
//   const allResults = [
//     ...employeeResults,
//     ...leadResults,
//     ...dealResults,
//     ...customerResults
//   ].sort((a, b) => b.relevance - a.relevance);
  
//   // Return top 10 most relevant results
//   return allResults.slice(0, 10);
// };

// // Get search suggestions for autocomplete
// export const getSearchSuggestions = (query: string): string[] => {
//   if (!query || query.trim().length < 1) {
//     return [];
//   }

//   const trimmedQuery = query.trim().toLowerCase();
//   const suggestions: string[] = [];
  
//   // Add employee names
//   sampleEmployees.forEach(employee => {
//     if (employee.name.toLowerCase().includes(trimmedQuery)) {
//       suggestions.push(employee.name);
//     }
//   });
  
//   // Add lead names
//   sampleLeads.forEach(lead => {
//     if (lead.name.toLowerCase().includes(trimmedQuery)) {
//       suggestions.push(lead.name);
//     }
//   });
  
//   // Add company names
//   sampleLeads.forEach(lead => {
//     if (lead.company.toLowerCase().includes(trimmedQuery)) {
//       suggestions.push(lead.company);
//     }
//   });
  
//   // Add deal titles
//   sampleDeals.forEach(deal => {
//     if (deal.title.toLowerCase().includes(trimmedQuery)) {
//       suggestions.push(deal.title);
//     }
//   });
  
//   // Remove duplicates and return top 5
//   return [...new Set(suggestions)].slice(0, 5);
// };

// // Debounced search function for performance
// export const debouncedSearch = (() => {
//   let timeoutId: number | undefined;
  
//   return (query: string, callback: (results: SearchResult[]) => void, delay: number = 300) => {
//     if (timeoutId) {
//       clearTimeout(timeoutId);
//     }
//     timeoutId = window.setTimeout(() => {
//       const results = performGlobalSearch(query);
//       callback(results);
//     }, delay);
//   };
// })(); 