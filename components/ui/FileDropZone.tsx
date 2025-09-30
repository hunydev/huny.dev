import React from 'react';
import { Icon } from '../../constants';

export type FileDropZoneProps = {
  file: File | null;
  previewUrl?: string;
  error?: string;
  isDragging?: boolean;
  accept?: string;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset?: () => void;
  label?: string;
  hint?: string;
  className?: string;
  previewClassName?: string;
  showFileName?: boolean;
  showFileSize?: boolean;
};

/**
 * 파일 드래그앤드롭 영역 컴포넌트
 * 
 * @example
 * ```tsx
 * <FileDropZone
 *   file={file}
 *   previewUrl={previewUrl}
 *   onDrop={onDrop}
 *   onDragOver={onDragOver}
 *   onInputChange={onInputChange}
 *   accept="image/*"
 * />
 * ```
 */
export const FileDropZone: React.FC<FileDropZoneProps> = ({
  file,
  previewUrl,
  error,
  isDragging = false,
  accept,
  onDrop,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onInputChange,
  onReset,
  label = '이미지를 드롭하거나 클릭하여 업로드해 주세요.',
  hint,
  className = '',
  previewClassName = '',
  showFileName = true,
  showFileSize = true,
}) => {
  return (
    <div
      className={`border border-dashed rounded-lg p-5 text-center transition ${
        isDragging
          ? 'border-blue-400 bg-blue-400/10'
          : file
          ? 'border-sky-400/40 bg-sky-400/5'
          : 'border-white/15 bg-black/20 hover:border-white/30'
      } ${className}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
    >
      {file ? (
        <div className="space-y-3">
          {previewUrl && (
            <>
              <p className="text-sm text-gray-400">업로드한 이미지</p>
              <img
                src={previewUrl}
                alt="미리보기"
                className={`max-h-64 mx-auto rounded border border-white/10 ${previewClassName}`}
              />
            </>
          )}
          {showFileName && (
            <div className="text-xs text-gray-500">
              {file.name}
              {showFileSize && ` · ${(file.size / 1024).toFixed(1)} KB`}
            </div>
          )}
          {onReset && (
            <button
              type="button"
              className="px-3 py-1.5 text-sm rounded border border-white/15 text-gray-200 hover:bg-white/10"
              onClick={onReset}
            >
              다른 이미지 선택
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-400">{label}</p>
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded border border-white/15 text-gray-200 hover:bg-white/10 cursor-pointer">
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={onInputChange}
            />
            <Icon name="addSquare" className="w-4 h-4" aria-hidden />
            <span>이미지 선택</span>
          </label>
          {hint && <p className="text-xs text-gray-500">{hint}</p>}
        </div>
      )}
      {error && (
        <p className="mt-2 text-xs text-amber-300">{error}</p>
      )}
    </div>
  );
};
