import React from 'react';
import type { PageProps } from '../../types';

// Import mascot assets
import conceptImg from '../../extra/mascot/images/concept.png';
import sideImg from '../../extra/mascot/images/side.png';
import frontImg from '../../extra/mascot/images/front.png';
import rearImg from '../../extra/mascot/images/rear.png';
import workImg from '../../extra/mascot/images/work.png';
import injuryImg from '../../extra/mascot/images/injury.png';
import cyborgImg from '../../extra/mascot/images/cyborg.png';
import iconImg from '../../extra/mascot/images/icon.png';

const SectionCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }>= ({ title, subtitle, children }) => (
  <section className="rounded-lg border border-white/10 bg-[#202020] p-4 md:p-5">
    <header className="flex items-end justify-between gap-3">
      <div>
        <h2 className="text-white font-medium text-lg md:text-xl">{title}</h2>
        {subtitle && <p className="text-xs md:text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </header>
    <div className="mt-3">{children}</div>
  </section>
);

const ImgTile: React.FC<{ src: string; label?: string; h?: number }>= ({ src, label, h = 200 }) => (
  <figure className="flex flex-col items-center gap-2">
    <img
      src={src}
      alt={label || 'mascot'}
      className="rounded border border-white/10 bg-[#1a1a1a] object-contain"
      style={{ height: h, width: 'auto', maxWidth: 360 }}
      loading="lazy"
    />
    {label && <figcaption className="text-xs text-gray-400">{label}</figcaption>}
  </figure>
);

const ImageRow: React.FC<{ children: React.ReactNode }>= ({ children }) => (
  <div className="flex flex-wrap items-end gap-4">{children}</div>
);

const MascotGalleryPage: React.FC<PageProps> = () => {
  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#1b1b1b] p-5 md:p-7">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold text-white">Mascot Gallery</h1>
          <p className="mt-1 text-sm md:text-base text-gray-400">huny.dev 브랜드 마스코트의 컨셉 · 기본 · 변형(Variations)</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:gap-6">
        {/* Concept */}
        <SectionCard title="Concept" subtitle="최초 콘셉트 이미지">
          <div className="flex justify-center">
            <ImgTile src={conceptImg} label="concept.png" h={360} />
          </div>
        </SectionCard>

        {/* Base images */}
        <SectionCard title="Base" subtitle="기본 이미지 (좌→우: side, front, rear)">
          <ImageRow>
            <ImgTile src={sideImg} label="side.png" h={240} />
            <ImgTile src={frontImg} label="front.png" h={240} />
            <ImgTile src={rearImg} label="rear.png" h={240} />
          </ImageRow>
        </SectionCard>

        {/* Variations */}
        <SectionCard title="Variations" subtitle="확장(variation)">
          <ImageRow>
            <ImgTile src={workImg} label="work.png" h={220} />
            <ImgTile src={injuryImg} label="injury.png" h={220} />
            <ImgTile src={cyborgImg} label="cyborg.png" h={220} />
            <ImgTile src={iconImg} label="icon.png" h={160} />
          </ImageRow>
        </SectionCard>
      </div>
    </div>
  );
};

export default MascotGalleryPage;
