export const cvData = {
  profile: {
    name: 'Hun Jang',
    alias: 'HunyDev',
    role: 'AI 음성합성(TTS) 개발자 · Software Engineer',
    location: 'Seoul, South Korea',
    domain: 'huny.dev',
    summary:
      'TTS 추론 엔진, API/SDK, 클라우드 서비스 개발·운영 경험을 중심으로 백엔드/플랫폼 개발을 수행합니다. 업무 자동화와 AI 기반 서비스 실험을 병행하며, 아이디어-개발-배포까지 빠르게 연결하는 실행력을 강점으로 합니다.',
    links: [
      { label: 'Portfolio', href: 'https://huny.dev' },
      { label: 'GitHub', href: 'https://github.com/hunydev' },
      { label: 'Email', href: 'mailto:contact@huny.dev' },
    ],
  },
  competencies: [
    {
      title: 'TTS Engineering',
      items: ['TTS 모델 추론 엔진 개발', 'TTS API/SDK 설계 및 유지보수', '고객사 연동 기술지원'],
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
  ],
  projects: [
    {
      name: 'huny.dev',
      desc: 'VSCode 테마 기반 포트폴리오/실험실 웹앱. 프로젝트, 기술 스택, 실험 기능을 통합 운영.',
      links: ['https://huny.dev', 'https://github.com/hunydev/huny.dev'],
    },
    {
      name: 'Prompt Keeper',
      desc: 'AI 프롬프트 저장/관리용 웹앱. 서버리스 구조로 운영.',
      links: ['https://prompts.huny.dev', 'https://github.com/hunydev/prompt-keeper'],
    },
    {
      name: 'AutoPad',
      desc: 'Windows 생산성 향상을 위한 클립보드 자동화 도구.',
      links: ['https://autopad.huny.dev', 'https://github.com/hunydev/autopad'],
    },
  ],
  skills: {
    languages: ['Go', 'C', 'Python', 'Java', 'JavaScript', 'C#'],
    infra: ['AWS', 'Cloudflare', 'Docker', 'GitHub Actions', 'Jenkins'],
    tools: ['VS Code', 'Visual Studio', 'STS', 'Notion', 'JIRA', 'Confluence'],
    data: ['MySQL', 'SQLite', 'MongoDB', 'Redis', 'Cassandra'],
  },
};
