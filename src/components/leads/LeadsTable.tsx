import React from 'react';
import DynamicTable from '../common/DynamicTable/DynamicTable';
import { regularLeadsTableConfig } from './tableConfigs';
import type { Lead } from '../../types';

interface LeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onLeadClick: (lead: Lead) => void;
  onBulkSelect: (leadIds: string[]) => void;
  selectedLeads: string[];
}

const LeadsTable: React.FC<LeadsTableProps> = ({
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
  // Transform leads data to include contact info for the contact column
  const transformedLeads = leads.map(lead => ({
    ...lead,
    contact: {
      name: lead.name,
      email: lead.email,
      phone: lead.phone
    }
  }));
    
    return (
    <DynamicTable
      data={transformedLeads}
      columns={regularLeadsTableConfig}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      selectedItems={selectedLeads}
      onPageChange={onPageChange}
      onRowClick={onLeadClick}
      onBulkSelect={onBulkSelect}
      theme={{
        primary: 'blue',
        secondary: 'gray',
        accent: 'blue'
      }}
      emptyMessage="No leads available"
    />
  );
};

export default LeadsTable;
