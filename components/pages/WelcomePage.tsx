import React from 'react';
import { PageProps, ViewId } from '../../types';

const WelcomePage: React.FC<PageProps> = ({ onOpenFile, setActiveView }) => {
    const handleContactClick = () => {
        setActiveView(ViewId.Email);
    };
    
    return (
        <div className="text-gray-300 max-w-4xl mx-auto font-sans leading-relaxed">
            <header className="mb-12">
                <h1 className="text-5xl font-thin mb-2">Huny<span className="font-light">Dev</span></h1>
                <p className="text-xl text-gray-400">Works & Digital Playground</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">Start</h2>
                    <ul className="space-y-3">
                        <li>
                            <button onClick={() => onOpenFile('project')} className="flex items-center gap-3 text-blue-400 hover:text-blue-300 w-full text-left">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                                <span className="text-lg">Browse Projects...</span>
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
            </main>

            <footer className="mt-16 text-center text-gray-500 text-sm">
                <p>Built with React, TypeScript, and Tailwind CSS.</p>
                <p>Inspired by the Visual Studio Code interface.</p>
            </footer>
        </div>
    );
};

export default WelcomePage;
