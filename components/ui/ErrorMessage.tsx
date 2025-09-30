import React from 'react';

export type ErrorMessageProps = {
  error?: string;
  className?: string;
};

/**
 * 일관된 에러 메시지 표시 컴포넌트
 * - 에러가 없으면 null 반환 (렌더링 안함)
 * - 기본 스타일: text-xs text-amber-300 truncate
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, className }) => {
  if (!error) return null;
  
  return (
    <span className={className || 'text-xs text-amber-300 truncate'} title={error}>
      {error}
    </span>
  );
};

export default ErrorMessage;
