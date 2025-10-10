import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PageProps } from '../../types';
import { Icon } from '../../constants/icons';

// Basic data model migrated from extra/tts_history/index.html
// Categories: early | digital | ai

type TtsItem = {
  id: string;
  category: 'early' | 'digital' | 'ai';
  year: number; // numeric for sorting and scope checks
  yearLabel: string;
  title: string;
  description: string;
  features?: string[];
  researchers?: string[];
  companies?: string[];
  // Extended details for modal
  technicalDetails?: string; // 기술적 세부사항
  impact?: string; // 영향 및 중요성
  limitations?: string; // 한계점
  useCases?: string[]; // 사용 사례
  // For modern era items, provide audio samples and reference links
  samples?: Array<{ title: string; url: string }>;
  links?: Array<{ title: string; url: string }>;
};

const DATA: TtsItem[] = [
  // Early era (1950-1990)
  {
    id: '1950s',
    category: 'early',
    year: 1958,
    yearLabel: '1950년대 후반',
    title: '최초의 컴퓨터 기반 음성 합성',
    description: '최초의 컴퓨터 기반 음성 합성 시스템이 등장하며 TTS 기술의 시작을 알렸습니다.',
    features: ['컴퓨터 음성 합성', '기초 연구'],
    technicalDetails: '1950년대 후반, 컴퓨터를 이용한 최초의 음성 합성 실험이 시작되었습니다. 초기 시스템은 아날로그 회로와 디지털 신호 처리의 결합으로 구현되었으며, 기본적인 포먼트 합성(Formant Synthesis) 방식을 사용했습니다. 이는 인간의 성도(vocal tract)를 수학적으로 모델링하여 음성을 생성하는 방식으로, 주파수 영역에서 포먼트(공명 주파수)를 조작하여 소리를 만들어냈습니다.',
    impact: 'TTS 기술의 태동기로, 컴퓨터가 인간의 음성을 생성할 수 있다는 가능성을 최초로 입증했습니다. 이후 음성 합성 연구의 이론적 기반이 되었으며, 언어학, 음성학, 신호 처리 등 다학제적 연구의 시작점이 되었습니다.',
    limitations: '합성된 음성의 품질이 매우 낮고 로봇 같은 소리였으며, 실시간 처리가 불가능했습니다. 또한 매우 제한적인 어휘만 처리할 수 있었고, 하드웨어 비용이 극도로 높았습니다.',
    useCases: ['학술 연구', '음성학 실험', '인간-기계 인터페이스 개념 연구'],
  },
  {
    id: '1961-ibm704',
    category: 'early',
    year: 1961,
    yearLabel: '1961년',
    title: 'IBM 704 "데이지 벨" 프로젝트',
    description: '벨 연구소의 존 래리 켈리 주니어와 루이 거스트먼이 IBM 704 컴퓨터로 최초의 음성 합성에 성공했습니다.',
    features: ['IBM 704', '데이지 벨', '벨 연구소'],
    researchers: ['존 래리 켈리 주니어', '루이 거스트먼'],
    technicalDetails: 'IBM 704 메인프레임 컴퓨터를 사용하여 "Daisy Bell" 노래를 합성했습니다. 벨 연구소에서 개발한 보코더(Vocoder) 기술과 포먼트 합성 방식을 결합했으며, Kelly-Lochbaum vocal tract model을 사용하여 인간의 성도를 시뮬레이션했습니다. 이 시스템은 음성의 기본 주파수와 포먼트를 독립적으로 제어할 수 있었습니다.',
    impact: '세계 최초로 컴퓨터가 노래를 부른 역사적인 순간입니다. 이 성과는 스탠리 큐브릭 감독의 영화 "2001: 스페이스 오디세이"에서 HAL 9000이 부르는 "Daisy Bell" 장면에 영감을 주었습니다. 음성 합성이 단순한 실험실 연구를 넘어 문화적 영향력을 가질 수 있음을 보여준 첫 사례입니다.',
    limitations: '실시간이 아닌 배치 처리 방식으로, 몇 초의 음성을 생성하는 데 수 시간이 걸렸습니다. 음질은 여전히 기계적이었고, 멜로디와 리듬의 자연스러움이 부족했습니다.',
    useCases: ['음성 합성 연구', '컴퓨터 음악 실험', '인공지능 개념 증명'],
  },
  {
    id: '1966-lpc',
    category: 'early',
    year: 1966,
    yearLabel: '1966년',
    title: '선형 예측 부호화(LPC) 기술 개발',
    description: '나고야 대학과 NTT에서 음성 합성의 핵심 기술인 LPC 기술을 개발했습니다.',
    features: ['LPC', '음성 부호화', '신호 처리'],
    researchers: ['이타쿠라 후미타다', '사이토 슈조'],
    technicalDetails: 'Linear Predictive Coding(LPC)은 음성 신호의 현재 샘플을 과거 샘플들의 선형 조합으로 예측하는 방식입니다. 음성 신호를 여기 신호(excitation)와 성도 필터(vocal tract filter)로 분리하여 표현하며, 자기회귀(AR) 모델을 기반으로 합니다. LPC 계수는 레빈슨-더빈 재귀(Levinson-Durbin recursion) 알고리즘으로 효율적으로 계산됩니다.',
    impact: 'LPC는 음성 처리 분야에 혁명을 일으켰습니다. 음성 압축, 음성 인식, 음성 합성의 핵심 기술이 되었으며, 이후 수십 년간 표준 기술로 사용되었습니다. 적은 데이터로 음성을 효율적으로 표현할 수 있어 통신 및 저장 분야에서 광범위하게 활용되었습니다.',
    limitations: '무성음(unvoiced sound) 처리에 한계가 있었고, 고주파 영역의 정확도가 낮았습니다. 또한 pitch 정보를 별도로 처리해야 했으며, 자연스러운 운율(prosody) 구현이 어려웠습니다.',
    useCases: ['음성 압축 (CELP 코덱)', '음성 인식 전처리', '저전송률 통신', '초기 TTS 시스템'],
  },
  {
    id: '1975-lsp',
    category: 'early',
    year: 1975,
    yearLabel: '1975년',
    title: '라인 스펙트럴 페어스(LSP) 방법',
    description: '음성 합성 및 부호화 기술의 중요한 돌파구가 된 LSP 방법이 개발되었습니다.',
    features: ['LSP', '스펙트럴 분석', '기술적 혁신'],
    technicalDetails: 'Line Spectral Pairs(LSP)는 LPC 필터 계수를 주파수 영역의 라인 스펙트럼 쌍으로 변환하는 기법입니다. LPC 필터를 두 개의 대칭/비대칭 다항식으로 분해하여 그 근(roots)을 구하면 LSP 파라미터를 얻을 수 있습니다. LSP는 보간(interpolation) 시 안정성이 보장되고, 양자화 오류에 강건하며, 주파수 해석이 직관적입니다.',
    impact: 'LPC의 단점을 보완하여 음성 코딩의 효율성과 안정성을 크게 향상시켰습니다. 이후 대부분의 음성 코덱(GSM, CELP, AMR 등)에서 표준으로 채택되었으며, 현대 통신 시스템의 기반 기술이 되었습니다. 파라미터 보간 시 안정성이 보장되어 음성 변환 및 합성에서도 널리 사용되었습니다.',
    limitations: 'LSP 계산이 LPC보다 복잡하고 계산량이 많았습니다. 근을 찾는 과정에서 수치적 안정성 문제가 발생할 수 있었습니다.',
    useCases: ['이동통신 코덱 (GSM, AMR)', '음성 합성 파라미터 보간', 'VoIP 시스템', '음성 변환(Voice Conversion)'],
  },

  // Digital era (1990-2010)
  {
    id: '1990-unit-selection',
    category: 'digital',
    year: 1990,
    yearLabel: '1990년대 초',
    title: '음편 선택 합성 기술',
    description: 'Unit Selection Synthesis 기술이 등장하여 더욱 자연스러운 음성 합성이 가능해졌습니다.',
    features: ['Unit Selection', '연결합성', '자연스러운 음성'],
    technicalDetails: 'Unit Selection은 대량의 녹음 데이터베이스에서 가장 적합한 음성 단위(unit)를 선택하고 연결하여 음성을 합성하는 방식입니다. 음소(phoneme), 음절, 단어 등 다양한 크기의 단위를 사용하며, Target Cost(목표 특성과의 차이)와 Join Cost(연결 부조화)를 최소화하는 비터비 탐색 알고리즘을 사용합니다. 원본 녹음을 최대한 보존하기 때문에 매우 자연스러운 음질을 얻을 수 있습니다.',
    impact: '파라메트릭 방식에서 다이폰 기반(concatenative) 방식으로의 패러다임 전환을 가져왔습니다. 1990년대 후반부터 2010년대 초까지 상업용 TTS 시스템의 주류 기술이었으며, AT&T Natural Voices, IBM ViaVoice, Nuance Vocalizer 등 주요 제품에 적용되었습니다.',
    limitations: '대량의 녹음 데이터(일반적으로 10-20시간 분량)가 필요했고, 데이터베이스 구축 비용이 매우 높았습니다. 또한 데이터베이스에 없는 표현은 품질이 떨어졌으며, 음성 스타일이나 감정 조절이 어려웠습니다.',
    useCases: ['상업용 TTS 제품', '내비게이션 시스템', '스크린 리더', '콜센터 자동 응답'],
  },
  {
    id: '2000-dsp',
    category: 'digital',
    year: 2000,
    yearLabel: '2000년대',
    title: '디지털 음성 처리 기술 발전',
    description: '텍스트 정규화, 음소 변환, 운율 제어 등 디지털 음성 처리 기술이 크게 발전했습니다.',
    features: ['텍스트 정규화', '음소 변환', '운율 제어'],
    technicalDetails: '2000년대에는 TTS 파이프라인의 모든 단계가 체계화되었습니다. Text Normalization(숫자, 약어, 기호 처리), Grapheme-to-Phoneme(G2P) 변환, Prosody Prediction(피치, 지속시간, 강세 예측), 그리고 Waveform Generation으로 이루어진 모듈화된 시스템이 표준화되었습니다. 또한 PSOLA(Pitch Synchronous Overlap and Add) 같은 신호 처리 기법으로 운율 조절이 가능해졌습니다.',
    impact: 'TTS 시스템이 상업적으로 성숙하여 다양한 애플리케이션에 통합되었습니다. Festival, Mary TTS, eSpeak 등 오픈소스 프로젝트도 활발히 개발되었으며, 다국어 지원이 크게 확대되었습니다. 특히 보조 기술(Assistive Technology) 분야에서 시각 장애인을 위한 스크린 리더가 표준 기능이 되었습니다.',
    limitations: '여전히 규칙 기반 접근법의 한계로 인해 예외 처리가 복잡했고, 운율 예측의 정확도가 낮았습니다. 또한 각 모듈을 별도로 최적화해야 해서 전체 시스템의 일관성을 유지하기 어려웠습니다.',
    useCases: ['웹 브라우저 스크린 리더', 'GPS 내비게이션', '자동 응답 시스템(IVR)', 'e-러닝 플랫폼'],
  },

  // AI era (2010- )
  {
    id: '2016-wavenet',
    category: 'ai',
    year: 2016,
    yearLabel: '2016년',
    title: 'WaveNet 등장',
    description: 'Google DeepMind에서 개발한 WaveNet이 딥러닝 기반 TTS의 새로운 시대를 열었습니다.',
    features: ['WaveNet', '딥러닝', 'Google DeepMind'],
    companies: ['Google'],
    technicalDetails: 'WaveNet은 Dilated Causal Convolution을 사용하는 자기회귀(autoregressive) 생성 모델입니다. Raw audio waveform을 샘플 단위로 직접 생성하며, 각 샘플은 이전 모든 샘플에 조건화됩니다. Dilated convolution을 통해 지수적으로 증가하는 receptive field를 확보하여 장기 의존성을 학습합니다. Gated activation unit과 residual connection을 사용하여 깊은 네트워크 훈련이 가능합니다.',
    impact: 'TTS 기술의 패러다임을 완전히 바꿨습니다. 인간과 구별하기 어려운 수준의 음질을 달성했으며, Google Assistant에 통합되어 실제 제품으로 공개되었습니다. 이후 모든 딥러닝 기반 TTS 연구의 토대가 되었으며, vocoder 분야에서도 표준 기준이 되었습니다.',
    limitations: '샘플 단위 자기회귀 생성으로 인해 추론 속도가 매우 느리며(실시간보다 느림), 훈련에 막대한 계산 리소스가 필요했습니다. 또한 음성과 텍스트의 alignment 문제를 해결하기 위해서는 별도의 acoustic model이 필요했습니다.',
    useCases: ['Google Assistant', 'Google Cloud TTS', '고품질 오디오북', '게임 캐릭터 음성'],
    samples: [
      { title: 'WaveNet – DeepMind samples', url: 'https://deepmind.google/discover/blog/wavenet-a-generative-model-for-raw-audio/' },
    ],
    links: [
      { title: 'WaveNet paper (arXiv)', url: 'https://arxiv.org/abs/1609.03499' },
      { title: 'DeepMind blog', url: 'https://deepmind.google/discover/blog/wavenet-a-generative-model-for-raw-audio/' },
    ],
  },
  {
    id: '2017-tacotron',
    category: 'ai',
    year: 2017,
    yearLabel: '2017년',
    title: 'Tacotron 시리즈',
    description: 'End-to-end 음성 합성 모델인 Tacotron이 등장하여 텍스트에서 음성까지 직접 변환이 가능해졌습니다.',
    features: ['Tacotron', 'End-to-end', 'Attention 메커니즘'],
    technicalDetails: 'Tacotron은 Sequence-to-Sequence 아키텍처에 Attention 메커니즘을 결합한 모델입니다. Character 또는 phoneme sequence를 입력받아 mel-spectrogram을 직접 생성합니다. CBHG(Convolution Bank + Highway network + GRU) 모듈로 텍스트를 인코딩하고, Location-sensitive attention으로 alignment를 학습하며, Decoder는 mel-spectrogram 프레임을 순차적으로 생성합니다. Tacotron 2는 여기에 WaveNet vocoder를 결합하여 최종 waveform을 생성합니다.',
    impact: 'Text-to-Speech를 진정한 End-to-End 학습으로 구현한 최초의 성공적인 모델입니다. 기존의 복잡한 다단계 파이프라인을 단일 신경망으로 대체했으며, 훈련 데이터만 있으면 자동으로 alignment와 prosody를 학습합니다. Google, Microsoft, Amazon 등 주요 기업의 TTS 제품에 적용되었으며, 현재도 많은 연구의 기반이 되고 있습니다.',
    limitations: 'Attention 메커니즘의 불안정성으로 인해 긴 문장에서 단어를 건너뛰거나 반복하는 문제가 발생할 수 있었습니다. 또한 WaveNet vocoder를 사용하면 추론 속도가 느렸으며, 다화자 학습에는 효율적이지 않았습니다.',
    useCases: ['클라우드 TTS 서비스', '음성 비서', '오디오북 제작', '모바일 앱 음성 기능'],
    samples: [
      { title: 'Tacotron samples', url: 'https://google.github.io/tacotron/' },
    ],
    links: [
      { title: 'Tacotron paper (arXiv)', url: 'https://arxiv.org/abs/1703.10135' },
    ],
  },
  {
    id: '2020-emotion',
    category: 'ai',
    year: 2020,
    yearLabel: '2020년대',
    title: '실시간 감정 표현 TTS',
    description: '감정과 억양을 실시간으로 조절할 수 있는 고도화된 TTS 기술이 개발되었습니다.',
    features: ['감정 표현', '실시간 처리', '억양 제어'],
    technicalDetails: '감정 TTS는 세 가지 주요 기술로 구현됩니다: 1) Style Token을 통한 감정 임베딩(Global Style Tokens, GST), 2) Reference Audio를 사용하는 스타일 전이(Style Transfer), 3) Variational Autoencoder(VAE)를 사용한 다양성 모델링. 이러한 기술들은 Tacotron 같은 기본 모델에 통합되어 행복, 슬픔, 화남, 침착 등의 감정을 표현할 수 있습니다. 또한 SSML(Speech Synthesis Markup Language)을 통해 사용자가 세밀하게 제어할 수 있습니다.',
    impact: 'TTS가 단순한 정보 전달을 넘어 감성적 커뮤니케이션 도구로 진화했습니다. 오디오북, 팟캐스트, 게임, 커스터머 서비스 분야에서 활발히 활용되고 있으며, Azure Neural TTS, Google Cloud TTS, Amazon Polly 등 주요 클라우드 서비스에서 기본 기능으로 제공됩니다. 실시간 처리가 가능해져 대화형 AI 에이전트에서도 활용됩니다.',
    limitations: '감정 표현의 다양성과 미묘한 뉘앙스 표현에는 여전히 한계가 있습니다. 또한 문화권별 감정 표현 차이를 고려하기 어려우며, 특정 도메인(예: 비즈니스 vs. 캐주얼)에 특화된 학습이 필요합니다.',
    useCases: ['오디오북 & 팟캐스트', '게임 NPC 대화', 'AI 커스터머 서비스', '심리 치료 봇', 'e-러닝 콘텐츠'],
    samples: [
      { title: 'Azure Neural TTS demo', url: 'https://azure.microsoft.com/en-us/products/cognitive-services/text-to-speech/#demo' },
      { title: 'Google Cloud TTS demo', url: 'https://cloud.google.com/text-to-speech?hl=ko#section-tryit' },
    ],
    links: [
      { title: 'Azure Neural TTS docs', url: 'https://learn.microsoft.com/azure/ai-services/speech-service/text-to-speech' },
      { title: 'Google Cloud TTS docs', url: 'https://cloud.google.com/text-to-speech/docs?hl=ko' },
      { title: 'Amazon Polly (Neural) overview', url: 'https://aws.amazon.com/polly/' },
    ],
  },
  {
    id: '2024-modern',
    category: 'ai',
    year: 2024,
    yearLabel: '2024년',
    title: '최신 AI TTS 모델들',
    description: 'ChatTTS, Mars5 TTS, MetaVoice, Parler TTS 등 다양한 특화 기능을 가진 최신 모델들이 등장했습니다.',
    features: ['ChatTTS', 'Mars5 TTS', 'MetaVoice', 'Parler TTS'],
    companies: ['Google', 'Apple', 'Amazon', 'Microsoft', 'iFlytek', 'Baidu'],
    technicalDetails: '2024년 현재 TTS는 여러 방향으로 특화되고 있습니다. **ChatTTS**는 대화형 시나리오에 최적화되어 자연스러운 운율과 감정 표현이 가능하며, 웃음소리, 말더듬 등 비언어적 요소도 생성할 수 있습니다. **Mars5 TTS**는 Few-shot 학습으로 5초 미만의 참조 오디오만으로 음성을 복제할 수 있습니다. **MetaVoice**는 1B 파라미터 규모의 대형 모델로 감정 제어에 강점이 있습니다. **Parler-TTS**는 자연어로 음성 특성을 기술하여("낮고 차분한 남성 목소리로...") 원하는 스타일을 생성할 수 있습니다. 또한 Transformer 기반 모델(VALL-E, AudioLM)과 Diffusion 기반 모델(Grad-TTS, DiffWave)도 활발히 연구되고 있습니다.',
    impact: 'TTS 기술이 민주화되어 소규모 팀이나 개인도 고품질 음성 합성을 활용할 수 있게 되었습니다. 오픈소스 모델들이 Hugging Face에 공개되어 접근성이 크게 향상되었으며, 다양한 언어와 방언 지원이 확대되고 있습니다. 특히 Zero-shot/Few-shot 학습이 가능해져 새로운 화자의 음성을 적은 데이터로 학습할 수 있게 되었습니다. 콘텐츠 제작, 교육, 엔터테인먼트 등 다양한 분야에서 창의적으로 활용되고 있습니다.',
    limitations: '고품질 음성 복제 기술로 인한 딥페이크 및 보이스 피싱 등 악용 가능성이 높아졌습니다. 윤리적, 법적 규제가 기술 발전 속도를 따라가지 못하고 있으며, 음성 인증 시스템의 보안 취약성이 우려됩니다. 또한 대형 모델의 경우 막대한 계산 리소스가 필요하여 환경적 영향과 비용 문제가 있습니다. 방언이나 소수 언어에 대한 지원은 여전히 부족합니다.',
    useCases: ['콘텐츠 크리에이터 도구', '다국어 더빙', '개인화된 음성 비서', '게임 및 메타버스', '접근성 도구', 'AI 인플루언서', '교육 콘텐츠 제작'],
    samples: [
      { title: 'ChatTTS — Hugging Face Space', url: 'https://huggingface.co/spaces/2Noise/ChatTTS' },
      { title: 'Parler-TTS — Hugging Face Space', url: 'https://huggingface.co/spaces/parler-tts/parler-tts' },
      { title: 'MetaVoice — Demos', url: 'https://metavoice.ai' },
    ],
    links: [
      { title: 'ChatTTS — GitHub', url: 'https://github.com/2noise/ChatTTS' },
      { title: 'Parler-TTS — GitHub', url: 'https://github.com/huggingface/parler-tts' },
    ],
  },
];

const FILTERS = [
  { id: 'all', label: '전체' },
  { id: 'early', label: '초기 발전 (1950-1990)' },
  { id: 'digital', label: '디지털 시대 (1990-2010)' },
  { id: 'ai', label: 'AI 시대 (2010-현재)' },
] as const;

// IntersectionObserver 기반 간단한 in-view 훅 (map 내부 훅 사용 회피를 위해 컴포넌트로 캡슐화)
function useInView<T extends HTMLElement>(): { ref: React.MutableRefObject<T | null>; inView: boolean } {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setInView(true);
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

type TimelineItemProps = {
  item: TtsItem;
  showDivider: boolean;
  onOpen: (item: TtsItem, opener?: HTMLElement | null) => void;
};

const TimelineItem: React.FC<TimelineItemProps> = ({ item, showDivider, onOpen }) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <>
      {showDivider && (
        <li className="relative">
          <div className="absolute -left-1.5 md:-left-2 top-1.5 w-3 h-3 md:w-4 md:h-4 rounded-full bg-blue-500/30 ring-2 ring-blue-500/40" />
          <div className="ml-6 md:ml-8 mb-1 text-xs md:text-[13px] uppercase tracking-wide text-blue-300/90">
            2015년 이후 · 나의 TTS 도메인 전문 영역 (Modern AI Era)
          </div>
        </li>
      )}

      <li className="relative">
        {/* marker */}
        <div
          className={`absolute -left-2 md:-left-2.5 top-2 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 ${
            item.category === 'early'
              ? 'bg-amber-400/40 border-amber-300/60'
              : item.category === 'digital'
              ? 'bg-teal-400/40 border-teal-300/60'
              : 'bg-rose-400/40 border-rose-300/60'
          }`}
        />

        <div
          ref={ref}
          onClick={() => onOpen(item, ref.current)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') onOpen(item, ref.current); }}
          className={`ml-6 md:ml-8 p-3 md:p-4 rounded border shadow-sm transition-all duration-500 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          } ${item.year >= 2015 ? 'bg-white/5 border-blue-400/20' : 'bg-white/5 border-white/10'}`}
        >
          <div className="text-xs md:text-sm text-gray-400">{item.yearLabel}</div>
          <h3 className="mt-0.5 text-base md:text-lg font-medium text-white">{item.title}</h3>
          <p className="mt-1 text-sm md:text-[15px] text-gray-300">{item.description}</p>

          {item.features && item.features.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.features.map((t) => (
                <span key={t} className="text-[11px] md:text-xs px-2 py-0.5 rounded bg-white/10 text-gray-200">
                  {t}
                </span>
              ))}
            </div>
          )}

          {item.researchers && item.researchers.length > 0 && (
            <div className="mt-2 text-xs md:text-sm text-gray-300">
              <strong className="text-gray-200">주요 연구자:</strong> {item.researchers.join(', ')}
            </div>
          )}
          {item.companies && item.companies.length > 0 && (
            <div className="mt-1 text-xs md:text-sm text-gray-300">
              <strong className="text-gray-200">주요 기업:</strong> {item.companies.join(', ')}
            </div>
          )}
        </div>
      </li>
    </>
  );
};

const DomainPage: React.FC<PageProps> = () => {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [selectedItem, setSelectedItem] = useState<TtsItem | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  const items = useMemo(() => {
    const sorted = [...DATA].sort((a, b) => a.year - b.year);
    if (activeFilter === 'all') return sorted;
    return sorted.filter(i => i.category === activeFilter);
  }, [activeFilter]);

  const firstModernIdx = useMemo(() => items.findIndex(i => i.year >= 2015), [items]);

  // ESC로 모달 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedItem(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // 모달 오픈 시 포커스 이동, 닫힐 때 복원
  useEffect(() => {
    if (!selectedItem) return;
    const el = modalRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      const focusables = Array.from(
        el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter((n): n is HTMLElement => n instanceof HTMLElement);
      (focusables[0] ?? el).focus();
    });
    return () => cancelAnimationFrame(id);
  }, [selectedItem]);

  const handleModalKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const el = modalRef.current;
    if (!el) return;
    const focusable = Array.from(
      el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    )
      .filter((n): n is HTMLElement => n instanceof HTMLElement)
      .filter((n) => !n.hasAttribute('disabled') && n.tabIndex !== -1);
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement as HTMLElement | null;
    if (e.shiftKey) {
      if (current === first || !el.contains(current)) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (current === last) {
        first.focus();
        e.preventDefault();
      }
    }
  };

  const openItem = (item: TtsItem, opener?: HTMLElement | null) => {
    lastFocusRef.current = opener ?? (document.activeElement as HTMLElement | null);
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
    const opener = lastFocusRef.current;
    lastFocusRef.current = null;
    if (opener) setTimeout(() => opener.focus(), 0);
  };

  return (
    <div className="min-h-full">
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#1b1b1b] p-5 md:p-7">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold text-white">TTS History</h1>
          <p className="mt-1 text-sm md:text-base text-gray-400">TTS 음성합성 기술의 역사적 발전 · 1950s → Present</p>
          <p className="mt-2 text-xs md:text-sm text-blue-300/90">2015년 이후: 나의 TTS 도메인 전문 영역</p>
        </div>
      </div>

      <div className="mt-6 max-w-5xl mx-auto">
      <nav className="mb-6">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`text-xs md:text-sm px-3 py-1.5 rounded border transition-colors ${
                activeFilter === f.id
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-transparent border-white/10 text-gray-300 hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </nav>

      <section className="relative pl-7 md:pl-8">
        {/* Vertical line */}
        <div className="absolute left-2 md:left-3 top-0 bottom-0 w-px bg-white/10" />

        <ul className="space-y-4">
          {items.map((item, idx) => (
            <TimelineItem
              key={item.id}
              item={item}
              showDivider={firstModernIdx === idx}
              onOpen={openItem}
            />
          ))}
        </ul>
      </section>
      </div>

      {/* Modal overlay */}
      {selectedItem && (
        <div className="fixed inset-0 z-50" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="timeline-modal-title"
            ref={modalRef}
            onKeyDown={handleModalKeyDown}
            className="relative mx-auto mt-12 md:mt-20 w-[min(92vw,840px)] max-h-[85vh] bg-[#252526] border border-white/10 rounded-lg shadow-xl overflow-hidden text-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 p-4 border-b border-white/10 sticky top-0 bg-[#252526] z-10">
              <div className="shrink-0 mt-0.5">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedItem.category === 'early'
                    ? 'bg-amber-400/40 border-amber-300/60'
                    : selectedItem.category === 'digital'
                    ? 'bg-teal-400/40 border-teal-300/60'
                    : 'bg-rose-400/40 border-rose-300/60'
                }`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-gray-400">{selectedItem.yearLabel}</div>
                <h3 id="timeline-modal-title" className="text-lg font-semibold text-white">{selectedItem.title}</h3>
              </div>
              <button
                onClick={closeModal}
                className="ml-2 p-1.5 rounded hover:bg-white/10 text-gray-300"
                aria-label="닫기"
                title="닫기"
              >
                <Icon name="close" className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(85vh-80px)] space-y-4">
              <div>
                <p className="text-sm text-gray-300 leading-relaxed">{selectedItem.description}</p>
                {selectedItem.features && selectedItem.features.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selectedItem.features.map((t) => (
                      <span key={t} className="text-[11px] md:text-xs px-2 py-0.5 rounded bg-white/10 text-gray-200">{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {selectedItem.technicalDetails && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-blue-300 mb-2">🔧 기술적 세부사항</h4>
                  <p className="text-xs md:text-sm text-gray-300 leading-relaxed">{selectedItem.technicalDetails}</p>
                </div>
              )}

              {selectedItem.impact && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-green-300 mb-2">💡 영향 및 중요성</h4>
                  <p className="text-xs md:text-sm text-gray-300 leading-relaxed">{selectedItem.impact}</p>
                </div>
              )}

              {selectedItem.limitations && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-amber-300 mb-2">⚠️ 한계점</h4>
                  <p className="text-xs md:text-sm text-gray-300 leading-relaxed">{selectedItem.limitations}</p>
                </div>
              )}

              {selectedItem.useCases && selectedItem.useCases.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-purple-300 mb-2">🎯 사용 사례</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItem.useCases.map((uc) => (
                      <span key={uc} className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-400/30">{uc}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedItem.researchers && selectedItem.researchers.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-gray-200 mb-1">👨‍🔬 주요 연구자</h4>
                    <p className="text-xs text-gray-300">{selectedItem.researchers.join(', ')}</p>
                  </div>
                )}
                {selectedItem.companies && selectedItem.companies.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-gray-200 mb-1">🏢 주요 기업</h4>
                    <p className="text-xs text-gray-300">{selectedItem.companies.join(', ')}</p>
                  </div>
                )}
              </div>

              {selectedItem.samples && selectedItem.samples.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-200 mb-2">🎵 음성 샘플</h4>
                  <ul className="space-y-1.5">
                    {selectedItem.samples.map((s) => (
                      <li key={s.url} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <a href={s.url} target="_blank" rel="noopener" className="text-xs md:text-sm text-blue-300 hover:text-blue-200 hover:underline">{s.title}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedItem.links && selectedItem.links.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-200 mb-2">📚 레퍼런스</h4>
                  <ul className="space-y-1.5">
                    {selectedItem.links.map((l) => (
                      <li key={l.url} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <a href={l.url} target="_blank" rel="noopener" className="text-xs md:text-sm text-blue-300 hover:text-blue-200 hover:underline">{l.title}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="mt-10 text-[12px] text-gray-500">
        <p>© 2025 TTS 기술 발전사 — 교육 목적으로 제작되었습니다.</p>
      </footer>
    </div>
  );
};

export default DomainPage;
