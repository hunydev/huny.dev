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

const Arrow: React.FC<{ vertical?: boolean }> = ({ vertical }) => (
  <div className={`flex items-center justify-center ${vertical ? 'h-8' : 'w-8'} text-gray-500`} aria-hidden>
    {vertical ? (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2v10l3-3 .7.7L8 14 4.3 9.7 5 9l3 3V2z"/></svg>
    ) : (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 8h10l-3-3 .7-.7L14 8 9.7 11.7 9 11l3-3H2z"/></svg>
    )}
  </div>
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
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold text-white">stack-huny.dev</h1>
          <p className="mt-1 text-sm md:text-base text-gray-400">huny.dev의 아이디어 → 개발 → 배포까지, 나의 Full-Stack 흐름을 한눈에.</p>
        </div>
      </div>

      {/* Flow overview */}
      <div className="mt-6 grid gap-4 md:gap-6">
        <Section title="1) Ideation · Prototype" note="아이디어 스케치 / 프로토타입">
          <div className="flex flex-wrap items-center gap-2">
            <CHIP label="Gemini Build" color="#60a5fa" />
            <CHIP label="ChatGPT" color="#22d3ee" />
            <CHIP label="YouWare AI" color="#a78bfa" />
          </div>
        </Section>

        <Arrow vertical />

        <Section title="2) Local Development · Agentic" note="로컬로 가져와 보완/개발">
          <div className="flex flex-wrap items-center gap-2">
            <CHIP label="Windsurf" color="#34d399" />
            <CHIP label="GPT‑5 (Agent)" color="#f59e0b" />
            <CHIP label="Gemini Pro (Agent)" color="#fb7185" />
            <CHIP label="Claude Sonnet/Opus (Agent)" color="#84cc16" />
          </div>
        </Section>

        <Arrow vertical />

        <Section title="3) Assets · Media" note="아이콘/이미지 등 제작">
          <div className="flex flex-wrap items-center gap-2">
            <CHIP label="Gemini Chat" color="#60a5fa" />
            <CHIP label="ChatGPT" color="#22d3ee" />
          </div>
        </Section>

        <Arrow vertical />

        <Section title="4) Source Control" note="버전 관리">
          <div className="flex flex-wrap items-center gap-2">
            <CHIP label="GitHub" color="#9ca3af" />
          </div>
        </Section>

        <Arrow vertical />

        <Section title="5) Delivery · Hosting" note="프리뷰/프로덕션 배포">
          <div className="flex flex-wrap items-center gap-2">
            <CHIP label="Cloudflare Workers" color="#f472b6" />
            <CHIP label="Netlify" color="#22c55e" />
          </div>
        </Section>

        <Arrow vertical />

        <Section title="6) Data · Storage" note="필요 시 연결">
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

        <Arrow vertical />

        <Section title="7) DNS · Domain (huny.dev)" note="서브도메인 라우팅">
          <div className="flex flex-wrap items-center gap-2">
            <CHIP label="Cloudflare DNS" color="#f59e0b" />
            <CHIP label="huny.dev / *.huny.dev" color="#60a5fa" />
          </div>
        </Section>

        <Arrow vertical />

        <Section title="8) Clients" note="브라우저에서 사용">
          <div className="flex flex-wrap items-center gap-2">
            <CHIP label="PC Browser" color="#9ca3af" />
            <CHIP label="Mobile Browser" color="#9ca3af" />
          </div>
        </Section>
      </div>
    </div>
  );
};

export default StackHunyDevPage;
