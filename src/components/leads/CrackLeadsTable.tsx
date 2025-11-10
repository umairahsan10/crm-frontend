import React from 'react';
import DynamicTable from '../common/DynamicTable/DynamicTable';
import { crackedLeadsTableConfig } from './tableConfigs';

interface CrackLeadsTableProps {
  leads: any[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onLeadClick: (lead: any) => void;
  onBulkSelect: (leadIds: string[]) => void;
  selectedLeads: string[];
}

const CrackLeadsTable: React.FC<CrackLeadsTableProps> = ({
  leads,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onLeadClick,
  onBulkSelect,
  selectedLeads
}) => {
  // Transform cracked leads data for the dynamic table
  const transformedLeads = leads.map((crackedLead: any) => {
    // Extract contact info from nested lead object - API response structure: crackedLead.lead.name, lead.email, lead.phone
    // The lead object is always present in the API response
    // For contact type columns, DynamicTable expects name, email, phone at root level OR in the object at column.key
    const leadInfo = crackedLead.lead || {};
    return {
      ...crackedLead,
      id: crackedLead.id, // Use cracked lead ID for selection
      // For contact column - DynamicTable passes entire row for contact type, so we need name/email/phone at root
      name: leadInfo.name,
      email: leadInfo.email,
      phone: leadInfo.phone,
      // Also keep the lead object structure for other uses
      contact: {
        name: leadInfo.name,
        email: leadInfo.email,
        phone: leadInfo.phone
      },
      lead: {
        name: leadInfo.name,
        email: leadInfo.email,
        phone: leadInfo.phone,
        // Preserve other lead properties
        ...leadInfo
      },
      amount: crackedLead.amount,
      commissionRate: crackedLead.commissionRate,
      currentPhase: crackedLead.currentPhase,
      totalPhases: crackedLead.totalPhases,
      status: 'cracked' // All cracked leads have cracked status
    };
  });

  // Handle row click - use existing data directly, no API call needed
  const handleRowClick = (row: any) => {
    // Find the original cracked lead data from the leads array
    const crackedLead = leads.find((lead: any) => lead.id === row.id);
    
    if (crackedLead && crackedLead.lead) {
      // Construct the lead data structure directly from existing data
      const fullLeadData = {
        ...crackedLead.lead,
        crackedLeads: [crackedLead],
        source: crackedLead.lead?.source,
        salesUnitId: crackedLead.lead?.salesUnit?.id || crackedLead.lead?.salesUnitId,
        salesUnit: crackedLead.lead?.salesUnit
      };
      
      // Immediately call onLeadClick with the data we already have
      onLeadClick(fullLeadData);
    }
  };
    
    return (
    <DynamicTable
        data={transformedLeads}
        columns={crackedLeadsTableConfig}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        selectedItems={selectedLeads}
        onPageChange={onPageChange}
        onRowClick={handleRowClick} // Use the custom handler
        onBulkSelect={onBulkSelect}
        theme={{
          primary: 'green',
          secondary: 'gray',
          accent: 'green'
        }}
        emptyMessage="No cracked leads available"
      />
  );
};

export default CrackLeadsTable;
