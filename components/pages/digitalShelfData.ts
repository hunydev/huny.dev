export type SubscriptionItem = {
  name: string;
  category?: string; // e.g. Productivity, Dev, Design
  billing: 'monthly' | 'yearly';
  price: number; // in KRW or USD depending on your convention
  currency?: 'KRW' | 'USD';
  note?: string;
};

export type LifetimeItem = {
  name: string;
  category?: string;
  price: number;
  currency?: 'KRW' | 'USD';
  note?: string;
};

export type FreeTierItem = {
  name: string;
  kind: string; // e.g. IDE, Chat AI, Monitoring, DB, Hosting, etc.
  minPlan?: string; // e.g. from $5/mo, from ₩5,000/mo
  note?: string;
};

export type DigitalShelfData = {
  meta: {
    title: string; // digital-shelf.json
    subtitle: string; // Personal Stack
    currencyDefault?: 'KRW' | 'USD';
  };
  subscriptions: SubscriptionItem[];
  lifetimes: LifetimeItem[];
  freeTiers: FreeTierItem[];
};

// Sample initial data (feel free to replace with your real stack)
export const DIGITAL_SHELF: DigitalShelfData = {
  meta: {
    title: 'digital-shelf.json',
    subtitle: 'Personal Stack',
    currencyDefault: 'USD',
  },
  subscriptions: [
    // Yearly
    { name: 'Microsoft 365 Family', category: 'Productivity', billing: 'yearly', price: 0, currency: 'USD', note: '가격 입력 필요' },
    { name: 'Notion Personal Pro', category: 'Productivity', billing: 'yearly', price: 96, currency: 'USD', note: '$8/mo billed annually' },
    { name: 'Zoho Mail Lite Plan', category: 'Email', billing: 'yearly', price: 0, currency: 'USD', note: '가격 입력 필요' },
    { name: 'Cloudflare Domain (huny.dev)', category: 'Domain', billing: 'yearly', price: 0, currency: 'USD', note: '가격 입력 필요' },
    { name: 'Bitwarden Personal', category: 'Security', billing: 'yearly', price: 0, currency: 'USD', note: '가격 입력 필요' },
    // Monthly
    { name: 'Windsurf Pro', category: 'Dev', billing: 'monthly', price: 0, currency: 'USD', note: '가격 입력 필요' },
    { name: 'Gemini Pro', category: 'AI', billing: 'monthly', price: 0, currency: 'USD', note: '가격 입력 필요' },
    { name: 'ChatGPT Pro', category: 'AI', billing: 'monthly', price: 0, currency: 'USD', note: '가격 입력 필요' },
    { name: 'Cloudflare Images Stream Bundle Basic', category: 'Media', billing: 'monthly', price: 0, currency: 'USD', note: '가격 입력 필요' },
    { name: 'PikaPods', category: 'Hosting', billing: 'monthly', price: 5, currency: 'USD', note: 'Starter $5' },
  ],
  lifetimes: [
    { name: 'Beyond Compare 5', category: 'Dev', price: 0, currency: 'USD', note: '가격 입력 필요' },
    { name: 'FileZilla Pro', category: 'Transfer', price: 0, currency: 'USD', note: '가격 입력 필요' },
    { name: 'UseBruno Golden Edition', category: 'API Client', price: 0, currency: 'USD', note: '가격 입력 필요' },
    { name: 'Xyplorer', category: 'File Manager', price: 0, currency: 'USD', note: '가격 입력 필요' },
    { name: 'UtilEngine', category: 'Utilities', price: 0, currency: 'USD', note: '가격 입력 필요' },
    { name: 'Hoverify', category: 'Browser DevTools', price: 0, currency: 'USD', note: '가격 입력 필요' },
    { name: 'BlogPro', category: 'Blog', price: 0, currency: 'USD', note: '가격 입력 필요' },
    { name: 'SecureCRT 9', category: 'SSH', price: 0, currency: 'USD', note: '가격 입력 필요' },
  ],
  freeTiers: [
    { name: 'Netlify', kind: 'Hosting' },
    { name: 'Cloudflare Worker', kind: 'Serverless' },
    { name: 'Whimsical', kind: 'Diagram / Whiteboard' },
  ],
};
