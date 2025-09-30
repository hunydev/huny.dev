import React from 'react';

export type LoadingButtonProps = {
  loading: boolean;
  disabled?: boolean;
  onClick?: () => void;
  loadingText: string;
  idleText: string;
  variant?: 'primary' | 'secondary' | 'blue' | 'emerald' | 'indigo';
  className?: string;
  children?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
};

/**
 * 로딩 상태를 표시하는 버튼 컴포넌트
 * - 로딩 중일 때 자동으로 텍스트 변경 및 비활성화
 * - 여러 variant 지원
 */
export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  disabled,
  onClick,
  loadingText,
  idleText,
  variant = 'primary',
  className,
  children,
  type = 'button',
}) => {
  const baseClass = 'px-3 py-2 rounded text-sm border border-white/10 transition';
  
  const variantClasses = {
    primary: `${loading ? 'opacity-70' : 'hover:bg-white/10'} text-white`,
    secondary: 'text-gray-300 hover:bg-white/10',
    blue: loading || disabled
      ? 'bg-blue-600/40 text-white/70 cursor-not-allowed'
      : 'bg-blue-600 hover:bg-blue-500 text-white',
    emerald: loading || disabled
      ? 'bg-emerald-600/40 text-white/70 cursor-not-allowed'
      : 'bg-emerald-600 hover:bg-emerald-500 text-white',
    indigo: loading || disabled
      ? 'bg-indigo-600/40 text-white/70 cursor-not-allowed'
      : 'bg-indigo-600 hover:bg-indigo-500 text-white',
  };

  const finalClassName = className || `${baseClass} ${variantClasses[variant]}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={finalClassName}
    >
      {children || (loading ? loadingText : idleText)}
    </button>
  );
};

export default LoadingButton;
