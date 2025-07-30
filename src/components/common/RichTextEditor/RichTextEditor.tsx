import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import './RichTextEditor.css';

// Toolbar button types
export type ToolbarButtonType = 
  | 'bold' 
  | 'italic' 
  | 'underline' 
  | 'strikethrough'
  | 'heading1' 
  | 'heading2' 
  | 'heading3'
  | 'paragraph'
  | 'link' 
  | 'unlink'
  | 'orderedList' 
  | 'unorderedList'
  | 'code' 
  | 'codeBlock'
  | 'quote'
  | 'alignLeft' 
  | 'alignCenter' 
  | 'alignRight' 
  | 'alignJustify'
  | 'undo' 
  | 'redo'
  | 'clearFormat'
  | 'insertImage'
  | 'insertTable'
  | 'subscript'
  | 'superscript'
  | 'indent'
  | 'outdent'
  | 'color'
  | 'backgroundColor'
  | 'fontSize'
  | 'fontFamily';

// Size variants
export type RichTextEditorSize = 'sm' | 'md' | 'lg';

// Theme variants
export type RichTextEditorTheme = 'light' | 'dark' | 'minimal';

// Toolbar layout variants
export type ToolbarLayout = 'horizontal' | 'vertical' | 'floating';

// Props interface
export interface RichTextEditorProps {
  /** Initial content value */
  value?: string;
  /** Default content value */
  defaultValue?: string;
  /** Whether the editor is controlled */
  controlled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Whether the editor is disabled */
  disabled?: boolean;
  /** Toolbar buttons to show */
  toolbarButtons?: ToolbarButtonType[];
  /** Whether to show the toolbar */
  showToolbar?: boolean;
  /** Toolbar layout */
  toolbarLayout?: ToolbarLayout;
  /** Whether to show character count */
  showCharCount?: boolean;
  /** Whether to show word count */
  showWordCount?: boolean;
  /** Maximum character limit */
  maxChars?: number;
  /** Maximum word limit */
  maxWords?: number;
  /** Minimum height of the editor */
  minHeight?: string | number;
  /** Maximum height of the editor */
  maxHeight?: string | number;
  /** Whether to auto-resize the editor */
  autoResize?: boolean;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Whether to show spell check */
  spellCheck?: boolean;
  /** Whether to show auto-save indicator */
  showAutoSave?: boolean;
  /** Auto-save interval in milliseconds */
  autoSaveInterval?: number;
  
  // Display props
  /** Size variant */
  size?: RichTextEditorSize;
  /** Theme variant */
  theme?: RichTextEditorTheme;
  /** Whether to show border */
  bordered?: boolean;
  /** Whether to show focus ring */
  showFocusRing?: boolean;
  /** Whether to show toolbar separators */
  showToolbarSeparators?: boolean;
  
  // Customization props
  /** Custom CSS class name */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Custom CSS class for toolbar */
  toolbarClassName?: string;
  /** Custom CSS class for editor */
  editorClassName?: string;
  /** Custom CSS class for status bar */
  statusBarClassName?: string;
  
  // Event handlers
  /** Callback when content changes */
  onChange?: (content: string, html: string) => void;
  /** Callback when editor focuses */
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
  /** Callback when editor blurs */
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
  /** Callback when editor is ready */
  onReady?: (editor: HTMLDivElement) => void;
  /** Callback when content is saved */
  onSave?: (content: string, html: string) => void;
  /** Callback when character limit is reached */
  onCharLimitReached?: (current: number, limit: number) => void;
  /** Callback when word limit is reached */
  onWordLimitReached?: (current: number, limit: number) => void;
  
  // Accessibility props
  /** ARIA label */
  'aria-label'?: string;
  /** ARIA described by */
  'aria-describedby'?: string;
  /** ARIA live region */
  'aria-live'?: 'polite' | 'assertive' | 'off';
  /** Role attribute */
  role?: string;
  
  // Custom render props
  /** Custom render function for toolbar button */
  renderToolbarButton?: (type: ToolbarButtonType, isActive: boolean, isDisabled: boolean) => React.ReactNode;
  /** Custom render function for status bar */
  renderStatusBar?: (charCount: number, wordCount: number, isSaving: boolean) => React.ReactNode;
  /** Custom render function for placeholder */
  renderPlaceholder?: (placeholder: string) => React.ReactNode;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  defaultValue = '',
  controlled = false,
  placeholder = 'Start typing...',
  readOnly = false,
  disabled = false,
  toolbarButtons = [
    'bold', 'italic', 'underline', 'strikethrough',
    'heading1', 'heading2', 'heading3', 'paragraph',
    'link', 'orderedList', 'unorderedList', 'code', 'codeBlock',
    'alignLeft', 'alignCenter', 'alignRight', 'alignJustify',
    'undo', 'redo', 'clearFormat'
  ],
  showToolbar = true,
  toolbarLayout = 'horizontal',
  showCharCount = false,
  showWordCount = false,
  maxChars,
  maxWords,
  minHeight = '200px',
  maxHeight,
  autoResize: _autoResize = false,
  showLineNumbers: _showLineNumbers = false,
  spellCheck = true,
  showAutoSave = false,
  autoSaveInterval = 30000, // 30 seconds
  size = 'md',
  theme = 'light',
  bordered = true,
  showFocusRing = true,
  showToolbarSeparators = true,
  className = '',
  style = {},
  toolbarClassName = '',
  editorClassName = '',
  statusBarClassName = '',
  onChange,
  onFocus,
  onBlur,
  onReady,
  onSave,
  onCharLimitReached,
  onWordLimitReached,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-live': ariaLive = 'polite',
  role = 'textbox',
  renderToolbarButton,
  renderStatusBar,
  renderPlaceholder
}) => {
  // State
  const [content, setContent] = useState(controlled ? value || '' : defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [colorPicker, setColorPicker] = useState<{ type: 'color' | 'backgroundColor' | null; value: string }>({ type: null, value: '' });
  const [fontSize, setFontSize] = useState('16px');
  const [fontFamily, setFontFamily] = useState('Arial');

  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveTimeoutRef = useRef<number | null>(null);

  // Update content when controlled value changes
  useEffect(() => {
    if (controlled && value !== undefined) {
      setContent(value);
    }
  }, [controlled, value]);

  // Auto-save functionality
  useEffect(() => {
    if (showAutoSave && autoSaveInterval > 0 && !disabled && !readOnly) {
      autoSaveTimeoutRef.current = window.setTimeout(() => {
        handleAutoSave();
      }, autoSaveInterval);

      return () => {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
      };
    }
  }, [content, showAutoSave, autoSaveInterval, disabled, readOnly]);

  // Calculate character and word counts
  const { charCount, wordCount } = useMemo(() => {
    const text = editorRef.current?.innerText || '';
    return {
      charCount: text.length,
      wordCount: text.trim() ? text.trim().split(/\s+/).length : 0
    };
  }, [content]);

  // Check limits
  const isCharLimitReached = maxChars ? charCount >= maxChars : false;
  const isWordLimitReached = maxWords ? wordCount >= maxWords : false;

  // Handle content change
  const handleContentChange = useCallback((newContent: string) => {
    if (disabled || readOnly) return;

    const html = editorRef.current?.innerHTML || '';
    
    if (controlled) {
      onChange?.(newContent, html);
    } else {
      setContent(newContent);
      onChange?.(newContent, html);
    }

    // Check limits
    if (isCharLimitReached && onCharLimitReached) {
      onCharLimitReached(charCount, maxChars!);
    }
    if (isWordLimitReached && onWordLimitReached) {
      onWordLimitReached(wordCount, maxWords!);
    }
  }, [disabled, readOnly, controlled, onChange, isCharLimitReached, isWordLimitReached, onCharLimitReached, onWordLimitReached, charCount, wordCount, maxChars, maxWords]);

  // Handle auto-save
  const handleAutoSave = useCallback(() => {
    if (disabled || readOnly) return;

    setIsSaving(true);
    const html = editorRef.current?.innerHTML || '';
    
    onSave?.(content, html);
    
    setTimeout(() => setIsSaving(false), 1000);
  }, [disabled, readOnly, content, onSave]);

  // Execute command
  const executeCommand = useCallback((command: string, value?: string) => {
    if (disabled || readOnly) return;

    document.execCommand(command, false, value);
    editorRef.current?.focus();
    
    // Trigger change event
    const newContent = editorRef.current?.innerText || '';
    handleContentChange(newContent);
  }, [disabled, readOnly, handleContentChange]);

  // Handle toolbar button click
  const handleToolbarClick = useCallback((type: ToolbarButtonType) => {
    if (disabled || readOnly) return;

    switch (type) {
      case 'bold':
        executeCommand('bold');
        break;
      case 'italic':
        executeCommand('italic');
        break;
      case 'underline':
        executeCommand('underline');
        break;
      case 'strikethrough':
        executeCommand('strikethrough');
        break;
      case 'heading1':
        executeCommand('formatBlock', '<h1>');
        break;
      case 'heading2':
        executeCommand('formatBlock', '<h2>');
        break;
      case 'heading3':
        executeCommand('formatBlock', '<h3>');
        break;
      case 'paragraph':
        executeCommand('formatBlock', '<p>');
        break;
      case 'link':
        setShowLinkDialog(true);
        break;
      case 'unlink':
        executeCommand('unlink');
        break;
      case 'orderedList':
        executeCommand('insertOrderedList');
        break;
      case 'unorderedList':
        executeCommand('insertUnorderedList');
        break;
      case 'code':
        executeCommand('formatInline', '<code>');
        break;
      case 'codeBlock':
        executeCommand('formatBlock', '<pre>');
        break;
      case 'quote':
        executeCommand('formatBlock', '<blockquote>');
        break;
      case 'alignLeft':
        executeCommand('justifyLeft');
        break;
      case 'alignCenter':
        executeCommand('justifyCenter');
        break;
      case 'alignRight':
        executeCommand('justifyRight');
        break;
      case 'alignJustify':
        executeCommand('justifyFull');
        break;
      case 'undo':
        executeCommand('undo');
        break;
      case 'redo':
        executeCommand('redo');
        break;
      case 'clearFormat':
        executeCommand('removeFormat');
        break;
      case 'subscript':
        executeCommand('subscript');
        break;
      case 'superscript':
        executeCommand('superscript');
        break;
      case 'indent':
        executeCommand('indent');
        break;
      case 'outdent':
        executeCommand('outdent');
        break;
      case 'color':
        setColorPicker({ type: 'color', value: '' });
        break;
      case 'backgroundColor':
        setColorPicker({ type: 'backgroundColor', value: '' });
        break;
      case 'fontSize':
        // Font size will be handled by dropdown
        break;
      case 'fontFamily':
        // Font family will be handled by dropdown
        break;
    }
  }, [disabled, readOnly, executeCommand]);

  // Handle link dialog
  const handleLinkSubmit = useCallback(() => {
    if (linkUrl.trim()) {
      executeCommand('createLink', linkUrl.trim());
    }
    setShowLinkDialog(false);
    setLinkUrl('');
  }, [linkUrl, executeCommand]);

  // Handle color change
  const handleColorChange = useCallback((color: string) => {
    if (colorPicker.type) {
      executeCommand(colorPicker.type, color);
    }
    setColorPicker({ type: null, value: '' });
  }, [colorPicker.type, executeCommand]);

  // Handle font size change
  const handleFontSizeChange = useCallback((size: string) => {
    setFontSize(size);
    executeCommand('fontSize', size);
  }, [executeCommand]);

  // Handle font family change
  const handleFontFamilyChange = useCallback((family: string) => {
    setFontFamily(family);
    executeCommand('fontName', family);
  }, [executeCommand]);

  // Check if command is active
  const isCommandActive = useCallback((command: string) => {
    return document.queryCommandState(command);
  }, []);

  // Handle editor input
  const handleEditorInput = useCallback(() => {
    const newContent = editorRef.current?.innerText || '';
    handleContentChange(newContent);
  }, [handleContentChange]);

  // Handle editor focus
  const handleEditorFocus = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  }, [onFocus]);

  // Handle editor blur
  const handleEditorBlur = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
    setIsFocused(false);
    onBlur?.(event);
  }, [onBlur]);

  // Handle editor paste
  const handleEditorPaste = useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  // CSS classes
  const cssClasses = useMemo(() => {
    const baseClasses = ['rich-text-editor'];
    if (size) baseClasses.push(`rich-text-editor--${size}`);
    if (theme) baseClasses.push(`rich-text-editor--${theme}`);
    if (toolbarLayout) baseClasses.push(`rich-text-editor--${toolbarLayout}-toolbar`);
    if (bordered) baseClasses.push('rich-text-editor--bordered');
    if (showFocusRing) baseClasses.push('rich-text-editor--focus-ring');
    if (showToolbarSeparators) baseClasses.push('rich-text-editor--toolbar-separators');
    if (disabled) baseClasses.push('rich-text-editor--disabled');
    if (readOnly) baseClasses.push('rich-text-editor--readonly');
    if (isFocused) baseClasses.push('rich-text-editor--focused');
    if (className) baseClasses.push(className);
    return baseClasses.filter(Boolean).join(' ');
  }, [size, theme, toolbarLayout, bordered, showFocusRing, showToolbarSeparators, disabled, readOnly, isFocused, className]);

  // Default toolbar button
  const defaultToolbarButton = useCallback((type: ToolbarButtonType, isActive: boolean, isDisabled: boolean) => {
    const buttonText = {
      bold: 'B',
      italic: 'I',
      underline: 'U',
      strikethrough: 'S',
      heading1: 'H1',
      heading2: 'H2',
      heading3: 'H3',
      paragraph: 'P',
      link: '🔗',
      unlink: '🔗',
      orderedList: '1.',
      unorderedList: '•',
      code: '</>',
      codeBlock: '{}',
      quote: '"',
      alignLeft: '←',
      alignCenter: '↔',
      alignRight: '→',
      alignJustify: '↔',
      undo: '↶',
      redo: '↷',
      clearFormat: 'A',
      insertImage: '📷',
      insertTable: '⊞',
      subscript: '₂',
      superscript: '²',
      indent: '→',
      outdent: '←',
      color: '🎨',
      backgroundColor: '🎨',
      fontSize: 'Aa',
      fontFamily: 'F'
    };

    return (
      <button
        key={type}
        type="button"
        onClick={() => handleToolbarClick(type)}
        disabled={isDisabled}
        className={`rich-text-editor__toolbar-button ${toolbarClassName} ${
          isActive ? 'rich-text-editor__toolbar-button--active' : ''
        } ${isDisabled ? 'rich-text-editor__toolbar-button--disabled' : ''}`}
        title={type}
        aria-label={type}
      >
        {buttonText[type]}
      </button>
    );
  }, [handleToolbarClick, toolbarClassName]);

  // Default status bar
  const defaultStatusBar = useCallback((charCount: number, wordCount: number, isSaving: boolean) => {
    const parts = [];
    
    if (showCharCount) {
      parts.push(`${charCount} characters`);
    }
    
    if (showWordCount) {
      parts.push(`${wordCount} words`);
    }
    
    if (maxChars) {
      parts.push(`${charCount}/${maxChars}`);
    }
    
    if (maxWords) {
      parts.push(`${wordCount}/${maxWords}`);
    }
    
    if (isSaving) {
      parts.push('Saving...');
    }

    return (
      <div className={`rich-text-editor__status-bar ${statusBarClassName}`}>
        {parts.join(' • ')}
      </div>
    );
  }, [showCharCount, showWordCount, maxChars, maxWords, statusBarClassName]);

  // Default placeholder
  const defaultPlaceholder = useCallback((placeholderText: string) => (
    <div className="rich-text-editor__placeholder">
      {placeholderText}
    </div>
  ), []);

  // Editor styles
  const editorStyles = useMemo(() => {
    const styles: React.CSSProperties = { ...style };
    if (minHeight) {
      styles.minHeight = typeof minHeight === 'number' ? `${minHeight}px` : minHeight;
    }
    if (maxHeight) {
      styles.maxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
    }
    return styles;
  }, [style, minHeight, maxHeight]);

  // Initialize editor
  useEffect(() => {
    if (editorRef.current && onReady) {
      onReady(editorRef.current);
    }
  }, [onReady]);

  return (
    <div className={cssClasses} style={editorStyles}>
      {/* Toolbar */}
      {showToolbar && (
        <div className={`rich-text-editor__toolbar ${toolbarClassName}`}>
          {toolbarButtons.map((type) => {
            const isActive = isCommandActive(type);
            const isDisabled = disabled || readOnly;
            
            return renderToolbarButton 
              ? renderToolbarButton(type, isActive, isDisabled)
              : defaultToolbarButton(type, isActive, isDisabled);
          })}
          
          {/* Font size dropdown */}
          {toolbarButtons.includes('fontSize') && (
            <select
              value={fontSize}
              onChange={(e) => handleFontSizeChange(e.target.value)}
              disabled={disabled || readOnly}
              className="rich-text-editor__font-size"
            >
              <option value="8px">8px</option>
              <option value="10px">10px</option>
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
              <option value="28px">28px</option>
              <option value="32px">32px</option>
            </select>
          )}
          
          {/* Font family dropdown */}
          {toolbarButtons.includes('fontFamily') && (
            <select
              value={fontFamily}
              onChange={(e) => handleFontFamilyChange(e.target.value)}
              disabled={disabled || readOnly}
              className="rich-text-editor__font-family"
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Helvetica">Helvetica</option>
            </select>
          )}
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        className={`rich-text-editor__content ${editorClassName}`}
        contentEditable={!disabled && !readOnly}
        suppressContentEditableWarning
        onInput={handleEditorInput}
        onFocus={handleEditorFocus}
        onBlur={handleEditorBlur}
        onPaste={handleEditorPaste}
        spellCheck={spellCheck}
        role={role}
        aria-label={ariaLabel || 'Rich text editor'}
        aria-describedby={ariaDescribedBy}
        aria-live={ariaLive}
        aria-multiline="true"
        tabIndex={disabled || readOnly ? -1 : 0}
        style={{ fontSize, fontFamily }}
      >
        {!content && renderPlaceholder ? renderPlaceholder(placeholder) : defaultPlaceholder(placeholder)}
        {content && <div dangerouslySetInnerHTML={{ __html: content }} />}
      </div>

      {/* Status bar */}
      {(showCharCount || showWordCount || showAutoSave) && (
        renderStatusBar 
          ? renderStatusBar(charCount, wordCount, isSaving)
          : defaultStatusBar(charCount, wordCount, isSaving)
      )}

      {/* Link dialog */}
      {showLinkDialog && (
        <div className="rich-text-editor__link-dialog">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Enter URL..."
            className="rich-text-editor__link-input"
          />
          <button
            type="button"
            onClick={handleLinkSubmit}
            className="rich-text-editor__link-submit"
          >
            Insert
          </button>
          <button
            type="button"
            onClick={() => setShowLinkDialog(false)}
            className="rich-text-editor__link-cancel"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Color picker */}
      {colorPicker.type && (
        <div className="rich-text-editor__color-picker">
          <input
            type="color"
            value={colorPicker.value}
            onChange={(e) => handleColorChange(e.target.value)}
            className="rich-text-editor__color-input"
          />
          <button
            type="button"
            onClick={() => setColorPicker({ type: null, value: '' })}
            className="rich-text-editor__color-cancel"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor; 