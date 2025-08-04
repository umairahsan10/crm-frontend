import React, { useState, useCallback, useEffect } from 'react';
import SearchBar from '../../common/SearchBar/SearchBar';
import { debouncedSearch, performGlobalSearch, type SearchResult } from '../../../utils/globalSearchService';
import './Header.css';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Handle search input changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setShowSearchResults(true);
    
    if (value.trim().length >= 2) {
      setIsSearching(true);
      debouncedSearch(value, (results) => {
        setSearchResults(results);
        setIsSearching(false);
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, []);

  // Handle search submission
  const handleSearchSubmit = useCallback((value: string) => {
    if (value.trim()) {
      // Here you could navigate to a search results page
      // or perform additional actions
      setShowSearchResults(false);
    }
  }, []);

  // Handle search result selection
  const handleSearchResultSelect = useCallback((result: SearchResult) => {
    setSearchQuery(result.title);
    setShowSearchResults(false);
    
    // Here you could navigate to the result's URL
    // window.location.href = result.url || '#';
  }, []);

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

  // Custom render function for search dropdown
  const renderSearchDropdown = useCallback((results: SearchResult[], isLoading: boolean, onSelect: (item: SearchResult) => void) => {
    if (isLoading) {
      return (
        <div className="global-search-dropdown">
          <div className="search-dropdown-loading">
            <div className="loading-spinner"></div>
            <span>Searching...</span>
          </div>
        </div>
      );
    }

    if (results.length === 0 && searchQuery.trim().length >= 2) {
      return (
        <div className="global-search-dropdown">
          <div className="search-dropdown-empty">
            <span>No results found for "{searchQuery}"</span>
            <p>Try searching for employees, leads, deals, or customers</p>
          </div>
        </div>
      );
    }

    return (
      <div className="global-search-dropdown">
        {results.map((result, index) => (
          <div
            key={`${result.type}-${result.id}`}
            className="search-dropdown-item"
            onClick={() => onSelect(result)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(result);
              }
            }}
          >
            <div className="search-result-icon">{result.icon}</div>
            <div className="search-result-content">
              <div className="search-result-title">{result.title}</div>
              {result.subtitle && (
                <div className="search-result-subtitle">{result.subtitle}</div>
              )}
              {result.description && (
                <div className="search-result-description">{result.description}</div>
              )}
            </div>
            <div className="search-result-type">{result.type}</div>
          </div>
        ))}
      </div>
    );
  }, [searchQuery]);

  return (
    <div className="header">
      <div className="header-left">
        <h1 className="header-title">CRM Dashboard</h1>
      </div>

      <div className="header-center header-search-container">
        <SearchBar 
          placeholder="Search employees, leads, deals, customers..."
          value={searchQuery}
          controlled={true}
          onChange={handleSearchChange}
          onSearch={handleSearchSubmit}
          onEnter={handleSearchSubmit}
          showDropdown={true}
          dropdownResults={searchResults}
          dropdownLoading={isSearching}
          dropdownVisible={showSearchResults}
          renderDropdown={renderSearchDropdown}
          minSearchLength={2}
          debounceDelay={300}
          searchOnInput={true}
          searchOnEnter={true}
          size="md"
          theme="light"
          variant="rounded"
          showClearButton={true}
          showSearchButton={true}
        />
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