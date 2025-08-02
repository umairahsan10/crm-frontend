import React, { useState } from 'react';
import DataTable, { Column, Action } from '../../common/DataTable/DataTable';

interface Booking {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  amount: number;
}

const BookingsTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  const mockBookings: Booking[] = [
    {
      id: '1',
      customerName: 'John Smith',
      service: 'Haircut & Styling',
      date: '2024-01-15',
      time: '10:00 AM',
      status: 'confirmed',
      amount: 45
    },
    {
      id: '2',
      customerName: 'Sarah Johnson',
      service: 'Manicure',
      date: '2024-01-15',
      time: '11:30 AM',
      status: 'pending',
      amount: 25
    },
    {
      id: '3',
      customerName: 'Mike Wilson',
      service: 'Beard Trim',
      date: '2024-01-15',
      time: '2:00 PM',
      status: 'confirmed',
      amount: 20
    },
    {
      id: '4',
      customerName: 'Emily Davis',
      service: 'Hair Color',
      date: '2024-01-16',
      time: '9:00 AM',
      status: 'cancelled',
      amount: 80
    },
    {
      id: '5',
      customerName: 'David Brown',
      service: 'Haircut',
      date: '2024-01-16',
      time: '1:00 PM',
      status: 'confirmed',
      amount: 35
    }
  ];

  const columns: Column<Booking>[] = [
    {
      key: 'customerName',
      label: 'Customer Name',
      sortable: true
    },
    {
      key: 'service',
      label: 'Service',
      sortable: true
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'time',
      label: 'Time',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`status-badge status-badge--${value}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value: number) => `$${value.toFixed(2)}`
    }
  ];

  const actions: Action<Booking>[] = [
    {
      label: 'Edit',
      onClick: (booking) => {
        console.log('Edit booking:', booking);
      },
      variant: 'primary'
    },
    {
      label: 'Delete',
      onClick: (booking) => {
        console.log('Delete booking:', booking);
      },
      variant: 'danger'
    }
  ];

  const handleRowClick = (booking: Booking) => {
    console.log('Booking clicked:', booking);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    console.log('Sort by:', key, direction);
  };

  return (
    <div className="bookings-table-container">
      <h2>Recent Bookings</h2>
      <DataTable
        data={mockBookings}
        columns={columns}
        pagination={{
          currentPage,
          pageSize,
          totalItems: mockBookings.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
          pageSizeOptions: [5, 10, 25, 50]
        }}
        searchable={true}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchKeys={['customerName', 'service']}
        onRowClick={handleRowClick}
        onSort={handleSort}
        actions={actions}
        striped={true}
        hoverable={true}
        bordered={true}
        className="bookings-table"
        ariaLabel="Bookings data table"
      />
    </div>
  );
};

export default BookingsTable; 