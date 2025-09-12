import React from 'react';
import './DataList.css';

export interface DataListItem {
  id: string | number;
  [key: string]: any;
}

interface DataListProps {
  data: DataListItem[];
  renderItem: (item: DataListItem) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

const DataList: React.FC<DataListProps> = ({
  data,
  renderItem,
  emptyMessage = 'No data available',
  className = ''
}) => {
  if (data.length === 0) {
    return (
      <div className={`data-list-empty ${className}`}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`data-list ${className}`}>
      {data.map((item) => (
        <div key={item.id} className="data-list-item">
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
};

export default DataList;
