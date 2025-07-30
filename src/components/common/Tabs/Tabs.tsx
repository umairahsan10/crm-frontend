import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import './Tabs.css';

// Tab orientation variants
export type TabsOrientation = 'horizontal' | 'vertical';

// Tab alignment variants
export type TabsAlignment = 'left' | 'center' | 'right' | 'full';

// Tab size variants
export type TabsSize = 'sm' | 'md' | 'lg';

// Tab theme variants
export type TabsTheme = 'light' | 'dark' | 'primary' | 'secondary' | 'minimal';

// Tab variant types
export type TabsVariant = 'default' | 'pills' | 'underline' | 'bordered' | 'cards';

// Individual tab interface
export interface TabItem {
  /** Unique identifier for the tab */
  id: string;
  /** Tab label text */
  label: string;
  /** Tab content */
  content: React.ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
  /** Optional icon for the tab */
  icon?: React.ReactNode;
  /** Optional badge content */
  badge?: React.ReactNode;
  /** Optional tooltip for the tab */
  tooltip?: string;
  /** Custom CSS class for this tab */
  className?: string;
  /** Custom inline styles for this tab */
  style?: React.CSSProperties;
}

// Props interface
export interface TabsProps {
  /** Array of tab items */
  tabs: TabItem[];
  /** Currently active tab ID */
  activeTab?: string;
  /** Default active tab ID (for uncontrolled mode) */
  defaultActiveTab?: string;
  /** Whether the component is controlled */
  controlled?: boolean;
  /** Orientation of tabs */
  orientation?: TabsOrientation;
  /** Alignment of tabs */
  alignment?: TabsAlignment;
  /** Size variant */
  size?: TabsSize;
  /** Theme variant */
  theme?: TabsTheme;
  /** Visual variant */
  variant?: TabsVariant;
  /** Whether to show tab icons */
  showIcons?: boolean;
  /** Whether to show tab badges */
  showBadges?: boolean;
  /** Whether to show tab tooltips */
  showTooltips?: boolean;
  /** Whether to enable keyboard navigation */
  keyboardNavigation?: boolean;
  /** Whether to enable focus management */
  focusManagement?: boolean;
  /** Whether to show focus indicators */
  showFocusIndicators?: boolean;
  /** Whether to animate tab transitions */
  animate?: boolean;
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Whether to show tab borders */
  bordered?: boolean;
  /** Whether to show tab shadows */
  shadowed?: boolean;
  /** Whether to show tab backgrounds */
  backgrounded?: boolean;
  /** Whether to show tab separators */
  showSeparators?: boolean;
  /** Whether to allow tab reordering */
  reorderable?: boolean;
  /** Whether to show close buttons on tabs */
  closable?: boolean;
  /** Whether to show add button */
  addable?: boolean;
  /** Maximum number of tabs */
  maxTabs?: number;
  /** Minimum number of tabs */
  minTabs?: number;
  
  // Customization props
  /** Custom CSS class name */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Custom CSS class for tab list */
  tabListClassName?: string;
  /** Custom CSS class for tab panels */
  tabPanelsClassName?: string;
  /** Custom CSS class for individual tabs */
  tabClassName?: string;
  /** Custom CSS class for active tab */
  activeTabClassName?: string;
  /** Custom CSS class for disabled tab */
  disabledTabClassName?: string;
  /** Custom CSS class for tab content */
  tabContentClassName?: string;
  
  // Event handlers
  /** Callback when active tab changes */
  onTabChange?: (tabId: string, tab: TabItem) => void;
  /** Callback when tab is clicked */
  onTabClick?: (tabId: string, tab: TabItem, event: React.MouseEvent) => void;
  /** Callback when tab is focused */
  onTabFocus?: (tabId: string, tab: TabItem, event: React.FocusEvent) => void;
  /** Callback when tab is blurred */
  onTabBlur?: (tabId: string, tab: TabItem, event: React.FocusEvent) => void;
  /** Callback when tab is closed */
  onTabClose?: (tabId: string, tab: TabItem) => void;
  /** Callback when add button is clicked */
  onAddTab?: () => void;
  /** Callback when tabs are reordered */
  onReorder?: (newTabs: TabItem[]) => void;
  
  // Accessibility props
  /** ARIA label for tab list */
  'aria-label'?: string;
  /** ARIA described by */
  'aria-describedby'?: string;
  /** ARIA live region */
  'aria-live'?: 'polite' | 'assertive' | 'off';
  /** Role attribute */
  role?: string;
  /** ID for the tabs container */
  id?: string;
  
  // Custom render props
  /** Custom render function for tab */
  renderTab?: (tab: TabItem, isActive: boolean, isDisabled: boolean) => React.ReactNode;
  /** Custom render function for tab content */
  renderContent?: (tab: TabItem, isActive: boolean) => React.ReactNode;
  /** Custom render function for tab icon */
  renderIcon?: (tab: TabItem, isActive: boolean) => React.ReactNode;
  /** Custom render function for tab badge */
  renderBadge?: (tab: TabItem, isActive: boolean) => React.ReactNode;
  /** Custom render function for close button */
  renderCloseButton?: (tab: TabItem, onClose: () => void) => React.ReactNode;
  /** Custom render function for add button */
  renderAddButton?: (onAdd: () => void) => React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab: propActiveTab,
  defaultActiveTab,
  controlled = false,
  orientation = 'horizontal',
  alignment = 'left',
  size = 'md',
  theme = 'light',
  variant = 'default',
  showIcons = false,
  showBadges = false,
  showTooltips = false,
  keyboardNavigation = true,
  focusManagement = true,
  showFocusIndicators: _showFocusIndicators = true,
  animate = true,
  animationDuration = 200,
  bordered = false,
  shadowed = false,
  backgrounded = true,
  showSeparators = false,
  reorderable: _reorderable = false,
  closable = false,
  addable = false,
  maxTabs,
  minTabs = 1,
  className = '',
  style = {},
  tabListClassName = '',
  tabPanelsClassName = '',
  tabClassName = '',
  activeTabClassName = '',
  disabledTabClassName = '',
  tabContentClassName = '',
  onTabChange,
  onTabClick,
  onTabFocus,
  onTabBlur,
  onTabClose,
  onAddTab,
  onReorder,
  'aria-label': ariaLabel = 'Tabs',
  'aria-describedby': ariaDescribedBy,
  'aria-live': ariaLive = 'polite',
  role = 'tablist',
  id,
  renderTab,
  renderContent,
  renderIcon,
  renderBadge,
  renderCloseButton,
  renderAddButton
}) => {
  // State
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (controlled && propActiveTab) return propActiveTab;
    if (defaultActiveTab) return defaultActiveTab;
    return tabs.length > 0 ? tabs[0].id : '';
  });
  const [_focusedTab, setFocusedTab] = useState<string>('');
  const [tabsState, setTabsState] = useState<TabItem[]>(tabs);

  // Refs
  const tabRefs = useRef<Record<string, HTMLButtonElement>>({});
  const tabListRef = useRef<HTMLDivElement>(null);

  // Update active tab when prop changes (controlled mode)
  useEffect(() => {
    if (controlled && propActiveTab) {
      setActiveTab(propActiveTab);
    }
  }, [controlled, propActiveTab]);

  // Update tabs state when tabs prop changes
  useEffect(() => {
    setTabsState(tabs);
  }, [tabs]);

  // Validate active tab exists
  useEffect(() => {
    const activeTabExists = tabsState.some(tab => tab.id === activeTab);
    if (!activeTabExists && tabsState.length > 0) {
      const newActiveTab = tabsState[0].id;
      setActiveTab(newActiveTab);
      if (controlled) {
        onTabChange?.(newActiveTab, tabsState[0]);
      }
    }
  }, [tabsState, activeTab, controlled, onTabChange]);

  // Handle tab change
  const handleTabChange = useCallback((tabId: string) => {
    const tab = tabsState.find(t => t.id === tabId);
    if (!tab || tab.disabled) return;

    if (!controlled) {
      setActiveTab(tabId);
    }
    
    onTabChange?.(tabId, tab);
  }, [tabsState, controlled, onTabChange]);

  // Handle tab click
  const handleTabClick = useCallback((tabId: string, event: React.MouseEvent) => {
    const tab = tabsState.find(t => t.id === tabId);
    if (!tab) return;

    onTabClick?.(tabId, tab, event);
    handleTabChange(tabId);
  }, [tabsState, onTabClick, handleTabChange]);

  // Handle tab focus
  const handleTabFocus = useCallback((tabId: string, event: React.FocusEvent) => {
    const tab = tabsState.find(t => t.id === tabId);
    if (!tab) return;

    setFocusedTab(tabId);
    onTabFocus?.(tabId, tab, event);
  }, [tabsState, onTabFocus]);

  // Handle tab blur
  const handleTabBlur = useCallback((tabId: string, event: React.FocusEvent) => {
    const tab = tabsState.find(t => t.id === tabId);
    if (!tab) return;

    setFocusedTab('');
    onTabBlur?.(tabId, tab, event);
  }, [tabsState, onTabBlur]);

  // Handle tab close
  const handleTabClose = useCallback((tabId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const tab = tabsState.find(t => t.id === tabId);
    if (!tab) return;

    if (tabsState.length <= minTabs) return;

    const newTabs = tabsState.filter(t => t.id !== tabId);
    setTabsState(newTabs);
    onReorder?.(newTabs);

    // If closing active tab, switch to next available tab
    if (activeTab === tabId && newTabs.length > 0) {
      const currentIndex = tabsState.findIndex(t => t.id === tabId);
      const nextTab = newTabs[currentIndex] || newTabs[currentIndex - 1] || newTabs[0];
      handleTabChange(nextTab.id);
    }

    onTabClose?.(tabId, tab);
  }, [tabsState, minTabs, activeTab, onReorder, onTabClose, handleTabChange]);

  // Handle add tab
  const handleAddTab = useCallback(() => {
    if (maxTabs && tabsState.length >= maxTabs) return;
    
    onAddTab?.();
  }, [tabsState.length, maxTabs, onAddTab]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, tabId: string) => {
    if (!keyboardNavigation) return;

    const enabledTabs = tabsState.filter(tab => !tab.disabled);
    const enabledIndex = enabledTabs.findIndex(tab => tab.id === tabId);

    let nextTabId = '';

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        if (orientation === 'horizontal') {
          const nextIndex = (enabledIndex + 1) % enabledTabs.length;
          nextTabId = enabledTabs[nextIndex].id;
        } else {
          const nextIndex = (enabledIndex + 1) % enabledTabs.length;
          nextTabId = enabledTabs[nextIndex].id;
        }
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        if (orientation === 'horizontal') {
          const prevIndex = enabledIndex === 0 ? enabledTabs.length - 1 : enabledIndex - 1;
          nextTabId = enabledTabs[prevIndex].id;
        } else {
          const prevIndex = enabledIndex === 0 ? enabledTabs.length - 1 : enabledIndex - 1;
          nextTabId = enabledTabs[prevIndex].id;
        }
        break;
      case 'Home':
        event.preventDefault();
        nextTabId = enabledTabs[0].id;
        break;
      case 'End':
        event.preventDefault();
        nextTabId = enabledTabs[enabledTabs.length - 1].id;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleTabChange(tabId);
        break;
    }

    if (nextTabId && focusManagement) {
      const nextTabElement = tabRefs.current[nextTabId];
      if (nextTabElement) {
        nextTabElement.focus();
      }
    }
  }, [keyboardNavigation, orientation, tabsState, focusManagement, handleTabChange]);

  // CSS classes
  const containerClasses = useMemo(() => {
    const baseClasses = ['tabs'];
    if (orientation) baseClasses.push(`tabs--${orientation}`);
    if (alignment) baseClasses.push(`tabs--${alignment}`);
    if (size) baseClasses.push(`tabs--${size}`);
    if (theme) baseClasses.push(`tabs--${theme}`);
    if (variant) baseClasses.push(`tabs--${variant}`);
    if (bordered) baseClasses.push('tabs--bordered');
    if (shadowed) baseClasses.push('tabs--shadowed');
    if (backgrounded) baseClasses.push('tabs--backgrounded');
    if (showSeparators) baseClasses.push('tabs--separators');
    if (animate) baseClasses.push('tabs--animate');
    if (className) baseClasses.push(className);
    return baseClasses.filter(Boolean).join(' ');
  }, [orientation, alignment, size, theme, variant, bordered, shadowed, backgrounded, showSeparators, animate, className]);

  const tabListClasses = useMemo(() => {
    const baseClasses = ['tabs__list'];
    if (orientation) baseClasses.push(`tabs__list--${orientation}`);
    if (alignment) baseClasses.push(`tabs__list--${alignment}`);
    if (tabListClassName) baseClasses.push(tabListClassName);
    return baseClasses.filter(Boolean).join(' ');
  }, [orientation, alignment, tabListClassName]);

  const tabPanelsClasses = useMemo(() => {
    const baseClasses = ['tabs__panels'];
    if (orientation) baseClasses.push(`tabs__panels--${orientation}`);
    if (tabPanelsClassName) baseClasses.push(tabPanelsClassName);
    return baseClasses.filter(Boolean).join(' ');
  }, [orientation, tabPanelsClassName]);

  // Tab styles
  const tabStyles = useMemo(() => {
    return {
      '--animation-duration': `${animationDuration}ms`
    } as React.CSSProperties;
  }, [animationDuration]);

  // Default tab renderer
  const defaultTabRenderer = useCallback((tab: TabItem, isActive: boolean, isDisabled: boolean) => {
    const tabClasses = [
      'tabs__tab',
      `tabs__tab--${orientation}`,
      `tabs__tab--${size}`,
      `tabs__tab--${theme}`,
      `tabs__tab--${variant}`
    ];
    
    if (isActive) {
      tabClasses.push('tabs__tab--active');
      if (activeTabClassName) tabClasses.push(activeTabClassName);
    }
    
    if (isDisabled) {
      tabClasses.push('tabs__tab--disabled');
      if (disabledTabClassName) tabClasses.push(disabledTabClassName);
    }
    
    if (tab.className) tabClasses.push(tab.className);
    if (tabClassName) tabClasses.push(tabClassName);

    return (
      <button
        ref={(el) => {
          if (el) tabRefs.current[tab.id] = el;
        }}
        key={tab.id}
        className={tabClasses.filter(Boolean).join(' ')}
        style={{ ...tab.style, ...tabStyles }}
        role="tab"
        aria-selected={isActive}
        aria-disabled={isDisabled}
        aria-controls={`panel-${tab.id}`}
        id={`tab-${tab.id}`}
        disabled={isDisabled}
        onClick={(e) => handleTabClick(tab.id, e)}
        onFocus={(e) => handleTabFocus(tab.id, e)}
        onBlur={(e) => handleTabBlur(tab.id, e)}
        onKeyDown={(e) => handleKeyDown(e, tab.id)}
        title={showTooltips ? tab.tooltip : undefined}
        tabIndex={isActive ? 0 : -1}
      >
        {showIcons && tab.icon && (
          <span className="tabs__tab-icon">
            {renderIcon ? renderIcon(tab, isActive) : tab.icon}
          </span>
        )}
        
        <span className="tabs__tab-label">{tab.label}</span>
        
        {showBadges && tab.badge && (
          <span className="tabs__tab-badge">
            {renderBadge ? renderBadge(tab, isActive) : tab.badge}
          </span>
        )}
        
        {closable && !isDisabled && (
          <button
            className="tabs__tab-close"
            onClick={(e) => handleTabClose(tab.id, e)}
            aria-label={`Close ${tab.label} tab`}
            title={`Close ${tab.label} tab`}
          >
            {renderCloseButton ? renderCloseButton(tab, () => handleTabClose(tab.id, {} as React.MouseEvent)) : '×'}
          </button>
        )}
      </button>
    );
  }, [orientation, size, theme, variant, activeTabClassName, disabledTabClassName, tabClassName, tabStyles, showIcons, showBadges, showTooltips, closable, renderIcon, renderBadge, renderCloseButton, handleTabClick, handleTabFocus, handleTabBlur, handleKeyDown, handleTabClose]);

  // Default content renderer
  const defaultContentRenderer = useCallback((tab: TabItem, isActive: boolean) => {
    const panelClasses = [
      'tabs__panel',
      `tabs__panel--${orientation}`,
      `tabs__panel--${size}`,
      `tabs__panel--${theme}`
    ];
    
    if (isActive) panelClasses.push('tabs__panel--active');
    if (tabContentClassName) panelClasses.push(tabContentClassName);

    return (
      <div
        key={tab.id}
        className={panelClasses.filter(Boolean).join(' ')}
        role="tabpanel"
        aria-labelledby={`tab-${tab.id}`}
        id={`panel-${tab.id}`}
        style={{ '--animation-duration': `${animationDuration}ms` } as React.CSSProperties}
      >
        {renderContent ? renderContent(tab, isActive) : tab.content}
      </div>
    );
  }, [orientation, size, theme, tabContentClassName, animationDuration, renderContent]);

  // Default add button renderer
  const defaultAddButtonRenderer = useCallback(() => {
    if (!addable) return null;

    const canAdd = !maxTabs || tabsState.length < maxTabs;

    return (
      <button
        className="tabs__add-button"
        onClick={handleAddTab}
        disabled={!canAdd}
        aria-label="Add new tab"
        title="Add new tab"
      >
        {renderAddButton ? renderAddButton(handleAddTab) : '+'}
      </button>
    );
  }, [addable, maxTabs, tabsState.length, handleAddTab, renderAddButton]);

  return (
    <div
      className={containerClasses}
      style={style}
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-live={ariaLive}
      id={id}
    >
      <div className={tabListClasses} ref={tabListRef}>
        {tabsState.map((tab) => {
          const isActive = tab.id === activeTab;
          const isDisabled = tab.disabled || false;
          
          return renderTab ? renderTab(tab, isActive, isDisabled) : defaultTabRenderer(tab, isActive, isDisabled);
        })}
        
        {defaultAddButtonRenderer()}
      </div>
      
      <div className={tabPanelsClasses}>
        {tabsState.map((tab) => {
          const isActive = tab.id === activeTab;
          return defaultContentRenderer(tab, isActive);
        })}
      </div>
    </div>
  );
};

export default Tabs; 