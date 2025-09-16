import React from 'react';

export interface DepartmentFilterProps {
  departments: string[];
  selectedDepartment: string | null;
  onDepartmentSelect: (department: string | null) => void;
  className?: string;
}

const DepartmentFilter: React.FC<DepartmentFilterProps> = ({
  departments,
  selectedDepartment,
  onDepartmentSelect,
  className = ''
}) => {
  const getButtonClasses = (isActive: boolean, department?: string) => {
    const baseClasses = `
      px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ease-in-out
      border focus:outline-none focus:ring-2 focus:ring-offset-1
      hover:scale-105 active:scale-95 cursor-pointer
      flex-shrink-0 whitespace-nowrap flex items-center justify-center
    `;

    if (isActive) {
      const departmentColors = {
        'sales': 'bg-green-500 border-green-500 text-white hover:bg-green-600 hover:border-green-600 shadow-lg shadow-green-200/50 focus:ring-green-500',
        'marketing': 'bg-purple-500 border-purple-500 text-white hover:bg-purple-600 hover:border-purple-600 shadow-lg shadow-purple-200/50 focus:ring-purple-500',
        'production': 'bg-orange-500 border-orange-500 text-white hover:bg-orange-600 hover:border-orange-600 shadow-lg shadow-orange-200/50 focus:ring-orange-500',
        'hr': 'bg-pink-500 border-pink-500 text-white hover:bg-pink-600 hover:border-pink-600 shadow-lg shadow-pink-200/50 focus:ring-pink-500',
        'accounting': 'bg-blue-500 border-blue-500 text-white hover:bg-blue-600 hover:border-blue-600 shadow-lg shadow-blue-200/50 focus:ring-blue-500'
      };

      const activeClasses = department && departmentColors[department as keyof typeof departmentColors] 
        ? departmentColors[department as keyof typeof departmentColors]
        : 'bg-blue-500 border-blue-500 text-white hover:bg-blue-600 hover:border-blue-600 shadow-lg shadow-blue-200/50 focus:ring-blue-500';

      return `${baseClasses} ${activeClasses} transform scale-105 hover:scale-110`;
    } else {
      const departmentColors = {
        'sales': 'bg-white text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 hover:text-green-700 focus:ring-green-400',
        'marketing': 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 focus:ring-purple-400',
        'production': 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 focus:ring-orange-400',
        'hr': 'bg-white text-pink-600 border-pink-200 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-700 focus:ring-pink-400',
        'accounting': 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 focus:ring-blue-400'
      };

      const inactiveClasses = department && departmentColors[department as keyof typeof departmentColors] 
        ? departmentColors[department as keyof typeof departmentColors]
        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 focus:ring-gray-400';

      return `${baseClasses} ${inactiveClasses} shadow-sm hover:shadow-md`;
    }
  };

  return (
    <div className={`w-full transition-all duration-300 ease-in-out ${className}`}>
      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 transition-all duration-300 ease-in-out">
        {/* All Departments Button */}
        <button
          onClick={() => onDepartmentSelect(null)}
          className={getButtonClasses(selectedDepartment === null)}
        >
          <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
          </svg>
          All
        </button>
        
        {/* Department Buttons */}
        {departments.map((department) => {
          const departmentClass = department.toLowerCase();
          
          const getDepartmentIcon = (dept: string) => {
            switch (dept) {
              case 'sales':
                return (
                  <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                );
              case 'marketing':
                return (
                  <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                );
              case 'production':
                return (
                  <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                );
              case 'hr':
                return (
                  <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                );
              case 'accounting':
                return (
                  <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                );
              default:
                return (
                  <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                  </svg>
                );
            }
          };
          
          return (
            <button
              key={department}
              onClick={() => onDepartmentSelect(department)}
              className={getButtonClasses(selectedDepartment === department, departmentClass)}
            >
              {getDepartmentIcon(departmentClass)}
              {department}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DepartmentFilter;
