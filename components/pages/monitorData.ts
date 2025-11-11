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
  category: 'status' | 'incident' | 'news' | 'usage' | 'pagespeed';
  summary: string;
  updatedAt: string;
  statusLevel?: MonitorStatusLevel;
  statusLabel?: string;
  statusIcon?: IconName;
  metrics?: MonitorMetric[];
  incidents?: MonitorIncident[];
  watchers?: MonitorWatcher[];
  notes?: string;
  pageSpeedData?: any; // PageSpeed Insights raw data
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
    icon: 'monitorStatus',
    items: [
      {
        id: 'huny-site-status',
        name: 'huny.dev 메인 사이트 상태',
        category: 'status',
        summary: 'CDN + Edge Worker 구조로 운영 중입니다. 북미 및 아시아 리전 응답 속도 모니터링.',
        updatedAt: '2025-09-26T08:55:00+09:00',
        statusLevel: 'operational',
        statusLabel: '정상 운영',
        statusIcon: 'monitorStatus',
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
    id: 'edge-latency',
    name: 'Edge Latency Observatory',
    description: '지역별 Edge Worker 지연 및 캐시 히트율을 추적합니다.',
    icon: 'monitorLatency',
    items: [
      {
        id: 'edge-latency-observatory',
        name: 'Edge Latency Observatory',
        category: 'status',
        summary: '지역별 Edge Worker 지연 및 캐시 히트율을 추적합니다.',
        updatedAt: '2025-09-26T08:42:00+09:00',
        statusLevel: 'informational',
        statusLabel: '관심 필요',
        statusIcon: 'monitorLatency',
        metrics: [
          { label: '캐시 히트율', value: '92.4%', change: '-1.1%', trend: 'down' },
          { label: 'P95 Latency (Tokyo)', value: '151 ms', change: '+18 ms', trend: 'down' },
          { label: 'API 타임아웃', value: '12 / 500', trend: 'flat', helper: '일일 한도 기준' },
        ],
        notes: '일본 리전에 신규 ISP 추가 예정. Argo Smart Routing 재학습 필요.',
      },
    ],
  },
  {
    id: 'news-watchers',
    name: 'News & Mentions',
    description: '내/외부 채널에서 언급되는 키워드와 업데이트를 수집합니다.',
    icon: 'monitorNews',
    items: [
      {
        id: 'news-hunydev',
        name: 'huny.dev 언급 모니터',
        category: 'news',
        summary: '기술 블로그, 커뮤니티, SNS에서 huny.dev 관련 키워드를 트래킹.',
        updatedAt: '2025-09-26T08:10:00+09:00',
        statusLevel: 'informational',
        statusLabel: '새 소식 2건',
        statusIcon: 'monitorNews',
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
    id: 'newsletter-mentions',
    name: 'Newsletter & 블로그 인용',
    description: '뉴스레터·블로그에서 인용된 문구와 참조 링크를 수집합니다.',
    icon: 'monitorNewsletter',
    items: [
      {
        id: 'newsletter-insights',
        name: 'Newsletter & 블로그 인용',
        category: 'news',
        summary: '뉴스레터·블로그에서 인용된 문구와 참조 링크를 수집합니다.',
        updatedAt: '2025-09-26T08:20:00+09:00',
        statusLevel: 'informational',
        statusLabel: '주간 3건',
        statusIcon: 'monitorNewsletter',
        watchers: [
          {
            label: 'Substack 디자인 레터',
            url: 'https://substack.com',
            lastChecked: '2025-09-26T08:18:00+09:00',
            highlights: 'AI 기반 포트폴리오 자동화 관련 짧은 인터뷰',
          },
          {
            label: 'Medium Topic: Frontend AI',
            url: 'https://medium.com/tag/frontend-ai',
            lastChecked: '2025-09-25T22:00:00+09:00',
            highlights: '테마 동기화 기능이 사례 연구로 언급됨',
          },
        ],
        notes: '인용 문구는 Notion 클리핑 DB에 정리. 주간 digest 자동 발송 예정.',
      },
    ],
  },
  {
    id: 'usage-quotas',
    name: 'Usage & Quotas',
    description: '내가 운영하는 서비스들의 사용량/쿼터 상황을 모니터링합니다.',
    icon: 'monitorUsage',
    items: [
      {
        id: 'infra-usage',
        name: 'Infra Usage (month-to-date)',
        category: 'usage',
        summary: 'R2 스토리지, KV, Durable Objects, Vercel Functions 사용량 집계.',
        updatedAt: '2025-09-26T07:55:00+09:00',
        statusLevel: 'operational',
        statusLabel: '안정',
        statusIcon: 'monitorUsage',
        metrics: [
          { label: 'R2 Storage', value: '128 GB / 500 GB', trend: 'up', helper: '증가 폭 6.4GB/주' },
          { label: 'KV Operations', value: '21.4M / 50M', change: '+9%', trend: 'up' },
          { label: 'Vercel Edge Invocations', value: '3.2M / 5M', change: '+4%', trend: 'up' },
        ],
        notes: 'R2 증설 대비 아카이빙 룰 적용 예정 (old logs > Glacier).',
      },
    ],
  },
  {
    id: 'billing-forecast',
    name: 'Billing Forecast (Cloudflare + Vercel)',
    description: '월간 청구 추이를 예측하고 예산 대비 사용량을 추적합니다.',
    icon: 'monitorBilling',
    items: [
      {
        id: 'billing-forecast',
        name: 'Billing Forecast (Cloudflare + Vercel)',
        category: 'usage',
        summary: '월간 청구 추이를 예측하고 예산 대비 사용량을 추적합니다.',
        updatedAt: '2025-09-26T07:45:00+09:00',
        statusLevel: 'informational',
        statusLabel: '주의 관찰',
        statusIcon: 'monitorBilling',
        metrics: [
          { label: 'Cloudflare Workers', value: 'USD 84 / 160', change: '+12%', trend: 'up', helper: 'QoQ 성장률' },
          { label: 'Vercel Edge', value: 'USD 61 / 150', change: '+9%', trend: 'up' },
          { label: '예산 대비', value: '145 / 310', trend: 'up', helper: '총합 (USD)' },
        ],
        notes: '다음 분기 예산 책정 전, 비용 절감 실험(이미지 압축, 캐싱) 진행 예정.',
      },
    ],
  },
  {
    id: 'security-alerts',
    name: 'Security & Alerts',
    description: '보안 이벤트 및 인증/접근 관련 경고를 추적합니다.',
    icon: 'monitorSecurity',
    items: [
      {
        id: 'cloudflare-security-posture',
        name: 'Cloudflare Security Posture',
        category: 'incident',
        summary: '방화벽 규칙, Bot 관리, WAF 이벤트 현황을 요약합니다.',
        updatedAt: '2025-09-26T08:30:00+09:00',
        statusLevel: 'operational',
        statusLabel: '안정',
        statusIcon: 'monitorSecurity',
        incidents: [
          {
            id: 'waf-2025-09-burst',
            title: 'API Bot Burst 차단',
            startedAt: '2025-09-25T21:15:00+09:00',
            resolvedAt: '2025-09-25T21:17:00+09:00',
            impact: 'minor',
            status: 'resolved',
            summary: '일시적 credential-stuffing 공격 발생. Rate Limiting 룰 자동 적용으로 차단.',
          },
        ],
        notes: '매주 규칙 리뷰. 신규 AI 서비스 보호 룰 2건 초안 작성중.',
      },
    ],
  },
  {
    id: 'automation-jobs',
    name: 'Automation Jobs',
    description: '스케줄러와 워크플로우 자동화 작업 성공률을 모니터링합니다.',
    icon: 'monitorAutomation',
    items: [
      {
        id: 'scheduler-health',
        name: 'Scheduler Healthboard',
        category: 'usage',
        summary: 'Cron Triggers, Notion Sync, RSS 인입 파이프라인의 성공률을 추적합니다.',
        updatedAt: '2025-09-26T08:25:00+09:00',
        statusLevel: 'operational',
        statusLabel: '정상',
        statusIcon: 'monitorAutomation',
        metrics: [
          { label: 'Cron Trigger Success', value: '98.7%', change: '-0.4%', trend: 'down', helper: '주간 평균' },
          { label: 'Notion Sync Job', value: '42 / 45', trend: 'up', helper: '성공/전체 작업 (24h)' },
          { label: 'RSS 파이프라인 큐', value: '3 / 50', trend: 'up', helper: '대기 작업 / 큐 한도' },
        ],
        notes: '실패 건 재시도 오토메이션 배치 준비. 5분 주기로 로그 스트리밍 검토.',
      },
    ],
  },
  {
    id: 'performance-insights',
    name: 'Performance Insights',
    description: 'Google PageSpeed Insights를 통한 웹 성능 분석 결과를 제공합니다.',
    icon: 'monitorStatus',
    items: [
      {
        id: 'pagespeed-hunydev',
        name: 'huny.dev PageSpeed 분석',
        category: 'pagespeed',
        summary: 'Lighthouse를 통한 성능, 접근성, SEO 등의 지표를 측정합니다.',
        updatedAt: '2025-11-11T11:37:58+09:00',
        statusLevel: 'operational',
        statusLabel: '우수',
        statusIcon: 'monitorStatus',
        metrics: [
          { label: 'Performance Score', value: '98/100', trend: 'up', helper: 'Lighthouse 성능 점수' },
          { label: 'First Contentful Paint', value: '0.6s', trend: 'up', helper: 'Score: 0.99' },
          { label: 'Total Blocking Time', value: '30ms', trend: 'up', helper: 'Score: 1.0' },
          { label: 'Server Response Time', value: '1ms', trend: 'up', helper: 'TTFB' },
        ],
        notes: 'Desktop 환경 기준 측정. 모바일 측정 추가 예정.',
        pageSpeedData: null, // Will be populated with actual data
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
