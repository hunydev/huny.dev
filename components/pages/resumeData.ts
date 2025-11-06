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
    name: 'Sarah Kim',
    title: 'Senior Software Engineer',
    email: 'sarah.kim@example.com',
    phone: '+1 (555) 987-6543',
    location: 'Seattle, WA',
    website: 'sarahkim.dev',
    github: 'github.com/sarahkim',
    linkedin: 'linkedin.com/in/sarahkim-swe',
  },
  summary:
    'Senior Software Engineer with 10+ years of experience designing and implementing large-scale distributed systems. Expert in system architecture, performance optimization, and building resilient microservices. Led multiple high-impact projects serving 50M+ users with 99.99% uptime. Proven track record in technical leadership, cross-functional collaboration, and mentoring engineering teams. Passionate about solving complex technical challenges and delivering scalable solutions.',
  experience: [
    {
      company: 'CloudScale Technologies',
      position: 'Senior Software Engineer',
      period: '2020 - Present',
      location: 'Seattle, WA',
      achievements: [
        'Designed and implemented distributed event-driven architecture processing 100M+ events/day with sub-100ms latency',
        'Led technical design and implementation of multi-region deployment strategy, achieving 99.99% uptime SLA',
        'Optimized database query performance reducing P99 latency from 800ms to 50ms through indexing strategy and query optimization',
        'Mentored team of 12 engineers across 3 squads, establishing code review standards and architectural guidelines',
        'Drove adoption of observability best practices using OpenTelemetry, reducing MTTR by 70%',
      ],
      technologies: ['Go', 'Python', 'Kubernetes', 'Kafka', 'PostgreSQL', 'Redis', 'AWS', 'Terraform', 'Prometheus', 'Grafana'],
    },
    {
      company: 'DataStream Inc.',
      position: 'Software Engineer',
      period: '2017 - 2020',
      location: 'San Francisco, CA',
      achievements: [
        'Built real-time data pipeline processing 10TB+ daily using Apache Kafka and Apache Flink',
        'Architected horizontally scalable microservices infrastructure handling 1M+ requests per minute',
        'Implemented automated canary deployment system reducing production incidents by 60%',
        'Designed and developed GraphQL API gateway aggregating data from 20+ backend services',
        'Led migration from monolithic architecture to microservices, improving deployment frequency from monthly to daily',
      ],
      technologies: ['Java', 'Spring Boot', 'Kafka', 'Flink', 'Cassandra', 'Elasticsearch', 'Docker', 'Jenkins', 'GraphQL'],
    },
    {
      company: 'FinTech Solutions',
      position: 'Software Engineer',
      period: '2014 - 2017',
      location: 'New York, NY',
      achievements: [
        'Developed high-throughput payment processing system handling $1B+ in annual transactions',
        'Implemented comprehensive security measures achieving PCI DSS Level 1 compliance',
        'Built automated reconciliation system reducing manual processing time by 90%',
        'Optimized critical API endpoints improving throughput from 500 to 5000 TPS',
        'Established testing practices increasing code coverage from 40% to 95%',
      ],
      technologies: ['Java', 'Spring Framework', 'Oracle DB', 'RabbitMQ', 'Redis', 'Angular', 'JUnit', 'Mockito'],
    },
  ],
  education: [
    {
      school: 'Carnegie Mellon University',
      degree: 'Master of Science',
      major: 'Computer Science',
      period: '2012 - 2014',
      gpa: '3.9/4.0',
    },
    {
      school: 'University of Washington',
      degree: 'Bachelor of Science',
      major: 'Computer Science',
      period: '2008 - 2012',
      gpa: '3.8/4.0',
    },
  ],
  skills: [
    {
      category: 'Languages',
      items: ['Go', 'Python', 'Java', 'JavaScript/TypeScript', 'SQL', 'Bash/Shell'],
    },
    {
      category: 'Backend & APIs',
      items: ['Microservices', 'REST APIs', 'GraphQL', 'gRPC', 'Spring Boot', 'FastAPI', 'Event-Driven Architecture'],
    },
    {
      category: 'Data & Messaging',
      items: ['PostgreSQL', 'Redis', 'Kafka', 'RabbitMQ', 'MongoDB', 'Cassandra', 'Elasticsearch', 'Apache Flink'],
    },
    {
      category: 'Cloud & Infrastructure',
      items: ['AWS (ECS, EKS, Lambda, RDS, S3)', 'Kubernetes', 'Docker', 'Terraform', 'Service Mesh', 'Multi-region'],
    },
    {
      category: 'Observability & DevOps',
      items: ['Prometheus', 'Grafana', 'OpenTelemetry', 'ELK Stack', 'CI/CD', 'Jenkins', 'GitLab CI', 'ArgoCD'],
    },
    {
      category: 'System Design & Architecture',
      items: ['Distributed Systems', 'High Availability', 'Performance Optimization', 'System Architecture', 'Load Balancing', 'Caching Strategies'],
    },
  ],
  projects: [
    {
      name: 'Distributed Task Scheduler',
      description: 'High-throughput distributed task scheduling system processing 50M+ tasks daily across multiple data centers',
      technologies: ['Go', 'Kafka', 'Redis Cluster', 'PostgreSQL', 'Kubernetes', 'Prometheus'],
      highlights: [
        'Designed consistent hashing-based task distribution achieving 99.99% success rate',
        'Implemented priority queue with fairness guarantees using custom scheduling algorithm',
        'Built fault-tolerant architecture with automatic failover and task recovery',
        'Achieved horizontal scalability from 10K to 1M tasks/min with linear performance',
      ],
      link: 'github.com/sarahkim/distributed-scheduler',
    },
    {
      name: 'Real-Time Analytics Pipeline',
      description: 'Stream processing platform for real-time event analytics and anomaly detection',
      technologies: ['Python', 'Apache Flink', 'Kafka', 'Cassandra', 'Elasticsearch', 'Grafana'],
      highlights: [
        'Processed 10TB+ daily data with sub-second latency using windowing and aggregations',
        'Implemented exactly-once semantics for critical business metrics',
        'Built ML-based anomaly detection reducing false positives by 80%',
        'Designed multi-tenant architecture supporting 100+ data streams',
      ],
      link: 'github.com/sarahkim/realtime-analytics',
    },
    {
      name: 'API Gateway Platform',
      description: 'High-performance API gateway with rate limiting, authentication, and observability',
      technologies: ['Go', 'Envoy Proxy', 'Redis', 'PostgreSQL', 'OpenTelemetry', 'Terraform'],
      highlights: [
        'Handled 5M+ requests/min with P99 latency under 10ms',
        'Implemented distributed rate limiting using token bucket algorithm',
        'Built plugin system for extensible authentication and authorization',
        'Achieved zero-downtime deployments with blue-green strategy',
      ],
      link: 'github.com/sarahkim/api-gateway',
    },
  ],
  certifications: [
    {
      name: 'AWS Certified Solutions Architect - Professional',
      issuer: 'Amazon Web Services',
      date: '2023',
    },
    {
      name: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation',
      date: '2022',
    },
    {
      name: 'HashiCorp Certified: Terraform Associate',
      issuer: 'HashiCorp',
      date: '2021',
    },
    {
      name: 'Confluent Certified Developer for Apache Kafka',
      issuer: 'Confluent',
      date: '2020',
    },
  ],
};
