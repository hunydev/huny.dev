import { IconName } from '../../constants/icons';

export type MonitorStatusLevel = 'operational' | 'degraded' | 'outage' | 'informational';

export type MonitorMetricTrend = 'up' | 'down' | 'flat';

export type MonitorMetric = {
  label: string;
  value: string;
  change?: string;
  trend?: MonitorMetricTrend;
  helper?: string;
};

export type MonitorIncident = {
  id: string;
  title: string;
  startedAt: string;
  resolvedAt?: string;
  impact: 'minor' | 'major' | 'critical';
  status: 'monitoring' | 'investigating' | 'resolved';
  summary: string;
};

export type MonitorWatcher = {
  label: string;
  url: string;
  lastChecked: string;
  highlights?: string;
};

export type MonitorItem = {
  id: string;
  name: string;
  category: 'status' | 'incident' | 'news' | 'usage';
  summary: string;
  updatedAt: string;
  statusLevel?: MonitorStatusLevel;
  statusLabel?: string;
  statusIcon?: IconName;
  metrics?: MonitorMetric[];
  incidents?: MonitorIncident[];
  watchers?: MonitorWatcher[];
  notes?: string;
};

export type MonitorGroup = {
  id: string;
  name: string;
  description: string;
  icon?: IconName;
  items: MonitorItem[];
};

export const MONITOR_GROUPS: MonitorGroup[] = [
  {
    id: 'status-health',
    name: 'Status & Health',
    description: '주요 서비스와 워커의 현재 상태를 한 눈에 확인합니다.',
    icon: 'monitor',
    items: [
      {
        id: 'huny-site-status',
        name: 'huny.dev 메인 사이트 상태',
        category: 'status',
        summary: 'CDN + Edge Worker 구조로 운영 중입니다. 북미 및 아시아 리전 응답 속도 모니터링.',
        updatedAt: '2025-09-26T08:55:00+09:00',
        statusLevel: 'operational',
        statusLabel: '정상 운영',
        statusIcon: 'checkBadge',
        metrics: [
          { label: 'Uptime(30d)', value: '99.982%', change: '+0.012%', trend: 'up', helper: 'Synthetic monitoring 기준' },
          { label: '응답 속도(Seoul)', value: '87 ms', change: '-4 ms', trend: 'up', helper: 'P90 기준' },
          { label: '에러율', value: '0.018%', trend: 'flat', helper: '5xx 중심' },
        ],
        notes: 'Cloudflare + Vercel 조합. 장애 발생 시 슬랙/Webhook 알림 예정.',
      },
    ],
  },
  {
    id: 'news-watchers',
    name: 'News & Mentions',
    description: '내/외부 채널에서 언급되는 키워드와 업데이트를 수집합니다.',
    icon: 'globe',
    items: [
      {
        id: 'news-hunydev',
        name: 'huny.dev 언급 모니터',
        category: 'news',
        summary: '기술 블로그, 커뮤니티, SNS에서 huny.dev 관련 키워드를 트래킹.',
        updatedAt: '2025-09-26T08:10:00+09:00',
        statusLevel: 'informational',
        statusLabel: '새 소식 2건',
        statusIcon: 'globe',
        watchers: [
          {
            label: 'Reddit /r/webdev',
            url: 'https://www.reddit.com/r/webdev/',
            lastChecked: '2025-09-26T08:05:00+09:00',
            highlights: 'UI 테마링 소개 게시물 댓글 4개',
          },
          {
            label: 'X #hunydev',
            url: 'https://x.com/search?q=huny.dev',
            lastChecked: '2025-09-26T08:08:00+09:00',
            highlights: '신규 프로젝트 프리뷰 이미지 공유',
          },
        ],
        notes: '지속적으로 RSS + Firehose API 연동 예정. 하이라이트 저장은 Notion 데이터베이스 활용 계획.',
      },
    ],
  },
  {
    id: 'usage-quotas',
    name: 'Usage & Quotas',
    description: '내가 운영하는 서비스들의 사용량/쿼터 상황을 모니터링합니다.',
    icon: 'layoutGrid',
    items: [
      {
        id: 'infra-usage',
        name: 'Infra Usage (month-to-date)',
        category: 'usage',
        summary: 'R2 스토리지, KV, Durable Objects, Vercel Functions 사용량 집계.',
        updatedAt: '2025-09-26T07:55:00+09:00',
        statusLevel: 'operational',
        statusLabel: '안정',
        statusIcon: 'layoutGrid',
        metrics: [
          { label: 'R2 Storage', value: '128 GB / 500 GB', trend: 'up', helper: '증가 폭 6.4GB/주' },
          { label: 'KV Operations', value: '21.4M / 50M', change: '+9%', trend: 'up' },
          { label: 'Vercel Edge Invocations', value: '3.2M / 5M', change: '+4%', trend: 'up' },
        ],
        notes: 'R2 증설 대비 아카이빙 룰 적용 예정 (old logs > Glacier).',
      },
    ],
  },
];

const index = new Map<string, MonitorItem>();
for (const group of MONITOR_GROUPS) {
  for (const item of group.items) {
    index.set(item.id, item);
  }
}

export const MONITOR_ITEMS_BY_ID = index;

export const getMonitorItemById = (id: string) => MONITOR_ITEMS_BY_ID.get(id);
