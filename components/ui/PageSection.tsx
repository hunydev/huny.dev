import React from 'react';

interface PageSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const PageSection: React.FC<PageSectionProps> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <section className={`space-y-4 ${className}`}>
      {title && (
        <h2 className="text-xl font-semibold text-white">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
};
