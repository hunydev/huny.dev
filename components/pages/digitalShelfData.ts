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
    { name: 'Microsoft 365 Family', category: 'Productivity', billing: 'yearly', price: 155000, currency: 'KRW', note: 'For one to six people' },
    { name: 'Notion Personal Pro', category: 'Productivity', billing: 'yearly', price: 96, currency: 'USD', note: 'Personal Pro $5/mo' },
    { name: 'Zoho Mail Lite Plan', category: 'Email', billing: 'yearly', price: 10, currency: 'USD', note: 'Enterprise-grade custom email' },
    { name: 'Cloudflare Domain (huny.dev)', category: 'Domain', billing: 'yearly', price: 12.20, currency: 'USD', note: 'Domain registrar' },
    { name: 'Bitwarden Personal', category: 'Security', billing: 'yearly', price: 10, currency: 'USD', note: 'Premium' },
    // Monthly
    { name: 'Windsurf Pro', category: 'Dev', billing: 'monthly', price: 15, currency: 'USD', note: '500 prompt credits/month' },
    { name: 'Gemini AI Pro', category: 'AI', billing: 'monthly', price: 29000, currency: 'KRW', note: '1,000 monthly AI credits' },
    { name: 'ChatGPT Plus', category: 'AI', billing: 'monthly', price: 20, currency: 'USD', note: 'access to flagship model' },
    { name: 'Cloudflare Images Stream Bundle Basic', category: 'Media', billing: 'monthly', price: 5, currency: 'USD', note: 'Images, Stream' },
    { name: 'PikaPods', category: 'Hosting', billing: 'monthly', price: 5, currency: 'USD', note: 'Starter $5' },
  ],
  lifetimes: [
    { name: 'Beyond Compare 5', category: 'Dev', price: 70, currency: 'USD', note: 'Pro Edition' },
    { name: 'FileZilla Pro', category: 'Transfer', price: 149.99, currency: 'USD', note: 'Multiple Devices For Windows' },
    { name: 'UseBruno', category: 'API Client', price: 9, currency: 'USD', note: 'Golden Edition' },
    { name: 'Xyplorer', category: 'File Manager', price: 69.95, currency: 'USD', note: 'Lifetime License Professional' },
    { name: 'UtilEngine', category: 'Utilities', price: 29, currency: 'USD', note: 'License for 5 browsers' },
    { name: 'Hoverify', category: 'Browser DevTools', price: 89, currency: 'USD', note: 'License for 3 activations' },
    { name: 'BlogPro', category: 'Blog', price: 399, currency: 'USD', note: 'Turn Notion into Blog' },
    { name: 'SecureCRT 9', category: 'SSH', price: 130.9, currency: 'USD', note: 'w/1 Yr of Updates' },
  ],
  freeTiers: [
    { name: 'Netlify', kind: 'Hosting', minPlan: '$9/mo' },
    { name: 'Cloudflare Worker', kind: 'Serverless', minPlan: '$5/mo', note: "Workers Free $0, Workers Paid Starting at $5/mo" },
    { name: 'Whimsical', kind: 'Diagram / Whiteboard', minPlan: '$10/mo' },
  ],
};
