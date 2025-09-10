import React from 'react';
import type { PageProps } from '../../types';
import { DIGITAL_SHELF, SubscriptionItem, LifetimeItem, FreeTierItem } from './digitalShelfData';

// Simple color palette for charts
const PALETTE = ['#60a5fa', '#34d399', '#f59e0b', '#f43f5e', '#a78bfa', '#22d3ee', '#fb7185', '#84cc16', '#eab308'];

function groupByCurrency<T extends { price: number; currency?: 'KRW' | 'USD' }>(
  items: T[],
  defaultCurrency: 'KRW' | 'USD' = 'USD'
): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const cur = item.currency || defaultCurrency;
    acc[cur] = acc[cur] || [];
    acc[cur].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

function formatMoney(value: number, currency: 'KRW' | 'USD') {
  if (currency === 'KRW') {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(value);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

const PieLegend: React.FC<{ entries: Array<{ label: string; value: number; color: string; currency: 'KRW' | 'USD' }> }> = ({ entries }) => (
  <ul className="flex flex-col gap-1 text-xs">
    {entries.map((e) => (
      <li key={e.label} className="flex items-center justify-between gap-2">
        <span className="min-w-0 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded shrink-0" style={{ background: e.color }} aria-hidden />
          <span className="text-gray-300 truncate" title={e.label}>{e.label}</span>
        </span>
        <span className="text-gray-500 shrink-0">{formatMoney(e.value, e.currency)}</span>
      </li>
    ))}
  </ul>
);

const PieChart: React.FC<{ entries: Array<{ label: string; value: number; color: string }>; size?: number }> = ({ entries, size = 120 }) => {
  const total = entries.reduce((s, e) => s + e.value, 0);
  let acc = 0;
  const segments: Array<{ from: number; to: number; color: string }> = entries.map((e) => {
    const from = acc;
    const to = acc + (total > 0 ? (e.value / total) * 360 : 0);
    acc = to;
    return { from, to, color: e.color };
  });
  const gradient = segments
    .map((s) => `${s.color} ${s.from}deg ${s.to}deg`)
    .join(', ');
  return (
    <div
      className="rounded-full"
      style={{ width: size, height: size, background: `conic-gradient(${gradient})` }}
      role="img"
      aria-label="Pie chart"
    />
  );
};

const SectionCard: React.FC<{ title: string; children: React.ReactNode }>= ({ title, children }) => (
  <section className="relative rounded-lg border border-white/10 bg-[#202020] p-4 md:p-5">
    <header className="flex items-center justify-between">
      <h2 className="text-white font-medium text-lg md:text-xl">{title}</h2>
    </header>
    <div className="mt-3 space-y-4">{children}</div>
  </section>
);

const SubsTable: React.FC<{ items: SubscriptionItem[] }> = ({ items }) => (
  <div className="overflow-x-auto rounded border border-white/10">
    <table className="w-full text-sm">
      <thead className="bg-white/[0.04] text-gray-300">
        <tr>
          <th className="text-left px-3 py-2">Name</th>
          <th className="text-left px-3 py-2">Category</th>
          <th className="text-left px-3 py-2">Billing</th>
          <th className="text-right px-3 py-2">Price</th>
          <th className="text-left px-3 py-2">Note</th>
        </tr>
      </thead>
      <tbody>
        {items.map((it) => (
          <tr key={`${it.name}-${it.billing}`} className="border-t border-white/5">
            <td className="px-3 py-2 text-gray-100">{it.name}</td>
            <td className="px-3 py-2 text-gray-400">{it.category || '-'}</td>
            <td className="px-3 py-2 text-gray-400">{it.billing}</td>
            <td className="px-3 py-2 text-right text-gray-200">{formatMoney(it.price, (it.currency || DIGITAL_SHELF.meta.currencyDefault || 'USD') as any)}</td>
            <td className="px-3 py-2 text-gray-400">{it.note || ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const LifetimeTable: React.FC<{ items: LifetimeItem[] }> = ({ items }) => (
  <div className="overflow-x-auto rounded border border-white/10">
    <table className="w-full text-sm">
      <thead className="bg-white/[0.04] text-gray-300">
        <tr>
          <th className="text-left px-3 py-2">Name</th>
          <th className="text-left px-3 py-2">Category</th>
          <th className="text-right px-3 py-2">Price</th>
          <th className="text-left px-3 py-2">Note</th>
        </tr>
      </thead>
      <tbody>
        {items.map((it) => (
          <tr key={`${it.name}`} className="border-t border-white/5">
            <td className="px-3 py-2 text-gray-100">{it.name}</td>
            <td className="px-3 py-2 text-gray-400">{it.category || '-'}</td>
            <td className="px-3 py-2 text-right text-gray-200">{formatMoney(it.price, (it.currency || DIGITAL_SHELF.meta.currencyDefault || 'USD') as any)}</td>
            <td className="px-3 py-2 text-gray-400">{it.note || ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const FreeTable: React.FC<{ items: FreeTierItem[] }> = ({ items }) => (
  <div className="overflow-x-auto rounded border border-white/10">
    <table className="w-full text-sm">
      <thead className="bg-white/[0.04] text-gray-300">
        <tr>
          <th className="text-left px-3 py-2">Name</th>
          <th className="text-left px-3 py-2">Kind</th>
          <th className="text-left px-3 py-2">Min Plan</th>
          <th className="text-left px-3 py-2">Note</th>
        </tr>
      </thead>
      <tbody>
        {items.map((it) => (
          <tr key={`${it.name}`} className="border-t border-white/5">
            <td className="px-3 py-2 text-gray-100">{it.name}</td>
            <td className="px-3 py-2 text-gray-400">{it.kind}</td>
            <td className="px-3 py-2 text-gray-400">{it.minPlan || '-'}</td>
            <td className="px-3 py-2 text-gray-400">{it.note || ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const DigitalShelfPage: React.FC<PageProps> = () => {
  const meta = DIGITAL_SHELF.meta;

  // Toggle for subscriptions chart view: 'monthly' or 'yearly'
  const [subsView, setSubsView] = React.useState<'monthly' | 'yearly'>('monthly');

  const subsByCurrency = groupByCurrency(DIGITAL_SHELF.subscriptions, meta.currencyDefault || 'USD');
  const lifeByCurrency = groupByCurrency(DIGITAL_SHELF.lifetimes, meta.currencyDefault || 'USD');

  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#1b1b1b] p-5 md:p-7">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold text-white">Digital Shelf</h1>
          <p className="mt-1 text-sm md:text-base text-gray-400">{meta.subtitle || 'Personal Stack'}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:gap-6 grid-cols-1">
        {/* Subscriptions */}
        <SectionCard title="Subscriptions (Paid)">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">View:</span>
            <div className="inline-flex rounded border border-white/10 overflow-hidden">
              <button
                className={`px-2 py-1 ${subsView === 'monthly' ? 'bg-white/10 text-gray-100' : 'text-gray-300 hover:bg-white/5'}`}
                onClick={() => setSubsView('monthly')}
                aria-pressed={subsView === 'monthly'}
              >
                Monthly
              </button>
              <button
                className={`px-2 py-1 ${subsView === 'yearly' ? 'bg-white/10 text-gray-100' : 'text-gray-300 hover:bg-white/5'}`}
                onClick={() => setSubsView('yearly')}
                aria-pressed={subsView === 'yearly'}
              >
                Yearly
              </button>
            </div>
          </div>
          {Object.entries(subsByCurrency).map(([currency, items], blockIdx) => {
            const normalized = items.map((it) => {
              const raw = it.price;
              const val = it.billing === 'monthly'
                ? (subsView === 'monthly' ? raw : raw * 12)
                : (subsView === 'monthly' ? raw / 12 : raw); // yearly
              return { ...it, normalized: val };
            });
            const entries = normalized.map((it, i) => ({ label: it.name, value: it.normalized, color: PALETTE[i % PALETTE.length] }));
            const legendEntries = normalized.map((it, i) => ({ label: it.name, value: it.normalized, color: PALETTE[i % PALETTE.length], currency: currency as 'KRW' | 'USD' }));
            const total = normalized.reduce((s, it) => s + it.normalized, 0);
            return (
              <div key={`subs-${currency}-${blockIdx}`} className="rounded bg-white/[0.03] border border-white/10 p-3">
                <div className="flex flex-col md:flex-row gap-4 md:items-start">
                  <div className="flex items-center gap-4 shrink-0 md:w-[340px]">
                    <PieChart entries={entries} size={140} />
                    <div>
                      <div className="text-gray-300 text-sm">Total ({subsView})</div>
                      <div className="text-white text-lg font-semibold">{formatMoney(total, currency as any)}</div>
                      <div className="text-gray-500 text-xs mt-1">Currency: {currency}</div>
                    </div>
                  </div>
                  <div className="grow md:max-h-56 overflow-y-auto pr-1">
                    <PieLegend entries={legendEntries} />
                  </div>
                </div>
                <div className="mt-3">
                  <SubsTable items={items} />
                </div>
              </div>
            );
          })}
        </SectionCard>

        {/* Lifetime */}
        <SectionCard title="Lifetime Licenses (One-time)">
          {Object.entries(lifeByCurrency).map(([currency, items], blockIdx) => {
            const entries = items.map((it, i) => ({ label: it.name, value: it.price, color: PALETTE[i % PALETTE.length] }));
            const legendEntries = items.map((it, i) => ({ label: it.name, value: it.price, color: PALETTE[i % PALETTE.length], currency: currency as 'KRW' | 'USD' }));
            const total = items.reduce((s, it) => s + it.price, 0);
            return (
              <div key={`life-${currency}-${blockIdx}`} className="rounded bg-white/[0.03] border border-white/10 p-3">
                <div className="flex flex-col md:flex-row gap-4 md:items-start">
                  <div className="flex items-center gap-4 shrink-0 md:w-[340px]">
                    <PieChart entries={entries} size={140} />
                    <div>
                      <div className="text-gray-300 text-sm">Total</div>
                      <div className="text-white text-lg font-semibold">{formatMoney(total, currency as any)}</div>
                      <div className="text-gray-500 text-xs mt-1">Currency: {currency}</div>
                    </div>
                  </div>
                  <div className="grow md:max-h-56 overflow-y-auto pr-1">
                    <PieLegend entries={legendEntries} />
                  </div>
                </div>
                <div className="mt-3">
                  <LifetimeTable items={items} />
                </div>
              </div>
            );
          })}
        </SectionCard>

        {/* Free tier */}
        <SectionCard title="Useful Free-tier Software / Services">
          <FreeTable items={DIGITAL_SHELF.freeTiers} />
        </SectionCard>
      </div>
    </div>
  );
};

export default DigitalShelfPage;
