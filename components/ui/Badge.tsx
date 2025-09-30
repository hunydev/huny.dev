import React from 'react';

export type BadgeProps = {
  children: React.ReactNode;
  variant?: 'default' | 'colored';
  colorClass?: string;
  className?: string;
};

/**
 * 일관된 Badge 컴포넌트
 * - default: 기본 회색 테두리 스타일
 * - colored: 커스텀 colorClass 적용
 */
export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  colorClass,
  className 
}) => {
  const defaultClass = 'inline-flex items-center px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-[11px] text-gray-300';
  const finalClass = className || (variant === 'colored' && colorClass ? `inline-flex items-center px-2 py-0.5 rounded text-[11px] ${colorClass}` : defaultClass);
  
  return (
    <span className={finalClass}>
      {children}
    </span>
  );
};

export default Badge;
