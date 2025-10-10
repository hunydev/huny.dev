import React from 'react';
import { PageProps } from '../../types';

type Channel = {
  id: string;
  name: string;
  handle: string;
  url: string;
  thumbnail: string;
  category: string;
};

const CHANNELS: Channel[] = [
  {
    id: 'UCSLrpBAzr-ROVGHQ5EmxnUg',
    name: '코딩애플',
    handle: '@codingapple',
    url: 'https://www.youtube.com/@codingapple',
    thumbnail: 'https://yt3.ggpht.com/ytc/AIdro_nwJ1atCtmd4bkIhKvnjnY0cVqehB44xMmyVJmSFqXiJ8c=s88-c-k-c0x00ffffff-no-rj',      
    category: 'IT',
  },
  {
    id: 'UCQNE2JmbasNYbjGAcuBiRRg',
    name: '조코딩 JoCoding',
    handle: '@jocoding',
    url: 'https://www.youtube.com/@jocoding',
    thumbnail: 'https://yt3.ggpht.com/6gJoxwN9IQ3SlQIo1SibzhmwNLfxhX3t15zfQAGMxmV3Fi7aALzNayf2CzqhL5U6c2f4123G=s88-c-k-c0x00ffffff-no-rj',
    category: 'IT',
  },
  {
    id: 'UCUpJs89fSBXNolQGOYKn0YQ',
    name: '노마드 코더 Nomad Coders',
    handle: '@nomadcoders',
    url: 'https://www.youtube.com/@nomadcoders',
    thumbnail: 'https://yt3.ggpht.com/ytc/AIdro_kZGbEvWmB_2CZMcZVcCpjFsiQNVQZEehF8jinP6zlFJ7s=s88-c-k-c0x00ffffff-no-rj',      
    category: 'IT',
  },
  {
    id: 'UCdUcjkyZtf-1WJyPPiETF1g',
    name: 'ITSub잇섭',
    handle: '@ITSUB',
    url: 'https://www.youtube.com/@ITSUB',
    thumbnail: 'https://yt3.ggpht.com/ytc/AIdro_kutxZhVtnH4nWcW7ebuDER5TfHwPZJaqGyBVGjVC52A0A=s88-c-k-c0x00ffffff-no-rj',      
    category: 'IT',
  },
  {
    id: 'UCvFhJjq2S7onUjiVmM4c5Bw',
    name: 'KEVIN 케빈 - IT리뷰',
    handle: '@itKevin',
    url: 'https://www.youtube.com/@itKevin',
    thumbnail: 'https://yt3.ggpht.com/xYLySX9GVm7CNpETdkFWZil9ROl9SMIhot78C2hG4bHYqa6GcHTURhg_McjEZAarrIR7nWYK=s88-c-k-c0x00ffffff-no-rj',
    category: 'IT',
  },
  {
    id: 'UC-mOekGSesms0agFntnQang',
    name: '우아한테크',
    handle: '@woowatech',
    url: 'https://www.youtube.com/@woowatech',
    thumbnail: 'https://yt3.ggpht.com/MkRGDthaDRuvOkukz8XQBn3XauBZsvwDxCDLmp8010sIpv5bKxpTE9Hv_EZibAAwN38N-oi-OA=s88-c-k-c0x00ffffff-no-rj',
    category: 'IT',
  },
  {
    id: 'UC4FwGfCOxBXTkchlY7xU7Aw',
    name: 'Golang Korea',
    handle: '@golangkorea8237',
    url: 'https://www.youtube.com/@golangkorea8237',
    thumbnail: 'https://yt3.ggpht.com/ytc/AIdro_nnbHAcyT8HctsfeI8DEOgWqPLNp1c2nHeipAYpHGGJGQ=s88-c-k-c0x00ffffff-no-rj',       
    category: 'IT',
  },
  {
    id: 'UCZp_ftx6UB_32VfVmlS3o_A',
    name: 'Tucker Programming',
    handle: '@TuckerProgramming',
    url: 'https://www.youtube.com/@TuckerProgramming',
    thumbnail: 'https://yt3.ggpht.com/ytc/AIdro_lalCjJKObkNnlZoibF2jKzx7oamRiHwccO6jSuzRZSZzA=s88-c-k-c0x00ffffff-no-rj',      
    category: 'IT',
  },
  {
    id: 'UCYSjF7_K6jBVzYVuqrE0uZA',
    name: '삼성전자 Samsung Korea',
    handle: '@SamsungKorea',
    url: 'https://www.youtube.com/@SamsungKorea',
    thumbnail: 'https://yt3.ggpht.com/pvib-ihLWumZVIei7MS8tfmNoPtSfIog7Q5mh9B4-iPeAtQV-n2orZrmxm2Zif_D9CvTMjNFZf8=s88-c-k-c0x00ffffff-no-rj',
    category: 'IT',
  },
  {
    id: 'UCMc4EmuDxnHPc6pgGW-QWvQ',
    name: '안될과학 Unrealscience',
    handle: '@Unrealscience',
    url: 'https://www.youtube.com/@Unrealscience',
    thumbnail: 'https://yt3.ggpht.com/ytc/AIdro_mfJU2V3f_mAORcKfyq-z7dPujl4aisAWyAQ9bJVeUDLw=s88-c-k-c0x00ffffff-no-rj',       
    category: '과학',
  },
  {
    id: 'UCJK07Uk2KY9r78ksPoXg-3g',
    name: '3Blue1Brown 한국어',
    handle: '@3Blue1BrownKR',
    url: 'https://www.youtube.com/@3Blue1BrownKR',
    thumbnail: 'https://yt3.ggpht.com/ytc/AIdro_kJeTQ9zdghyaijialQLaA0eE4zO6mSyW9FaHgmhgsM3eg=s88-c-k-c0x00ffffff-no-rj',      
    category: '과학',
  },
  {
    id: 'UCj-MI9DaXgAz412O9ybQ9WA',
    name: '이과형',
    handle: '@이과형',
    url: 'https://www.youtube.com/@이과형',
    thumbnail: 'https://yt3.ggpht.com/V9gToTg3MbMfRb7pBKkTmQzefTOXE0Hlx6NRjclw8aT0vILlnTc8FbIJkgTm5Ps6YHvWFFJW5g=s88-c-k-c0x00ffffff-no-rj',
    category: '과학',
  },
  {
    id: 'UCsXVk37bltHxD1rDPwtNM8Q',
    name: 'Kurzgesagt – In a Nutshell',
    handle: '@kurzgesagt',
    url: 'https://www.youtube.com/@kurzgesagt',
    thumbnail: 'https://yt3.ggpht.com/ytc/AIdro_n1Ribd7LwdP_qKtqWL3ZDfIgv9M1d6g78VwpHGXVR2Ir4=s88-c-k-c0x00ffffff-no-rj',      
    category: '과학',
  },
  {
    id: 'UC8rKCy_tipwTEY3RdkNCKmw',
    name: '한눈에 보는 세상 – Kurzgesagt',
    handle: '@kurzgesagt_kr',
    url: 'https://www.youtube.com/@kurzgesagt_kr',
    thumbnail: 'https://yt3.ggpht.com/nrh_Nr4UG5bzup4WGXphCBxKTib5PSAVaQ25Rsv7UlXweCI2zR5xwUjQCYij-8CAvWwlTYzGUg=s88-c-k-c0x00ffffff-no-rj',
    category: '과학',
  },
  {
    id: 'UC7F6UDq3gykPZHWRhrj_BDw',
    name: '사물궁이 잡학지식',
    handle: '@사물궁이',
    url: 'https://www.youtube.com/@사물궁이',
    thumbnail: 'https://yt3.ggpht.com/WsW1e29fcryN0IwA1KsMlAzBq70JS068hynXoWwZW0iA8YJ8ZA7jme6zTn-Lm4aNgWkyY961x6k=s88-c-k-c0x00ffffff-no-rj',
    category: '과학',
  },
  {
    id: 'UCpZUM8lQBdgzo3avQqtmQvw',
    name: '북툰',
    handle: '@book_toon',
    url: 'https://www.youtube.com/@book_toon',
    thumbnail: 'https://yt3.ggpht.com/ytc/AIdro_lyku2muAltQHseRbZtXobj1fOv2c8TxRbXRFtjn4xF6UI=s88-c-k-c0x00ffffff-no-rj',      
    category: '과학',
  },
  {
    id: 'UCPPmdyMlzN4pB0dTDOmQyvw',
    name: '지식코리야',
    handle: '@koreyaman',
    url: 'https://www.youtube.com/@koreyaman',
    thumbnail: 'https://yt3.ggpht.com/mEyr3EJQOFgJUwqSniAjintfkDhGZqN0AULK5a9y5e5IQYvmfSt6xMsPz0qA4ZpSEnNcXxOTOqE=s88-c-k-c0x00ffffff-no-rj',
    category: '과학',
  },
  {
    id: 'UC1Do3xw9OuUk7FQuPTmSVOw',
    name: '지식보관소',
    handle: '@지식보관소',
    url: 'https://www.youtube.com/@지식보관소',
    thumbnail: 'https://yt3.ggpht.com/QdmwqMz6AuMK3cIEX5bJ8w0haDzATn_kgZSjqhuIHSESRR56g609wz0vcCT01amfL7ZIWQQodQ=s88-c-k-c0x00ffffff-no-rj',
    category: '과학',
  }
];

const YouTubeChannelsPage: React.FC<PageProps> = () => {
  const [mounted, setMounted] = React.useState(false);
  const categories = Array.from(new Set(CHANNELS.map(ch => ch.category)));

  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#1b1b1b] p-5 md:p-7">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-red-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <h1 className="mt-3 text-2xl md:text-3xl font-semibold text-white">YouTube Channels</h1>
          <p className="mt-1 text-sm md:text-base text-gray-400">즐겨보는 IT & 과학 유튜브 채널 모음</p>
        </div>
      </div>

      {/* Categories */}
      <div className="mt-6 space-y-6">
        {categories.map((category, catIdx) => {
          const channelsInCategory = CHANNELS.filter(ch => ch.category === category);
          const categoryColor = category === 'IT' ? '#3b82f6' : '#10b981';
          
          return (
            <section
              key={category}
              className={`relative rounded-lg border border-white/10 bg-[#202020] p-4 md:p-5 transition-all duration-500 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
              style={{ transitionDelay: `${catIdx * 100}ms` }}
            >
              <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-lg" style={{ background: categoryColor, opacity: 0.9 }} aria-hidden />
              
              <h2 className="text-white font-medium text-lg md:text-xl flex items-center gap-2 mb-4">
                <span className="inline-block w-2.5 h-2.5 rounded" style={{ background: categoryColor }} aria-hidden />
                {category}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {channelsInCategory.map((channel, idx) => (
                  <a
                    key={channel.id}
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group bg-[#252526] border border-white/10 rounded-lg p-3 md:p-4 hover:bg-[#2d2d2d] hover:border-blue-500/50 transition-all duration-300 ${
                      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
                    style={{ transitionDelay: `${catIdx * 100 + idx * 50}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <img
                          src={channel.thumbnail}
                          alt={channel.name}
                          className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm md:text-base mb-0.5 group-hover:text-blue-400 transition-colors truncate">
                          {channel.name}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-400 mb-2 truncate">{channel.handle}</p>
                        <div className="flex items-center gap-1 text-[10px] md:text-xs text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-4 md:h-4 text-red-500">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                          <span className="group-hover:text-gray-400 transition-colors">채널 방문</span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default YouTubeChannelsPage;
