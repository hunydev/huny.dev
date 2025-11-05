export interface ResumeData {
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    github: string;
    linkedin: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    period: string;
    location: string;
    achievements: string[];
    technologies: string[];
  }>;
  education: Array<{
    school: string;
    degree: string;
    major: string;
    period: string;
    gpa?: string;
  }>;
  skills: {
    category: string;
    items: string[];
  }[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    highlights: string[];
    link?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}

export const RESUME_DATA: ResumeData = {
  personal: {
    name: 'Alex Johnson',
    title: 'Senior Full-Stack Engineer',
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    website: 'alexjohnson.dev',
    github: 'github.com/alexjohnson',
    linkedin: 'linkedin.com/in/alexjohnson',
  },
  summary:
    'Experienced Full-Stack Engineer with 8+ years building scalable web applications and cloud infrastructure. Specialized in React, TypeScript, Node.js, and AWS. Led teams of 5+ engineers, delivered 20+ production applications serving millions of users. Passionate about clean code, performance optimization, and developer experience.',
  experience: [
    {
      company: 'TechCorp Global',
      position: 'Senior Full-Stack Engineer',
      period: '2021 - Present',
      location: 'San Francisco, CA',
      achievements: [
        'Architected and led development of microservices platform serving 5M+ daily active users',
        'Reduced API response time by 60% through database optimization and caching strategies',
        'Mentored 8 junior engineers, improving team productivity by 40%',
        'Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes',
        'Collaborated with product and design teams to ship 15+ major features',
      ],
      technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes'],
    },
    {
      company: 'StartupX Inc.',
      position: 'Full-Stack Developer',
      period: '2019 - 2021',
      location: 'New York, NY',
      achievements: [
        'Built real-time collaboration platform from scratch using WebSocket and Redis',
        'Developed RESTful APIs handling 10K+ requests per second',
        'Implemented authentication system with OAuth2 and JWT',
        'Optimized frontend bundle size by 45% improving load time significantly',
        'Led migration from monolithic architecture to microservices',
      ],
      technologies: ['Vue.js', 'Express.js', 'MongoDB', 'Redis', 'WebSocket', 'GraphQL'],
    },
    {
      company: 'Digital Agency Co.',
      position: 'Frontend Developer',
      period: '2017 - 2019',
      location: 'Boston, MA',
      achievements: [
        'Developed 30+ responsive websites and web applications for enterprise clients',
        'Implemented design systems and component libraries improving consistency',
        'Achieved 95+ Lighthouse scores across performance, accessibility, and SEO',
        'Collaborated with UX designers to create pixel-perfect implementations',
        'Trained team members on modern JavaScript frameworks and best practices',
      ],
      technologies: ['React', 'SASS', 'Webpack', 'jQuery', 'Bootstrap', 'Gulp'],
    },
  ],
  education: [
    {
      school: 'Stanford University',
      degree: 'Master of Science',
      major: 'Computer Science',
      period: '2015 - 2017',
      gpa: '3.8/4.0',
    },
    {
      school: 'UC Berkeley',
      degree: 'Bachelor of Science',
      major: 'Computer Engineering',
      period: '2011 - 2015',
      gpa: '3.7/4.0',
    },
  ],
  skills: [
    {
      category: 'Languages',
      items: ['JavaScript/TypeScript', 'Python', 'Go', 'Java', 'SQL', 'HTML/CSS'],
    },
    {
      category: 'Frontend',
      items: ['React', 'Vue.js', 'Next.js', 'Redux', 'TailwindCSS', 'Webpack', 'Vite'],
    },
    {
      category: 'Backend',
      items: ['Node.js', 'Express.js', 'Nest.js', 'Django', 'FastAPI', 'GraphQL', 'REST APIs'],
    },
    {
      category: 'Database',
      items: ['PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'DynamoDB', 'Elasticsearch'],
    },
    {
      category: 'DevOps & Cloud',
      items: ['AWS (EC2, S3, Lambda, RDS)', 'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'Terraform'],
    },
    {
      category: 'Tools & Others',
      items: ['Git', 'Linux', 'Nginx', 'WebSocket', 'Microservices', 'Agile/Scrum', 'TDD'],
    },
  ],
  projects: [
    {
      name: 'CloudSync Platform',
      description: 'Real-time file synchronization service similar to Dropbox, supporting 100K+ users',
      technologies: ['React', 'Node.js', 'WebSocket', 'AWS S3', 'PostgreSQL', 'Redis'],
      highlights: [
        'Built real-time sync engine with conflict resolution',
        'Implemented chunked file upload with resume capability',
        'Achieved 99.9% uptime with auto-scaling infrastructure',
      ],
      link: 'github.com/alexjohnson/cloudsync',
    },
    {
      name: 'DevTools Dashboard',
      description: 'Open-source monitoring and analytics dashboard for development teams',
      technologies: ['Next.js', 'TypeScript', 'Prisma', 'Chart.js', 'TailwindCSS'],
      highlights: [
        'Visualizes deployment metrics, error tracking, and performance data',
        'Integrated with 10+ third-party services (GitHub, Sentry, Datadog)',
        '2K+ stars on GitHub, used by 500+ companies',
      ],
      link: 'github.com/alexjohnson/devtools-dashboard',
    },
    {
      name: 'AI Code Review Bot',
      description: 'GitHub bot that automatically reviews pull requests using AI',
      technologies: ['Python', 'OpenAI API', 'GitHub API', 'FastAPI', 'Docker'],
      highlights: [
        'Analyzes code quality, security issues, and best practices',
        'Reduced manual code review time by 30%',
        'Integrated into 50+ repositories',
      ],
      link: 'github.com/alexjohnson/ai-code-reviewer',
    },
  ],
  certifications: [
    {
      name: 'AWS Certified Solutions Architect - Professional',
      issuer: 'Amazon Web Services',
      date: '2022',
    },
    {
      name: 'Google Cloud Professional Cloud Architect',
      issuer: 'Google Cloud',
      date: '2021',
    },
    {
      name: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation',
      date: '2020',
    },
  ],
};
