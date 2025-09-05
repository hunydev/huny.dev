// TTS 기술 발전사 인포그래픽 웹페이지 스크립트

class TimelineManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId) || document.querySelector('.timeline-container');
        this.timelineItems = document.querySelectorAll('.timeline-item');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.modal = document.getElementById('modalOverlay');
        this.modalBody = document.getElementById('modalBody');
        this.modalClose = document.getElementById('modalClose');
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupScrollAnimation();
        this.animateTimelineEntry();
    }
    
    setupEventListeners() {
        // 필터 버튼 이벤트
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterByCategory(category);
                this.updateActiveFilter(e.target);
            });
        });
        
        // 타임라인 아이템 클릭 이벤트
        this.timelineItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.showItemDetails(item);
            });
            
            // 애니메이션 지연을 위한 CSS 변수 설정
            item.style.setProperty('--index', index);
        });
        
        // 모달 닫기 이벤트
        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => {
                this.hideItemDetails();
            });
        }
        
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.hideItemDetails();
                }
            });
        }
        
        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideItemDetails();
            }
        });
    }
    
    setupScrollAnimation() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, observerOptions);
        
        this.timelineItems.forEach(item => {
            observer.observe(item);
        });
    }
    
    async animateTimelineEntry() {
        // 페이지 로드 시 타임라인 아이템들을 순차적으로 애니메이션
        await new Promise(resolve => setTimeout(resolve, 500));
        
        this.timelineItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('animate');
            }, index * 200);
        });
    }
    
    filterByCategory(category) {
        this.timelineItems.forEach(item => {
            const itemCategory = item.dataset.category;
            
            if (category === 'all' || itemCategory === category) {
                item.classList.remove('hidden');
                item.classList.add('visible');
            } else {
                item.classList.add('hidden');
                item.classList.remove('visible');
            }
        });
    }
    
    updateActiveFilter(activeButton) {
        this.filterButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        activeButton.classList.add('active');
    }
    
    showItemDetails(item) {
        const year = item.querySelector('.timeline-year').textContent;
        const title = item.querySelector('.timeline-title').textContent;
        const description = item.querySelector('.timeline-description').textContent;
        const features = Array.from(item.querySelectorAll('.feature-tag')).map(tag => tag.textContent);
        const researchers = item.querySelector('.timeline-researchers');
        const companies = item.querySelector('.timeline-companies');
        
        let modalContent = `
            <h2 style="color: #667eea; margin-bottom: 1rem;">${year}</h2>
            <h3 style="margin-bottom: 1.5rem; font-size: 1.5rem;">${title}</h3>
            <p style="margin-bottom: 2rem; line-height: 1.7; color: #666;">${description}</p>
            
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: #333;">주요 특징</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${features.map(feature => `
                        <span style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem;">${feature}</span>
                    `).join('')}
                </div>
            </div>
        `;
        
        if (researchers) {
            modalContent += `
                <div style="margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                    ${researchers.innerHTML}
                </div>
            `;
        }
        
        if (companies) {
            modalContent += `
                <div style="margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                    ${companies.innerHTML}
                </div>
            `;
        }
        
        // 추가 상세 정보
        modalContent += this.getAdditionalInfo(item.dataset.year);
        
        this.modalBody.innerHTML = modalContent;
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    getAdditionalInfo(year) {
        const additionalInfo = {
            '1950': `
                <div style="margin-top: 2rem; padding: 1.5rem; background: #e8f4fd; border-radius: 10px; border-left: 4px solid #667eea;">
                    <h4 style="color: #667eea; margin-bottom: 1rem;">기술적 배경</h4>
                    <p style="color: #555; line-height: 1.6;">
                        1950년대는 컴퓨터 기술이 막 발전하기 시작한 시기로, 음성 합성은 순수한 학술적 호기심에서 출발했습니다. 
                        당시 컴퓨터의 처리 능력은 매우 제한적이었지만, 연구자들은 기계가 인간의 음성을 모방할 수 있다는 
                        가능성을 보여주었습니다.
                    </p>
                </div>
            `,
            '1961': `
                <div style="margin-top: 2rem; padding: 1.5rem; background: #e8f4fd; border-radius: 10px; border-left: 4px solid #667eea;">
                    <h4 style="color: #667eea; margin-bottom: 1rem;">역사적 의미</h4>
                    <p style="color: #555; line-height: 1.6;">
                        "데이지 벨" 프로젝트는 단순히 기술적 성취를 넘어 문화적 아이콘이 되었습니다. 
                        아서 C. 클라크의 소설 "2001: 스페이스 오디세이"에서 HAL 9000이 부르는 노래로 등장하며, 
                        인공지능과 음성 합성 기술의 상징이 되었습니다.
                    </p>
                </div>
            `,
            '1966': `
                <div style="margin-top: 2rem; padding: 1.5rem; background: #e8f4fd; border-radius: 10px; border-left: 4px solid #667eea;">
                    <h4 style="color: #667eea; margin-bottom: 1rem;">기술적 혁신</h4>
                    <p style="color: #555; line-height: 1.6;">
                        LPC(Linear Predictive Coding) 기술은 음성 신호를 효율적으로 분석하고 합성하는 방법을 제공했습니다. 
                        이 기술은 현재까지도 음성 처리의 기본 원리로 사용되고 있으며, 
                        디지털 음성 통신과 압축 기술의 토대가 되었습니다.
                    </p>
                </div>
            `,
            '2016': `
                <div style="margin-top: 2rem; padding: 1.5rem; background: #e8f4fd; border-radius: 10px; border-left: 4px solid #667eea;">
                    <h4 style="color: #667eea; margin-bottom: 1rem;">딥러닝 혁명</h4>
                    <p style="color: #555; line-height: 1.6;">
                        WaveNet은 원시 오디오 파형을 직접 생성하는 최초의 딥러닝 모델로, 
                        기존 TTS 시스템 대비 현저히 자연스러운 음성을 생성했습니다. 
                        이는 TTS 기술의 패러다임을 완전히 바꾸는 전환점이 되었습니다.
                    </p>
                </div>
            `,
            '2024': `
                <div style="margin-top: 2rem; padding: 1.5rem; background: #e8f4fd; border-radius: 10px; border-left: 4px solid #667eea;">
                    <h4 style="color: #667eea; margin-bottom: 1rem;">현재와 미래</h4>
                    <p style="color: #555; line-height: 1.6;">
                        현재의 TTS 기술은 단순한 텍스트 읽기를 넘어 감정 표현, 화자 복제, 
                        다국어 지원 등 다양한 고급 기능을 제공합니다. 
                        앞으로는 더욱 자연스럽고 개인화된 음성 합성 기술이 발전할 것으로 예상됩니다.
                    </p>
                </div>
            `
        };
        
        return additionalInfo[year] || '';
    }
    
    hideItemDetails() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    scrollToItem(itemId) {
        const item = document.querySelector(`[data-year="${itemId}"]`);
        if (item) {
            item.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // 하이라이트 효과
            item.style.transform = 'scale(1.05)';
            setTimeout(() => {
                item.style.transform = 'scale(1)';
            }, 300);
        }
    }
}

class AnimationController {
    constructor() {
        this.setupParallaxEffect();
        this.setupHoverEffects();
    }
    
    setupParallaxEffect() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.timeline-marker');
            
            parallaxElements.forEach((element, index) => {
                const speed = 0.5 + (index * 0.1);
                const yPos = -(scrolled * speed);
                element.style.transform = `translateX(-50%) translateY(${yPos}px)`;
            });
        });
    }
    
    setupHoverEffects() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        timelineItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                this.highlightItem(item);
            });
            
            item.addEventListener('mouseleave', () => {
                this.removeHighlight(item);
            });
        });
    }
    
    highlightItem(element) {
        const marker = element.querySelector('.timeline-marker');
        if (marker) {
            marker.style.transform = 'translateX(-50%) scale(1.3)';
            marker.style.boxShadow = '0 0 0 8px rgba(102, 126, 234, 0.3)';
        }
    }
    
    removeHighlight(element) {
        const marker = element.querySelector('.timeline-marker');
        if (marker) {
            marker.style.transform = 'translateX(-50%) scale(1)';
            marker.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.3)';
        }
    }
}

class ResponsiveHandler {
    constructor() {
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
    }
    
    handleResize() {
        const width = window.innerWidth;
        
        if (width <= 768) {
            this.adjustMobileLayout();
        } else {
            this.adjustDesktopLayout();
        }
    }
    
    adjustMobileLayout() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => {
            item.classList.add('mobile-layout');
        });
    }
    
    adjustDesktopLayout() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => {
            item.classList.remove('mobile-layout');
        });
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 로딩 애니메이션
    document.body.style.opacity = '0';
    
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
        
        // 메인 클래스들 초기화
        const timelineManager = new TimelineManager();
        const animationController = new AnimationController();
        const responsiveHandler = new ResponsiveHandler();
        
        // 전역 객체로 설정 (디버깅용)
        window.timelineManager = timelineManager;
        
    }, 100);
});

// 스크롤 위치 복원
window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('scrollPosition', window.scrollY);
});

window.addEventListener('load', () => {
    const scrollPosition = sessionStorage.getItem('scrollPosition');
    if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition));
        sessionStorage.removeItem('scrollPosition');
    }
});

// 성능 최적화를 위한 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 스크롤 이벤트 최적화
const optimizedScrollHandler = debounce(() => {
    // 스크롤 관련 처리
}, 16); // 60fps

window.addEventListener('scroll', optimizedScrollHandler);

export { TimelineManager, AnimationController, ResponsiveHandler };