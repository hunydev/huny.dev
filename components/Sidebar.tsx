import React, { useState } from 'react';
import { ViewId } from '../types';
import { FileIcon } from '../constants';
import logoImg from '../logo.png';
import logo128 from '../logo_128x128.png';

type SidebarProps = {
  activeView: ViewId;
  onOpenFile: (fileId: string) => void;
  width?: number;
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

type MediaNode =
  | { type: 'folder'; name: string; children: MediaNode[] }
  | { type: 'image' | 'video'; name: string; src: string };

const MEDIA_TREE: MediaNode[] = [
  {
    type: 'folder',
    name: 'Images',
    children: [
      {
        type: 'folder',
        name: 'logos',
        children: [
          { type: 'image', name: 'logo.png', src: logoImg },
          { type: 'image', name: 'logo_128x128.png', src: logo128 },
        ],
      },
    ],
  },
  {
    type: 'folder',
    name: 'Videos',
    children: [
      { type: 'video', name: 'flower.mp4', src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
    ],
  },
];

const MediaView: React.FC = () => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'Images': true, 'Images/logos': true });
  const [selected, setSelected] = useState<{ type: 'image' | 'video'; name: string; src: string } | null>(null);

  const toggle = (path: string) => setExpanded(prev => ({ ...prev, [path]: !prev[path] }));

  const renderNode = (node: MediaNode, path: string, depth = 0): React.ReactNode => {
    if (node.type === 'folder') {
      const currPath = path ? `${path}/${node.name}` : node.name;
      const isOpen = !!expanded[currPath];
      return (
        <div key={currPath}>
          <button
            onClick={() => toggle(currPath)}
            className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1"
            style={{ paddingLeft: depth * 12 }}
          >
            <svg className={`w-3 h-3 mr-1 transition-transform ${isOpen ? 'rotate-90' : ''}`} viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M6 3l5 5-5 5V3z" />
            </svg>
            <span className="mr-2">
              <svg className="w-4 h-4 inline text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 4a2 2 0 0 1 2-2h3l2 2h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4z" />
              </svg>
            </span>
            <span className="text-sm">{node.name}</span>
          </button>
          {isOpen && (
            <div>
              {node.children.map((child) => renderNode(child, currPath, depth + 1))}
            </div>
          )}
        </div>
      );
    } else {
      const filePath = path ? `${path}/${node.name}` : node.name;
      const isSelected = selected && selected.name === node.name && selected.src === node.src;
      return (
        <button
          key={filePath}
          onClick={() => setSelected({ type: node.type, name: node.name, src: node.src })}
          className={`flex items-center text-left w-full rounded px-2 py-1 ${isSelected ? 'bg-white/15' : 'hover:bg-white/10'}`}
          style={{ paddingLeft: depth * 12 + 12 }}
        >
          <span className="mr-2">
            {node.type === 'image' ? (
              <svg className="w-4 h-4 inline text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1.5 3A1.5 1.5 0 0 0 0 4.5v7A1.5 1.5 0 0 0 1.5 13h13a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 14.5 3h-13Zm2 2 3 4 2-2 4 5h-11l2-7Z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 inline text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 3.5a.5.5 0 0 1 .79-.407l6 4.5a.5.5 0 0 1 0 .814l-6 4.5A.5.5 0 0 1 4 12.5v-9Z" />
              </svg>
            )}
          </span>
          <span className="text-sm">{node.name}</span>
        </button>
      );
    }
  };

  return (
    <div className="p-2">
      <h2 className="text-xs uppercase text-gray-400 tracking-wider mb-2">Media</h2>
      <div className="flex flex-col gap-1">
        {MEDIA_TREE.map((node) => renderNode(node, ''))}
      </div>
      {selected && (
        <div className="mt-3 border-t border-white/10 pt-2">
          <div className="text-xs uppercase text-gray-400 tracking-wider mb-2">Preview</div>
          {selected.type === 'image' ? (
            <img src={selected.src} alt={selected.name} className="w-full max-h-40 object-contain rounded" />
          ) : (
            <video src={selected.src} controls className="w-full max-h-40 rounded" />
          )}
          <div className="mt-1 text-xs text-gray-400">{selected.name}</div>
        </div>
      )}
    </div>
  );
};


const Sidebar: React.FC<SidebarProps> = ({ activeView, onOpenFile, width = 256 }) => {

  const renderView = () => {
    switch (activeView) {
      case ViewId.Explorer:
        return <ExplorerView onOpenFile={onOpenFile} />;
      case ViewId.Search:
        return <GenericView title="Search"><p className="text-sm text-gray-400">Search functionality coming soon.</p></GenericView>;
      case ViewId.Docs:
        return <GenericView title="Docs"><p className="text-sm text-gray-400">Documentation section coming soon.</p></GenericView>;
      case ViewId.Apps:
        return <GenericView title="Apps"><p className="text-sm text-gray-400">Apps Works section coming soon.</p></GenericView>;
      case ViewId.Media:
        return <MediaView />;
      case ViewId.Library:
        return <GenericView title="Library"><p className="text-sm text-gray-400">Library section coming soon.</p></GenericView>;
      case ViewId.Bookmark:
        return <GenericView title="Bookmark"><p className="text-sm text-gray-400">Bookmarks section coming soon.</p></GenericView>;
      case ViewId.Lab:
        return <GenericView title="Lab"><p className="text-sm text-gray-400">Lab section coming soon.</p></GenericView>;
      case ViewId.Notes:
        return <GenericView title="Notes"><p className="text-sm text-gray-400">Notes section coming soon.</p></GenericView>;
      default:
        return <ExplorerView onOpenFile={onOpenFile} />;
    }
  };

  return <div className="bg-[#252526] border-r border-black/30 shrink-0" style={{ width }}>{renderView()}</div>;
};

export default Sidebar;