import React from 'react';
import { PageProps } from '../../types';

const AboutPage: React.FC<PageProps> = () => {
  const JsonLine = ({ field, value, isLink = false, comma = true, level = 1 }: { field: string, value: string, isLink?: boolean, comma?: boolean, level?: number }) => (
    <div style={{ paddingLeft: `${level * 1.5}rem` }}>
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

  const JsonArray = ({ field, items, level = 1 }: { field: string, items: string[], level?: number }) => (
     <div style={{ paddingLeft: `${level * 1.5}rem` }}>
        <span className="text-blue-400">"{field}"</span>
        <span className="text-gray-500">: [</span>
        <div className="pl-6">
            {items.map((item, index) => (
                 <span key={item} className="text-green-400">
                    "{item}"{index < items.length - 1 && <span className="text-gray-500">,</span>}
                </span>
            ))}
        </div>
        <span className="text-gray-500" style={{ paddingLeft: `${level * 1.5}rem` }}>],</span>
     </div>
  );

  return (
    <div className="font-mono text-base text-gray-300 leading-relaxed">
      <p className="text-gray-500">{`{`}</p>
      
      <JsonLine field="name" value="Huny" />
      <JsonLine field="title" value="Senior Frontend Engineer" />
      <JsonLine field="location" value="Seoul, South Korea" />
      
      <JsonArray field="skills" items={["React", "TypeScript", "Node.js", "Next.js", "UI/UX Design", "Gemini API", "Cloud Computing"]} />

      <div className="pl-6">
        <span className="text-blue-400">"bio"</span>
        <span className="text-gray-500">: </span>
        <span className="text-green-400">"A passionate developer with a knack for creating beautiful, functional, and user-centric web applications. I thrive on solving complex problems and continuously learning new technologies. My goal is to build software that not only works well but also provides an exceptional user experience."</span>
        <span className="text-gray-500">,</span>
      </div>

       <div className="pl-6">
        <span className="text-blue-400">"contact"</span>
        <span className="text-gray-500">: {`{`}</span>
        <JsonLine field="email" value="mailto:huny@example.com" isLink={true} level={2}/>
        <JsonLine field="github" value="https://github.com/hunydev" isLink={true} level={2}/>
        <JsonLine field="linkedin" value="https://linkedin.com/in/hunydev" isLink={true} comma={false} level={2}/>
        <span className="text-gray-500 pl-6">{`}`}</span>
      </div>

      <p className="text-gray-500">{`}`}</p>
    </div>
  );
};

export default AboutPage;
