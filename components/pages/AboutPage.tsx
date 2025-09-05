import React from 'react';
import { PageProps } from '../../types';

const AboutPage: React.FC<PageProps> = () => {
  const JsonLine = ({ field, value, isLink = false, comma = true, level = 1 }: { field: string, value: string, isLink?: boolean, comma?: boolean, level?: number }) => (
    <div style={{ paddingLeft: `${level * 1.0}rem` }}>
      <span className="text-blue-400">"{field}"</span>
      <span className="text-gray-500">: </span>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">"{value}"</a>
      ) : (
        <span className="text-green-400">"{value}"</span>
      )}
      {comma && <span className="text-gray-500">,</span>}
    </div>
  );

  const JsonArray = ({ field, items, comma = true, level = 1 }: { field: string, items: string[], comma?: boolean, level?: number }) => (
     <div style={{ paddingLeft: `${level * 1.0}rem` }}>
        <span className="text-blue-400">"{field}"</span>
        <span className="text-gray-500">: [</span>
        <div className="pl-6">
            {items.map((item, index) => (
                 <span key={item} className="text-green-400">
                    "{item}"{index < items.length - 1 && <span className="text-gray-500">,</span>}
                </span>
            ))}
        </div>
        {comma && <span className="text-gray-500">],</span>}
        {!comma && <span className="text-gray-500">]</span>}
     </div>
  );

  return (
    <div className="font-mono text-base text-gray-300 leading-relaxed">
      <p className="text-gray-500">{`{`}</p>

      <JsonLine field="name" value="Hun Jang" />
      <JsonLine field="alias" value="HunyDev" />
      <JsonLine field="domain" value="huny.dev" />
      <JsonLine field="title" value="AI 음성합성 개발자" />
      <JsonLine field="location" value="Seoul, South Korea" />

      <div className="pl-6">
        <span className="text-blue-400">"bio"</span>
        <span className="text-gray-500">: </span>
        <span className="text-green-400">
          "음성합성 솔루션 개발을 담당하며, 음성합성 추론 모델의 엔진화, SDK 및 서비스 개발에 집중하고 있습니다. 
          음성합성 분야에서의 전문성과 경험을 바탕으로 사용자에게 자연스럽고 고품질의 음성 서비스를 제공하는 것을 목표로 합니다. 
          업무 자동화와 AI에 관심이 많으며, 다양한 아이디어를 AI를 통해 현실화하여 개발부터 배포, 운영까지 전 과정을 경험하고 있습니다. 
          비록 Frontend UI/UX는 약하지만, AI의 도움으로 아이디어를 빠르게 실현하고 비즈니스 로직에 집중하며 열정적으로 개발을 이어가고 있습니다."
        </span>
        <span className="text-gray-500">,</span>
      </div>

      {/* expertise */}
      <div className="pl-6">
        <span className="text-blue-400">"expertise"</span>
        <span className="text-gray-500">: {`{`}</span>

        <JsonArray
          field="domain"
          items={["TTS", "AI"]}
          level={2}
        />
        <JsonArray
          field="development"
          items={["Software Engineering", "Backend Web Development", "Desktop Application Development", "Cloud Architecture & Deployment"]}
          level={2}
          comma={false}
        />

        <span className="text-gray-500">{`}`}</span>
        <span className="text-gray-500">,</span>
      </div>

      {/* languages */}
      <div className="pl-6">
        <span className="text-blue-400">"languages"</span>
        <span className="text-gray-500">: {`{`}</span>

        <JsonArray field="primary" items={["Go", "C"]} level={2} />
        <JsonArray field="extra" items={["Java", "C#", "Python", "JavaScript"]} level={2} comma={false} />

        <span className="text-gray-500">{`}`}</span>
        <span className="text-gray-500">,</span>
      </div>

      {/* environment */}
      <div className="pl-6">
        <span className="text-blue-400">"environment"</span>
        <span className="text-gray-500">: {`{`}</span>

        <JsonArray field="os" items={["Windows", "Linux"]} level={2} />
        <JsonArray field="ide" items={["Visual Studio Code", "Visual Studio", "Eclipse(STS)"]} level={2} />
        <JsonArray field="scm" items={["Git (GitHub)", "SVN"]} level={2} />
        <JsonArray field="ci_cd" items={["GitHub Actions", "Jenkins"]} level={2} />
        <JsonArray field="infra" items={["AWS", "Cloudflare"]} level={2} />
        <JsonArray field="platform" items={["Netlify", "Pikapods", "YouWare", "Google AI Studio"]} level={2} />
        <JsonArray field="ai_tools" items={["ChatGPT", "Copilot", "Gemini", "Windsurf"]} level={2} />
        <JsonArray field="docs" items={["Notion", "Confluence"]} level={2} />
        <JsonArray field="project" items={["Teams", "JIRA"]} level={2} />
        <JsonArray field="work" items={["Windows 11", "Microsoft 365"]} level={2} />
        <JsonArray field="chart" items={["Whimsical", "Draw.io"]} level={2} />
        <JsonArray field="web" items={["IIS", "Nginx", "Apache"]} level={2} />
        <JsonArray field="ssh" items={["SecureCRT", "Filezilla Pro"]} level={2} />
        <JsonArray field="blog" items={["BlogPro"]} level={2} comma={false} />

        <span className="text-gray-500">{`}`}</span>
        {/* 마지막 항목이므로 쉼표 없음 */}
      </div>

      <p className="text-gray-500">{`}`}</p>
    </div>

  );
};

export default AboutPage;
