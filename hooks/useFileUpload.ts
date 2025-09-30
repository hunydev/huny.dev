import React, { useState, useCallback, useEffect } from 'react';

export type FileUploadOptions = {
  accept?: string;
  maxSize?: number; // bytes
  onFileSelect?: (file: File) => void;
  onError?: (error: string) => void;
  autoPreview?: boolean;
};

export type FileUploadReturn = {
  file: File | null;
  previewUrl: string;
  error: string;
  isDragging: boolean;
  onFileSelect: (file: File | null) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onPaste: (e: ClipboardEvent) => void;
  reset: () => void;
  setError: (error: string) => void;
};

/**
 * 파일 업로드를 위한 공통 Hook
 * 드래그앤드롭, 붙여넣기, 파일 선택, 미리보기 지원
 * 
 * @example
 * ```tsx
 * const { file, previewUrl, onDrop, onInputChange, reset } = useFileUpload({
 *   accept: 'image/*',
 *   maxSize: 10 * 1024 * 1024, // 10MB
 *   onFileSelect: (file) => console.log('Selected:', file)
 * });
 * ```
 */
export function useFileUpload(options: FileUploadOptions = {}): FileUploadReturn {
  const {
    accept,
    maxSize,
    onFileSelect,
    onError,
    autoPreview = true,
  } = options;

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Cleanup preview URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (accept) {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileType = file.type;
      const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
      
      const isAccepted = acceptedTypes.some(acceptType => {
        if (acceptType.endsWith('/*')) {
          // e.g., "image/*"
          const category = acceptType.split('/')[0];
          return fileType.startsWith(category + '/');
        } else if (acceptType.startsWith('.')) {
          // e.g., ".png"
          return fileExt === acceptType.toLowerCase();
        } else {
          // e.g., "image/png"
          return fileType === acceptType;
        }
      });

      if (!isAccepted) {
        return `허용되지 않은 파일 형식입니다. (허용: ${accept})`;
      }
    }

    // Check file size
    if (maxSize && file.size > maxSize) {
      const sizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      return `파일 크기가 너무 큽니다. (최대: ${sizeMB}MB)`;
    }

    return null;
  }, [accept, maxSize]);

  const handleFileSelect = useCallback((newFile: File | null) => {
    // Cleanup previous preview
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }

    if (!newFile) {
      setFile(null);
      setError('');
      return;
    }

    // Validate
    const validationError = validateFile(newFile);
    if (validationError) {
      setError(validationError);
      onError?.(validationError);
      return;
    }

    setFile(newFile);
    setError('');

    // Create preview URL for images
    if (autoPreview && newFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(newFile);
      setPreviewUrl(url);
    }

    onFileSelect?.(newFile);
  }, [previewUrl, validateFile, autoPreview, onFileSelect, onError]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    handleFileSelect(selectedFile);
  }, [handleFileSelect]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0] || null;
    handleFileSelect(droppedFile);
  }, [handleFileSelect]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if leaving the drop zone itself
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const onPaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const pastedFile = item.getAsFile();
        if (pastedFile) {
          handleFileSelect(pastedFile);
          break;
        }
      }
    }
  }, [handleFileSelect]);

  const reset = useCallback(() => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl('');
    setError('');
    setIsDragging(false);
  }, [previewUrl]);

  return {
    file,
    previewUrl,
    error,
    isDragging,
    onFileSelect: handleFileSelect,
    onInputChange,
    onDrop,
    onDragOver,
    onDragEnter,
    onDragLeave,
    onPaste,
    reset,
    setError,
  };
}
