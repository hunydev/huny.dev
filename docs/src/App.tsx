import type { ReactNode } from 'react';
import { cvData } from './data';

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="section-card">
    <h2>{title}</h2>
    {children}
  </section>
);

function App() {
  const handlePrint = () => window.print();

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="kicker">Curriculum Vitae</p>
          <h1>
            {cvData.profile.name} <span>({cvData.profile.alias})</span>
          </h1>
          <p className="role">{cvData.profile.role}</p>
          <p className="summary">{cvData.profile.summary}</p>
        </div>
        <div className="hero-meta">
          <p>{cvData.profile.location}</p>
          <p>{cvData.profile.domain}</p>
          <div className="mini-card">
            <h3>Current Position</h3>
            <p>
              <strong>{cvData.profile.currentCompany.role}</strong>
            </p>
            <p>
              <a href={cvData.profile.currentCompany.website} target="_blank" rel="noreferrer">
                {cvData.profile.currentCompany.name}
              </a>
            </p>
            <p>{cvData.profile.currentCompany.period}</p>
          </div>
          <div className="links">
            {cvData.profile.links.map((item) => (
              <a key={item.href} href={item.href} target="_blank" rel="noreferrer">
                {item.label}
              </a>
            ))}
          </div>
          <button onClick={handlePrint} className="print-btn" type="button">
            PDF Export
          </button>
        </div>
      </header>

      <Section title="Current Company & Role">
        <article className="mini-card">
          <h3>
            {cvData.profile.currentCompany.name} · {cvData.profile.currentCompany.role}
          </h3>
          <p>{cvData.profile.currentCompany.period}</p>
          <ul>
            {cvData.profile.currentCompany.focus.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <ul>
            {cvData.profile.currentCompany.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </Section>

      <Section title="Core Competencies">
        <div className="grid-2">
          {cvData.competencies.map((group) => (
            <article key={group.title} className="mini-card">
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Professional Experience (Selected)">
        <div className="stack-list">
          {cvData.experience.map((exp) => (
            <article key={exp.title} className="mini-card">
              <h3>{exp.title}</h3>
              <ul>
                {exp.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <p className="chips">
                {exp.stacks.map((stack) => (
                  <span key={stack}>{stack}</span>
                ))}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Projects">
        <div className="stack-list">
          {cvData.projects.map((project) => (
            <article key={project.name} className="mini-card">
              <h3>{project.name}</h3>
              <p>{project.desc}</p>
              <ul>
                {project.links.map((link) => (
                  <li key={link}>
                    <a href={link} target="_blank" rel="noreferrer">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Technical Skills">
        <div className="skills-grid">
          <article>
            <h3>Languages</h3>
            <p>{cvData.skills.languages.join(' · ')}</p>
          </article>
          <article>
            <h3>Infra</h3>
            <p>{cvData.skills.infra.join(' · ')}</p>
          </article>
          <article>
            <h3>Tools</h3>
            <p>{cvData.skills.tools.join(' · ')}</p>
          </article>
          <article>
            <h3>Data</h3>
            <p>{cvData.skills.data.join(' · ')}</p>
          </article>
        </div>
      </Section>
    </div>
  );
}

export default App;
