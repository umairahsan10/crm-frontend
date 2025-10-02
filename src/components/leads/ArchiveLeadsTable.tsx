import React from 'react';
import DynamicTable from '../common/DynamicTable/DynamicTable';
import { archivedLeadsTableConfig } from './tableConfigs';

interface ArchiveLeadsTableProps {
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

const ArchiveLeadsTable: React.FC<ArchiveLeadsTableProps> = ({
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
  // Transform archived leads data for the dynamic table
  const transformedLeads = leads.map((archivedLead: any) => ({
    ...archivedLead,
    id: archivedLead.id,
    contact: {
      name: archivedLead.name,
      email: archivedLead.email,
      phone: archivedLead.phone
    },
    source: archivedLead.source,
    outcome: archivedLead.outcome,
    qualityRating: archivedLead.qualityRating,
    archivedOn: archivedLead.archivedOn,
    employee: archivedLead.employee
  }));

  // Create a handler that passes the full archived lead data structure to the drawer
  const handleRowClick = (archivedLead: any) => {
    // Create a lead object that includes the archived lead data for the drawer
    const fullLeadData = {
      id: archivedLead.id,
      name: archivedLead.name,
      email: archivedLead.email,
      phone: archivedLead.phone,
      source: archivedLead.source,
      outcome: archivedLead.outcome,
      qualityRating: archivedLead.qualityRating,
      archivedOn: archivedLead.archivedOn,
      // Include archived-specific fields
      employee: archivedLead.employee,
      unit: archivedLead.unit,
      salesUnitId: archivedLead.unit?.id,
      salesUnit: archivedLead.unit,
      // Add any other fields the drawer might need
      status: 'archived',
      type: archivedLead.type || 'unknown'
    };
    onLeadClick(fullLeadData);
    };
    
    return (
    <DynamicTable
      data={transformedLeads}
      columns={archivedLeadsTableConfig}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      selectedItems={selectedLeads}
      onPageChange={onPageChange}
      onRowClick={handleRowClick}
      onBulkSelect={onBulkSelect}
      theme={{
        primary: 'gray',
        secondary: 'gray',
        accent: 'gray'
      }}
      emptyMessage="No archived leads available"
    />
  );
};

export default ArchiveLeadsTable;
