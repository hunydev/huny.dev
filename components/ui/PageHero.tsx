import React from 'react';

interface PageHeroProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  gradient?: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose';
  children?: React.ReactNode;
}

const gradientStyles = {
  blue: 'bg-blue-500/10',
  emerald: 'bg-emerald-500/10',
  purple: 'bg-purple-500/10',
  amber: 'bg-amber-500/10',
  rose: 'bg-rose-500/10',
};

export const PageHero: React.FC<PageHeroProps> = ({
  title,
  description,
  icon,
  gradient = 'blue',
  children,
}) => {
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#1b1b1b] p-5 md:p-7">
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute -top-24 -right-24 w-72 h-72 ${gradientStyles[gradient]} rounded-full blur-3xl`} />
      </div>
      <div className="relative">
        {icon && (
          <div className="mb-4">
            {icon}
          </div>
        )}
        <h1 className="text-2xl md:text-3xl font-semibold text-white mb-3">
          {title}
        </h1>
        {description && (
          <p className="text-gray-400 leading-relaxed">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};
