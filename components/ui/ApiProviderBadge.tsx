import React from 'react';

export type ApiProvider = 'gemini' | 'openai' | 'both';

export interface ApiProviderBadgeProps {
  provider: ApiProvider;
  className?: string;
}

const GeminiIcon: React.FC<{ className?: string }> = ({ className = 'w-3 h-3' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={className}>
    <path
      fill="#448aff"
      d="M15 8.014A7.457 7.457 0 0 0 8.014 15h-.028A7.456 7.456 0 0 0 1 8.014v-.028A7.456 7.456 0 0 0 7.986 1h.028A7.457 7.457 0 0 0 15 7.986z"
    />
  </svg>
);

const OpenAIIcon: React.FC<{ className?: string }> = ({ className = 'w-3 h-3' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M11.217 19.384a3.501 3.501 0 0 0 6.783 -1.217v-5.167l-6 -3.35" />
    <path d="M5.214 15.014a3.501 3.501 0 0 0 4.446 5.266l4.34 -2.534v-6.946" />
    <path d="M6 7.63c-1.391 -.236 -2.787 .395 -3.534 1.689a3.474 3.474 0 0 0 1.271 4.745l4.263 2.514l6 -3.348" />
    <path d="M12.783 4.616a3.501 3.501 0 0 0 -6.783 1.217v5.067l6 3.45" />
    <path d="M18.786 8.986a3.501 3.501 0 0 0 -4.446 -5.266l-4.34 2.534v6.946" />
    <path d="M18 16.302c1.391 .236 2.787 -.395 3.534 -1.689a3.474 3.474 0 0 0 -1.271 -4.745l-4.308 -2.514l-5.955 3.42" />
  </svg>
);

export const ApiProviderBadge: React.FC<ApiProviderBadgeProps> = ({ provider, className = '' }) => {
  if (provider === 'both') {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium">
          <GeminiIcon className="w-3 h-3" />
          <span>Gemini</span>
        </div>
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/30 text-green-300 text-xs font-medium">
          <OpenAIIcon className="w-3 h-3" />
          <span>OpenAI</span>
        </div>
      </div>
    );
  }

  if (provider === 'gemini') {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium ${className}`}>
        <GeminiIcon className="w-3 h-3" />
        <span>Gemini</span>
      </div>
    );
  }

  if (provider === 'openai') {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/30 text-green-300 text-xs font-medium ${className}`}>
        <OpenAIIcon className="w-3 h-3" />
        <span>OpenAI</span>
      </div>
    );
  }

  return null;
};
