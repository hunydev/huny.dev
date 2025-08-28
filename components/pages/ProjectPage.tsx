import React from 'react';
import { PageProps } from '../../types';

const ProjectCard = ({ title, description, tags, link }: { title: string, description: string, tags: string[], link: string }) => (
    <div className="bg-[#2a2d2e] p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-300">
        <h3 className="text-xl font-bold text-blue-400 mb-2">{title}</h3>
        <p className="text-gray-400 mb-4">{description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
            {tags.map(tag => (
                <span key={tag} className="bg-gray-700 text-gray-300 text-xs font-mono px-2 py-1 rounded">{tag}</span>
            ))}
        </div>
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
            View on GitHub &rarr;
        </a>
    </div>
);

const ProjectPage: React.FC<PageProps> = () => {
    const projects = [
        {
            title: "Works Website",
            description: "This very website. A VSCode-themed Works site built with React, TypeScript and TailwindCSS to showcase my skills in a creative way.",
            tags: ["React", "TypeScript", "TailwindCSS", "Vite"],
            link: "#"
        },
        {
            title: "AI-Powered Chat Application",
            description: "A real-time chat application integrated with a large language model to provide intelligent responses and assistance.",
            tags: ["Node.js", "WebSocket", "Gemini API", "React"],
            link: "#"
        },
        {
            title: "E-commerce Platform",
            description: "A full-stack e-commerce solution with features like product catalog, shopping cart, user authentication, and order management.",
            tags: ["Next.js", "PostgreSQL", "Prisma", "Stripe API"],
            link: "#"
        }
    ];

    return (
        <div className="text-gray-300 font-mono">
            <h1 className="text-3xl font-bold text-white mb-2">
                <span className="text-gray-500">const</span> <span className="text-yellow-400">projects</span> <span className="text-gray-500">=</span> [
            </h1>
            <div className="space-y-6 pl-4 border-l-2 border-gray-700 ml-2">
                {projects.map((project, index) => (
                    <div key={index} className="my-4">
                       <span className="text-gray-500">{`{`}</span>
                         <ProjectCard {...project} />
                       <span className="text-gray-500">{`},`}</span>
                    </div>
                ))}
            </div>
             <h1 className="text-3xl font-bold text-white mt-2">];</h1>
        </div>
    );
};

export default ProjectPage;
