import React from 'react';
import type { PageProps } from '../../types';
import { WORKS } from './worksData';

const Chip: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/10 text-gray-200 text-[11px] md:text-xs mr-1 mb-1">
    {label}
  </span>
);

const WorksPage: React.FC<PageProps> = () => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#1b1b1b] p-5 md:p-7">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <h1 className="mt-3 text-2xl md:text-3xl font-semibold text-white">Works</h1>
          <p className="mt-1 text-sm md:text-base text-gray-400">업무 내용 및 기술 스택</p>
        </div>
      </div>

      {/* Blocks */}
      <div className="mt-6 grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        {WORKS.map((block, idx) => (
          <section
            key={block.id}
            className={`relative rounded-lg border border-white/10 bg-[#202020] p-4 md:p-5 transition-all duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{ transitionDelay: `${idx * 80}ms` }}
            aria-labelledby={`work-${block.id}`}
          >
            <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: block.color, opacity: 0.9 }} aria-hidden />
            <header className="flex items-center justify-between">
              <h2 id={`work-${block.id}`} className="text-white font-medium text-lg md:text-xl flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded" style={{ background: block.color }} aria-hidden />
                {block.title}
              </h2>
            </header>

            <div className="mt-3 space-y-3">
              {block.items.map((it, i) => (
                <article key={`${block.id}-${i}`} className="rounded bg-white/[0.03] border border-white/10 p-3">
                  <h3 className="text-gray-100 font-medium text-sm md:text-base">{it.title}</h3>
                  {it.description && (
                    <p className="text-xs md:text-sm text-gray-400 mt-1">{it.description}</p>
                  )}
                  {it.stacks && it.stacks.length > 0 && (
                    <div className="mt-2 -m-0.5">
                      {it.stacks.map((s) => (
                        <Chip key={s} label={s} />
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>

            {block.note && (
              <p className="mt-3 text-xs text-gray-500">{block.note}</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default WorksPage;
