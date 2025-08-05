import React, { useState, useCallback, useEffect } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof codeItems>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.header-search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
          
          <button className="header-btn" aria-label="User menu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header; 