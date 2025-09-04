import React from 'react';
import { PageProps, ViewId } from '../../types';
import { ACTIVITY_BAR_ITEMS, PAGES } from '../../constants';

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
            items: ['Java', 'Python', 'C#'],
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
            items: ['AWS'],
            tile: 'bg-yellow-500/10 border-yellow-500/20',
            heading: 'text-yellow-300',
            chip: 'bg-yellow-500/10 border-yellow-500/20',
        },
        {
            title: 'Platform',
            items: ['Cloudflare', 'Netlify', 'YouWare', 'Google AI Studio'],
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
            items: ['Notion'],
            tile: 'bg-cyan-500/10 border-cyan-500/20',
            heading: 'text-cyan-300',
            chip: 'bg-cyan-500/10 border-cyan-500/20',
        },
        {
            title: 'Project',
            items: ['Teams'],
            tile: 'bg-violet-500/10 border-violet-500/20',
            heading: 'text-violet-300',
            chip: 'bg-violet-500/10 border-violet-500/20',
        },
        {
            title: 'Work',
            items: ['MS365'],
            tile: 'bg-zinc-500/10 border-zinc-500/20',
            heading: 'text-zinc-300',
            chip: 'bg-zinc-500/10 border-zinc-500/20',
        },
        {
            title: 'Chart',
            items: ['Whimsical'],
            tile: 'bg-pink-500/10 border-pink-500/20',
            heading: 'text-pink-300',
            chip: 'bg-pink-500/10 border-pink-500/20',
        },
        {
            title: 'Web',
            items: ['IIS', 'Nginx'],
            tile: 'bg-orange-500/10 border-orange-500/20',
            heading: 'text-orange-300',
            chip: 'bg-orange-500/10 border-orange-500/20',
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
                                const meta = PAGES[id];
                                if (!meta) return null;
                                return (
                                    <li key={id}>
                                        <button
                                            onClick={() => onOpenFile(id)}
                                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/10 text-left"
                                        >
                                            <span>{meta.icon}</span>
                                            <span className="text-sm">{meta.title}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                {/* Explore: richer cards to guide first-time visitors */}
                <section>
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

                {/* Highlights: tiles per category with subtle color differentiation */}
                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">Highlights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
