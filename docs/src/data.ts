const currentYear = new Date().getFullYear();

export const cvData = {
  profile: {
    name: 'Hun Jang',
    alias: 'HunyDev',
    role: 'AI 음성합성(TTS) 개발자 · Software Engineer',
    location: 'Sejong, South Korea',
    summary:
      'TTS 추론 엔진, API/SDK, 클라우드 서비스 개발·운영 경험을 중심으로 백엔드/플랫폼 개발을 수행합니다. 업무 자동화와 AI 기반 서비스 실험을 병행하며, 아이디어-개발-배포까지 빠르게 연결하는 실행력을 강점으로 합니다.',
    links: [
      { label: 'Portfolio', href: 'https://huny.dev', text: 'Portfolio: https://huny.dev' },
      { label: 'GitHub', href: 'https://github.com/hunydev', text: 'GitHub: https://github.com/hunydev' },
      { label: 'Blog', href: 'https://blog.huny.dev', text: 'Blog: https://blog.huny.dev' },
      { label: 'Email', href: 'mailto:jang@huny.dev', text: 'Email: jang@huny.dev' },
    ],
    currentCompany: {
      name: 'SELVAS AI',
      website: 'https://selvasai.com',
      role: 'TTS 솔루션 개발자',
      period: `2015 - ${currentYear}`,
      focus: [
        'TTS 엔진 개발 및 서버 솔루션 개발',
        'TTS 솔루션 유지보수 및 업체 기술지원',
        'TTS 사업/서비스 운영 및 프로젝트 수행',
      ],
      highlights: [
        'AICC 중심의 TTS 지원 프로젝트 다수 수행',
        '방송, BIS/BIT, 이북 등 다양한 도메인에 TTS 공급',
        '여러 기업과의 협업 프로젝트에서 기술 검토/연동 지원',
      ],
    },
  },
  competencies: [
    {
      title: 'TTS Engineering',
      items: [
        '학습 기반 TTS 추론 엔진 개발 및 고도화',
        'TTS API/SDK 설계 및 유지보수',
        '고객사 연동 기술지원 및 장애 대응',
      ],
    },
    {
      title: 'Backend & Platform',
      items: ['Go / C / Java(Spring)', 'REST API, Gateway, Service Architecture', 'Windows · Linux 환경 운영'],
    },
    {
      title: 'Cloud & Delivery',
      items: ['AWS, Cloudflare, Netlify', 'Docker, GitHub Actions, Jenkins', '배포 파이프라인 및 운영 자동화'],
    },
    {
      title: 'AI-enabled Development',
      items: ['ChatGPT, Gemini, Claude 기반 개발 생산성 향상', '아이디어 빠른 프로토타이핑', '실험형 웹 서비스 다수 운영'],
    },
  ],
  experience: [
    {
      title: 'TTS 솔루션 개발',
      bullets: [
        '학습된 TTS 모델 기반 추론 엔진 및 API 개발',
        'TTS 서버 솔루션(게이트웨이/관리도구 포함) 개발',
        '클라우드 TTS API 서비스 개발 및 운영',
      ],
      stacks: ['C', 'C++', 'Go', 'Python', 'Java', 'TensorFlow', 'PyTorch', 'AWS'],
    },
    {
      title: 'TTS 솔루션 유지보수 & 아키텍처 지원',
      bullets: [
        '엔진/서버 SDK 연동 가이드 및 샘플 코드 제공',
        '문서화/기술지원 및 고객사 이슈 대응',
        'TTS 서비스 아키텍처 설계 및 컨설팅',
      ],
      stacks: ['C/C++', 'C#(.NET)', 'Java', 'PHP', 'Markdown', 'Consulting'],
    },
    {
      title: '사내 시스템/업무 자동화',
      bullets: [
        '관리 시스템 및 영업/운영 지원 도구 개발',
        '빌드/배포 자동화 및 CI/CD 파이프라인 구축',
        '모델 학습/신기술 연동 업무 지원',
      ],
      stacks: ['Go', 'Java', 'Python', 'Docker', 'GitHub Actions', 'Jenkins'],
    },
    {
      title: '고객 지원 개발',
      bullets: [
        'TTS 웹 데모/품질 비교 도구 개발로 고객 PoC 지원',
        '합성음 평가 및 오디오 품질 분석 툴 개발',
        '구매 고객 대상 이슈 대응, 점검, 기술 커뮤니케이션 수행',
      ],
      stacks: ['Go', 'IIS', 'Web', 'Troubleshooting', 'On-site', 'Remote'],
    },
  ],
  projects: [
    {
      name: 'Riano',
      desc: '수학·과학 개념을 인터랙티브 시뮬레이션으로 탐구하는 학습 플랫폼. 이론 콘텐츠와 실험형 UI를 결합해 학습 경험을 강화.',
      links: ['https://riano.app', 'https://blog.riano.app'],
    },
    {
      name: 'rc',
      desc: '간결한 구조로 빠르게 사용할 수 있는 개인 웹앱. 경량한 사용자 경험과 빠른 반복 배포를 중심으로 운영.',
      links: ['https://rc.huny.dev', 'https://github.com/hunydev/rc'],
    },
    {
      name: 'huny.dev',
      desc: 'VSCode 테마 기반 포트폴리오/실험실 웹앱. 프로젝트, 기술 스택, 실험 기능을 통합 운영.',
      links: ['https://huny.dev', 'https://github.com/hunydev/huny.dev'],
    },
    {
      name: 'AutoPad',
      desc: 'Windows 생산성 향상을 위한 클립보드 자동화 도구.',
      links: ['https://autopad.huny.dev', 'https://github.com/hunydev/autopad', 'https://apps.microsoft.com/detail/9p63pjdml1x0'],
    },
  ],
  skills: {
    languages: ['Go', 'C', 'Python', 'Java', 'JavaScript', 'C#'],
    infra: ['AWS', 'Cloudflare', 'Netlify', 'Docker', 'GitHub Actions', 'Jenkins'],
    tools: ['VS Code', 'Visual Studio', 'STS', 'Notion', 'JIRA', 'Confluence'],
    data: ['MySQL', 'SQLite', 'MongoDB', 'Redis', 'Cassandra'],
    ai: ['GitHub Copilot', 'Claude', 'Gemini', 'Codex', 'ChatGPT'],
  },
};
