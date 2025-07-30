import React, { useState, useRef, useCallback, useMemo } from 'react';
import './ImageUpload.css';

// Image upload status types
export type ImageUploadStatus = 'idle' | 'uploading' | 'success' | 'error';

// Size variants
export type ImageUploadSize = 'sm' | 'md' | 'lg';

// Theme variants
export type ImageUploadTheme = 'light' | 'dark';

// Layout variants
export type ImageUploadLayout = 'grid' | 'list' | 'carousel';

// Image interface
export interface UploadImage {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: ImageUploadStatus;
  progress?: number;
  error?: string;
  preview?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
}

// Image validation interface
export interface ImageValidation {
  maxWidth?: number;
  minWidth?: number;
  maxHeight?: number;
  minHeight?: number;
  maxSize?: number; // in bytes
  minSize?: number; // in bytes
  aspectRatio?: number; // width/height ratio
  allowedTypes?: string[]; // e.g., ['image/jpeg', 'image/png']
}

// Props interface
export interface ImageUploadProps {
  /** Accepted image types (e.g., 'image/jpeg', 'image/png') */
  accept?: string;
  /** Whether to allow multiple image selection */
  multiple?: boolean;
  /** Maximum number of images */
  maxImages?: number;
  /** Whether to enable drag and drop */
  dragDrop?: boolean;
  /** Upload button text */
  buttonText?: string;
  /** Upload button icon */
  buttonIcon?: React.ReactNode;
  /** Dropzone text */
  dropzoneText?: string;
  /** Whether to show image previews */
  showPreviews?: boolean;
  /** Whether to show image info (size, dimensions) */
  showImageInfo?: boolean;
  /** Whether to show progress indicator */
  showProgress?: boolean;
  /** Whether to show remove buttons */
  showRemoveButton?: boolean;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Whether the component is read-only */
  readOnly?: boolean;
  /** Whether to auto-upload images */
  autoUpload?: boolean;
  /** Layout for displaying images */
  layout?: ImageUploadLayout;
  /** Number of columns for grid layout */
  gridColumns?: number;
  /** Image validation rules */
  validation?: ImageValidation;
  
  // Display props
  /** Size variant */
  size?: ImageUploadSize;
  /** Theme variant */
  theme?: ImageUploadTheme;
  /** Whether to show upload icon */
  showIcon?: boolean;
  /** Custom upload icon */
  icon?: React.ReactNode;
  /** Preview image size */
  previewSize?: number;
  
  // Customization props
  /** Custom CSS class name */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Custom CSS class for the dropzone */
  dropzoneClassName?: string;
  /** Custom CSS class for the image list */
  imageListClassName?: string;
  
  // Event handlers
  /** Callback when images are selected */
  onChange?: (images: UploadImage[]) => void;
  /** Callback when images are uploaded */
  onUpload?: (images: UploadImage[]) => void;
  /** Callback when an image is removed */
  onRemove?: (image: UploadImage) => void;
  /** Callback when upload starts */
  onUploadStart?: (image: UploadImage) => void;
  /** Callback when upload completes */
  onUploadComplete?: (image: UploadImage) => void;
  /** Callback when upload fails */
  onUploadError?: (image: UploadImage, error: string) => void;
  /** Callback when images are dropped */
  onDrop?: (images: UploadImage[]) => void;
  /** Callback when drag enters */
  onDragEnter?: () => void;
  /** Callback when drag leaves */
  onDragLeave?: () => void;
  /** Callback when drag over */
  onDragOver?: (event: React.DragEvent) => void;
  /** Callback when image validation fails */
  onValidationError?: (file: File, error: string) => void;
  
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
  /** Custom render function for image item */
  renderImage?: (image: UploadImage, onRemove: (image: UploadImage) => void) => React.ReactNode;
  /** Custom render function for progress */
  renderProgress?: (image: UploadImage) => React.ReactNode;
  /** Custom render function for preview */
  renderPreview?: (image: UploadImage) => React.ReactNode;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  accept = 'image/*',
  multiple = false,
  maxImages,
  dragDrop = true,
  buttonText = 'Choose Images',
  buttonIcon,
  dropzoneText = 'Drag and drop images here, or click to select',
  showPreviews = true,
  showImageInfo = true,
  showProgress = true,
  showRemoveButton = true,
  disabled = false,
  readOnly = false,
  autoUpload = false,
  layout = 'grid',
  gridColumns = 3,
  validation,
  size = 'md',
  theme = 'light',
  showIcon = true,
  icon,
  previewSize = 120,
  className = '',
  style = {},
  dropzoneClassName = '',
  imageListClassName = '',
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
  onValidationError: _onValidationError,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  name,
  id,
  renderImage,
  renderProgress,
  renderPreview
}) => {
  // State management
  const [images, setImages] = useState<UploadImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  // Generate unique ID for images
  const generateImageId = useCallback(() => {
    return `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Validate image
  const validateImage = useCallback((file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        resolve('File must be an image');
        return;
      }

      // Check allowed types
      if (validation?.allowedTypes && !validation.allowedTypes.includes(file.type)) {
        resolve(`Image type ${file.type} is not allowed. Accepted types: ${validation.allowedTypes.join(', ')}`);
        return;
      }

      // Check file size
      if (validation?.maxSize && file.size > validation.maxSize) {
        resolve(`Image size ${formatFileSize(file.size)} exceeds maximum allowed size ${formatFileSize(validation.maxSize)}`);
        return;
      }

      if (validation?.minSize && file.size < validation.minSize) {
        resolve(`Image size ${formatFileSize(file.size)} is below minimum required size ${formatFileSize(validation.minSize)}`);
        return;
      }

      // Check image dimensions
      if (validation?.maxWidth || validation?.maxHeight || validation?.minWidth || validation?.minHeight || validation?.aspectRatio) {
        const img = new Image();
        img.onload = () => {
          const { width, height } = img;
          
          if (validation?.maxWidth && width > validation.maxWidth) {
            resolve(`Image width ${width}px exceeds maximum allowed width ${validation.maxWidth}px`);
            return;
          }

          if (validation?.minWidth && width < validation.minWidth) {
            resolve(`Image width ${width}px is below minimum required width ${validation.minWidth}px`);
            return;
          }

          if (validation?.maxHeight && height > validation.maxHeight) {
            resolve(`Image height ${height}px exceeds maximum allowed height ${validation.maxHeight}px`);
            return;
          }

          if (validation?.minHeight && height < validation.minHeight) {
            resolve(`Image height ${height}px is below minimum required height ${validation.minHeight}px`);
            return;
          }

          if (validation?.aspectRatio) {
            const aspectRatio = width / height;
            const tolerance = 0.1; // Allow some tolerance
            if (Math.abs(aspectRatio - validation.aspectRatio) > tolerance) {
              resolve(`Image aspect ratio ${aspectRatio.toFixed(2)} does not match required ratio ${validation.aspectRatio}`);
              return;
            }
          }

          resolve(null);
        };
        img.onerror = () => {
          resolve('Failed to load image for validation');
        };
        img.src = URL.createObjectURL(file);
      } else {
        resolve(null);
      }
    });
  }, [validation, formatFileSize]);

  // Create upload image object
  const createUploadImage = useCallback(async (file: File): Promise<UploadImage> => {
    const error = await validateImage(file);
    const uploadImage: UploadImage = {
      id: generateImageId(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: error ? 'error' : 'idle',
      error: error || undefined
    };

    // Generate preview and get dimensions
    if (showPreviews) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          uploadImage.width = img.width;
          uploadImage.height = img.height;
          uploadImage.aspectRatio = img.width / img.height;
          
          // Create preview URL
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = previewSize;
            canvas.height = previewSize;
            
            // Calculate scaling to fit in preview size while maintaining aspect ratio
            const scale = Math.min(previewSize / img.width, previewSize / img.height);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const x = (previewSize - scaledWidth) / 2;
            const y = (previewSize - scaledHeight) / 2;
            
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
            uploadImage.preview = canvas.toDataURL('image/jpeg', 0.8);
          }
          
          resolve(uploadImage);
        };
        img.onerror = () => {
          uploadImage.preview = URL.createObjectURL(file);
          resolve(uploadImage);
        };
        img.src = URL.createObjectURL(file);
      });
    }

    return uploadImage;
  }, [validateImage, generateImageId, showPreviews, previewSize]);

  // Handle image selection
  const handleImageSelect = useCallback(async (selectedFiles: FileList | File[]) => {
    if (disabled || readOnly) return;

    const fileArray = Array.from(selectedFiles);
    const newImages: UploadImage[] = [];

    for (const file of fileArray) {
      // Check max images limit
      if (maxImages && images.length + newImages.length >= maxImages) {
        break;
      }

      const uploadImage = await createUploadImage(file);
      newImages.push(uploadImage);
    }

    const updatedImages = multiple ? [...images, ...newImages] : newImages;
    setImages(updatedImages);

    if (onChange) {
      onChange(updatedImages);
    }

    if (autoUpload) {
      handleUpload(updatedImages);
    }
  }, [disabled, readOnly, maxImages, images, multiple, createUploadImage, onChange, autoUpload]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      handleImageSelect(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleImageSelect]);

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
    const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      handleImageSelect(imageFiles);
      if (onDrop) {
        // Note: onDrop will be called after images are processed
        // You might want to handle this differently based on your needs
      }
    }
  }, [disabled, readOnly, handleImageSelect, onDrop]);

  // Handle image removal
  const handleRemoveImage = useCallback((imageToRemove: UploadImage) => {
    if (disabled || readOnly) return;

    const updatedImages = images.filter(image => image.id !== imageToRemove.id);
    setImages(updatedImages);

    if (onChange) {
      onChange(updatedImages);
    }

    if (onRemove) {
      onRemove(imageToRemove);
    }
  }, [disabled, readOnly, images, onChange, onRemove]);

  // Handle upload
  const handleUpload = useCallback(async (imagesToUpload: UploadImage[] = images) => {
    if (disabled || readOnly || imagesToUpload.length === 0) return;

    const validImages = imagesToUpload.filter(image => image.status !== 'error');
    if (validImages.length === 0) return;

    setUploadingImages(new Set(validImages.map(img => img.id)));

    for (const image of validImages) {
      // Update image status to uploading
      setImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, status: 'uploading', progress: 0 } : img
      ));

      if (onUploadStart) {
        onUploadStart(image);
      }

      try {
        // Simulate upload progress (replace with actual upload logic)
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setImages(prev => prev.map(img => 
            img.id === image.id ? { ...img, progress } : img
          ));
        }

        // Update image status to success
        setImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, status: 'success', progress: 100 } : img
        ));

        if (onUploadComplete) {
          onUploadComplete(image);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, status: 'error', error: errorMessage } : img
        ));

        if (onUploadError) {
          onUploadError(image, errorMessage);
        }
      }
    }

    setUploadingImages(new Set());

    if (onUpload) {
      onUpload(validImages);
    }
  }, [disabled, readOnly, images, onUploadStart, onUploadComplete, onUploadError, onUpload]);

  // Handle button click
  const handleButtonClick = useCallback(() => {
    if (disabled || readOnly) return;
    fileInputRef.current?.click();
  }, [disabled, readOnly]);

  // Default upload icon
  const defaultIcon = useMemo(() => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
    </svg>
  ), []);

  // CSS classes
  const cssClasses = useMemo(() => {
    const baseClasses = ['imageupload'];
    if (size) baseClasses.push(`imageupload--${size}`);
    if (theme) baseClasses.push(`imageupload--${theme}`);
    if (disabled) baseClasses.push('imageupload--disabled');
    if (readOnly) baseClasses.push('imageupload--readonly');
    if (isDragOver) baseClasses.push('imageupload--drag-over');
    if (layout) baseClasses.push(`imageupload--${layout}`);
    if (className) baseClasses.push(className);
    return baseClasses.filter(Boolean).join(' ');
  }, [size, theme, disabled, readOnly, isDragOver, layout, className]);

  // Get status icon
  const getStatusIcon = useCallback((status: ImageUploadStatus) => {
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

  // Default image renderer
  const defaultImageRenderer = useCallback((image: UploadImage, onRemove: (image: UploadImage) => void) => (
    <div key={image.id} className="imageupload__image">
      <div className="imageupload__image-preview">
        {renderPreview ? (
          renderPreview(image)
        ) : (
          <img 
            src={image.preview || URL.createObjectURL(image.file)} 
            alt={image.name}
            className="imageupload__preview-img"
          />
        )}
        {showProgress && image.status === 'uploading' && (
          <div className="imageupload__image-progress">
            {renderProgress ? (
              renderProgress(image)
            ) : (
              <div className="imageupload__progress-bar">
                <div 
                  className="imageupload__progress-fill" 
                  style={{ width: `${image.progress || 0}%` }}
                />
              </div>
            )}
          </div>
        )}
        {showRemoveButton && !readOnly && (
          <button
            type="button"
            onClick={() => onRemove(image)}
            className="imageupload__image-remove"
            aria-label={`Remove ${image.name}`}
          >
            ×
          </button>
        )}
      </div>
      <div className="imageupload__image-info">
        <div className="imageupload__image-name">{image.name}</div>
        {showImageInfo && (
          <div className="imageupload__image-details">
            <span>{formatFileSize(image.size)}</span>
            {image.width && image.height && (
              <span>{image.width}×{image.height}</span>
            )}
          </div>
        )}
        {image.error && (
          <div className="imageupload__image-error">{image.error}</div>
        )}
        <div className="imageupload__image-status">
          {getStatusIcon(image.status)}
        </div>
      </div>
    </div>
  ), [showProgress, showRemoveButton, readOnly, showImageInfo, formatFileSize, getStatusIcon, renderPreview, renderProgress]);

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
        className="imageupload__input"
        aria-label={ariaLabel || 'Image upload'}
        aria-describedby={ariaDescribedBy}
        name={name}
        id={id}
      />

      {/* Dropzone */}
      {dragDrop && (
        <div
          ref={dropzoneRef}
          className={`imageupload__dropzone ${dropzoneClassName}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleButtonClick}
          role="button"
          tabIndex={disabled || readOnly ? -1 : 0}
          aria-label={ariaLabel || 'Image upload dropzone'}
        >
          <div className="imageupload__dropzone-content">
            {showIcon && (icon || defaultIcon)}
            <div className="imageupload__dropzone-text">{dropzoneText}</div>
            <button
              type="button"
              className="imageupload__button"
              onClick={(e) => e.stopPropagation()}
              disabled={disabled || readOnly}
            >
              {buttonIcon && <span className="imageupload__button-icon">{buttonIcon}</span>}
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
          className="imageupload__button"
        >
          {buttonIcon && <span className="imageupload__button-icon">{buttonIcon}</span>}
          {buttonText}
        </button>
      )}

      {/* Image list */}
      {images.length > 0 && (
        <div 
          className={`imageupload__image-list ${imageListClassName}`}
          style={layout === 'grid' ? { 
            gridTemplateColumns: `repeat(${gridColumns}, 1fr)` 
          } : undefined}
        >
          {images.map(image => 
            renderImage ? renderImage(image, handleRemoveImage) : defaultImageRenderer(image, handleRemoveImage)
          )}
        </div>
      )}

      {/* Upload button for selected images */}
      {images.length > 0 && !autoUpload && (
        <button
          type="button"
          onClick={() => handleUpload()}
          disabled={disabled || readOnly || uploadingImages.size > 0}
          className="imageupload__upload-button"
        >
          {uploadingImages.size > 0 ? 'Uploading...' : 'Upload Images'}
        </button>
      )}

      {/* Image count and limits */}
      {maxImages && (
        <div className="imageupload__image-count">
          {images.length} / {maxImages} images
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 