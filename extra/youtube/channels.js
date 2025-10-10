/**
 * YouTube 채널 정보를 가져와서 TypeScript 형식으로 출력하는 스크립트
 * 
 * 사용법:
 * 1. CHANNELS 배열에 카테고리와 handle 정보를 입력
 * 2. API_KEY 환경변수 설정: set YOUTUBE_API_KEY=your_api_key
 * 3. 실행: node channels.js
 * 4. 출력된 코드를 YouTubeChannelsPage.tsx의 CHANNELS 상수에 복사
 */

// ============================================
// 여기에 카테고리와 handle을 입력하세요
// ============================================
const CHANNELS = [
  { category: 'IT', handle: '@codingapple' },
  { category: 'IT', handle: '@jocoding' },
  { category: 'IT', handle: '@nomadcoders' },
  { category: 'IT', handle: '@ITSUB' },
  { category: 'IT', handle: '@itKevin' },
  { category: 'IT', handle: '@woowatech' },
  { category: 'IT', handle: '@golangkorea8237' },
  { category: 'IT', handle: '@TuckerProgramming' },
  { category: 'IT', handle: '@SamsungKorea' },
  { category: '과학', handle: '@Unrealscience' },
  { category: '과학', handle: '@3Blue1BrownKR' },
  { category: '과학', handle: '@이과형' },
  { category: '과학', handle: '@kurzgesagt' },
  { category: '과학', handle: '@kurzgesagt_kr' },
  { category: '과학', handle: '@사물궁이' },
  { category: '과학', handle: '@book_toon' },
  { category: '과학', handle: '@koreyaman' },
  { category: '과학', handle: '@지식보관소' },
];

// ============================================
// API 설정
// ============================================
const API_KEY = process.env.YOUTUBE_API_KEY;

if (!API_KEY) {
  console.error('❌ YOUTUBE_API_KEY 환경변수가 설정되지 않았습니다.');
  console.error('   Windows: set YOUTUBE_API_KEY=your_api_key');
  console.error('   Linux/Mac: export YOUTUBE_API_KEY=your_api_key');
  process.exit(1);
}

// ============================================
// 메인 함수
// ============================================
async function fetchChannelInfo(handle) {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${encodeURIComponent(handle.replace('@', ''))}&key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    if (!data.items || data.items.length === 0) {
      throw new Error('채널을 찾을 수 없습니다');
    }
    
    const channel = data.items[0];
    const snippet = channel.snippet;
    
    return {
      id: channel.id,
      name: snippet.title,
      url: `https://www.youtube.com/${handle}`,
      thumbnail: snippet.thumbnails.default.url || snippet.thumbnails.medium?.url || snippet.thumbnails.high?.url,
    };
  } catch (error) {
    console.error(`❌ ${handle} 조회 실패:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🔄 YouTube 채널 정보를 가져오는 중...\n');
  
  const results = [];
  
  for (const channel of CHANNELS) {
    console.log(`📡 ${channel.handle} 조회 중...`);
    const info = await fetchChannelInfo(channel.handle);
    
    if (info) {
      results.push({
        ...info,
        handle: channel.handle,
        category: channel.category,
      });
      console.log(`✅ ${info.name}\n`);
    } else {
      console.log(`⏭️  건너뜀\n`);
    }
    
    // API 호출 제한을 피하기 위한 딜레이
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  if (results.length === 0) {
    console.error('❌ 가져온 채널 정보가 없습니다.');
    process.exit(1);
  }
  
  // TypeScript 코드 생성
  console.log('\n' + '='.repeat(80));
  console.log('📋 아래 코드를 YouTubeChannelsPage.tsx의 CHANNELS 상수에 복사하세요');
  console.log('='.repeat(80) + '\n');
  
  console.log('const CHANNELS: Channel[] = [');
  
  results.forEach((channel, index) => {
    const isLast = index === results.length - 1;
    console.log('  {');
    console.log(`    id: '${channel.id}',`);
    console.log(`    name: '${channel.name.replace(/'/g, "\\'")}',`);
    console.log(`    handle: '${channel.handle}',`);
    console.log(`    url: '${channel.url}',`);
    console.log(`    thumbnail: '${channel.thumbnail}',`);
    console.log(`    category: '${channel.category}',`);
    console.log(`  }${isLast ? '' : ','}`);
  });
  
  console.log('];\n');
  
  console.log('✅ 완료! 총 ' + results.length + '개 채널');
}

main().catch(error => {
  console.error('❌ 오류 발생:', error);
  process.exit(1);
});
