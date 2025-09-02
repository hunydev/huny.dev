import React from 'react';
import { PageProps, ViewId } from '../../types';

const WelcomePage: React.FC<PageProps> = ({ onOpenFile, setActiveView }) => {
    const handleContactClick = () => {
        setActiveView(ViewId.Email);
    };
    
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
                    <ul className="space-y-3">
                        <li>
                            <button onClick={() => onOpenFile('project')} className="flex items-center gap-3 text-blue-400 hover:text-blue-300 w-full text-left">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                                <span className="text-lg">Browse Works...</span>
                            </button>
                        </li>
                        <li>
                            <button onClick={() => onOpenFile('about')} className="flex items-center gap-3 text-blue-400 hover:text-blue-300 w-full text-left">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                <span className="text-lg">About Me</span>
                            </button>
                        </li>
                        <li>
                            <button onClick={handleContactClick} className="flex items-center gap-3 text-blue-400 hover:text-blue-300 w-full text-left">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                <span className="text-lg">Contact Me</span>
                            </button>
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">Recent</h2>
                    <p className="text-gray-500">No recent folders.</p>
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

                {/* Highlights: compact skill tags */}
                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">Highlights</h2>
                    <ul className="flex flex-wrap gap-2">
                        {['TypeScript','React','Vite','Tailwind CSS','Node.js','REST/GraphQL','UI/UX','Open Source'].map(k => (
                            <li key={k}>
                                <span className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/10 text-sm text-gray-300">{k}</span>
                            </li>
                        ))}
                    </ul>
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
