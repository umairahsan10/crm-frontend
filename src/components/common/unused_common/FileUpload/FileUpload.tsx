import React, { useState, useRef, useCallback, useMemo } from 'react';
import './fileupload.css';

// File upload status types
export type FileUploadStatus = 'idle' | 'uploading' | 'success' | 'error';

// Size variants
export type FileUploadSize = 'sm' | 'md' | 'lg';

// Theme variants
export type FileUploadTheme = 'light' | 'dark';

// File interface
export interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: FileUploadStatus;
  progress?: number;
  error?: string;
  preview?: string;
}

// Props interface
export interface FileUploadProps {
  /** Accepted file types (e.g., 'image/*', '.pdf,.doc') */
  accept?: string;
  /** Whether to allow multiple file selection */
  multiple?: boolean;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Maximum number of files */
  maxFiles?: number;
  /** Whether to enable drag and drop */
  dragDrop?: boolean;
  /** Upload button text */
  buttonText?: string;
  /** Upload button icon */
  buttonIcon?: React.ReactNode;
  /** Dropzone text */
  dropzoneText?: string;
  /** Whether to show file previews */
  showPreviews?: boolean;
  /** Whether to show file size */
  showFileSize?: boolean;
  /** Whether to show progress indicator */
  showProgress?: boolean;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Whether the component is read-only */
  readOnly?: boolean;
  /** Whether to auto-upload files */
  autoUpload?: boolean;
  
  // Display props
  /** Size variant */
  size?: FileUploadSize;
  /** Theme variant */
  theme?: FileUploadTheme;
  /** Whether to show upload icon */
  showIcon?: boolean;
  /** Custom upload icon */
  icon?: React.ReactNode;
  
  // Customization props
  /** Custom CSS class name */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Custom CSS class for the dropzone */
  dropzoneClassName?: string;
  /** Custom CSS class for the file list */
  fileListClassName?: string;
  
  // Event handlers
  /** Callback when files are selected */
  onChange?: (files: UploadFile[]) => void;
  /** Callback when files are uploaded */
  onUpload?: (files: UploadFile[]) => void;
  /** Callback when a file is removed */
  onRemove?: (file: UploadFile) => void;
  /** Callback when upload starts */
  onUploadStart?: (file: UploadFile) => void;
  /** Callback when upload completes */
  onUploadComplete?: (file: UploadFile) => void;
  /** Callback when upload fails */
  onUploadError?: (file: UploadFile, error: string) => void;
  /** Callback when files are dropped */
  onDrop?: (files: UploadFile[]) => void;
  /** Callback when drag enters */
  onDragEnter?: () => void;
  /** Callback when drag leaves */
  onDragLeave?: () => void;
  /** Callback when drag over */
  onDragOver?: (event: React.DragEvent) => void;
  
  // Accessibility props
  /** ARIA label */
  'aria-label'?: string;
  /** ARIA described by */
  'aria-describedby'?: string;
  /** Input name attribute */
  name?: string;
  /** Input id attribute */
  id?: string;
  
  // Custom render props
  /** Custom render function for file item */
  renderFile?: (file: UploadFile, onRemove: (file: UploadFile) => void) => React.ReactNode;
  /** Custom render function for progress */
  renderProgress?: (file: UploadFile) => React.ReactNode;
  /** Custom render function for preview */
  renderPreview?: (file: UploadFile) => React.ReactNode;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept = '*',
  multiple = false,
  maxSize,
  maxFiles,
  dragDrop = true,
  buttonText = 'Choose Files',
  buttonIcon,
  dropzoneText = 'Drag and drop files here, or click to select',
  showPreviews = true,
  showFileSize = true,
  showProgress = true,
  disabled = false,
  readOnly = false,
  autoUpload = false,
  size = 'md',
  theme = 'light',
  showIcon = true,
  icon,
  className = '',
  style = {},
  dropzoneClassName = '',
  fileListClassName = '',
  onChange,
  onUpload,
  onRemove,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  onDrop,
  onDragEnter,
  onDragLeave,
  onDragOver,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  name,
  id,
  renderFile,
  renderProgress,
  renderPreview
}) => {
  // State management
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  // Generate unique ID for files
  const generateFileId = useCallback(() => {
    return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (accept !== '*' && accept !== file.type) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type.toLowerCase();
        }
        if (type.endsWith('/*')) {
          const baseType = type.slice(0, -2);
          return file.type.startsWith(baseType);
        }
        return file.type === type;
      });
      
      if (!isAccepted) {
        return `File type ${file.type} is not allowed. Accepted types: ${accept}`;
      }
    }

    // Check file size
    if (maxSize && file.size > maxSize) {
      return `File size ${formatFileSize(file.size)} exceeds maximum allowed size ${formatFileSize(maxSize)}`;
    }

    return null;
  }, [accept, maxSize, formatFileSize]);

  // Create upload file object
  const createUploadFile = useCallback((file: File): UploadFile => {
    const error = validateFile(file);
    const uploadFile: UploadFile = {
      id: generateFileId(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: error ? 'error' : 'idle',
      error: error || undefined
    };

    // Generate preview for images
    if (showPreviews && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, preview: e.target?.result as string } : f
        ));
      };
      reader.readAsDataURL(file);
    }

    return uploadFile;
  }, [validateFile, generateFileId, showPreviews]);

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles: FileList | File[]) => {
    if (disabled || readOnly) return;

    const fileArray = Array.from(selectedFiles);
    const newFiles: UploadFile[] = [];

    for (const file of fileArray) {
      // Check max files limit
      if (maxFiles && files.length + newFiles.length >= maxFiles) {
        break;
      }

      const uploadFile = createUploadFile(file);
      newFiles.push(uploadFile);
    }

    const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
    setFiles(updatedFiles);

    if (onChange) {
      onChange(updatedFiles);
    }

    if (autoUpload) {
      handleUpload(updatedFiles);
    }
  }, [disabled, readOnly, maxFiles, files, multiple, createUploadFile, onChange, autoUpload]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      handleFileSelect(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFileSelect]);

  // Handle drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    if (onDragEnter) {
      onDragEnter();
    }
  }, [onDragEnter]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dropzoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      if (onDragLeave) {
        onDragLeave();
      }
    }
  }, [onDragLeave]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDragOver) {
      onDragOver(e);
    }
  }, [onDragOver]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled || readOnly) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
      if (onDrop) {
        const uploadFiles = droppedFiles.map(file => createUploadFile(file));
        onDrop(uploadFiles);
      }
    }
  }, [disabled, readOnly, handleFileSelect, onDrop, createUploadFile]);

  // Handle file removal
  const handleRemoveFile = useCallback((fileToRemove: UploadFile) => {
    if (disabled || readOnly) return;

    const updatedFiles = files.filter(file => file.id !== fileToRemove.id);
    setFiles(updatedFiles);

    if (onChange) {
      onChange(updatedFiles);
    }

    if (onRemove) {
      onRemove(fileToRemove);
    }
  }, [disabled, readOnly, files, onChange, onRemove]);

  // Handle upload
  const handleUpload = useCallback(async (filesToUpload: UploadFile[] = files) => {
    if (disabled || readOnly || filesToUpload.length === 0) return;

    const validFiles = filesToUpload.filter(file => file.status !== 'error');
    if (validFiles.length === 0) return;

    setUploadingFiles(new Set(validFiles.map(f => f.id)));

    for (const file of validFiles) {
      // Update file status to uploading
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'uploading', progress: 0 } : f
      ));

      if (onUploadStart) {
        onUploadStart(file);
      }

      try {
        // Simulate upload progress (replace with actual upload logic)
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, progress } : f
          ));
        }

        // Update file status to success
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'success', progress: 100 } : f
        ));

        if (onUploadComplete) {
          onUploadComplete(file);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'error', error: errorMessage } : f
        ));

        if (onUploadError) {
          onUploadError(file, errorMessage);
        }
      }
    }

    setUploadingFiles(new Set());

    if (onUpload) {
      onUpload(validFiles);
    }
  }, [disabled, readOnly, files, onUploadStart, onUploadComplete, onUploadError, onUpload]);

  // Handle button click
  const handleButtonClick = useCallback(() => {
    if (disabled || readOnly) return;
    fileInputRef.current?.click();
  }, [disabled, readOnly]);

  // Default upload icon
  const defaultIcon = useMemo(() => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
      <path d="M14 2v6h6"/>
      <path d="M16 13v6"/>
      <path d="M12 17l4-4 4 4"/>
    </svg>
  ), []);

  // CSS classes
  const cssClasses = useMemo(() => {
    const baseClasses = ['fileupload'];
    if (size) baseClasses.push(`fileupload--${size}`);
    if (theme) baseClasses.push(`fileupload--${theme}`);
    if (disabled) baseClasses.push('fileupload--disabled');
    if (readOnly) baseClasses.push('fileupload--readonly');
    if (isDragOver) baseClasses.push('fileupload--drag-over');
    if (className) baseClasses.push(className);
    return baseClasses.filter(Boolean).join(' ');
  }, [size, theme, disabled, readOnly, isDragOver, className]);

  // Get file status icon
  const getStatusIcon = useCallback((status: FileUploadStatus) => {
    switch (status) {
      case 'success':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#10b981' }}>
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        );
      case 'error':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#ef4444' }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      case 'uploading':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#3b82f6' }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      default:
        return null;
    }
  }, []);

  // Default file renderer
  const defaultFileRenderer = useCallback((file: UploadFile, onRemove: (file: UploadFile) => void) => (
    <div key={file.id} className="fileupload__file">
      <div className="fileupload__file-info">
        {showPreviews && file.preview && (
          <div className="fileupload__file-preview">
            {renderPreview ? (
              renderPreview(file)
            ) : (
              <img src={file.preview} alt={file.name} />
            )}
          </div>
        )}
        <div className="fileupload__file-details">
          <div className="fileupload__file-name">{file.name}</div>
          {showFileSize && (
            <div className="fileupload__file-size">{formatFileSize(file.size)}</div>
          )}
          {file.error && (
            <div className="fileupload__file-error">{file.error}</div>
          )}
        </div>
        <div className="fileupload__file-status">
          {getStatusIcon(file.status)}
        </div>
      </div>
      {showProgress && file.status === 'uploading' && (
        <div className="fileupload__file-progress">
          {renderProgress ? (
            renderProgress(file)
          ) : (
            <div className="fileupload__progress-bar">
              <div 
                className="fileupload__progress-fill" 
                style={{ width: `${file.progress || 0}%` }}
              />
            </div>
          )}
        </div>
      )}
      {!readOnly && (
        <button
          type="button"
          onClick={() => onRemove(file)}
          className="fileupload__file-remove"
          aria-label={`Remove ${file.name}`}
        >
          ×
        </button>
      )}
    </div>
  ), [showPreviews, showFileSize, showProgress, readOnly, formatFileSize, getStatusIcon, renderPreview, renderProgress]);

  return (
    <div className={cssClasses} style={style}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        disabled={disabled || readOnly}
        className="fileupload__input"
        aria-label={ariaLabel || 'File upload'}
        aria-describedby={ariaDescribedBy}
        name={name}
        id={id}
      />

      {/* Dropzone */}
      {dragDrop && (
        <div
          ref={dropzoneRef}
          className={`fileupload__dropzone ${dropzoneClassName}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleButtonClick}
          role="button"
          tabIndex={disabled || readOnly ? -1 : 0}
          aria-label={ariaLabel || 'File upload dropzone'}
        >
          <div className="fileupload__dropzone-content">
            {showIcon && (icon || defaultIcon)}
            <div className="fileupload__dropzone-text">{dropzoneText}</div>
            <button
              type="button"
              className="fileupload__button"
              onClick={(e) => e.stopPropagation()}
              disabled={disabled || readOnly}
            >
              {buttonIcon && <span className="fileupload__button-icon">{buttonIcon}</span>}
              {buttonText}
            </button>
          </div>
        </div>
      )}

      {/* Upload button (when dragDrop is false) */}
      {!dragDrop && (
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled || readOnly}
          className="fileupload__button"
        >
          {buttonIcon && <span className="fileupload__button-icon">{buttonIcon}</span>}
          {buttonText}
        </button>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className={`fileupload__file-list ${fileListClassName}`}>
          {files.map(file => 
            renderFile ? renderFile(file, handleRemoveFile) : defaultFileRenderer(file, handleRemoveFile)
          )}
        </div>
      )}

      {/* Upload button for selected files */}
      {files.length > 0 && !autoUpload && (
        <button
          type="button"
          onClick={() => handleUpload()}
          disabled={disabled || readOnly || uploadingFiles.size > 0}
          className="fileupload__upload-button"
        >
          {uploadingFiles.size > 0 ? 'Uploading...' : 'Upload Files'}
        </button>
      )}

      {/* File count and limits */}
      {maxFiles && (
        <div className="fileupload__file-count">
          {files.length} / {maxFiles} files
        </div>
      )}
    </div>
  );
};

export default FileUpload; 