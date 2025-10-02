import React from 'react';
import DynamicTable from '../common/DynamicTable/DynamicTable';
import { crackedLeadsTableConfig } from './tableConfigs';
import { getCrackedLeadApi } from '../../apis/leads';

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
  const transformedLeads = leads.map((crackedLead: any) => ({
    ...crackedLead,
    id: crackedLead.id, // Use cracked lead ID for selection
    lead: {
      name: crackedLead.lead?.name,
      email: crackedLead.lead?.email,
      phone: crackedLead.lead?.phone
    },
    amount: crackedLead.amount,
    commissionRate: crackedLead.commissionRate,
    currentPhase: crackedLead.currentPhase,
    totalPhases: crackedLead.totalPhases,
    status: 'cracked' // All cracked leads have cracked status
  }));

  // Create a handler that fetches full cracked lead details from API
  const handleRowClick = async (crackedLead: any) => {
    try {
      // Fetch the complete cracked lead details from the API
      const response = await getCrackedLeadApi(crackedLead.id);
      
      if (response.success && response.data) {
        const fullCrackedLeadData = response.data;
        
        console.log('📊 Full Cracked Lead Data:', fullCrackedLeadData);
        console.log('📌 Lead Source:', fullCrackedLeadData.lead?.source);
        console.log('📌 Sales Unit:', fullCrackedLeadData.lead?.salesUnit);
        
        // Create a lead object that matches what the drawer expects
        const fullLeadData = {
          ...fullCrackedLeadData.lead, // Original lead data with comments and outcomeHistory
          // Add cracked lead specific data
          crackedLeads: [fullCrackedLeadData], // Full cracked lead data with industry, employee, etc.
          // Explicitly ensure all fields are available (override in case they're missing)
          source: fullCrackedLeadData.lead?.source || fullCrackedLeadData.lead?.source,
          salesUnitId: fullCrackedLeadData.lead?.salesUnit?.id || fullCrackedLeadData.lead?.salesUnitId,
          salesUnit: fullCrackedLeadData.lead?.salesUnit
        };
        
        console.log('✅ Final Lead Data to Drawer:', fullLeadData);
        console.log('✅ Final Source:', fullLeadData.source);
        console.log('✅ Final Sales Unit:', fullLeadData.salesUnit);
        
        onLeadClick(fullLeadData);
      } else {
        console.error('Failed to fetch cracked lead details:', response.message);
        // Fallback to limited data if API fails
        const fallbackData = {
          ...crackedLead.lead,
          crackedLeads: [crackedLead],
          source: crackedLead.lead?.source,
          salesUnitId: crackedLead.lead?.salesUnitId,
          salesUnit: crackedLead.lead?.salesUnit
        };
        onLeadClick(fallbackData);
      }
    } catch (error) {
      console.error('Error fetching cracked lead details:', error);
      // Fallback to limited data if API fails
      const fallbackData = {
        ...crackedLead.lead,
        crackedLeads: [crackedLead],
        source: crackedLead.lead?.source,
        salesUnitId: crackedLead.lead?.salesUnitId,
        salesUnit: crackedLead.lead?.salesUnit
      };
      onLeadClick(fallbackData);
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
