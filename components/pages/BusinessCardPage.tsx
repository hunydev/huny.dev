import React from 'react';
import type { PageProps } from '../../types';
import mascotWork from '../../extra/mascot/images/work.png';

const BusinessCardPage: React.FC<PageProps> = () => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  // Load custom fonts
  React.useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#1b1b1b] p-5 md:p-7">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <h1 className="mt-3 text-2xl md:text-3xl font-semibold text-white">Business Card</h1>
          <p className="mt-1 text-sm md:text-base text-gray-400">명함</p>
        </div>
      </div>

      {/* Business Cards Container */}
      <div className="mt-6 grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Front Side */}
        <div
          className={`relative rounded-lg overflow-hidden bg-[#0a0a1f] aspect-[1.75/1] transition-all duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
          style={{ transitionDelay: '0ms' }}
        >
          <div className="absolute inset-0 flex">
            {/* Left Section */}
            <div className="flex-1 flex flex-col justify-between p-6 md:p-8 lg:p-10" style={{ fontFamily: '"Be Vietnam Pro", sans-serif' }}>
              <div>
                <h2 className="text-sm md:text-base lg:text-lg font-bold text-white tracking-wider">HUNYDEV</h2>
              </div>
              <div style={{ fontFamily: 'Georgia, serif' }}>
                <p className="text-xl md:text-2xl lg:text-4xl text-white leading-tight">
                  Crafting Code.
                </p>
                <p className="text-xl md:text-2xl lg:text-4xl text-white leading-tight">
                  Creating Impact
                </p>
              </div>
              <div className="text-xs md:text-sm text-white/90 space-y-0.5">
                <p>https://huny.dev</p>
                <p>https://github.com/hunydev</p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 gap-6">
              {/* Mascot image */}
              <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 flex items-center justify-center">
                <img src={mascotWork} alt="Mascot" className="w-full h-full object-contain" />
              </div>
              
              {/* Icons */}
              <div className="flex gap-4 md:gap-5 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 md:w-7 md:h-7">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
                  <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
                  <path d="M3 6l0 13" />
                  <path d="M12 6l0 13" />
                  <path d="M21 6l0 13" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 md:w-7 md:h-7">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                  <path d="M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                  <path d="M14 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                  <path d="M14 7l6 0" />
                  <path d="M17 4l0 6" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 md:w-7 md:h-7">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M3 4m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z" />
                  <path d="M7 20h10" />
                  <path d="M9 16v4" />
                  <path d="M15 16v4" />
                  <path d="M9 12v-4" />
                  <path d="M12 12v-1" />
                  <path d="M15 12v-2" />
                  <path d="M12 12v-1" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 md:w-7 md:h-7">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M6.1 15h11.8" />
                  <path d="M14 3v7.342a6 6 0 0 1 1.318 10.658h-6.635a6 6 0 0 1 1.317 -10.66v-7.34h4z" />
                  <path d="M9 3h6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[2px] h-full bg-white/90" />
        </div>

        {/* Back Side */}
        <div
          className={`relative rounded-lg overflow-hidden bg-[#0a0a1f] aspect-[1.75/1] transition-all duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
          style={{ transitionDelay: '80ms', fontFamily: '"Be Vietnam Pro", sans-serif' }}
        >
          <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8 lg:p-10">
            {/* Top Section */}
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-5xl text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>Hun Jang</h2>
              <p className="text-xs md:text-sm lg:text-base font-bold text-white tracking-widest">SOFTWARE ENGINEER</p>
            </div>

            {/* Bottom Section */}
            <div className="text-right">
              <p className="text-base md:text-lg lg:text-2xl text-white mb-1">+82 10-XXXX-XXXX</p>
              <p className="text-base md:text-lg lg:text-2xl text-white mb-4">jang@huny.dev</p>
              <p className="text-sm md:text-base lg:text-lg text-white/90 mb-2">
                From Sejong, Building for the World.
              </p>
              <p className="text-sm md:text-base lg:text-lg font-bold text-white tracking-wider">MAKE IT REAL</p>
            </div>
          </div>

          {/* Horizontal divider */}
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-[2px] bg-white/90" />
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 rounded-lg border border-white/10 bg-[#202020]">
        <p className="text-sm text-gray-400">
          💡 Be Vietnam Pro 폰트와 마스코트 이미지가 적용되었습니다. Roca Two 폰트는 Georgia serif로 대체되었습니다.
        </p>
      </div>
    </div>
  );
};

export default BusinessCardPage;
