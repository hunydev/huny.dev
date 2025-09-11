import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PageProps } from '../../types';

// Basic data model migrated from extra/tts_history/index.html
// Categories: early | digital | ai

type TtsItem = {
  id: string;
  category: 'early' | 'digital' | 'ai';
  year: number; // numeric for sorting and scope checks
  yearLabel: string;
  title: string;
  description: string;
  features?: string[];
  researchers?: string[];
  companies?: string[];
  // For modern era items, provide audio samples and reference links
  samples?: Array<{ title: string; url: string }>;
  links?: Array<{ title: string; url: string }>;
};

const DATA: TtsItem[] = [
  // Early era (1950-1990)
  {
    id: '1950s',
    category: 'early',
    year: 1958,
    yearLabel: '1950년대 후반',
    title: '최초의 컴퓨터 기반 음성 합성',
    description: '최초의 컴퓨터 기반 음성 합성 시스템이 등장하며 TTS 기술의 시작을 알렸습니다.',
    features: ['컴퓨터 음성 합성', '기초 연구'],
  },
  {
    id: '1961-ibm704',
    category: 'early',
    year: 1961,
    yearLabel: '1961년',
    title: 'IBM 704 "데이지 벨" 프로젝트',
    description: '벨 연구소의 존 래리 켈리 주니어와 루이 거스트먼이 IBM 704 컴퓨터로 최초의 음성 합성에 성공했습니다.',
    features: ['IBM 704', '데이지 벨', '벨 연구소'],
    researchers: ['존 래리 켈리 주니어', '루이 거스트먼'],
  },
  {
    id: '1966-lpc',
    category: 'early',
    year: 1966,
    yearLabel: '1966년',
    title: '선형 예측 부호화(LPC) 기술 개발',
    description: '나고야 대학과 NTT에서 음성 합성의 핵심 기술인 LPC 기술을 개발했습니다.',
    features: ['LPC', '음성 부호화', '신호 처리'],
    researchers: ['이타쿠라 후미타다', '사이토 슈조'],
  },
  {
    id: '1975-lsp',
    category: 'early',
    year: 1975,
    yearLabel: '1975년',
    title: '라인 스펙트럴 페어스(LSP) 방법',
    description: '음성 합성 및 부호화 기술의 중요한 돌파구가 된 LSP 방법이 개발되었습니다.',
    features: ['LSP', '스펙트럴 분석', '기술적 혁신'],
  },

  // Digital era (1990-2010)
  {
    id: '1990-unit-selection',
    category: 'digital',
    year: 1990,
    yearLabel: '1990년대 초',
    title: '음편 선택 합성 기술',
    description: 'Unit Selection Synthesis 기술이 등장하여 더욱 자연스러운 음성 합성이 가능해졌습니다.',
    features: ['Unit Selection', '연결합성', '자연스러운 음성'],
  },
  {
    id: '2000-dsp',
    category: 'digital',
    year: 2000,
    yearLabel: '2000년대',
    title: '디지털 음성 처리 기술 발전',
    description: '텍스트 정규화, 음소 변환, 운율 제어 등 디지털 음성 처리 기술이 크게 발전했습니다.',
    features: ['텍스트 정규화', '음소 변환', '운율 제어'],
  },

  // AI era (2010- )
  {
    id: '2016-wavenet',
    category: 'ai',
    year: 2016,
    yearLabel: '2016년',
    title: 'WaveNet 등장',
    description: 'Google DeepMind에서 개발한 WaveNet이 딥러닝 기반 TTS의 새로운 시대를 열었습니다.',
    features: ['WaveNet', '딥러닝', 'Google DeepMind'],
    companies: ['Google'],
    samples: [
      { title: 'WaveNet – DeepMind samples', url: 'https://deepmind.google/discover/blog/wavenet-a-generative-model-for-raw-audio/' },
    ],
    links: [
      { title: 'WaveNet paper (arXiv)', url: 'https://arxiv.org/abs/1609.03499' },
      { title: 'DeepMind blog', url: 'https://deepmind.google/discover/blog/wavenet-a-generative-model-for-raw-audio/' },
    ],
  },
  {
    id: '2017-tacotron',
    category: 'ai',
    year: 2017,
    yearLabel: '2017년',
    title: 'Tacotron 시리즈',
    description: 'End-to-end 음성 합성 모델인 Tacotron이 등장하여 텍스트에서 음성까지 직접 변환이 가능해졌습니다.',
    features: ['Tacotron', 'End-to-end', 'Attention 메커니즘'],
    samples: [
      { title: 'Tacotron samples', url: 'https://google.github.io/tacotron/' },
    ],
    links: [
      { title: 'Tacotron paper (arXiv)', url: 'https://arxiv.org/abs/1703.10135' },
    ],
  },
  {
    id: '2020-emotion',
    category: 'ai',
    year: 2020,
    yearLabel: '2020년대',
    title: '실시간 감정 표현 TTS',
    description: '감정과 억양을 실시간으로 조절할 수 있는 고도화된 TTS 기술이 개발되었습니다.',
    features: ['감정 표현', '실시간 처리', '억양 제어'],
    samples: [
      { title: 'Azure Neural TTS demo', url: 'https://azure.microsoft.com/en-us/products/cognitive-services/text-to-speech/#demo' },
      { title: 'Google Cloud TTS demo', url: 'https://cloud.google.com/text-to-speech?hl=ko#section-tryit' },
    ],
    links: [
      { title: 'Azure Neural TTS docs', url: 'https://learn.microsoft.com/azure/ai-services/speech-service/text-to-speech' },
      { title: 'Google Cloud TTS docs', url: 'https://cloud.google.com/text-to-speech/docs?hl=ko' },
      { title: 'Amazon Polly (Neural) overview', url: 'https://aws.amazon.com/polly/' },
    ],
  },
  {
    id: '2024-modern',
    category: 'ai',
    year: 2024,
    yearLabel: '2024년',
    title: '최신 AI TTS 모델들',
    description: 'ChatTTS, Mars5 TTS, MetaVoice, Parler TTS 등 다양한 특화 기능을 가진 최신 모델들이 등장했습니다.',
    features: ['ChatTTS', 'Mars5 TTS', 'MetaVoice', 'Parler TTS'],
    companies: ['Google', 'Apple', 'Amazon', 'Microsoft', 'iFlytek', 'Baidu'],
    samples: [
      { title: 'ChatTTS — Hugging Face Space', url: 'https://huggingface.co/spaces/2Noise/ChatTTS' },
      { title: 'Parler-TTS — Hugging Face Space', url: 'https://huggingface.co/spaces/parler-tts/parler-tts' },
      { title: 'MetaVoice — Demos', url: 'https://metavoice.ai' },
    ],
    links: [
      { title: 'ChatTTS — GitHub', url: 'https://github.com/2noise/ChatTTS' },
      { title: 'Parler-TTS — GitHub', url: 'https://github.com/huggingface/parler-tts' },
    ],
  },
];

const FILTERS = [
  { id: 'all', label: '전체' },
  { id: 'early', label: '초기 발전 (1950-1990)' },
  { id: 'digital', label: '디지털 시대 (1990-2010)' },
  { id: 'ai', label: 'AI 시대 (2010-현재)' },
] as const;

// IntersectionObserver 기반 간단한 in-view 훅 (map 내부 훅 사용 회피를 위해 컴포넌트로 캡슐화)
function useInView<T extends HTMLElement>(): { ref: React.MutableRefObject<T | null>; inView: boolean } {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setInView(true);
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

type TimelineItemProps = {
  item: TtsItem;
  showDivider: boolean;
  onOpen: (item: TtsItem, opener?: HTMLElement | null) => void;
};

const TimelineItem: React.FC<TimelineItemProps> = ({ item, showDivider, onOpen }) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <>
      {showDivider && (
        <li className="relative">
          <div className="absolute -left-1.5 md:-left-2 top-1.5 w-3 h-3 md:w-4 md:h-4 rounded-full bg-blue-500/30 ring-2 ring-blue-500/40" />
          <div className="ml-6 md:ml-8 mb-1 text-xs md:text-[13px] uppercase tracking-wide text-blue-300/90">
            2015년 이후 · 나의 TTS 도메인 전문 영역 (Modern AI Era)
          </div>
        </li>
      )}

      <li className="relative">
        {/* marker */}
        <div
          className={`absolute -left-2 md:-left-2.5 top-2 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 ${
            item.category === 'early'
              ? 'bg-amber-400/40 border-amber-300/60'
              : item.category === 'digital'
              ? 'bg-teal-400/40 border-teal-300/60'
              : 'bg-rose-400/40 border-rose-300/60'
          }`}
        />

        <div
          ref={ref}
          onClick={() => onOpen(item, ref.current)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') onOpen(item, ref.current); }}
          className={`ml-6 md:ml-8 p-3 md:p-4 rounded border shadow-sm transition-all duration-500 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          } ${item.year >= 2015 ? 'bg-white/5 border-blue-400/20' : 'bg-white/5 border-white/10'}`}
        >
          <div className="text-xs md:text-sm text-gray-400">{item.yearLabel}</div>
          <h3 className="mt-0.5 text-base md:text-lg font-medium text-white">{item.title}</h3>
          <p className="mt-1 text-sm md:text-[15px] text-gray-300">{item.description}</p>

          {item.features && item.features.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.features.map((t) => (
                <span key={t} className="text-[11px] md:text-xs px-2 py-0.5 rounded bg-white/10 text-gray-200">
                  {t}
                </span>
              ))}
            </div>
          )}

          {item.researchers && item.researchers.length > 0 && (
            <div className="mt-2 text-xs md:text-sm text-gray-300">
              <strong className="text-gray-200">주요 연구자:</strong> {item.researchers.join(', ')}
            </div>
          )}
          {item.companies && item.companies.length > 0 && (
            <div className="mt-1 text-xs md:text-sm text-gray-300">
              <strong className="text-gray-200">주요 기업:</strong> {item.companies.join(', ')}
            </div>
          )}
        </div>
      </li>
    </>
  );
};

const DomainPage: React.FC<PageProps> = () => {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [selectedItem, setSelectedItem] = useState<TtsItem | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  const items = useMemo(() => {
    const sorted = [...DATA].sort((a, b) => a.year - b.year);
    if (activeFilter === 'all') return sorted;
    return sorted.filter(i => i.category === activeFilter);
  }, [activeFilter]);

  const firstModernIdx = useMemo(() => items.findIndex(i => i.year >= 2015), [items]);

  // ESC로 모달 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedItem(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // 모달 오픈 시 포커스 이동, 닫힐 때 복원
  useEffect(() => {
    if (!selectedItem) return;
    const el = modalRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      const focusables = Array.from(
        el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter((n): n is HTMLElement => n instanceof HTMLElement);
      (focusables[0] ?? el).focus();
    });
    return () => cancelAnimationFrame(id);
  }, [selectedItem]);

  const handleModalKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const el = modalRef.current;
    if (!el) return;
    const focusable = Array.from(
      el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    )
      .filter((n): n is HTMLElement => n instanceof HTMLElement)
      .filter((n) => !n.hasAttribute('disabled') && n.tabIndex !== -1);
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement as HTMLElement | null;
    if (e.shiftKey) {
      if (current === first || !el.contains(current)) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (current === last) {
        first.focus();
        e.preventDefault();
      }
    }
  };

  const openItem = (item: TtsItem, opener?: HTMLElement | null) => {
    lastFocusRef.current = opener ?? (document.activeElement as HTMLElement | null);
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
    const opener = lastFocusRef.current;
    lastFocusRef.current = null;
    if (opener) setTimeout(() => opener.focus(), 0);
  };

  return (
    <div className="min-h-full">
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#1b1b1b] p-5 md:p-7">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold text-white">TTS History</h1>
          <p className="mt-1 text-sm md:text-base text-gray-400">TTS 음성합성 기술의 역사적 발전 · 1950s → Present</p>
          <p className="mt-2 text-xs md:text-sm text-blue-300/90">2015년 이후: 나의 TTS 도메인 전문 영역</p>
        </div>
      </div>

      <div className="mt-6 max-w-5xl mx-auto">
      <nav className="mb-6">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`text-xs md:text-sm px-3 py-1.5 rounded border transition-colors ${
                activeFilter === f.id
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-transparent border-white/10 text-gray-300 hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </nav>

      <section className="relative pl-7 md:pl-8">
        {/* Vertical line */}
        <div className="absolute left-2 md:left-3 top-0 bottom-0 w-px bg-white/10" />

        <ul className="space-y-4">
          {items.map((item, idx) => (
            <TimelineItem
              key={item.id}
              item={item}
              showDivider={firstModernIdx === idx}
              onOpen={openItem}
            />
          ))}
        </ul>
      </section>
      </div>

      {/* Modal overlay */}
      {selectedItem && (
        <div className="fixed inset-0 z-50" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="timeline-modal-title"
            ref={modalRef}
            onKeyDown={handleModalKeyDown}
            className="relative mx-auto mt-20 w-[min(92vw,720px)] bg-[#252526] border border-white/10 rounded-lg shadow-xl p-4 text-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedItem.category === 'early'
                    ? 'bg-amber-400/40 border-amber-300/60'
                    : selectedItem.category === 'digital'
                    ? 'bg-teal-400/40 border-teal-300/60'
                    : 'bg-rose-400/40 border-rose-300/60'
                }`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-gray-400">{selectedItem.yearLabel}</div>
                <h3 id="timeline-modal-title" className="text-lg font-semibold text-white">{selectedItem.title}</h3>
                <p className="mt-2 text-sm text-gray-300">{selectedItem.description}</p>
                {selectedItem.features && selectedItem.features.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selectedItem.features.map((t) => (
                      <span key={t} className="text-[11px] md:text-xs px-2 py-0.5 rounded bg-white/10 text-gray-200">{t}</span>
                    ))}
                  </div>
                )}
                {selectedItem.researchers && selectedItem.researchers.length > 0 && (
                  <div className="mt-3 text-xs md:text-sm text-gray-300">
                    <strong className="text-gray-200">주요 연구자:</strong> {selectedItem.researchers.join(', ')}
                  </div>
                )}
                {selectedItem.companies && selectedItem.companies.length > 0 && (
                  <div className="mt-1 text-xs md:text-sm text-gray-300">
                    <strong className="text-gray-200">주요 기업:</strong> {selectedItem.companies.join(', ')}
                  </div>
                )}
                {selectedItem.samples && selectedItem.samples.length > 0 && (
                  <div className="mt-3 text-xs md:text-sm text-gray-300">
                    <strong className="text-gray-200">음성 샘플:</strong>
                    <ul className="mt-1 list-disc ml-5 space-y-0.5">
                      {selectedItem.samples.map((s) => (
                        <li key={s.url}>
                          <a href={s.url} target="_blank" rel="noopener" className="text-blue-300 hover:underline">{s.title}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedItem.links && selectedItem.links.length > 0 && (
                  <div className="mt-2 text-xs md:text-sm text-gray-300">
                    <strong className="text-gray-200">레퍼런스:</strong>
                    <ul className="mt-1 list-disc ml-5 space-y-0.5">
                      {selectedItem.links.map((l) => (
                        <li key={l.url}>
                          <a href={l.url} target="_blank" rel="noopener" className="text-blue-300 hover:underline">{l.title}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <button
                onClick={closeModal}
                className="ml-2 p-1.5 rounded hover:bg-white/10 text-gray-300"
                aria-label="닫기"
                title="닫기"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                  <path d="M3.72 3.22a.75.75 0 0 1 1.06 0L8 6.44l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 7.5l3.22 3.22a.75.75 0 0 1-1.06 1.06L8 8.56l-3.22 3.22a.75.75 0 1 1-1.06-1.06L6.94 7.5L3.72 4.28a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-10 text-[12px] text-gray-500">
        <p>© 2025 TTS 기술 발전사 — 교육 목적으로 제작되었습니다.</p>
      </footer>
    </div>
  );
};

export default DomainPage;
