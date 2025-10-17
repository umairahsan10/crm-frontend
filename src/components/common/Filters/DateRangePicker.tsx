import React from 'react';

export interface DateRangeValue {
  from: string;
  to: string;
}

export interface DateRangePickerProps {
  value?: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  fromLabel?: string;
  toLabel?: string;
  fromPlaceholder?: string;
  toPlaceholder?: string;
  className?: string;
  disabled?: boolean;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value = { from: '', to: '' },
  onChange,
  fromLabel = 'From Date',
  toLabel = 'To Date',
  fromPlaceholder = 'Start date',
  toPlaceholder = 'End date',
  className = '',
  disabled = false
}) => {
  const handleFromChange = (newFrom: string) => {
    onChange({ ...value, from: newFrom });
  };

  const handleToChange = (newTo: string) => {
    onChange({ ...value, to: newTo });
  };

  return (
    <div className={`flex gap-4 ${className}`}>
      {/* From Date */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {fromLabel}
        </label>
        <input
          type="date"
          value={value.from}
          onChange={(e) => handleFromChange(e.target.value)}
          placeholder={fromPlaceholder}
          disabled={disabled}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* To Date */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {toLabel}
        </label>
        <input
          type="date"
          value={value.to}
          onChange={(e) => handleToChange(e.target.value)}
          placeholder={toPlaceholder}
          disabled={disabled}
          min={value.from || undefined}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};

