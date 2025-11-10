import React, { useState } from 'react';
import DynamicTable from '../common/DynamicTable/DynamicTable';
import { crackedLeadsTableConfig } from './tableConfigs';
import { useCrackedLeadDetail } from '../../hooks/queries/useLeadsQueries';

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

  // State to track which lead detail is being fetched
  const [selectedCrackedLeadId, setSelectedCrackedLeadId] = useState<number | null>(null);
  
  // Use React Query hook to fetch lead details with caching
  const leadDetailQuery = useCrackedLeadDetail(selectedCrackedLeadId);

  // Handle row click - use cached data if available
  const handleRowClick = (crackedLead: any) => {
    // Set the selected ID to trigger the query (or use cached data)
    setSelectedCrackedLeadId(crackedLead.id);
  };

  // Watch for data changes and update when query completes or uses cache
  React.useEffect(() => {
    if (selectedCrackedLeadId && leadDetailQuery.data) {
      const response = leadDetailQuery.data;
      const fullCrackedLeadData = response.data || response;
      
      if (fullCrackedLeadData) {
        const fullLeadData = {
          ...fullCrackedLeadData.lead,
          crackedLeads: [fullCrackedLeadData],
          source: fullCrackedLeadData.lead?.source || fullCrackedLeadData.lead?.source,
          salesUnitId: fullCrackedLeadData.lead?.salesUnit?.id || fullCrackedLeadData.lead?.salesUnitId,
          salesUnit: fullCrackedLeadData.lead?.salesUnit
        };
        
        onLeadClick(fullLeadData);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCrackedLeadId, leadDetailQuery.data]);
    
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
