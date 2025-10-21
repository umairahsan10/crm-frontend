import React from 'react';
import DynamicTable from '../common/DynamicTable/DynamicTable';
import { companyTableConfig } from './tableConfigs';
import type { Company } from '../../apis/company';

interface CompanyTableProps {
  companies: Company[];
  isLoading: boolean;
  onCompanyClick: (company: Company) => void;
  selectedCompanies: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

const CompanyTable: React.FC<CompanyTableProps> = ({
  companies,
  isLoading,
  onCompanyClick,
  selectedCompanies,
  onSelectionChange
}) => {
  // Transform companies data to match the table config
  const transformedCompanies = companies.map(company => ({
    ...company,
    // Ensure all required fields are present and convert id to string
    id: company.id.toString(),
    name: company.name || '',
    email: company.email || '',
    phone: company.phone || '',
    website: company.website || '',
    address: company.address || '',
    country: company.country || '',
    status: company.status || 'active',
    createdAt: company.createdAt || new Date().toISOString(),
    updatedAt: company.updatedAt || new Date().toISOString()
  }));

  return (
    <DynamicTable
      data={transformedCompanies}
      columns={companyTableConfig}
      isLoading={isLoading}
      currentPage={1}
      totalPages={1}
      totalItems={transformedCompanies.length}
      itemsPerPage={transformedCompanies.length}
      onPageChange={() => {}}
      onRowClick={onCompanyClick}
      onBulkSelect={onSelectionChange}
      selectedItems={selectedCompanies}
    />
  );
};

export default CompanyTable;