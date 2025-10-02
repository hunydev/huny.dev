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
  // IT
  {
    id: 'codingapple',
    name: '코딩애플',
    handle: '@codingapple',
    url: 'https://www.youtube.com/@codingapple',
    thumbnail: 'https://yt3.googleusercontent.com/JuRcVt9OFQgqh7UL1LjihpVLEbjdNXt3tGq-IQfqRMT8wVXgWg_tzyz0S_GVsgqkB3ucBC5fqeU=s176-c-k-c0x00ffffff-no-rj',
    category: 'IT',
  },
  {
    id: 'jocoding',
    name: '조코딩 JoCoding',
    handle: '@jocoding',
    url: 'https://www.youtube.com/@jocoding',
    thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_mXQ5DM8Oj2n6Fc_zKFY8Ue_HNVhQiXXXXXXXX=s176-c-k-c0x00ffffff-no-rj',
    category: 'IT',
  },
  {
    id: 'nomadcoders',
    name: 'Nomad Coders',
    handle: '@nomadcoders',
    url: 'https://www.youtube.com/@nomadcoders',
    thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_kXQ5DM8Oj2n6Fc_zKFY8Ue_HNVhQiXXXXXXXX=s176-c-k-c0x00ffffff-no-rj',
    category: 'IT',
  },
  // 과학
  {
    id: '3blue1brownkr',
    name: '3Blue1Brown 한국어',
    handle: '@3Blue1BrownKR',
    url: 'https://www.youtube.com/@3Blue1BrownKR',
    thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_lXQ5DM8Oj2n6Fc_zKFY8Ue_HNVhQiXXXXXXXX=s176-c-k-c0x00ffffff-no-rj',
    category: '과학',
  },
  {
    id: 'science-lee',
    name: '이과형',
    handle: '@이과형',
    url: 'https://www.youtube.com/@%EC%9D%B4%EA%B3%BC%ED%98%95',
    thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_mXQ5DM8Oj2n6Fc_zKFY8Ue_HNVhQiXXXXXXXX=s176-c-k-c0x00ffffff-no-rj',
    category: '과학',
  },
  {
    id: 'kurzgesagt',
    name: 'Kurzgesagt – In a Nutshell',
    handle: '@kurzgesagt',
    url: 'https://www.youtube.com/@kurzgesagt',
    thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_kXQ5DM8Oj2n6Fc_zKFY8Ue_HNVhQiXXXXXXXX=s176-c-k-c0x00ffffff-no-rj',
    category: '과학',
  },
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
