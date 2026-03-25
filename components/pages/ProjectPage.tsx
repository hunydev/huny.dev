import React from 'react';
import { PageProps } from '../../types';

interface Project {
    title: string;
    description: string;
    tags: string[];
    link: string;
    linkLabel?: string;
    liveUrl?: string;
    liveLabel?: string;
    status: string;
    icon: string;
}

const isGitHubLink = (url: string): boolean => {
    try {
        const { hostname } = new URL(url);
        return hostname === 'github.com' || hostname.endsWith('.github.com');
    } catch {
        return false;
    }
};

const ProjectCard: React.FC<Project> = ({ title, description, tags, link, linkLabel = 'GitHub', liveUrl, liveLabel = 'Live Demo', status, icon }) => (
    <div className="group relative bg-gradient-to-br from-[#2a2d2e] to-[#1f2223] p-6 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
        {/* 아이콘과 상태 배지 */}
        <div className="flex items-start justify-between mb-4">
            <div className="text-4xl mb-2">{icon}</div>
            <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full border border-green-500/30">
                {status}
            </span>
        </div>
        
        {/* 제목 */}
        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
            {title}
        </h3>
        
        {/* 설명 */}
        <p className="text-gray-400 mb-5 leading-relaxed min-h-[60px]">
            {description}
        </p>
        
        {/* 기술 스택 태그 */}
        <div className="flex flex-wrap gap-2 mb-5">
            {tags.map(tag => (
                <span 
                    key={tag} 
                    className="bg-gray-800/60 text-blue-300 text-xs font-mono px-3 py-1.5 rounded-md border border-gray-700/50 hover:border-blue-500/50 transition-colors"
                >
                    {tag}
                </span>
            ))}
        </div>
        
        {/* 링크들 */}
        <div className="flex gap-3 pt-4 border-t border-gray-700/50">
            <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors text-sm font-medium group/link"
            >
                {isGitHubLink(link) ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 3H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h4v-2H5V5h9v4h2V5a2 2 0 0 0-2-2zm2.293 7.293-5 5 1.414 1.414 3.293-3.293V21h2v-7.586l3.293 3.293 1.414-1.414-5-5a1 1 0 0 0-1.414 0z"/>
                    </svg>
                )}
                <span className="group-hover/link:underline">{linkLabel}</span>
            </a>
            {liveUrl && (
                <>
                    <span className="text-gray-600">•</span>
                    <a 
                        href={liveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors text-sm font-medium group/link"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span className="group-hover/link:underline">{liveLabel}</span>
                    </a>
                </>
            )}
        </div>
    </div>
);

const ProjectPage: React.FC<PageProps> = () => {
    const projects: Project[] = [
        {
            title: "Riano",
            description: "수학·과학 이론을 인터랙티브하게 탐구할 수 있는 학습 플랫폼입니다. 블로그 이론 글과 연동되어 개념을 읽고 바로 시뮬레이션으로 실험할 수 있습니다.",
            tags: ["Interactive Learning", "Math", "Science", "Simulation", "Web App"],
            link: "https://blog.riano.app",
            linkLabel: "Blog",
            liveUrl: "https://riano.app",
            liveLabel: "Site",
            status: "Production",
            icon: "🧠"
        },
        {
            title: "rc",
            description: "간결한 구조로 빠르게 사용할 수 있도록 만든 개인 프로젝트 웹앱입니다. 실제 배포 환경(rc.huny.dev)과 GitHub 저장소를 함께 운영합니다.",
            tags: ["TypeScript", "Web App", "Personal Project", "Frontend"],
            link: "https://github.com/hunydev/rc",
            liveUrl: "https://rc.huny.dev",
            liveLabel: "Site",
            status: "Production",
            icon: "⚙️"
        },
        {
            title: "AutoPad",
            description: "Windows 생산성 향상을 위한 클립보드 유틸리티 프로젝트입니다. 반복 입력을 자동화하고 텍스트 작업 흐름을 빠르게 정리할 수 있도록 설계되었습니다.",
            tags: ["Windows", "Clipboard Utility", "Automation", "Productivity"],
            link: "https://github.com/hunydev/autopad",
            liveUrl: "https://autopad.huny.dev",
            liveLabel: "Site",
            status: "Production",
            icon: "📋"
        },
        {
            title: "Prompt Keeper",
            description: "자주 사용하는 AI 프롬프트를 저장하고 관리하는 북마크형 웹앱. Netlify Functions와 Blobs를 활용한 서버리스 아키텍처로 구현되었습니다.",
            tags: ["React", "TypeScript", "Netlify Functions", "Netlify Blobs", "Serverless"],
            link: "https://github.com/hunydev/prompt-keeper",
            liveUrl: "https://prompts.huny.dev",
            status: "Production",
            icon: "📝"
        },
        {
            title: "huny.dev",
            description: "VSCode 테마를 적용한 개인 포트폴리오 웹사이트. TTS 솔루션 엔지니어 및 DevOps 개발자로서의 경험과 기술을 소개합니다.",
            tags: ["React", "TypeScript", "TailwindCSS", "Vite", "Cloudflare Workers", "SSR"],
            link: "https://github.com/hunydev/huny.dev",
            liveUrl: "https://huny.dev",
            status: "Production",
            icon: "💼"
        },
        {
            title: "JWT Encoder/Decoder",
            description: "실시간으로 JWT 토큰을 인코딩하고 디코딩할 수 있는 웹 애플리케이션. 서명 검증과 만료시간 편집 기능을 제공합니다.",
            tags: ["React 18", "Vite", "Tailwind CSS", "jose", "Cloudflare Workers"],
            link: "https://github.com/hunydev/jwt-huny-dev",
            liveUrl: "https://jwt.huny.dev",
            status: "Production",
            icon: "🔐"
        }
    ];

    return (
        <div className="min-h-full">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#1e1e1e] via-[#1b1b1b] to-[#161616] p-8 md:p-10 mb-8">
                <div className="absolute inset-0 pointer-events-none" aria-hidden>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                </div>
                <div className="relative">
                    <div className="inline-block mb-4">
                        <span className="text-4xl">🚀</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Featured Projects
                    </h1>
                    <p className="text-base md:text-lg text-gray-400 max-w-2xl">
                        실제 프로덕션 환경에서 운영 중인 프로젝트들입니다. 각 프로젝트는 현대적인 기술 스택과 베스트 프랙티스를 적용하여 개발되었습니다.
                    </p>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <ProjectCard 
                        key={project.link}
                        title={project.title}
                        description={project.description}
                        tags={project.tags}
                        link={project.link}
                        linkLabel={project.linkLabel}
                        liveUrl={project.liveUrl}
                        liveLabel={project.liveLabel}
                        status={project.status}
                        icon={project.icon}
                    />
                ))}
            </div>

            {/* Footer Stats */}
            <div className="mt-10 pt-8 border-t border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-[#1e1e1e] p-6 rounded-lg border border-gray-800 text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-2">{projects.length}</div>
                        <div className="text-sm text-gray-400">Total Projects</div>
                    </div>
                    <div className="bg-[#1e1e1e] p-6 rounded-lg border border-gray-800 text-center">
                        <div className="text-3xl font-bold text-green-400 mb-2">
                            {projects.filter(p => p.status === 'Production').length}
                        </div>
                        <div className="text-sm text-gray-400">In Production</div>
                    </div>
                </div>

                {/* Technologies Usage */}
                <div className="bg-[#1e1e1e] p-6 rounded-lg border border-gray-800">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-purple-400">📊</span>
                        Technologies Used
                    </h3>
                    <div className="space-y-3">
                        {(() => {
                            // 모든 태그 수집 및 빈도 계산
                            const tagCount = new Map<string, number>();
                            projects.forEach(project => {
                                project.tags.forEach(tag => {
                                    // React 18 -> React로 정규화
                                    const normalizedTag = tag.replace(/\s+\d+$/, '');
                                    tagCount.set(normalizedTag, (tagCount.get(normalizedTag) || 0) + 1);
                                });
                            });
                            
                            // 빈도순으로 정렬
                            const sortedTags = Array.from(tagCount.entries())
                                .sort((a, b) => b[1] - a[1]);
                            
                            const maxCount = Math.max(...sortedTags.map(([, count]) => count));
                            
                            return sortedTags.map(([tag, count]) => {
                                const percentage = (count / projects.length) * 100;
                                const barWidth = (count / maxCount) * 100;
                                
                                return (
                                    <div key={tag} className="group">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm font-mono text-gray-300 group-hover:text-blue-400 transition-colors">
                                                {tag}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {count}/{projects.length} projects ({percentage.toFixed(0)}%)
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-600 rounded-full transition-all duration-500 group-hover:bg-blue-500"
                                                style={{ width: `${barWidth}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectPage;
