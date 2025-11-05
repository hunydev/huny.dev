import React from 'react';
import { PageProps, ApiRequirement } from '../types';
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
const AppDetailPage = React.lazy(() => import('../components/pages/AppDetailPage'));
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
const TextToEmojiPage = React.lazy(() => import('../components/pages/TextToEmojiPage'));
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
const NonNativeKoreanTTSPage = React.lazy(() => import('../components/pages/NonNativeKoreanTTSPage'));
const SceneToScriptPage = React.lazy(() => import('../components/pages/SceneToScriptPage'));
const GearPage = React.lazy(() => import('../components/pages/GearPage'));
const InspirationGalleryPage = React.lazy(() => import('../components/pages/InspirationGalleryPage'));
const YouTubeChannelsPage = React.lazy(() => import('../components/pages/YouTubeChannelsPage'));
const AITierListPage = React.lazy(() => import('../components/pages/AITierListPage'));
const DesignSystemPage = React.lazy(() => import('../components/pages/DesignSystemPage'));

export type PageComponent =
  | React.ComponentType<PageProps>
  | React.LazyExoticComponent<React.ComponentType<PageProps>>;

export const PAGES: Record<string, { title: string; component: PageComponent; icon: React.ReactNode; apiRequirement?: ApiRequirement }> = {
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
  'design-system': {
    title: 'design-system.json',
    component: DesignSystemPage,
    icon: <Icon name="file" className="mr-2" />,
  },
  'todo-generator': {
    title: 'To-do Generator',
    component: ToDoGeneratorPage,
    icon: <Icon name="todoGenerator" className="mr-2" />,
    apiRequirement: { provider: 'gemini', features: ['text'] },
  },
  'ai-tier-list': {
    title: 'AI Tier List',
    component: AITierListPage,
    icon: <Icon name="aiTierList" className="mr-2" />,
    apiRequirement: { provider: 'gemini', features: ['text'] },
  },
  'text-to-phoneme': {
    title: 'Text to Phoneme',
    component: TextToPhonemePage,
    icon: <Icon name="textToPhoneme" className="mr-2" />,
    apiRequirement: { provider: 'gemini', features: ['text'] },
  },
  'text-to-emoji': {
    title: 'Text to Emoji',
    component: TextToEmojiPage,
    icon: <Icon name="textToEmoji" className="mr-2" />,
    apiRequirement: { provider: 'gemini', features: ['text'] },
  },
  'web-worker': {
    title: 'Web Worker',
    component: WebWorkerPage,
    icon: <Icon name="webWorker" className="mr-2" />,
    apiRequirement: { provider: 'gemini', features: ['text'] },
  },
  'text-cleaning': {
    title: 'Text Cleaning',
    component: TextCleaningPage,
    icon: <Icon name="textCleaning" className="mr-2" />,
    apiRequirement: { provider: 'gemini', features: ['text'] },
  },
  'ai-business-card': {
    title: 'AI Business Card',
    component: AIBusinessCardPage,
    icon: <Icon name="aiBusinessCard" className="mr-2" />,
    apiRequirement: { provider: 'gemini', features: ['image'] },
  },
  'sticker-generator': {
    title: 'Sticker Generator',
    component: StickerGeneratorPage,
    icon: <Icon name="stickerGenerator" className="mr-2" />,
    apiRequirement: { provider: 'gemini', features: ['image'] },
  },
  'comic-restyler': {
    title: 'Comic Restyler',
    component: ComicRestylerPage,
    icon: <Icon name="comicRestyler" className="mr-2" />,
    apiRequirement: { provider: 'gemini', features: ['image'] },
  },
  'favicon-distiller': {
    title: 'Favicon Distiller',
    component: FaviconDistillerPage,
    icon: <Icon name="favicon" className="mr-2" />,
    apiRequirement: { provider: 'gemini', features: ['image'] },
  },
  'avatar-distiller': {
    title: 'Avatar Distiller',
    component: AvatarDistillerPage,
    icon: <Icon name="avatar" className="mr-2" />,
    apiRequirement: { provider: 'gemini', features: ['image'] },
  },
  'cover-crafter': {
    title: 'Cover Crafter',
    component: CoverCrafterPage,
    icon: <Icon name="coverCrafter" className="mr-2" />,
    apiRequirement: { provider: 'gemini', features: ['image'] },
  },
  'ui-clone': {
    title: 'UI Clone',
    component: UIClonePage,
    icon: <Icon name="uiClone" className="mr-2" />,
    apiRequirement: { provider: 'gemini', features: ['text'] },
  },
  'multi-voice-reader': {
    title: 'MultiVoice Reader',
    component: MultiVoiceReaderPage,
    icon: <Icon name="multiVoiceReader" className="mr-2" />,
    apiRequirement: { provider: 'gemini', features: ['text', 'tts'] },
  },
  'image-to-speech': {
    title: 'Image to Speech',
    component: ImageToSpeechPage,
    icon: <Icon name="imageToSpeech" className="mr-2" />,
    apiRequirement: { provider: 'gemini', features: ['text', 'tts'] },
  },
  'non-native-korean-tts': {
    title: 'Non-Native Korean TTS',
    component: NonNativeKoreanTTSPage,
    icon: <Icon name="nonNativeKoreanTts" className="mr-2" />,
    apiRequirement: { provider: 'gemini', features: ['tts'] },
  },
  'scene-to-script': {
    title: 'Scene to Script',
    component: SceneToScriptPage,
    icon: <Icon name="sceneToScript" className="mr-2" />,
    apiRequirement: { provider: 'gemini', features: ['text', 'tts'] },
  },
  monitor: {
    title: 'monitor',
    component: MonitorPage,
    icon: <Icon name="monitor" className="mr-2" />,
  },
  'split-speaker': {
    title: 'Split Speaker',
    component: SplitSpeakerPage,
    icon: <Icon name="splitSpeaker" className="mr-2" />,
    apiRequirement: { provider: 'gemini', features: ['text'] },
  },
  'bird-generator': {
    title: 'Bird Generator',
    component: BirdGeneratorPage,
    icon: <Icon name="bird" className="mr-2" />,
    apiRequirement: { provider: 'openai', features: ['image'] },
  },
  mascot: {
    title: 'mascot.gallery',
    component: MascotGalleryPage,
    icon: <Icon name="file" className="mr-2" />,
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
  gear: {
    title: 'gear.json',
    component: GearPage,
    icon: <Icon name="file" className="mr-2" />,
  },
  inspiration: {
    title: 'inspiration.gallery',
    component: InspirationGalleryPage,
    icon: <Icon name="file" className="mr-2" />,
  },
  bookmark: {
    title: 'bookmarks.json',
    component: BookmarkPage,
    icon: <Icon name="bookmark" className="mr-2" />,
  },
  notes: {
    title: 'notes',
    component: NotesBoardPage,
    icon: <Icon name="note" className="mr-2" />,
  },
  apps: {
    title: 'apps',
    component: AppsPage,
    icon: <Icon name="apps" className="mr-2" />,
  },
  app: {
    title: 'app',
    component: AppDetailPage,
    icon: <Icon name="apps" className="mr-2" />,
  },
  'youtube-channels': {
    title: 'youtube-channels.json',
    component: YouTubeChannelsPage,
    icon: <Icon name="file" className="mr-2" />,
  },
};
