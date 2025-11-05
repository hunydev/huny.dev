import React from 'react';
import { PageProps } from '../../types';
import { COLORS, TYPOGRAPHY, COMPONENT_PATTERNS, SPACING, SHADOWS, ANIMATIONS, ICON_SYSTEM } from './designSystemData';

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const DesignSystemPage: React.FC<PageProps> = () => {
  const [mounted, setMounted] = React.useState(false);
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#1b1b1b] p-5 md:p-7">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-semibold text-white">Design System</h1>
          <p className="mt-1 text-sm md:text-base text-gray-400">
            개인 프로젝트를 위한 통합 디자인 시스템 · 컬러, 타이포그래피, 컴포넌트 패턴
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <span>Icons by</span>
            <a 
              href="https://tabler.io/icons" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
            >
              Tabler Icons
            </a>
          </div>
        </div>
      </div>

      {/* Colors Section */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold text-white mb-4">🎨 Color Palette</h2>
        
        {/* Backgrounds */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">Backgrounds</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {COLORS.backgrounds.map((color, idx) => (
              <div
                key={color.name}
                className={`bg-[#2a2d2e] p-4 rounded-lg border border-gray-700 transition-all duration-500 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
                style={{ transitionDelay: `${idx * 50}ms` }}
              >
                <div
                  className="w-full h-20 rounded-lg mb-3 border border-white/10"
                  style={{ backgroundColor: color.value }}
                />
                <h4 className="text-white font-medium mb-1">{color.name}</h4>
                <p className="text-xs text-gray-400 mb-2">{color.description}</p>
                <code className="text-xs font-mono text-emerald-400 bg-black/30 px-2 py-1 rounded block">
                  {color.usage}
                </code>
              </div>
            ))}
          </div>
        </div>

        {/* Text Colors */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">Text Colors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {COLORS.text.map((color, idx) => (
              <div
                key={color.name}
                className={`bg-[#2a2d2e] p-4 rounded-lg border border-gray-700 transition-all duration-500 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
                style={{ transitionDelay: `${(idx + 4) * 50}ms` }}
              >
                <div className="flex items-center justify-center w-full h-20 rounded-lg mb-3 bg-[#1e1e1e]">
                  <span className="text-4xl font-bold" style={{ color: color.value }}>
                    Aa
                  </span>
                </div>
                <h4 className="text-white font-medium mb-1">{color.name}</h4>
                <p className="text-xs text-gray-400 mb-2">{color.description}</p>
                <code className="text-xs font-mono text-emerald-400 bg-black/30 px-2 py-1 rounded block">
                  {color.usage}
                </code>
              </div>
            ))}
          </div>
        </div>

        {/* Accent Colors */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">Accent Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {COLORS.accents.map((color, idx) => (
              <div
                key={color.name}
                className={`bg-[#2a2d2e] p-4 rounded-lg border border-gray-700 transition-all duration-500 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
                style={{ transitionDelay: `${(idx + 8) * 50}ms` }}
              >
                <div
                  className="w-full h-16 rounded-lg mb-3"
                  style={{ backgroundColor: color.value }}
                />
                <h4 className="text-white font-medium mb-1">{color.name}</h4>
                <p className="text-xs text-gray-400 mb-2">{color.description}</p>
                <code className="text-xs font-mono text-emerald-400 bg-black/30 px-2 py-1 rounded block">
                  {color.usage}
                </code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Typography Section */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">✍️ Typography</h2>
        <div className="bg-[#2a2d2e] rounded-lg border border-gray-700 overflow-hidden">
          {TYPOGRAPHY.map((typo, idx) => (
            <div
              key={typo.name}
              className="p-4 border-b border-gray-700 last:border-b-0 hover:bg-white/5 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <p className={typo.className}>{typo.example}</p>
                </div>
                <div className="flex-shrink-0 md:w-1/3">
                  <h4 className="text-xs font-semibold text-gray-400 mb-1">{typo.name}</h4>
                  <code className="text-xs font-mono text-emerald-400 bg-black/30 px-2 py-1 rounded block overflow-x-auto">
                    {typo.className}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Component Patterns Section */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">🧩 Component Patterns</h2>
        
        {/* Group by category */}
        {['Buttons', 'Cards', 'Forms', 'Elements', 'Layout'].map((category) => {
          const components = COMPONENT_PATTERNS.filter((c) => c.category === category);
          if (components.length === 0) return null;

          return (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">{category}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {components.map((comp) => (
                  <div
                    key={comp.name}
                    className="bg-[#2a2d2e] p-4 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">{comp.name}</h4>
                      <button
                        onClick={() => copyToClipboard(comp.code, comp.name)}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                        title="Copy code"
                      >
                        {copiedCode === comp.name ? (
                          <span className="text-emerald-400"><CheckIcon /></span>
                        ) : (
                          <span className="text-gray-400"><CopyIcon /></span>
                        )}
                      </button>
                    </div>
                    
                    {/* Preview */}
                    <div className="bg-[#1e1e1e] p-4 rounded-lg mb-3 flex items-center justify-center min-h-[80px]">
                      <div dangerouslySetInnerHTML={{ __html: comp.code.replace(/className="/g, 'class="') }} />
                    </div>

                    {/* Code */}
                    <pre className="bg-black/40 p-3 rounded text-xs font-mono text-gray-300 overflow-x-auto">
                      <code>{comp.code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Icon System Section */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">🎨 Icon System</h2>
        <div className="bg-[#2a2d2e] rounded-lg border border-gray-700 p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-3">{ICON_SYSTEM.library}</h3>
              <p className="text-sm text-gray-400 mb-4">{ICON_SYSTEM.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">아이콘 수</div>
                  <div className="text-base font-semibold text-white">{ICON_SYSTEM.count}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Stroke Width</div>
                  <div className="text-base font-semibold text-white">{ICON_SYSTEM.strokeWidth}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">라이선스</div>
                  <div className="text-base font-semibold text-white">{ICON_SYSTEM.license}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">웹사이트</div>
                  <a 
                    href={ICON_SYSTEM.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    방문하기
                  </a>
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 bg-[#1e1e1e] p-4 rounded-lg border border-gray-700/50">
              <div className="text-xs text-gray-500 mb-3">샘플 아이콘</div>
              <div className="flex gap-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M12 5l0 14" /><path d="M5 12l14 0" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M5 12l5 5l10 -10" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M12 5l0 14" /><path d="M18 13l-6 6" /><path d="M6 13l6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacing Section */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">📏 Spacing System</h2>
        <div className="bg-[#2a2d2e] rounded-lg border border-gray-700 overflow-hidden">
          {SPACING.map((space) => (
            <div
              key={space.name}
              className="p-4 border-b border-gray-700 last:border-b-0 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className="bg-blue-500"
                  style={{ width: space.value, height: space.value, minWidth: space.value, minHeight: space.value }}
                />
                <div className="flex-1">
                  <h4 className="text-white font-medium">{space.name}</h4>
                  <p className="text-sm text-gray-400">{space.value}</p>
                </div>
                <code className="text-xs font-mono text-emerald-400 bg-black/30 px-2 py-1 rounded">
                  {space.class}
                </code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shadows Section */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">🌓 Shadows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SHADOWS.map((shadow) => (
            <div key={shadow.name} className="bg-[#2a2d2e] p-6 rounded-lg border border-gray-700">
              <div className={`bg-[#1e1e1e] p-4 rounded-lg ${shadow.class} mb-3`}>
                <div className="w-full h-12 bg-[#2a2d2e] rounded border border-gray-700/50 flex items-center justify-center">
                  <span className="text-xs text-gray-500">Sample Card</span>
                </div>
              </div>
              <h4 className="text-white font-medium mb-1">{shadow.name}</h4>
              <p className="text-xs text-gray-400 mb-2">{shadow.usage}</p>
              <code className="text-xs font-mono text-emerald-400 bg-black/30 px-2 py-1 rounded block">
                {shadow.class}
              </code>
            </div>
          ))}
        </div>
      </section>

      {/* Animations Section */}
      <section className="mt-8 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">✨ Animations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ANIMATIONS.map((anim, idx) => {
            const [animState, setAnimState] = React.useState(false);
            
            const triggerAnimation = () => {
              setAnimState(false);
              setTimeout(() => setAnimState(true), 50);
            };

            return (
              <div key={anim.name} className="bg-[#2a2d2e] p-4 rounded-lg border border-gray-700">
                <h4 className="text-white font-medium mb-3">{anim.name}</h4>
                
                {/* Preview Area */}
                <div className="bg-[#1e1e1e] p-6 rounded-lg mb-3 flex items-center justify-center min-h-[120px]">
                  {anim.name === 'Fade In' && (
                    <div 
                      className={`bg-blue-500 text-white px-4 py-2 rounded font-semibold transition-all duration-500 ${
                        animState ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      Fade In
                    </div>
                  )}
                  {anim.name === 'Slide Up' && (
                    <div 
                      className={`bg-emerald-500 text-white px-4 py-2 rounded font-semibold transition-all duration-500 ${
                        animState ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                      }`}
                    >
                      Slide Up
                    </div>
                  )}
                  {anim.name === 'Hover Lift' && (
                    <div className="bg-purple-500 text-white px-4 py-2 rounded font-semibold hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
                      Hover Me
                    </div>
                  )}
                  {anim.name === 'Scale' && (
                    <div className="bg-yellow-500 text-white px-4 py-2 rounded font-semibold hover:scale-105 transition-transform duration-300 cursor-pointer">
                      Hover Me
                    </div>
                  )}
                </div>

                {/* Trigger Button */}
                {(anim.name === 'Fade In' || anim.name === 'Slide Up') && (
                  <button
                    onClick={triggerAnimation}
                    className="w-full mb-3 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-gray-700 hover:border-gray-600 rounded text-xs text-gray-400 hover:text-gray-300 transition-all"
                  >
                    애니메이션 다시보기
                  </button>
                )}

                {/* Code */}
                <pre className="bg-black/40 p-3 rounded text-xs font-mono text-gray-300 whitespace-pre-wrap">
                  <code>{anim.code}</code>
                </pre>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default DesignSystemPage;
