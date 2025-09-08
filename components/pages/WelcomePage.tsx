import React from 'react';
import { PageProps, ViewId } from '../../types';
import { ACTIVITY_BAR_ITEMS, PAGES, FileIcon } from '../../constants';
import { getCategoryById } from './bookmarksData';
import { getNoteGroupById } from './notesData';
import { getAppCategoryById } from './appsData';
import { getDocBySlug } from './docsData';

const WelcomePage: React.FC<PageProps> = ({ onOpenFile, setActiveView, onActivityClick }) => {
    const handleContactClick = () => {
        setActiveView(ViewId.Email);
    };

    // Recent tabs: read from sessionStorage (exclude 'welcome')
    const [recentIds, setRecentIds] = React.useState<string[]>([]);
    React.useEffect(() => {
        try {
            const raw = sessionStorage.getItem('recentTabs');
            const arr = raw ? JSON.parse(raw) : [];
            if (Array.isArray(arr)) {
                setRecentIds(arr.filter((id: string) => id !== 'welcome').slice(0, 5));
            }
        } catch {}
    }, []);
    
    // Highlights data from provided about.json
    const highlightGroups = React.useMemo(() => [
        {
            title: 'Domain',
            items: ['TTS', 'AI'],
            tile: 'bg-violet-500/10 border-violet-500/20',
            heading: 'text-violet-300',
            chip: 'bg-violet-500/10 border-violet-500/20',
        },
        {
            title: 'Development',
            items: ['Software Engineering', 'Backend Web Development', 'Desktop Application Development', 'Cloud Architecture & Deployment'],
            tile: 'bg-blue-500/10 border-blue-500/20',
            heading: 'text-blue-300',
            chip: 'bg-blue-500/10 border-blue-500/20',
        },
        {
            title: 'Languages — Primary',
            items: ['Go', 'C'],
            tile: 'bg-emerald-500/10 border-emerald-500/20',
            heading: 'text-emerald-300',
            chip: 'bg-emerald-500/10 border-emerald-500/20',
        },
        {
            title: 'Languages — Extra',
            items: ['Java', 'C#', 'Python', 'JavaScript'],
            tile: 'bg-teal-500/10 border-teal-500/20',
            heading: 'text-teal-300',
            chip: 'bg-teal-500/10 border-teal-500/20',
        },
        {
            title: 'OS',
            items: ['Windows', 'Linux'],
            tile: 'bg-slate-500/10 border-slate-500/20',
            heading: 'text-slate-300',
            chip: 'bg-slate-500/10 border-slate-500/20',
        },
        {
            title: 'IDE',
            items: ['Visual Studio Code', 'Visual Studio', 'Eclipse(STS)'],
            tile: 'bg-sky-500/10 border-sky-500/20',
            heading: 'text-sky-300',
            chip: 'bg-sky-500/10 border-sky-500/20',
        },
        {
            title: 'SCM',
            items: ['Git (GitHub)', 'SVN'],
            tile: 'bg-amber-500/10 border-amber-500/20',
            heading: 'text-amber-300',
            chip: 'bg-amber-500/10 border-amber-500/20',
        },
        {
            title: 'CI/CD',
            items: ['GitHub Actions', 'Jenkins'],
            tile: 'bg-rose-500/10 border-rose-500/20',
            heading: 'text-rose-300',
            chip: 'bg-rose-500/10 border-rose-500/20',
        },
        {
            title: 'Infra',
            items: ['AWS', 'Cloudflare'],
            tile: 'bg-yellow-500/10 border-yellow-500/20',
            heading: 'text-yellow-300',
            chip: 'bg-yellow-500/10 border-yellow-500/20',
        },
        {
            title: 'Platform',
            items: ['Netlify', 'Pikapods', 'YouWare', 'Google AI Studio'],
            tile: 'bg-indigo-500/10 border-indigo-500/20',
            heading: 'text-indigo-300',
            chip: 'bg-indigo-500/10 border-indigo-500/20',
        },
        {
            title: 'AI Tools',
            items: ['ChatGPT', 'Copilot', 'Gemini', 'Windsurf'],
            tile: 'bg-fuchsia-500/10 border-fuchsia-500/20',
            heading: 'text-fuchsia-300',
            chip: 'bg-fuchsia-500/10 border-fuchsia-500/20',
        },
        {
            title: 'Docs',
            items: ['Notion', 'Confluence'],
            tile: 'bg-cyan-500/10 border-cyan-500/20',
            heading: 'text-cyan-300',
            chip: 'bg-cyan-500/10 border-cyan-500/20',
        },
        {
            title: 'Project',
            items: ['Teams', 'JIRA'],
            tile: 'bg-violet-500/10 border-violet-500/20',
            heading: 'text-violet-300',
            chip: 'bg-violet-500/10 border-violet-500/20',
        },
        {
            title: 'Work',
            items: ['Windows 11', 'Microsoft 365'],
            tile: 'bg-zinc-500/10 border-zinc-500/20',
            heading: 'text-zinc-300',
            chip: 'bg-zinc-500/10 border-zinc-500/20',
        },
        {
            title: 'Chart',
            items: ['Whimsical', 'Draw.io'],
            tile: 'bg-pink-500/10 border-pink-500/20',
            heading: 'text-pink-300',
            chip: 'bg-pink-500/10 border-pink-500/20',
        },
        {
            title: 'Web',
            items: ['IIS', 'Nginx', 'Apache'],
            tile: 'bg-orange-500/10 border-orange-500/20',
            heading: 'text-orange-300',
            chip: 'bg-orange-500/10 border-orange-500/20',
        },
        {
            title: 'SSH',
            items: ['SecureCRT', 'Filezilla Pro'],
            tile: 'bg-lime-500/10 border-lime-500/20',
            heading: 'text-lime-300',
            chip: 'bg-lime-500/10 border-lime-500/20',
        },
        {
            title: 'Blog',
            items: ['BlogPro'],
            tile: 'bg-emerald-500/10 border-emerald-500/20',
            heading: 'text-emerald-300',
            chip: 'bg-emerald-500/10 border-emerald-500/20',
        },
    ], []);
    
    return (
        <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed px-6 md:px-8">
            <header className="mb-12">
                <h1 className="text-5xl font-thin mb-2">Huny<span className="font-light">Dev</span></h1>
                <p className="text-xl text-gray-400">Works & Digital Playground</p>
                <p className="mt-3 text-gray-400 max-w-3xl">
                    I craft dependable, delightful web experiences with TypeScript and React. Explore my Works, learn more About me, or get in touch.
                </p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">Start</h2>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {ACTIVITY_BAR_ITEMS.filter((i: any) => i.section === 'top').map(item => (
                            <button
                                key={String(item.id)}
                                onClick={() => (onActivityClick ? onActivityClick(item.id as ViewId) : setActiveView(item.id as ViewId))}
                                className="aspect-square rounded-md bg-white/[0.03] hover:bg-white/10 transition flex flex-col items-center justify-center gap-1 text-gray-300"
                                title={item.title}
                            >
                                <span className="text-gray-200">{item.icon}</span>
                                <span className="text-xs text-gray-400">{item.title}</span>
                            </button>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">Recent</h2>
                    {recentIds.length === 0 ? (
                        <p className="text-gray-500">No recent items.</p>
                    ) : (
                        <ul className="space-y-2">
                            {recentIds.map((id) => {
                                // Support dynamic routes like 'bookmark:<categoryId>'
                                const [baseId, arg] = id.split(':');
                                const baseMeta = PAGES[baseId] || PAGES[id];
                                if (!baseMeta) return null;

                                let displayTitle: string = baseMeta.title;
                                let displayIcon: React.ReactNode = baseMeta.icon;

                                if (baseId === 'bookmark') {
                                    const categoryId = arg || 'all';
                                    const cat = categoryId === 'all' ? undefined : getCategoryById(categoryId);
                                    const catName = categoryId === 'all' ? 'All' : (cat?.name ?? categoryId);
                                    displayTitle = `bookmarks (${catName})`;
                                    const color = categoryId === 'all' ? '#9ca3af' : (cat?.color ?? '#9ca3af');
                                    displayIcon = (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="w-4 h-4"
                                            style={{ color }}
                                        >
                                            <path d="M6 3.5C6 2.67 6.67 2 7.5 2h9A1.5 1.5 0 0 1 18 3.5v16.77c0 .57-.63.92-1.11.6l-4.78-3.2a1.5 1.5 0 0 0-1.64 0l-4.78 3.2c-.48.32-1.11-.03-1.11-.6z" />
                                        </svg>
                                    );
                                } else if (baseId === 'media' && arg) {
                                    try {
                                        const payload = JSON.parse(atob(arg)) as { type?: 'image' | 'video'; name?: string; src?: string };
                                        const mType = payload?.type ?? 'image';
                                        const mName = payload?.name ?? 'file';
                                        displayTitle = `media (${mName})`;
                                        displayIcon = mType === 'image' ? (
                                            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                                                <path d="M1.5 3A1.5 1.5 0 0 0 0 4.5v7A1.5 1.5 0 0 0 1.5 13h13a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 14.5 3h-13Zm2 2 3 4 2-2 4 5h-11l2-7Z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                                                <path d="M4 3.5a.5.5 0 0 1 .79-.407l6 4.5a.5.5 0 0 1 0 .814l-6 4.5A.5.5 0 0 1 4 12.5v-9Z" />
                                            </svg>
                                        );
                                    } catch {}
                                } else if (baseId === 'notes' && arg) {
                                    const group = getNoteGroupById(arg);
                                    const groupName = group?.name ?? arg;
                                    const color = group?.color ?? '#9ca3af';
                                    displayTitle = `notes – ${groupName}`;
                                    displayIcon = (
                                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" style={{ color }}>
                                            <path d="M2.5 2A1.5 1.5 0 0 0 1 3.5v9A1.5 1.5 0 0 0 2.5 14h7.793l3.354-3.354A.5.5 0 0 0 14 10.293V3.5A1.5 1.5 0 0 0 12.5 2h-10Z" />
                                            <path d="M10.5 13.5V11a1 1 0 0 1 1-1h2.5" opacity="0.6" />
                                        </svg>
                                    );
                                } else if (baseId === 'apps') {
                                    const categoryId = arg || 'huny';
                                    const cat = getAppCategoryById(categoryId);
                                    const catName = cat?.name ?? categoryId;
                                    displayTitle = `apps – ${catName}`;
                                    displayIcon = cat?.iconUrl ? (
                                        <img src={cat.iconUrl} alt="" className="w-4 h-4 rounded-sm" />
                                    ) : cat?.emoji ? (
                                        <span className="text-sm" aria-hidden>{cat.emoji}</span>
                                    ) : (
                                        baseMeta.icon
                                    );
                                } else if (baseId === 'docs') {
                                    const slug = arg || '';
                                    const doc = getDocBySlug(slug);
                                    const title = doc?.title || slug || 'docs';
                                    displayTitle = `docs – ${title}`;
                                    displayIcon = <FileIcon />;
                                }

                                return (
                                    <li key={id}>
                                        <button
                                            onClick={() => onOpenFile(id)}
                                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/10 text-left"
                                            title={displayTitle}
                                        >
                                            <span>{displayIcon}</span>
                                            <span className="text-sm truncate">{displayTitle}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                {/* Highlights: tiles per category with subtle color differentiation (full width) */}
                <section className="md:col-span-2">
                    <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">Highlights</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {highlightGroups.map((g) => (
                            <div key={g.title} className={`rounded-md border ${g.tile} p-3`}>
                                <h3 className={`text-sm font-semibold ${g.heading}`}>{g.title}</h3>
                                <ul className="mt-2 flex flex-wrap gap-2">
                                    {g.items.map((item) => (
                                        <li key={item}>
                                            <span className={`px-2.5 py-1 rounded-md border ${g.chip} text-xs text-gray-200`}>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Explore: richer cards to guide first-time visitors (full width, placed below Highlights) */}
                <section className="md:col-span-2">
                    <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">Explore</h2>
                    <div className="space-y-3">
                        <button onClick={() => onOpenFile('project')} className="w-full text-left rounded-md p-4 bg-white/[0.03] hover:bg-white/10 transition">
                            <div className="flex items-center gap-3 text-blue-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"/></svg>
                                <span className="text-lg">Works</span>
                            </div>
                            <p className="ml-9 mt-1 text-sm text-gray-400">Browse works, experiments, and results.</p>
                        </button>
                        <button onClick={() => onOpenFile('about')} className="w-full text-left rounded-md p-4 bg-white/[0.03] hover:bg-white/10 transition">
                            <div className="flex items-center gap-3 text-blue-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-4 7a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"/></svg>
                                <span className="text-lg">About Me</span>
                            </div>
                            <p className="ml-9 mt-1 text-sm text-gray-400">Who I am, what I do, and how I work.</p>
                        </button>
                    </div>
                </section>
            </main>

            {/* Tips spanning full width */}
            <section className="mt-6 md:mt-10">
                <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">Tips & Shortcuts</h2>
                <ul className="space-y-2 text-gray-400">
                    <li>Use the pin icon in the title bar to pin/unpin the sidebar. In overlay mode, the main panel won’t shift.</li>
                    <li>Scroll the ActivityBar to access hidden items; faint up/down indicators appear when more items are available.</li>
                    <li>Open the user icon menu in the title bar for GitHub / Discord / X / Email links.</li>
                </ul>
            </section>
        </div>
    );
};

export default WelcomePage;
