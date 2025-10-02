import React from 'react';
import type { PageProps } from '../../types';

interface GearItem {
  category: string;
  name: string;
  model: string;
  specs: string[];
  image?: string;
  link?: string;
  note?: string;
}

const GEAR_ITEMS: GearItem[] = [
  {
    category: 'Phone',
    name: 'Samsung Galaxy Z Fold7',
    model: '1TB',
    specs: [
      'Snapdragon 8 Elite for Galaxy (SM8750-AC)',
      '16GB LPDDR5X RAM / 1TB UFS 4.0',
      '8.0" Main Display (2184×1968 QXGA+, 386ppi)',
      '6.5" Cover Display (2520×1080 FHD+, 422ppi)',
      '후면 3렌즈 카메라 + LED 플래시',
      '4,400mAh 배터리 (25W 고속충전)',
      'IP48 방수·방진 지원',
    ],
    note: '폴더블 폼팩터로 멀티태스킹과 생산성 극대화',
  },
  {
    category: 'Earbuds',
    name: 'Samsung Galaxy Buds2 Pro',
    model: 'SM-R510',
    specs: [
      'Bestechnic BES2700 칩셋',
      'Bluetooth 5.3 + LE',
      '2-way 스피커, 24bit 음원 재생',
      'SSC Hi-Fi, AAC, LC3 코덱 지원',
      'IPX7 방수 지원',
      '배터리: 이어버드 61mAh, 케이스 515mAh',
      '액티브 노이즈 캔슬링',
    ],
    note: '고음질 무선 이어폰으로 몰입감 있는 오디오 경험',
  },
  {
    category: 'Headset',
    name: 'Sony MDR-7506',
    model: 'Professional Monitor Headphones',
    specs: [
      '40mm 다이나믹 드라이버, 클로즈드백 설계',
      '주파수 응답 10Hz–20kHz',
      '63Ω 임피던스 / 106dB 감도',
      '3m 코일형 OFC 케이블 (금도금 플러그)',
      '접이식 디자인 & 휴대용 파우치 포함',
    ],
    note: '장시간 착용에도 편안한 레퍼런스 모니터링 헤드셋',
  },
  {
    category: 'Laptop',
    name: 'Samsung Galaxy Book4 Edge',
    model: '16인치 (NT960XMB)',
    specs: [
      'Snapdragon X Elite X1E-84-100 (12-core, 최대 4.2GHz)',
      '16GB LPDDR5X RAM / 1TB eUFS4.0',
      '16" AMOLED Display (2880×1800)',
      'Qualcomm Hexagon NPU',
      '61.8Wh 배터리',
      'Wi-Fi 7, Bluetooth 5.3',
      'Windows 11 ARM Pro',
    ],
    note: 'ARM 기반 고효율 프로세서로 장시간 사용 가능',
  },
  {
    category: 'Keyboard',
    name: 'AULA F108',
    model: '유무선 독거미 한글 기계식 (Funkeys Edition)',
    specs: [
      'LEOBOG 저소음 솜사탕축',
      '108키 풀배열 한글 각인',
      'Bluetooth 5.0 무선 / USB-C 유선',
      'RGB 백라이트',
      'PBT 키캡',
      'Hot-swappable',
    ],
    note: '저소음 커스텀 스위치로 타건감과 조용함 양립',
  },
  {
    category: 'Mouse',
    name: 'Logitech MX Anywhere 2',
    model: '정품 (블랙)',
    specs: [
      'Darkfield 고정밀 센서',
      '무선 연결 (USB 수신기)',
      '모든 표면에서 사용 가능',
      '컴팩트한 휴대용 디자인',
      '충전식 배터리',
      '6버튼 구성',
    ],
    note: '컴팩트하고 휴대성 좋은 프리미엄 무선 마우스',
  },
  {
    category: 'Desktop',
    name: 'Custom Workstation',
    model: 'Windows 11 Pro',
    specs: [
      'Intel Core i7-14700K @ 3.40GHz (20코어 하이브리드)',
      '64GB DDR5 RAM (63.7GB usable)',
      'ASUS PRIME B760M-A 메인보드',
      'SHPP41-500GM NVMe SSD',
      'Windows 11 Pro',
    ],
    note: '개발과 콘텐츠 제작을 위한 메인 데스크탑 워크스테이션',
  },
  {
    category: 'Bag',
    name: 'Techiture Laptop Backpack',
    model: 'CONSPARA',
    specs: [
      '16인치 노트북 수납',
      '방수 원단',
      '다층 수납 구조',
      '펜슬 케이스 수납 가능',
      '인체공학적 어깨 패드',
      '세련된 미니멀 디자인',
    ],
    link: 'https://conspara.kr/shop_view/?idx=85',
    note: '테크 제품 보호와 스타일을 동시에',
  },
];

const categoryIcons: Record<string, string> = {
  Phone: '📱',
  Earbuds: '🎶',
  Laptop: '💻',
  Keyboard: '⌨️',
  Mouse: '🖱️',
  Bag: '🎒',
  Headset: '🎧',
  Desktop: '🖥️',
};

const GearCard: React.FC<{ item: GearItem }> = ({ item }) => (
  <div className="rounded-lg border border-white/10 bg-[#202020] p-4 md:p-5 hover:border-white/20 transition-colors">
    <div className="flex items-start gap-3 mb-3">
      <span className="text-3xl" aria-hidden="true">{categoryIcons[item.category] || '📦'}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">{item.category}</span>
        </div>
        <h3 className="text-lg font-semibold text-white">{item.name}</h3>
        <p className="text-sm text-gray-400 mt-0.5">{item.model}</p>
      </div>
    </div>

    <div className="space-y-2 mb-3">
      <h4 className="text-xs uppercase tracking-wider text-gray-500 font-medium">Specs</h4>
      <ul className="space-y-1">
        {item.specs.map((spec, idx) => (
          <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
            <span className="text-gray-600 shrink-0">•</span>
            <span>{spec}</span>
          </li>
        ))}
      </ul>
    </div>

    {item.note && (
      <div className="pt-3 border-t border-white/5">
        <p className="text-xs text-gray-400 italic">{item.note}</p>
      </div>
    )}

    {item.link && (
      <div className="pt-3 border-t border-white/5 mt-3">
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          <span>더 알아보기</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
            <path fillRule="evenodd" d="M4.22 11.78a.75.75 0 0 1 0-1.06L9.44 5.5H5.75a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V6.56l-5.22 5.22a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
          </svg>
        </a>
      </div>
    )}
  </div>
);

const GearPage: React.FC<PageProps> = () => {
  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#1b1b1b] p-5 md:p-7">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold text-white">My Gear</h1>
          <p className="mt-1 text-sm md:text-base text-gray-400">
            일상적으로 사용하는 하드웨어와 장비들
          </p>
        </div>
      </div>

      {/* Gear Grid */}
      <div className="mt-6 grid gap-4 md:gap-5 grid-cols-1 md:grid-cols-2">
        {GEAR_ITEMS.map((item, idx) => (
          <GearCard key={idx} item={item} />
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-6 rounded-lg border border-white/10 bg-[#202020]/50 p-4">
        <p className="text-xs text-gray-500 text-center">
          <span className="text-gray-400">💡</span> 이 페이지는 제가 실제로 사용하는 장비들의 스냅샷입니다. 
          업데이트 시점에 따라 일부 정보가 변경될 수 있습니다.
        </p>
      </div>
    </div>
  );
};

export default GearPage;
