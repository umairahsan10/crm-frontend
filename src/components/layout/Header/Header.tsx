import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Header.css';

// Static list of code-related items for search
const codeItems = [
  { id: 1, title: 'AttendancePage.tsx', type: 'file', category: 'pages', description: 'Attendance management page component' },
  { id: 2, title: 'Header.tsx', type: 'file', category: 'components', description: 'Main header component' },
  { id: 3, title: 'DataTable.tsx', type: 'file', category: 'components', description: 'Reusable data table component' },
  { id: 4, title: 'AttendanceLog.tsx', type: 'file', category: 'components', description: 'Attendance log display component' },
  { id: 5, title: 'useState', type: 'hook', category: 'react', description: 'React state management hook' },
  { id: 6, title: 'useEffect', type: 'hook', category: 'react', description: 'React side effect hook' },
  { id: 7, title: 'handleSubmit', type: 'function', category: 'events', description: 'Form submission handler' },
  { id: 8, title: 'onClick', type: 'event', category: 'events', description: 'Click event handler' },
  { id: 9, title: 'className', type: 'prop', category: 'react', description: 'CSS class name property' },
  { id: 10, title: 'useState', type: 'hook', category: 'react', description: 'React state management hook' },
  { id: 11, title: 'Header.css', type: 'file', category: 'styles', description: 'Header component styles' },
  { id: 12, title: 'AttendancePage.css', type: 'file', category: 'styles', description: 'Attendance page styles' },
  { id: 13, title: 'export default', type: 'keyword', category: 'javascript', description: 'Default export statement' },
  { id: 14, title: 'React.FC', type: 'type', category: 'typescript', description: 'React functional component type' },
  { id: 15, title: 'interface', type: 'keyword', category: 'typescript', description: 'TypeScript interface declaration' }
];

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof codeItems>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const autoCloseTimeoutRef = useRef<number | null>(null);

  // Filter code items based on search query
  const filterItems = useCallback((query: string) => {
    if (query.trim().length < 2) return [];
    
    const lowerQuery = query.toLowerCase();
    return codeItems.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery) ||
      item.type.toLowerCase().includes(lowerQuery)
    );
  }, []);

  // Handle search input changes
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim().length >= 2) {
      setIsSearching(true);
      setShowSearchResults(true);
      
      // Simulate search delay
      setTimeout(() => {
        const results = filterItems(value);
        setSearchResults(results);
        setIsSearching(false);
      }, 150);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
    }
  }, [filterItems]);

  // Handle search result selection
  const handleResultSelect = useCallback((item: typeof codeItems[0]) => {
    setSearchQuery(item.title);
    setShowSearchResults(false);
    console.log('Selected:', item);
    // Here you could navigate to the file or perform other actions
  }, []);

  // Handle search submission
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Search submitted:', searchQuery);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  // Auto-close profile dropdown after 2 seconds unless mouse is hovering
  useEffect(() => {
    if (showProfileDropdown) {
      console.log('Setting auto-close timer for profile dropdown');
      // Clear any existing timeout
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
      
      // Set new timeout to close after 2 seconds
      autoCloseTimeoutRef.current = setTimeout(() => {
        console.log('Auto-closing profile dropdown');
        setShowProfileDropdown(false);
      }, 2000);
    } else {
      // Clear timeout when dropdown is closed
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
        autoCloseTimeoutRef.current = null;
      }
    }

    // Cleanup timeout on unmount
    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
    };
  }, [showProfileDropdown]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.header-search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle mouse enter - pause auto-close
  const handleMouseEnter = () => {
    console.log('Mouse entered profile dropdown - pausing auto-close');
    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
      autoCloseTimeoutRef.current = null;
    }
  };

  // Handle mouse leave - resume auto-close
  const handleMouseLeave = () => {
    console.log('Mouse left profile dropdown - resuming auto-close');
    if (showProfileDropdown) {
      autoCloseTimeoutRef.current = setTimeout(() => {
        console.log('Auto-closing profile dropdown after mouse leave');
        setShowProfileDropdown(false);
      }, 2000);
    }
  };

  // Handle profile dropdown actions
  const handleProfileAction = (action: string) => {
    setShowProfileDropdown(false);
    if (action === 'profile') {
      navigate('/profile');
    } else if (action === 'settings') {
      navigate('/settings');
    } else if (action === 'logout') {
      logout();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSearchResults(false);
    }
  }, []);

  return (
    <div className="header">
      <div className="header-left">
        <h1 className="header-title">CRM Dashboard</h1>
      </div>

      <div className="header-center header-search-container">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search files, functions, hooks..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={() => searchQuery.trim().length >= 2 && setShowSearchResults(true)}
            />
            <button type="submit" className="search-button" aria-label="Search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="search-results-dropdown">
              {isSearching ? (
                <div className="search-loading">
                  <div className="loading-spinner"></div>
                  <span>Searching...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="search-results-list">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="search-result-item"
                      onClick={() => handleResultSelect(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleResultSelect(item);
                        }
                      }}
                    >
                      <div className="result-icon">
                        {item.type === 'file' && '📄'}
                        {item.type === 'hook' && '⚛️'}
                        {item.type === 'function' && '🔧'}
                        {item.type === 'event' && '🖱️'}
                        {item.type === 'prop' && '🏷️'}
                        {item.type === 'keyword' && '🔑'}
                        {item.type === 'type' && '📝'}
                      </div>
                      <div className="result-content">
                        <div className="result-title">{item.title}</div>
                        <div className="result-description">{item.description}</div>
                      </div>
                      <div className="result-category">{item.category}</div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim().length >= 2 ? (
                <div className="search-no-results">
                  <span>No results found for "{searchQuery}"</span>
                  <p>Try searching for files, functions, or hooks</p>
                </div>
              ) : null}
            </div>
          )}
        </form>
      </div>

      <div className="header-right">
        <div className="header-actions">
          <button className="header-btn" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <path d="m13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          
          <div 
            className="profile-dropdown-container relative" 
            ref={profileDropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button 
              className="header-btn flex items-center space-x-2" 
              aria-label="User menu"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Profile button clicked, current state:', showProfileDropdown);
                setShowProfileDropdown(!showProfileDropdown);
              }}
            >
              <img
                src={user?.avatar || '/default-avatar.svg'}
                alt="Profile"
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="hidden sm:block text-sm font-medium">User</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </button>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">User</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                <button
                  onClick={() => handleProfileAction('profile')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => handleProfileAction('settings')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  <span>Settings</span>
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button
                  onClick={() => handleProfileAction('logout')}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16,17 21,12 16,7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header; 