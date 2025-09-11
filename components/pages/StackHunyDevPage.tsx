import React from 'react';
import type { PageProps } from '../../types';

const CHIP = (props: { label: string; color?: string }) => (
  <span
    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border"
    style={{
      color: props.color || '#e5e7eb',
      borderColor: (props.color || '#e5e7eb') + '33',
      background: (props.color || '#e5e7eb') + '14',
    }}
  >
    {props.label}
  </span>
);

const RailCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <aside className="rounded-lg border border-white/10 bg-[#1f1f1f] p-4 md:p-5">
    <header className="flex items-center gap-2">
      <span className="text-base md:text-lg font-semibold text-white">{title}</span>
      <span className="text-sm text-gray-400" aria-hidden>∞</span>
    </header>
    <div className="mt-3 space-y-2">
      {children}
    </div>
  </aside>
);

const Section: React.FC<{ title: string; children: React.ReactNode; note?: string }>= ({ title, note, children }) => (
  <section className="rounded-lg border border-white/10 bg-[#202020] p-4 md:p-5">
    <header className="flex items-center justify-between">
      <h3 className="text-white font-medium text-base md:text-lg">{title}</h3>
      {note && <span className="text-xs text-gray-400">{note}</span>}
    </header>
    <div className="mt-3">{children}</div>
  </section>
);

const StackHunyDevPage: React.FC<PageProps> = () => {
  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#1b1b1b] p-5 md:p-7">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold text-white">huny.dev Tech Stack</h1>
          <p className="mt-1 text-sm md:text-base text-gray-400">From ideation to deployment: the full‑stack map of huny.dev.</p>
        </div>
      </div>

      {/* Stack map: stages (left) + continuous rails (right) */}
      <div className="mt-6 grid gap-4 md:gap-6 md:grid-cols-[1fr,320px]">
        {/* Stages / Lanes */}
        <div className="space-y-4">
          <Section title="1) Ideation · Prototype" note="Sketching ideas / Prototyping">
            <div className="flex flex-wrap items-center gap-2">
              <CHIP label="Gemini Build" color="#60a5fa" />
              <CHIP label="ChatGPT" color="#22d3ee" />
              <CHIP label="YouWare AI" color="#a78bfa" />
            </div>
          </Section>

          <Section title="2) Local Development · Agentic" note="Local development & agentic iteration">
            <div className="flex flex-wrap items-center gap-2">
              <CHIP label="Windsurf" color="#34d399" />
              <CHIP label="GPT‑5 (Agent)" color="#f59e0b" />
              <CHIP label="Gemini Pro (Agent)" color="#fb7185" />
              <CHIP label="Claude Sonnet/Opus (Agent)" color="#84cc16" />
            </div>
          </Section>

          <Section title="3) Assets · Media" note="Create icons/images and media">
            <div className="flex flex-wrap items-center gap-2">
              <CHIP label="Gemini Chat" color="#60a5fa" />
              <CHIP label="ChatGPT" color="#22d3ee" />
            </div>
          </Section>

          <Section title="4) Delivery · Hosting" note="Preview/Production deployment">
            <div className="flex flex-wrap items-center gap-2">
              <CHIP label="Cloudflare Workers" color="#f472b6" />
              <CHIP label="Netlify" color="#22c55e" />
            </div>
          </Section>

          <Section title="5) Data · Storage" note="Connect as needed">
            <div className="flex flex-wrap items-center gap-2">
              <CHIP label="Cloudflare KV" color="#c084fc" />
              <CHIP label="Cloudflare D1" color="#a3e635" />
              <CHIP label="Cloudflare R2" color="#f97316" />
              <CHIP label="Cloudflare Stream" color="#06b6d4" />
              <CHIP label="Cloudflare Images" color="#f43f5e" />
              <CHIP label="Netlify Postgres" color="#38bdf8" />
              <CHIP label="Netlify Blob" color="#eab308" />
            </div>
          </Section>

          <Section title="6) DNS · Domain (huny.dev)" note="Subdomain routing">
            <div className="flex flex-wrap items-center gap-2">
              <CHIP label="Cloudflare DNS" color="#f59e0b" />
              <CHIP label="huny.dev / *.huny.dev" color="#60a5fa" />
            </div>
          </Section>

          <Section title="7) Clients" note="Used in browsers">
            <div className="flex flex-wrap items-center gap-2">
              <CHIP label="PC Browser" color="#9ca3af" />
              <CHIP label="Mobile Browser" color="#9ca3af" />
            </div>
          </Section>
        </div>

        {/* Continuous rails */}
        <div className="space-y-4 md:sticky md:top-4 self-start">
          <RailCard title="Continuous · Source Control">
            <div className="flex flex-wrap items-center gap-2">
              <CHIP label="GitHub" color="#9ca3af" />
            </div>
            <p className="text-xs text-gray-400">Issues/PRs/projects, release tags, release notes — integrated across ops & delivery</p>
          </RailCard>
          <RailCard title="Continuous · CI/CD & Delivery">
            <div className="flex flex-wrap items-center gap-2">
              <CHIP label="Netlify" color="#22c55e" />
              <CHIP label="Cloudflare Workers" color="#f472b6" />
            </div>
            <p className="text-xs text-gray-400">Preview/Prod pipelines, branch previews, automatic cache invalidation, etc.</p>
          </RailCard>
          <RailCard title="Continuous · Assets / Media">
            <div className="flex flex-wrap items-center gap-2">
              <CHIP label="Cloudflare Images" color="#f43f5e" />
              <CHIP label="Cloudflare Stream" color="#06b6d4" />
              <CHIP label="Cloudflare R2" color="#f97316" />
            </div>
            <p className="text-xs text-gray-400">Image/video hosting, resizing & serving, operating the media pipeline</p>
          </RailCard>
          <RailCard title="Continuous · Data & Storage">
            <div className="flex flex-wrap items-center gap-2">
              <CHIP label="Cloudflare KV" color="#c084fc" />
              <CHIP label="Cloudflare D1" color="#a3e635" />
              <CHIP label="Netlify Postgres" color="#38bdf8" />
              <CHIP label="Netlify Blob" color="#eab308" />
            </div>
            <p className="text-xs text-gray-400">Configuration/cache/data persistence, object/blob storage, Postgres‑backed data services</p>
          </RailCard>
        </div>
      </div>
    </div>
  );
};

export default StackHunyDevPage;
