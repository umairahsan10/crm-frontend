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
      border focus:outline-none focus:ring-1 focus:ring-offset-1
      hover:scale-105 active:scale-95 cursor-pointer
      flex-shrink-0 whitespace-nowrap relative overflow-hidden group
      before:absolute before:inset-0 before:opacity-0 before:transition-all before:duration-500 before:ease-out
      before:bg-gradient-to-r before:from-transparent before:via-white before:to-transparent
      before:transform before:-skew-x-12 before:-translate-x-full
      hover:before:opacity-30 hover:before:translate-x-full
      after:absolute after:inset-0 after:rounded-full after:opacity-0 after:transition-all after:duration-300 after:ease-out
      after:border after:border-transparent
      hover:after:opacity-100 hover:after:border-white/20 hover:after:shadow-inner
    `;

    if (isActive) {
      const departmentColors = {
        'sales': 'bg-gradient-to-r from-emerald-500 to-green-600 border-emerald-500 text-white shadow-emerald-200/50 ring-emerald-200/50 hover:from-emerald-600 hover:to-green-700 hover:border-emerald-400 hover:shadow-emerald-300/60 hover:ring-emerald-300/30',
        'marketing': 'bg-gradient-to-r from-purple-500 to-pink-600 border-purple-500 text-white shadow-purple-200/50 ring-purple-200/50 hover:from-purple-600 hover:to-pink-700 hover:border-purple-400 hover:shadow-purple-300/60 hover:ring-purple-300/30',
        'production': 'bg-gradient-to-r from-orange-500 to-red-600 border-orange-500 text-white shadow-orange-200/50 ring-orange-200/50 hover:from-orange-600 hover:to-red-700 hover:border-orange-400 hover:shadow-orange-300/60 hover:ring-orange-300/30',
        'hr': 'bg-gradient-to-r from-pink-500 to-rose-600 border-pink-500 text-white shadow-pink-200/50 ring-pink-200/50 hover:from-pink-600 hover:to-rose-700 hover:border-pink-400 hover:shadow-pink-300/60 hover:ring-pink-300/30',
        'accounting': 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-500 text-white shadow-cyan-200/50 ring-cyan-200/50 hover:from-cyan-600 hover:to-blue-700 hover:border-cyan-400 hover:shadow-cyan-300/60 hover:ring-cyan-300/30'
      };

      const activeClasses = department && departmentColors[department as keyof typeof departmentColors] 
        ? departmentColors[department as keyof typeof departmentColors]
        : 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white shadow-blue-200/50 ring-blue-200/50 hover:from-blue-700 hover:to-indigo-700 hover:border-blue-500 hover:shadow-blue-300/60 hover:ring-blue-300/30';

      return `${baseClasses} ${activeClasses} transform scale-105 hover:scale-110 focus:ring-blue-500 focus-visible:ring-4 focus-visible:ring-blue-400/50 ring-2 hover:after:border-white/30 hover:after:ring-2 hover:after:ring-white/20`;
    } else {
      return `${baseClasses} bg-white text-gray-600 border-gray-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:border-gray-300 hover:text-gray-800 focus:ring-gray-400 focus-visible:ring-4 focus-visible:ring-gray-400/50 shadow-sm hover:shadow-lg ring-1 ring-gray-100 hover:ring-2 hover:ring-gray-200 hover:border-gray-400 hover:shadow-md hover:after:border-gray-300/50 hover:after:ring-1 hover:after:ring-gray-200/50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500 dark:hover:text-gray-100 dark:ring-gray-700 dark:hover:ring-gray-600 dark:hover:after:border-gray-400/30`;
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
          <span className="mr-1 text-xs">🏢</span>
          All
        </button>
        
        {/* Department Buttons */}
        {departments.map((department) => {
          const departmentClass = department.toLowerCase();
          const departmentIcons: { [key: string]: string } = {
            'sales': '💼',
            'marketing': '📈',
            'production': '⚙️',
            'hr': '👥',
            'accounting': '💰'
          };
          
          return (
            <button
              key={department}
              onClick={() => onDepartmentSelect(department)}
              className={getButtonClasses(selectedDepartment === department, departmentClass)}
            >
              <span className="mr-1 text-xs">{departmentIcons[departmentClass] || '🏢'}</span>
              {department}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DepartmentFilter;
