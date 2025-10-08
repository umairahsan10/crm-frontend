import React from 'react';
import DynamicTable from '../common/DynamicTable/DynamicTable';
import { assetsTableConfig } from './tableConfigs';
import type { Asset } from '../../types';

interface AssetsTableProps {
  assets: Asset[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onAssetClick: (asset: Asset) => void;
  onBulkSelect: (assetIds: string[]) => void;
  selectedAssets: string[];
}

const AssetsTable: React.FC<AssetsTableProps> = ({
  assets,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onAssetClick,
  onBulkSelect,
  selectedAssets
}) => {
  // Transform assets data for the table
  const transformedAssets = assets.map(asset => ({
    ...asset,
    // Transform vendor for assignment type
    vendor: asset.transaction?.vendor?.name || 'N/A'
  }));
    
  return (
    <DynamicTable
      data={transformedAssets}
      columns={assetsTableConfig}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      selectedItems={selectedAssets}
      onPageChange={onPageChange}
      onRowClick={onAssetClick}
      onBulkSelect={onBulkSelect}
      theme={{
        primary: 'indigo',
        secondary: 'gray',
        accent: 'indigo'
      }}
      emptyMessage="No assets available"
    />
  );
};

export default AssetsTable;

