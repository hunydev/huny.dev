import React from 'react';
import { PageProps } from '../../types';
import { RESUME_DATA } from './resumeData';
import jsPDF from 'jspdf';

const ResumePage: React.FC<PageProps> = () => {
  const [isExporting, setIsExporting] = React.useState(false);
  const resumeRef = React.useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (isExporting) return;

    setIsExporting(true);
    
    try {
      // PDF 생성 (A4 사이즈)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = margin;

      // 색상 정의
      const colors = {
        primary: [17, 24, 39],      // #111827
        secondary: [55, 65, 81],    // #374151
        muted: [107, 114, 128],     // #6b7280
        blue: [37, 99, 235],        // #2563eb
        green: [34, 197, 94],       // #22c55e
        purple: [168, 85, 247],     // #a855f7
        yellow: [234, 179, 8],      // #eab308
        cyan: [6, 182, 212],        // #06b6d4
        orange: [249, 115, 22],     // #f97316
        border: [229, 231, 235],    // #e5e7eb
      };

      // Helper 함수들
      const addText = (text: string, x: number, y: number, options: any = {}) => {
        const {
          size = 10,
          color = colors.secondary,
          font = 'helvetica',
          style = 'normal',
          align = 'left',
          maxWidth = contentWidth,
        } = options;
        
        pdf.setFont(font, style);
        pdf.setFontSize(size);
        pdf.setTextColor(color[0], color[1], color[2]);
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        
        if (align === 'left') {
          pdf.text(lines, x, y);
        } else if (align === 'right') {
          pdf.text(lines, x, y, { align: 'right' });
        }
        
        return y + (lines.length * size * 0.35);
      };

      const addLine = (x1: number, y1: number, x2: number, y2: number, color = colors.border) => {
        pdf.setDrawColor(color[0], color[1], color[2]);
        pdf.setLineWidth(0.3);
        pdf.line(x1, y1, x2, y2);
      };

      const addRect = (x: number, y: number, w: number, h: number, color: number[]) => {
        pdf.setFillColor(color[0], color[1], color[2]);
        pdf.rect(x, y, w, h, 'F');
      };

      const addSectionTitle = (title: string, y: number, accentColor: number[]) => {
        // 색상 바
        addRect(margin, y - 2, 2, 5, accentColor);
        
        // 제목
        addText(title, margin + 4, y + 2, {
          size: 14,
          color: colors.primary,
          style: 'bold',
        });
        
        return y + 8;
      };

      const checkPageBreak = (requiredSpace: number) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // =========================
      // Header - 개인 정보
      // =========================
      yPos = addText(RESUME_DATA.personal.name, margin, yPos, {
        size: 22,
        color: colors.primary,
        style: 'bold',
      });
      
      yPos = addText(RESUME_DATA.personal.title, margin, yPos + 2, {
        size: 12,
        color: colors.secondary,
      });

      yPos += 5;

      // 연락처 정보 (2열) - 이모지 대신 텍스트 레이블 사용
      const contactInfo = [
        { label: 'Email:', value: RESUME_DATA.personal.email },
        { label: 'Phone:', value: RESUME_DATA.personal.phone },
        { label: 'Location:', value: RESUME_DATA.personal.location },
        { label: 'Website:', value: RESUME_DATA.personal.website },
        { label: 'GitHub:', value: RESUME_DATA.personal.github },
        { label: 'LinkedIn:', value: RESUME_DATA.personal.linkedin },
      ];

      const colWidth = contentWidth / 2;
      let col = 0;
      let contactY = yPos;

      contactInfo.forEach((info) => {
        const x = margin + (col * colWidth);
        
        // 레이블 (굵게)
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
        pdf.text(info.label, x, contactY);
        
        // 값
        const labelWidth = pdf.getTextWidth(info.label);
        pdf.setFont('helvetica', 'normal');
        pdf.text(info.value, x + labelWidth + 1, contactY);
        
        col++;
        if (col >= 2) {
          col = 0;
          contactY += 5;
        }
      });

      yPos = contactY + 5;
      addLine(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;

      // =========================
      // Professional Summary
      // =========================
      yPos = addSectionTitle('Professional Summary', yPos, colors.blue);
      yPos = addText(RESUME_DATA.summary, margin, yPos + 1, {
        size: 10,
        color: colors.secondary,
      });
      yPos += 8;

      // =========================
      // Professional Experience
      // =========================
      checkPageBreak(30);
      yPos = addSectionTitle('Professional Experience', yPos, colors.green);
      
      RESUME_DATA.experience.forEach((exp, idx) => {
        checkPageBreak(40);
        
        // 회사명 & 기간
        addText(exp.position, margin + 2, yPos, {
          size: 11,
          color: colors.primary,
          style: 'bold',
        });
        
        addText(exp.period, pageWidth - margin, yPos, {
          size: 9,
          color: colors.muted,
          align: 'right',
        });
        
        yPos += 5;
        
        yPos = addText(`${exp.company} · ${exp.location}`, margin + 2, yPos, {
          size: 10,
          color: colors.secondary,
        });
        
        yPos += 3;
        
        // 업적
        exp.achievements.forEach((achievement) => {
          const bulletY = yPos - 1;
          pdf.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
          pdf.circle(margin + 4, bulletY, 0.6, 'F');
          
          yPos = addText(achievement, margin + 7, yPos, {
            size: 9,
            color: colors.secondary,
            maxWidth: contentWidth - 7,
          });
          yPos += 1;
        });
        
        yPos += 2;
        
        // 기술 스택
        const techText = exp.technologies.join(' · ');
        yPos = addText(techText, margin + 2, yPos, {
          size: 8,
          color: colors.muted,
        });
        
        yPos += 6;
      });

      // =========================
      // Education
      // =========================
      checkPageBreak(30);
      yPos = addSectionTitle('Education', yPos, colors.purple);
      
      RESUME_DATA.education.forEach((edu) => {
        checkPageBreak(15);
        
        addText(`${edu.degree} in ${edu.major}`, margin + 2, yPos, {
          size: 11,
          color: colors.primary,
          style: 'bold',
        });
        
        addText(edu.period, pageWidth - margin, yPos, {
          size: 9,
          color: colors.muted,
          align: 'right',
        });
        
        yPos += 5;
        
        yPos = addText(edu.school, margin + 2, yPos, {
          size: 10,
          color: colors.secondary,
        });
        
        if (edu.gpa) {
          yPos = addText(`GPA: ${edu.gpa}`, margin + 2, yPos + 1, {
            size: 9,
            color: colors.muted,
          });
        }
        
        yPos += 5;
      });

      // =========================
      // Technical Skills
      // =========================
      checkPageBreak(40);
      yPos = addSectionTitle('Technical Skills', yPos, colors.yellow);
      
      RESUME_DATA.skills.forEach((skillGroup) => {
        checkPageBreak(10);
        
        yPos = addText(skillGroup.category, margin + 2, yPos, {
          size: 10,
          color: colors.primary,
          style: 'bold',
        });
        
        yPos = addText(skillGroup.items.join(' · '), margin + 2, yPos + 1, {
          size: 9,
          color: colors.secondary,
        });
        
        yPos += 4;
      });

      // =========================
      // Key Projects
      // =========================
      checkPageBreak(30);
      yPos = addSectionTitle('Key Projects', yPos, colors.cyan);
      
      RESUME_DATA.projects.forEach((project) => {
        checkPageBreak(30);
        
        addText(project.name, margin + 2, yPos, {
          size: 11,
          color: colors.primary,
          style: 'bold',
        });
        
        if (project.link) {
          addText(project.link, pageWidth - margin, yPos, {
            size: 8,
            color: colors.blue,
            align: 'right',
          });
        }
        
        yPos += 5;
        
        yPos = addText(project.description, margin + 2, yPos, {
          size: 9,
          color: colors.secondary,
        });
        
        yPos += 2;
        
        project.highlights.forEach((highlight) => {
          const bulletY = yPos - 1;
          pdf.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
          pdf.circle(margin + 4, bulletY, 0.6, 'F');
          
          yPos = addText(highlight, margin + 7, yPos, {
            size: 9,
            color: colors.secondary,
            maxWidth: contentWidth - 7,
          });
          yPos += 1;
        });
        
        yPos += 2;
        
        const techText = project.technologies.join(' · ');
        yPos = addText(techText, margin + 2, yPos, {
          size: 8,
          color: colors.muted,
        });
        
        yPos += 6;
      });

      // =========================
      // Certifications
      // =========================
      if (RESUME_DATA.certifications && RESUME_DATA.certifications.length > 0) {
        checkPageBreak(20);
        yPos = addSectionTitle('Certifications', yPos, colors.orange);
        
        RESUME_DATA.certifications.forEach((cert) => {
          checkPageBreak(10);
          
          addText(cert.name, margin + 2, yPos, {
            size: 10,
            color: colors.primary,
            style: 'bold',
          });
          
          addText(cert.date, pageWidth - margin, yPos, {
            size: 9,
            color: colors.muted,
            align: 'right',
          });
          
          yPos += 4;
          
          yPos = addText(cert.issuer, margin + 2, yPos, {
            size: 9,
            color: colors.secondary,
          });
          
          yPos += 5;
        });
      }

      // PDF 다운로드
      pdf.save(`${RESUME_DATA.personal.name.replace(/\s/g, '_')}_Resume.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#1b1b1b] p-5 md:p-7 mb-6">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-semibold text-white">Resume</h1>
          <p className="mt-1 text-sm md:text-base text-gray-400">
            Professional resume template
          </p>
        </div>
      </div>

      {/* Template Notice */}
      <div className="mb-6 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
        <div className="flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5">
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9s-9-1.8-9-9s1.8-9 9-9z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-yellow-300 mb-1">Template Example</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              이 이력서는 실제 개인 정보가 아닌 <span className="text-yellow-400 font-medium">예시 템플릿</span>입니다. 
              레이아웃과 구조를 참고하여 실제 정보로 교체하실 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* Resume Content with Export Button */}
      <div className="relative">
        {/* Export PDF Button - 우측 상단 */}
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="absolute top-8 right-8 z-10 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors text-sm font-medium shadow-lg"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                <path d="M7 11l5 5l5 -5" />
                <path d="M12 4l0 12" />
              </svg>
              Export PDF
            </>
          )}
        </button>

        <div 
          ref={resumeRef}
          className="resume-container bg-[#1e1e1e] rounded-lg border border-white/10 p-8 md:p-12"
        >
        {/* Header */}
        <header className="border-b border-white/10 pb-6 mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">{RESUME_DATA.personal.name}</h1>
          <p className="text-xl text-gray-300 mb-4">{RESUME_DATA.personal.title}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span>📧</span>
              <span>{RESUME_DATA.personal.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📱</span>
              <span>{RESUME_DATA.personal.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>{RESUME_DATA.personal.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🌐</span>
              <span>{RESUME_DATA.personal.website}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔗</span>
              <span>{RESUME_DATA.personal.github}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💼</span>
              <span>{RESUME_DATA.personal.linkedin}</span>
            </div>
          </div>
        </header>

        {/* Summary */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-500 rounded" />
            Professional Summary
          </h2>
          <p className="text-gray-300 leading-relaxed">{RESUME_DATA.summary}</p>
        </section>

        {/* Experience */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-1 h-6 bg-green-500 rounded" />
            Professional Experience
          </h2>
          <div className="space-y-5">
            {RESUME_DATA.experience.map((exp, idx) => (
              <div key={idx} className="border-l-2 border-gray-700 pl-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{exp.position}</h3>
                    <p className="text-gray-300">{exp.company} · {exp.location}</p>
                  </div>
                  <span className="text-sm text-gray-400 md:text-right">{exp.period}</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-gray-400 text-sm mb-2">
                  {exp.achievements.map((achievement, i) => (
                    <li key={i}>{achievement}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1.5">
                  {exp.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-1 h-6 bg-purple-500 rounded" />
            Education
          </h2>
          <div className="space-y-3">
            {RESUME_DATA.education.map((edu, idx) => (
              <div key={idx} className="border-l-2 border-gray-700 pl-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{edu.degree} in {edu.major}</h3>
                    <p className="text-gray-300">{edu.school}</p>
                    {edu.gpa && <p className="text-sm text-gray-400">GPA: {edu.gpa}</p>}
                  </div>
                  <span className="text-sm text-gray-400">{edu.period}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-1 h-6 bg-yellow-500 rounded" />
            Technical Skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {RESUME_DATA.skills.map((skillGroup, idx) => (
              <div key={idx}>
                <h4 className="text-sm font-semibold text-gray-300 mb-1">{skillGroup.category}</h4>
                <p className="text-sm text-gray-400">{skillGroup.items.join(' · ')}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-1 h-6 bg-cyan-500 rounded" />
            Key Projects
          </h2>
          <div className="space-y-4">
            {RESUME_DATA.projects.map((project, idx) => (
              <div key={idx} className="border-l-2 border-gray-700 pl-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                  {project.link && (
                    <span className="text-xs text-blue-400">{project.link}</span>
                  )}
                </div>
                <p className="text-sm text-gray-300 mb-2">{project.description}</p>
                <ul className="list-disc list-inside space-y-0.5 text-sm text-gray-400 mb-2">
                  {project.highlights.map((highlight, i) => (
                    <li key={i}>{highlight}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        {RESUME_DATA.certifications && (
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-500 rounded" />
              Certifications
            </h2>
            <div className="space-y-2">
              {RESUME_DATA.certifications.map((cert, idx) => (
                <div key={idx} className="flex items-start justify-between border-l-2 border-gray-700 pl-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{cert.name}</h4>
                    <p className="text-sm text-gray-400">{cert.issuer}</p>
                  </div>
                  <span className="text-sm text-gray-400">{cert.date}</span>
                </div>
              ))}
            </div>
          </section>
        )}
        </div>
      </div>

      {/* PDF Light Mode Styles */}
      <style jsx>{`
        .resume-container[data-pdf-mode="true"] {
          background-color: #ffffff !important;
          border-color: #e5e7eb !important;
        }
        .resume-container[data-pdf-mode="true"] h1,
        .resume-container[data-pdf-mode="true"] h2,
        .resume-container[data-pdf-mode="true"] h3,
        .resume-container[data-pdf-mode="true"] h4 {
          color: #111827 !important;
        }
        .resume-container[data-pdf-mode="true"] p,
        .resume-container[data-pdf-mode="true"] span,
        .resume-container[data-pdf-mode="true"] li {
          color: #374151 !important;
        }
        .resume-container[data-pdf-mode="true"] .border-white\\/10 {
          border-color: #e5e7eb !important;
        }
        .resume-container[data-pdf-mode="true"] .border-gray-700 {
          border-color: #d1d5db !important;
        }
        .resume-container[data-pdf-mode="true"] .bg-gray-700 {
          background-color: #e5e7eb !important;
          color: #374151 !important;
        }
        .resume-container[data-pdf-mode="true"] .text-gray-300,
        .resume-container[data-pdf-mode="true"] .text-gray-400 {
          color: #4b5563 !important;
        }
        .resume-container[data-pdf-mode="true"] .text-blue-400 {
          color: #2563eb !important;
        }
      `}</style>
    </div>
  );
};

export default ResumePage;
