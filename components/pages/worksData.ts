export type WorkItem = {
  title: string;
  description?: string;
  stacks?: string[];
};

export type WorkBlock = {
  id: string;
  title: string;
  color: string; // accent color
  items: WorkItem[];
  note?: string;
};

export const WORKS: WorkBlock[] = [
  {
    id: 'tts-dev',
    title: 'TTS 솔루션 개발',
    color: '#60a5fa',
    items: [
      {
        title: 'TTS 엔진 개발',
        description: '학습된 TTS 모델 추론 엔진 개발, TTS API 개발',
        stacks: ['C', 'C++', 'Python', 'TensorFlow', 'PyTorch', 'Windows', 'Linux'],
      },
      {
        title: 'TTS 서버 솔루션 개발',
        description: 'TTS 서비스 서버, 게이트웨이, 웹 관리도구',
        stacks: ['C', 'Go', 'Java(Spring)', 'TCP', 'HTTP(RESTful)', 'Windows', 'Linux'],
      },
      {
        title: 'TTS 클라우드 서비스',
        description: 'TTS 클라우드 API 서비스 개발/운영',
        stacks: ['Go', 'HTTP(RESTful)', 'AWS'],
      },
    ],
  },
  {
    id: 'tts-maint',
    title: 'TTS 솔루션 유지보수',
    color: '#a78bfa',
    items: [
      {
        title: 'TTS 엔진 SDK 유지보수',
        description: 'TTS 엔진 API 연동 지원, 문서, API 샘플 개발',
        stacks: ['C/C++', 'C# (.NET)', 'Windows', 'Markdown'],
      },
      {
        title: 'TTS 서버 SDK 유지보수',
        description: 'TTS 서버 API 연동 지원, 문서, API 샘플 개발',
        stacks: ['C/C++', 'Java', '.NET', 'PHP', 'Windows', 'Linux', 'Markdown'],
      },
      {
        title: 'TTS 서비스 아키텍처 설계',
        description: 'TTS 연동 컨설팅, 서비스 아키텍처 설계, 고객 지원',
        stacks: ['PM', 'Consulting'],
      },
    ],
  },
  {
    id: 'inhouse-automation',
    title: '사내 시스템/업무 자동화 개발',
    color: '#34d399',
    items: [
      {
        title: '사내 개발',
        description: '관리 시스템 개발, 업무 자동화, 영업지원 프로그램, 지원',
        stacks: ['Go', 'Java', 'WSL', 'Windows', 'Linux'],
      },
      {
        title: '생산성 향상',
        description: '빌드 및 배포 자동화, CI/CD 파이프라인 구축 및 운영, 소프트웨어 최적화',
        stacks: ['Docker', 'GitHub Actions'],
      },
      {
        title: 'TTS 학습 지원',
        description: 'DNN TTS 모델 학습 지원, DNN TTS 신기술 연동 지원',
        stacks: ['Python'],
      },
    ],
  },
  {
    id: 'customer-support',
    title: '고객 지원 개발',
    color: '#f43f5e',
    items: [
      {
        title: 'TTS 웹 데모 지원',
        stacks: ['Go', 'IIS', 'Windows', 'Linux', 'IDC'],
      },
      {
        title: 'TTS 품질 비교 지원',
        description: '합성음 평가 툴 개발, 오디오 품질 분석 툴 개발',
        stacks: ['Web'],
      },
      {
        title: 'TTS 구매고객 지원',
        description: '고객 미팅, 기술 지원, 이슈 대응, 점검 지원',
        stacks: ['Support', 'Troubleshooting', 'On-site', 'Remote'],
      },
    ],
  },
];
