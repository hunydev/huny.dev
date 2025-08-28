import React from 'react';
import { ViewId } from '../types';
import { FileIcon } from '../constants';

type SidebarProps = {
  activeView: ViewId;
  onOpenFile: (fileId: string) => void;
};

const ExplorerView: React.FC<{ onOpenFile: (fileId: string) => void }> = ({ onOpenFile }) => (
  <div className="p-2">
    <h2 className="text-xs uppercase text-gray-400 tracking-wider">Explorer</h2>
    <div className="mt-4">
        <div className="flex items-center cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 mr-1">
                <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
            <h3 className="text-sm font-bold uppercase tracking-wide">HunyDev</h3>
        </div>
        <div className="mt-2 pl-4 flex flex-col gap-1">
            <button onClick={() => onOpenFile('welcome')} className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
                <span className="w-4 h-4 mr-2"></span>
                <span>Welcome</span>
            </button>
            <button onClick={() => onOpenFile('project')} className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
                <FileIcon />
                <span>project.js</span>
            </button>
            <button onClick={() => onOpenFile('about')} className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
                <FileIcon />
                <span>about.json</span>
            </button>
        </div>
    </div>
  </div>
);

const GenericView: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
    <div className="p-2">
        <h2 className="text-xs uppercase text-gray-400 tracking-wider mb-4">{title}</h2>
        {children}
    </div>
);


const Sidebar: React.FC<SidebarProps> = ({ activeView, onOpenFile }) => {
  const socialLinks = {
    [ViewId.GitHub]: 'https://github.com',
    [ViewId.Discord]: 'https://discord.com',
    [ViewId.X]: 'https://x.com',
    [ViewId.Email]: 'mailto:example@huny.dev',
  };

  const socialLink = socialLinks[activeView as keyof typeof socialLinks];
  if(socialLink) {
    window.open(socialLink, '_blank');
  }

  const renderView = () => {
    switch (activeView) {
      case ViewId.Explorer:
        return <ExplorerView onOpenFile={onOpenFile} />;
      case ViewId.Search:
        return <GenericView title="Search"><p className="text-sm text-gray-400">Search functionality coming soon.</p></GenericView>;
      case ViewId.Docs:
        return <GenericView title="Docs"><p className="text-sm text-gray-400">Documentation section coming soon.</p></GenericView>;
      case ViewId.Apps:
        return <GenericView title="Apps"><p className="text-sm text-gray-400">Apps portfolio section coming soon.</p></GenericView>;
      default:
        return <ExplorerView onOpenFile={onOpenFile} />;
    }
  };

  return <div className="w-64 bg-[#252526] border-r border-black/30">{renderView()}</div>;
};

export default Sidebar;