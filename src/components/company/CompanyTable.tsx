import React from 'react';
import DynamicTable from '../common/DynamicTable/DynamicTable';
import { companyTableConfig } from './tableConfigs';

interface CompanyTableProps {
  companies: any[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onCompanyClick: (company: any) => void;
  onBulkSelect: (companyIds: string[]) => void;
  selectedCompanies: string[];
}

const CompanyTable: React.FC<CompanyTableProps> = ({
  companies,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onCompanyClick,
  onBulkSelect,
  selectedCompanies
}) => {
  // Transform companies data to include contact info for the contact column
  const transformedCompanies = companies.map(company => ({
    ...company,
    contact: {
      name: company.name,
      email: company.email,
      phone: company.phone,
      website: company.website
    }
  }));
    
  return (
    <DynamicTable
      data={transformedCompanies}
      columns={companyTableConfig}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      selectedItems={selectedCompanies}
      onPageChange={onPageChange}
      onRowClick={onCompanyClick}
      onBulkSelect={onBulkSelect}
      theme={{
        primary: 'blue',
        secondary: 'gray',
        accent: 'blue'
      }}
      emptyMessage="No companies available"
    />
  );
};

export default CompanyTable;

