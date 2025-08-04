// components/common/DataTable/DataTable.tsx
import React, { useState, useMemo } from 'react';
import './DataTable.css';

type Column<T> = {
  header: string;
  accessor: keyof T;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  sortable?: boolean;
  paginated?: boolean;
  rowsPerPage?: number;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  emptyMessage?: string;
};

function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  searchable = false,
  sortable = false,
  paginated = false,
  rowsPerPage = 5,
  onRowClick,
  selectable = false,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  const filteredData = useMemo(() => {
    let filtered = data;

    if (searchable && searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = data.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(lower)
        )
      );
    }

    if (sortable && sortKey) {
      filtered = [...filtered].sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortKey, sortOrder, searchable, sortable]);

  const pagedData = paginated
    ? filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    : filteredData;

  const toggleSort = (accessor: keyof T) => {
    if (!sortable) return;
    if (sortKey === accessor) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(accessor);
      setSortOrder('asc');
    }
  };

  const toggleSelect = (id: string | number) => {
    setSelectedRows((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  return (
    <div className="container">
      {searchable && (
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search"
        />
      )}

      <table className="table">
        <thead>
          <tr>
            {selectable && <th />}
            {columns.map((col) => (
              <th
                key={String(col.accessor)}
                onClick={() => toggleSort(col.accessor)}
                className={sortable && col.sortable !== false ? 'sortable' : ''}
              >
                {col.header}
                {sortable && sortKey === col.accessor && (
                  <span className="sortIndicator">
                    {sortOrder === 'asc' ? ' ▲' : ' ▼'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pagedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            pagedData.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'clickable' : ''}
              >
                {selectable && (
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id!)}
                      onChange={() => toggleSelect(row.id!)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={String(col.accessor)}>
                    {col.render
                      ? col.render(row[col.accessor], row)
                      : String(row[col.accessor] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {paginated && filteredData.length > rowsPerPage && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {Math.ceil(filteredData.length / rowsPerPage)}
          </span>
          <button
            disabled={currentPage === Math.ceil(filteredData.length / rowsPerPage)}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default DataTable;
