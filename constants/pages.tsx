import React from 'react';
import { PageProps } from '../types';
import welcomeIcon from '../icon_32x32.png';
import { Icon } from './icons';

const WelcomePage = React.lazy(() => import('../components/pages/WelcomePage'));
const ProjectPage = React.lazy(() => import('../components/pages/ProjectPage'));
const AboutPage = React.lazy(() => import('../components/pages/AboutPage'));
const BookmarkPage = React.lazy(() => import('../components/pages/BookmarkPage'));
const MonitorPage = React.lazy(() => import('../components/pages/MonitorPage'));
const NotesBoardPage = React.lazy(() => import('../components/pages/NotesBoardPage'));
const DomainPage = React.lazy(() => import('../components/pages/DomainPage'));
const AppsPage = React.lazy(() => import('../components/pages/AppsPage'));
const DocsPage = React.lazy(() => import('../components/pages/DocsPage'));
const WorksPage = React.lazy(() => import('../components/pages/WorksPage'));
const DigitalShelfPage = React.lazy(() => import('../components/pages/DigitalShelfPage'));
const StackHunyDevPage = React.lazy(() => import('../components/pages/StackHunyDevPage'));
const MascotGalleryPage = React.lazy(() => import('../components/pages/MascotGalleryPage'));
const SplitSpeakerPage = React.lazy(() => import('../components/pages/SplitSpeakerPage'));
const BirdGeneratorPage = React.lazy(() => import('../components/pages/BirdGeneratorPage'));
const MultiVoiceReaderPage = React.lazy(() => import('../components/pages/MultiVoiceReaderPage'));
const ToDoGeneratorPage = React.lazy(() => import('../components/pages/ToDoGeneratorPage'));
const TextToPhonemePage = React.lazy(() => import('../components/pages/TextToPhonemePage'));
const WebWorkerPage = React.lazy(() => import('../components/pages/WebWorkerPage'));
const UIClonePage = React.lazy(() => import('../components/pages/UIClonePage'));
const ExtensionsPage = React.lazy(() => import('../components/pages/ExtensionsPage'));
const TextCleaningPage = React.lazy(() => import('../components/pages/TextCleaningPage'));
const AIBusinessCardPage = React.lazy(() => import('../components/pages/AIBusinessCardPage'));
const StickerGeneratorPage = React.lazy(() => import('../components/pages/StickerGeneratorPage'));
const ComicRestylerPage = React.lazy(() => import('../components/pages/ComicRestylerPage'));
const FaviconDistillerPage = React.lazy(() => import('../components/pages/FaviconDistillerPage'));
const CoverCrafterPage = React.lazy(() => import('../components/pages/CoverCrafterPage'));
const AvatarDistillerPage = React.lazy(() => import('../components/pages/AvatarDistillerPage'));
const ImageToSpeechPage = React.lazy(() => import('../components/pages/ImageToSpeechPage'));
const SceneToScriptPage = React.lazy(() => import('../components/pages/SceneToScriptPage'));

export type PageComponent =
  | React.ComponentType<PageProps>
  | React.LazyExoticComponent<React.ComponentType<PageProps>>;

export const PAGES: Record<string, { title: string; component: PageComponent; icon: React.ReactNode }> = {
  welcome: {
    title: 'Welcome',
    component: WelcomePage,
    icon: <img src={welcomeIcon} alt="Welcome" className="w-4 h-4 mr-2 rounded-sm" decoding="async" />,
  },
  docs: {
    title: 'docs',
    component: DocsPage,
    icon: <Icon name="file" className="mr-2" />,
  },
  domain: {
    title: 'tts-history.md',
    component: DomainPage,
    icon: <Icon name="file" className="mr-2" />,
  },
  works: {
    title: 'works.md',
    component: WorksPage,
    icon: <Icon name="file" className="mr-2" />,
  },
  stack: {
    title: 'stack-huny.dev',
    component: StackHunyDevPage,
    icon: <Icon name="file" className="mr-2" />,
  },
  'digital-shelf': {
    title: 'digital-shelf.json',
    component: DigitalShelfPage,
    icon: <Icon name="file" className="mr-2" />,
  },
  'todo-generator': {
    title: 'To-do Generator',
    component: ToDoGeneratorPage,
    icon: <Icon name="todoGenerator" className="mr-2" />,
  },
  'text-to-phoneme': {
    title: 'Text to Phoneme',
    component: TextToPhonemePage,
    icon: <Icon name="textToPhoneme" className="mr-2" />,
  },
  'web-worker': {
    title: 'Web Worker',
    component: WebWorkerPage,
    icon: <Icon name="webWorker" className="mr-2" />,
  },
  'text-cleaning': {
    title: 'Text Cleaning',
    component: TextCleaningPage,
    icon: <Icon name="textCleaning" className="mr-2" />,
  },
  'ai-business-card': {
    title: 'AI Business Card',
    component: AIBusinessCardPage,
    icon: <Icon name="aiBusinessCard" className="mr-2" />,
  },
  'sticker-generator': {
    title: 'Sticker Generator',
    component: StickerGeneratorPage,
    icon: <Icon name="stickerGenerator" className="mr-2" />,
  },
  'comic-restyler': {
    title: 'Comic Restyler',
    component: ComicRestylerPage,
    icon: <Icon name="comicRestyler" className="mr-2" />,
  },
  'favicon-distiller': {
    title: 'Favicon Distiller',
    component: FaviconDistillerPage,
    icon: <Icon name="favicon" className="mr-2" />,
  },
  'avatar-distiller': {
    title: 'Avatar Distiller',
    component: AvatarDistillerPage,
    icon: <Icon name="avatar" className="mr-2" />,
  },
  'cover-crafter': {
    title: 'Cover Crafter',
    component: CoverCrafterPage,
    icon: <Icon name="coverCrafter" className="mr-2" />,
  },
  'ui-clone': {
    title: 'UI Clone',
    component: UIClonePage,
    icon: <Icon name="uiClone" className="mr-2" />,
  },
  'multi-voice-reader': {
    title: 'MultiVoice Reader',
    component: MultiVoiceReaderPage,
    icon: <Icon name="multiVoiceReader" className="mr-2" />,
  },
  'image-to-speech': {
    title: 'Image to Speech',
    component: ImageToSpeechPage,
    icon: <Icon name="imageToSpeech" className="mr-2" />,
  },
  'scene-to-script': {
    title: 'Scene to Script',
    component: SceneToScriptPage,
    icon: <Icon name="sceneToScript" className="mr-2" />,
  },
  monitor: {
    title: 'monitor',
    component: MonitorPage,
    icon: <Icon name="monitor" className="mr-2" />,
  },
  'split-speaker': {
    title: 'Split Speaker',
    component: SplitSpeakerPage,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2 text-gray-400">
        <path d="M2 5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9l-4 3v-3H5a3 3 0 0 1-3-3z" />
        <path d="M14 10a3 3 0 0 0 3-3v-.5h2a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-1l-3 2.25V16h-1a3 3 0 0 1-3-3v-1z" opacity={0.65} />
      </svg>
    ),
  },
  'bird-generator': {
    title: 'Bird Generator',
    component: BirdGeneratorPage,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 mr-2 text-gray-400">
        <g fill="none" fillRule="evenodd">
          <path d="m12.594 23.258-.012.002-.071.035-.02.004-.014-.004-.071-.036q-.016-.004-.024.006l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427q-.004-.016-.016-.018m.264-.113-.014.002-.184.093-.01.01-.003.011.018.43.005.012.008.008.201.092q.019.005.029-.008l.004-.014-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014-.034.614q.001.018.017.024l.015-.002.201-.093.01-.008.003-.011.018-.43-.003-.012-.01-.01z" />
          <path fill="currentColor" d="M15 2a5 5 0 0 1 4.49 2.799l.094.201H21a1 1 0 0 1 .9 1.436l-.068.119-1.552 2.327a1 1 0 0 0-.166.606l.014.128.141.774c.989 5.438-3.108 10.451-8.593 10.606l-.262.004H3a1 1 0 0 1-.9-1.436l.068-.119L9.613 8.277A2.3 2.3 0 0 0 10 7a5 5 0 0 1 5-5m-3.5 9c-.271 0-.663.07-1.036.209c-.375.14-.582.295-.654.378l-3.384 5.077c.998-.287 2.065-.603 3.063-.994c1.067-.417 1.978-.892 2.609-1.446.612-.537.902-1.092.902-1.724a1.5 1.5 0 0 0-1.5-1.5M15 6a1 1 0 1 0 0 2a1 1 0 0 0 0-2" />
        </g>
      </svg>
    ),
  },
  project: {
    title: 'project.js',
    component: ProjectPage,
    icon: <Icon name="file" className="mr-2" />,
  },
  extensions: {
    title: 'extensions.txt',
    component: ExtensionsPage,
    icon: <Icon name="file" className="mr-2" />,
  },
  about: {
    title: 'about.json',
    component: AboutPage,
    icon: <Icon name="file" className="mr-2" />,
  },
  bookmark: {
    title: 'bookmarks.json',
    component: BookmarkPage,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4 mr-2 text-gray-400"
      >
        <path d="M6 3.5C6 2.67 6.67 2 7.5 2h9A1.5 1.5 0 0 1 18 3.5v16.77c0 .57-.63.92-1.11.6l-4.78-3.2a1.5 1.5 0 0 0-1.64 0l-4.78 3.2c-.48.32-1.11-.03-1.11-.6z" />
      </svg>
    ),
  },
  notes: {
    title: 'notes',
    component: NotesBoardPage,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        className="w-4 h-4 mr-2 text-gray-400"
      >
        <path d="M2.5 2A1.5 1.5 0 0 0 1 3.5v9A1.5 1.5 0 0 0 2.5 14h7.793l3.354-3.354A.5.5 0 0 0 14 10.293V3.5A1.5 1.5 0 0 0 12.5 2h-10Z" />
        <path d="M10.5 13.5V11a1 1 0 0 1 1-1h2.5" opacity={0.6} />
      </svg>
    ),
  },
};
