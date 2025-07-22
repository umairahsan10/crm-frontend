import React from 'react';
import './DataTable.css';

interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableRow {
  id: string | number;
  [key: string]: any;
}

interface DataTableProps {
  title?: string;
  subtitle?: string;
  columns: TableColumn[];
  data: TableRow[];
  onRowClick?: (row: TableRow) => void;
  className?: string;
}

const DataTable: React.FC<DataTableProps> = ({
  title,
  subtitle,
  columns,
  data,
  onRowClick,
  className = ''
}) => {
  const handleRowClick = (row: TableRow) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  return (
    <div className={`data-table-container ${className}`}>
      {/* Title block */}
      {(title || subtitle) && (
        <div className="table-header">
          {title && <h1 className="table-title">{title}</h1>}
          {subtitle && <p className="table-subtitle">{subtitle}</p>}
        </div>
      )}

      {/* Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className="table-header-cell"
                  style={{ 
                    width: column.width,
                    textAlign: column.align || 'left'
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.id}
                onClick={() => handleRowClick(row)}
                className={onRowClick ? 'clickable-row' : ''}
              >
                {columns.map((column) => (
                  <td 
                    key={column.key}
                    className="table-cell"
                    style={{ textAlign: column.align || 'left' }}
                  >
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable; 