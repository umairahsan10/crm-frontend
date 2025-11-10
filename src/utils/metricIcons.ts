import React from 'react';

/**
 * Maps metric titles to icons
 * Icons are handled on frontend for better control and consistency
 */
export const getMetricIcon = (title: string): React.ReactNode => {
  // Normalize title for matching (case-insensitive, trim whitespace)
  const normalizedTitle = title.trim().toLowerCase();

  const iconMap: Record<string, React.ReactNode> = {
    // Sales Department
    'leads': '📋',
    'total leads': '📋',
    'unit leads': '📋',
    'team leads': '📋',
    'my assigned leads': '📋',
    'conversion rate': '📈',
    'unit conversion rate': '📈',
    'team conversion rate': '📈',
    'my conversion rate': '📈',
    'revenue': '💰',
    'monthly revenue': '💰',
    'unit revenue': '💰',
    'team revenue': '💰',
    'my commission earned': '💰',
    'won deals': '✅',
    'total won deals': '✅',
    'unit won deals': '✅',
    'team won deals': '✅',
    'my won deals': '✅',

    // HR Department
    'employees': '👥',
    'all active employees': '👥',
    'total employees': '👥',
    'department employees': '👥',
    'team size': '👥',
    'my team size': '👥',
    'attendance rate': '📅',
    'department attendance': '📅',
    'team attendance': '📅',
    'my attendance status': '📅',
    'present employees': '✅',
    'pending tasks': '📝',
    'request pending': '📝',
    'total leaves': '🏖️',
    'on leave today': '🏖️',
    'my leave balance': '🏖️',
    'new hires': '🆕',

    // Marketing Department
    'active campaigns': '📢',
    'total campaigns': '📢',
    'unit campaigns': '📢',
    'team campaigns': '📢',
    'my campaigns': '📢',
    'roi': '📊',
    'budget utilization': '💵',
    'monthly budget': '💵',
    'unit budget': '💵',
    'budget used': '💵',

    // Production Department
    'projects': '📁',
    'all active projects': '📁',
    'total projects': '📁',
    'unit projects': '📁',
    'team projects': '📁',
    'active projects': '📁',
    'completed projects': '✅',
    'team employees': '👨‍👩‍👧‍👦',
    'team members': '👤',
    'my active tasks': '📋',
    'next deadline': '⏰',
    'progress': '📊',
    'efficiency rate': '⚡',
    'unit efficiency': '⚡',
    'team efficiency': '⚡',
    'my efficiency': '⚡',
    'quality score': '⭐',
    'unit quality': '⭐',
    'on track projects': '🎯',
    'most completed': '🏆',

    // Accounting/Finance Department
    'profit': '💵',
    'net profit': '💵',
    'expense': '💸',
    'expenses': '💸',
    'cash flow': '💳',
    'outstanding invoices': '📄',
    'monthly income': '💰',
    'my processed transactions': '🔄',
    'team processed payments': '💳',
    'my processed payments': '💳',
    'pending approvals': '⏳',

    // Admin
    'total users': '👥',
    'active today': '🟢',
    'departments': '🏢',
    'system health': '💚',
  };

  // Try exact match first
  if (iconMap[normalizedTitle]) {
    return iconMap[normalizedTitle];
  }

  // Try partial match (for titles with additional context)
  for (const [key, icon] of Object.entries(iconMap)) {
    if (normalizedTitle.includes(key) || key.includes(normalizedTitle)) {
      return icon;
    }
  }

  // Default icon if no match found
  return '📊';
};

