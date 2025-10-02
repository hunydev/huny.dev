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
  const categories = Array.from(new Set(CHANNELS.map(ch => ch.category)));

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">YouTube Channels</h1>
        <p className="text-gray-400">즐겨보는 IT & 과학 유튜브 채널 모음</p>
      </header>

      {categories.map(category => {
        const channelsInCategory = CHANNELS.filter(ch => ch.category === category);
        
        return (
          <section key={category} className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="inline-block w-1 h-6 bg-blue-500 rounded"></span>
              {category}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {channelsInCategory.map(channel => (
                <a
                  key={channel.id}
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-[#252526] border border-white/10 rounded-lg p-4 hover:bg-[#2d2d2d] hover:border-blue-500/50 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <img
                        src={channel.thumbnail}
                        alt={channel.name}
                        className="w-16 h-16 rounded-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          // 썸네일 로드 실패 시 기본 이미지
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium mb-1 group-hover:text-blue-400 transition-colors truncate">
                        {channel.name}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2 truncate">{channel.handle}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-500">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        <span className="group-hover:text-gray-400 transition-colors">YouTube 채널 방문</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        );
      })}

      <footer className="mt-12 pt-6 border-t border-white/10 text-sm text-gray-500">
        <p>채널 정보는 정기적으로 업데이트됩니다.</p>
      </footer>
    </div>
  );
};

export default YouTubeChannelsPage;
