import React from 'react';

export interface AmountRangeValue {
  min: string;
  max: string;
}

export interface AmountRangePickerProps {
  value?: AmountRangeValue;
  onChange: (value: AmountRangeValue) => void;
  minLabel?: string;
  maxLabel?: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  currency?: string;
  className?: string;
  disabled?: boolean;
}

export const AmountRangePicker: React.FC<AmountRangePickerProps> = ({
  value = { min: '', max: '' },
  onChange,
  minLabel = 'Min Amount',
  maxLabel = 'Max Amount',
  minPlaceholder = 'Min',
  maxPlaceholder = 'Max',
  currency = '$',
  className = '',
  disabled = false
}) => {
  const handleMinChange = (newMin: string) => {
    // Only allow positive numbers and decimals
    const numericValue = newMin.replace(/[^0-9.]/g, '');
    if (numericValue === '' || (parseFloat(numericValue) >= 0)) {
      onChange({ ...value, min: numericValue });
    }
  };

  const handleMaxChange = (newMax: string) => {
    // Only allow positive numbers and decimals
    const numericValue = newMax.replace(/[^0-9.]/g, '');
    if (numericValue === '' || (parseFloat(numericValue) >= 0)) {
      onChange({ ...value, max: numericValue });
    }
  };

  return (
    <div className={`flex gap-4 ${className}`}>
      {/* Min Amount */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {minLabel}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{currency}</span>
          </div>
          <input
            type="text"
            value={value.min}
            onChange={(e) => handleMinChange(e.target.value)}
            placeholder={minPlaceholder}
            disabled={disabled}
            className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Max Amount */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {maxLabel}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{currency}</span>
          </div>
          <input
            type="text"
            value={value.max}
            onChange={(e) => handleMaxChange(e.target.value)}
            placeholder={maxPlaceholder}
            disabled={disabled}
            className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
};

