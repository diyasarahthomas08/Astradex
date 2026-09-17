import React, { useRef, useState } from 'react';
import { AnimatedCounter, SkeletonLoader, EmptyState } from './components/UIUtils';
import { useNavigate, Link } from 'react-router-dom';
import heroIllustration from './assets/hero-illustration.svg';
import iconLive from './assets/icon-live.svg';
import iconProgress from './assets/icon-progress.svg';
import iconSecure from './assets/icon-secure.svg';
import avatarPlaceholder from './assets/avatar-placeholder.svg';
import logoLight from './assets/logo-light.png';
import logoDark from './assets/logo-dark.png';
import { useTheme } from './context/ThemeContext';
import { courses } from './data/courses';

// Scroll animation hook
// Simplified: Always visible (debug mode)
function useScrollAnimation() {
  const domRef = useRef();
  const [isVisible, setVisible] = useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        setVisible(entry.isIntersecting);
      });
    }, { threshold: 0.1 });

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => {
      if (domRef.current) {
        observer.unobserve(domRef.current);
      }
    };
  }, []);

  return [domRef, isVisible];
}

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="brand">
        <img
          src={theme === 'light' ? logoLight : logoDark}
          alt="Astradex Logo"
          style={{ height: '40px', objectFit: 'contain' }}
        />
      </div>

      {/* Navigation Menu - Center */}
      <nav className={menuOpen ? 'nav-menu open' : 'nav-menu'}>
        <ul>
          {['Home', 'Courses', 'About', 'Contact'].map(
            (link) => (
              <li key={link}>
                {link === 'Courses' ? (
                  <Link to="/courses" onClick={() => setMenuOpen(false)}>
                    {link}
                  </Link>
                ) : (
                  <a
                    href={link === 'Home' ? '#' : `#${link.toLowerCase().replace(' ', '-')}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link}
                  </a>
                )}
              </li>
            )
          )}
          <li>
            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
            >
              Register
            </Link>
          </li>

          <li>
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          </li>
        </ul>
      </nav>

      {/* Controls (Toggle + Hamburger) - Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={toggleTheme}
          className="btn-secondary"
          style={{
            padding: '0',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--border-color)',
            background: 'transparent'
          }}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-main)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-main)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          )}
        </button>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          aria-label="Toggle menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>
    </header>
  );
};

const HeroSection = () => {
  const [ref, visible] = useScrollAnimation();
  const navigate = useNavigate();

  return (
    <section
      id="home"
      ref={ref}
      className={visible ? 'hero-section visible' : 'hero-section'}
    >
      <div className="hero-grid">
        <div className="hero-text">
          <p className="badge-pill">Board Exam Prep • 11th &amp; 12th</p>
          <h1 className="heading-large">Master Your Exams Like a Pro</h1>
          <p className="paragraph-main">
            Join 10,000+ students learning with live classes, exam-style practice and real-time progress tracking.
          </p>
          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={() => navigate('/register')}
              type="button"
            >
              Get Started
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate('/courses')}
              type="button"
            >
              Explore Courses
            </button>
          </div>
          <p className="hero-extra">
            4.9★ rating from 1000+ students &nbsp;|&nbsp; 98% board exam pass rate
          </p>
        </div>
        <div className="hero-media">
          <img
            src={heroIllustration}
            alt="Abstract learning visualization"
            className="hero-illustration hero-illustration-float"
            width={320}
            height={220}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      title: 'Live Interactive Classes',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#icon-gradient)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.5 7.5a2.5 2.5 0 0 0-2.5-2.5h-16a2.5 2.5 0 0 0-2.5 2.5v9a2.5 2.5 0 0 0 2.5 2.5h16a2.5 2.5 0 0 0 2.5-2.5v-9z"></path>
          <path d="M7 11.5l2 2 4-4"></path>
          <circle cx="18" cy="8" r="1" fill="url(#icon-gradient)">
            <animate attributeName="opacity" values="1;0;1" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </svg>
      ),
      description: 'Dynamic, real-time sessions with India\'s top examiners and subject specialists.'
    },
    {
      title: 'AI-Powered Practice',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#icon-gradient)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          <path d="M12 22V12"></path>
          <circle cx="12" cy="7" r="1.5" fill="url(#icon-gradient)"></circle>
        </svg>
      ),
      description: 'Machine-learning algorithms that adapt quizzes to your unique learning curve.'
    },
    {
      title: 'Expert Faculty',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#icon-gradient)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
          <path d="M6 12v5c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-5"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      ),
      description: 'Mentorship from elite educators with decades of proven board exam success.'
    },
    {
      title: 'Real-Time Progress',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#icon-gradient)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"></path>
          <path d="M14 10l2 2 4-4"></path>
          <path d="M8 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
          <path d="M13 21h7"></path>
          <path d="M13 18h4"></path>
        </svg>
      ),
      description: 'Holistic performance analytics that visualisize your strengths and exam readiness.'
    },
    {
      title: 'Learn Anywhere',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#icon-gradient)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <path d="M12 18h.01"></path>
          <path d="M9 6h6"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      ),
      description: 'Seamless cross-device learning optimized for smartphones, tablets, and PCs.'
    },
    {
      title: '100% Secure',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#icon-gradient)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          <circle cx="12" cy="16" r="1.5" fill="url(#icon-gradient)"></circle>
        </svg>
      ),
      description: 'Bank-grade encryption protecting your personal data and transaction history.'
    }
  ];

  const [ref, visible] = useScrollAnimation();

  return (
    <section
      id="about"
      ref={ref}
      className={`section why-section ${visible ? 'visible' : ''}`}
    >
      <h2 className="heading-medium">Why Choose Astradex?</h2>
      <p className="section-subtitle">
        Everything you need to top your 11th and 12th board exams, in one modern learning platform.
      </p>
      <div className={visible ? 'features-grid visible' : 'features-grid'}>
        {features.map(({ title, icon, description }) => (
          <div key={title} className="card feature-card">
            <div className="feature-icon-wrapper">
              {icon}
            </div>
            <h3 className="feature-title">{title}</h3>
            <p className="feature-desc">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const CoursesPreview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // For future API integration
  const [ref, visible] = useScrollAnimation();
  const featured = courses.slice(0, 3);

  return (
    <section id="courses" ref={ref} className={visible ? 'visible' : ''}>
      <h2 className="heading-medium">Featured Courses</h2>
      <div className={visible ? 'courses-grid visible' : 'courses-grid'}>
        {loading
          ? Array(3).fill(0).map((_, i) => <SkeletonLoader key={i} height={180} />)
          : featured.length === 0
            ? <EmptyState message="No featured courses available." />
            : featured.map((course) => {
              // Map unique icons for featured courses
              let icon;
              if (course.name.toLowerCase().includes('math')) {
                icon = (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#icon-gradient)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="3" strokeWidth="2"></rect>
                    <rect x="7" y="5" width="10" height="4" rx="1" strokeWidth="1.5"></rect>
                    <path d="M8 12h1.5" strokeWidth="2"></path>
                    <path d="M11.5 12h1.5" strokeWidth="2"></path>
                    <path d="M15 12h1.5" strokeWidth="2"></path>
                    <path d="M8 15h1.5" strokeWidth="2"></path>
                    <path d="M11.5 15h1.5" strokeWidth="2"></path>
                    <path d="M15 15h1.5" strokeWidth="2"></path>
                    <path d="M8 18h1.5" strokeWidth="2"></path>
                    <path d="M11.5 18h5" strokeWidth="2.5"></path>
                  </svg>
                );
              } else if (course.name.toLowerCase().includes('physics')) {
                icon = (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#icon-gradient)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="2" fill="url(#icon-gradient)"></circle>
                    <circle cx="12" cy="12" r="5" strokeWidth="1.2"></circle>
                    <circle cx="12" cy="12" r="9" strokeWidth="1"></circle>
                    <circle cx="17" cy="12" r="1.2" fill="url(#icon-gradient)"></circle>
                    <circle cx="12" cy="3" r="1.2" fill="url(#icon-gradient)"></circle>
                  </svg>
                );
              }
              else if (course.name.toLowerCase().includes('chemistry')) {
                icon = (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="url(#icon-gradient)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 2v7.5l-5.5 9A2 2 0 0 0 6.23 21.5h11.54a2 2 0 0 0 1.73-3l-5.5-9V2"></path>
                    <path d="M8 2h8"></path>
                    <path d="M7 16h10"></path>
                  </svg>
                );
              } else {
                icon = (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="url(#icon-gradient)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                );
              }

              return (
                <button
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="card course-card course-card-link"
                  aria-label={`View course details for ${course.name}`}
                  type="button"
                >
                  <div className="course-card-header">
                    <div className="course-thumb-wrapper">
                      {icon}
                    </div>
                    <h3 className="course-title">{course.name}</h3>
                  </div>
                  <p className="course-desc">{course.tagline}</p>
                  <div className="card-link">Explore Course &rarr;</div>
                </button>
              );
            })}
      </div>
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate('/courses')}
          aria-label="View the full catalog of courses"
        >
          View All Courses
        </button>
      </p>
    </section>
  );
};

const StatsSection = () => {
  const stats = [
    { label: 'Active Students', value: 10000 },
    { label: 'Expert Teachers', value: 50 },
    { label: 'Pass Rate', value: 98, suffix: '%' },
    { label: 'Practice Questions', value: 2000 }
  ];
  const [ref, visible] = useScrollAnimation();
  return (
    <section
      ref={ref}
      className={`stats-band ${visible ? 'visible' : ''}`}
      aria-label="Trusted by students across India"
    >
      <div className="stats-inner">
        <h2 className="stats-heading">Trusted by Students Across India</h2>
        <div className="stats-grid">
          {stats.map(({ label, value, suffix }) => (
            <div key={label} className="stats-item">
              <span className="stats-value">
                <AnimatedCounter value={value} isVisible={visible} />{suffix || (typeof value === 'number' && value >= 1000 ? '+' : '')}
              </span>
              <span className="stats-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AboutSection = () => {
  const [ref, visible] = useScrollAnimation();

  return (
    <section
      id="about"
      className={`section ${visible ? 'visible fade-slide-up' : 'fade-slide-up'}`}
      ref={ref}
    >
      <h2 className="heading-medium">About Astradex</h2>
      <p className="paragraph-main">
        Astradex is a startup committed to empowering students preparing
        for their 10th, 11th, and 12th board exams. We deliver an engaging and
        interactive online learning experience through expert instructors and
        live classes.
      </p>
    </section>
  );
};

const FacultySection = () => {
  const [ref, visible] = useScrollAnimation();

  const faculty = [
    {
      name: 'Faculty Name 1',
      qualification: 'M.Sc, B.Ed',
      board: 'CBSE',
      subject: 'Physics',
      experience: '12 Years'
    },
    {
      name: 'Faculty Name 2',
      qualification: 'M.Sc, B.Ed',
      board: 'CBSE',
      subject: 'Chemistry',
      experience: '10 Years'
    },
    {
      name: 'Faculty Name 3',
      qualification: 'M.A, B.Ed',
      board: 'CBSE',
      subject: 'English',
      experience: '9 Years'
    },
    {
      name: 'Faculty Name 4',
      qualification: 'M.Sc, B.Ed',
      board: 'TN Board',
      subject: 'Maths',
      experience: '11 Years'
    },
    {
      name: 'Faculty Name 5',
      qualification: 'M.Sc, B.Ed',
      board: 'TN Board',
      subject: 'Biology',
      experience: '8 Years'
    }
  ];

  return (
    <section
      id="faculty"
      ref={ref}
      className={`section faculty-section ${visible ? 'visible' : ''}`}
    >
      <h2 className="heading-medium">Faculty of Excellence</h2>
      <p className="section-subtitle">
        Learn from industry experts with decades of experience.
      </p>
      <div className="faculty-ticker-container">
        <div className="faculty-track">
          {[...faculty, ...faculty, ...faculty].map(
            ({ name, qualification, board, subject, experience }, index) => (
              <article key={`${name}-${index}`} className="faculty-card">
                <div className="faculty-card-body">
                  <h3 className="faculty-name">{name}</h3>
                  <p className="faculty-line">
                    <span className="faculty-label">Qualification:</span> {qualification}
                  </p>
                  <p className="faculty-line">
                    <span className="faculty-label">Board:</span> {board}
                  </p>
                  <p className="faculty-line">
                    <span className="faculty-label">Subject:</span> {subject}
                  </p>
                  <p className="faculty-line">
                    <span className="faculty-label">Experience:</span> {experience}
                  </p>
                </div>
                <button type="button" className="btn-secondary faculty-cta">
                  Watch Intro
                </button>
              </article>
            )
          )}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const testimonials = [
    {
      text: 'I went from 65% to 92% in Maths! The live doubt sessions are amazing.',
      author: 'Sarathy R',
      grade: '12th CBSE'
    },
    {
      text: 'Never thought I&rsquo;d enjoy studying Physics. Astradex made it so fun and easy to understand.',
      author: 'Ashwini N',
      grade: '11th CBSE'
    },
    {
      text: 'The progress tracking showed exactly where I was weak. Improved my scores in 2 months!',
      author: 'Vikram S',
      grade: '12th TN Board'
    }
  ];

  const [ref, visible] = useScrollAnimation();

  return (
    <section
      id="testimonials"
      className={`section ${visible ? 'visible fade-slide-up' : 'fade-slide-up'}`}
      ref={ref}
    >
      <h2 className="heading-medium">What Students Love About Astradex</h2>
      <p className="section-subtitle">Real stories from real toppers.</p>
      <div className="testimonial-grid">
        {testimonials.map(({ text, author, grade }) => (
          <article key={author} className="card testimonial-card">
            <div className="testimonial-card-body">
              <div className="testimonial-star">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="url(#icon-gradient)">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <p className="testimonial-quote">“{text}”</p>
              <p className="testimonial-author-line">
                <span className="testimonial-author">{author}</span>
                <span className="testimonial-grade">{grade}</span>
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const FAQSection = () => {
  const faqs = [
    {
      q: 'How do I start learning?',
      a: 'Sign up for free, choose your course, and join live classes on your first day. No credit card needed.',
      icon: '❓'
    },
    {
      q: 'Can I ask doubts during classes?',
      a: 'Yes. You can raise hand, type in chat, or join dedicated doubt‑clearing sessions every week.',
      icon: '💬'
    },
    {
      q: 'Can I study on my phone?',
      a: 'Absolutely. Astradex is fully optimised for mobile so you can revise anywhere, anytime.',
      icon: '📱'
    },
    {
      q: 'Will this really help my board exams?',
      a: 'Our curriculum is aligned to board exam patterns, with previous‑year questions, sample papers and timed mocks.',
      icon: '📘'
    },
    {
      q: 'Is it expensive?',
      a: 'We offer flexible monthly and yearly plans. Start with a free trial class and upgrade only if you love it.',
      icon: '🔥'
    }
  ];

  const [ref, visible] = useScrollAnimation();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleToggle = (index) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      id="faq"
      className={`section faq-section ${visible ? 'visible fade-slide-up' : 'fade-slide-up'}`}
      ref={ref}
    >
      <h2 className="heading-medium">Frequently Asked Questions</h2>
      <p className="section-subtitle">Got questions? We&rsquo;ve got answers.</p>
      <div className="faq-accordion">
        {faqs.map(({ q, a, icon }, index) => {
          const isOpen = activeIndex === index;
          return (
            <div
              key={q}
              className={`faq-row ${isOpen ? 'open' : ''}`}
              onClick={() => handleToggle(index)}
              aria-expanded={isOpen}
              role="button"
              tabIndex={0}
            >
              <div className="faq-row-header">
                <div className="faq-row-title">
                  {icon && (
                    <span className="faq-icon" aria-hidden="true">
                      {icon}
                    </span>
                  )}
                  <span>{q}</span>
                </div>
                <span className="faq-toggle" aria-hidden="true">
                  +
                </span>
              </div>
              <div className="faq-row-body" style={{ maxHeight: isOpen ? '200px' : '0', opacity: isOpen ? 1 : 0, transition: 'all 0.4s ease', marginTop: isOpen ? '10px' : '0' }}>
                <p className="faq-answer">{a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const SignupCTA = () => {
  const [ref, visible] = useScrollAnimation();
  const navigate = useNavigate();

  return (
    <section
      id="signup"
      className={visible ? 'signup-cta signup-cta-primary visible' : 'signup-cta signup-cta-primary'}
      ref={ref}
    >
      <div className="signup-inner">
        <h2 className="heading-medium signup-heading">
          Ready to ace your board exams?
        </h2>
        <p className="signup-copy">
          Join 10,000+ students and start learning with expert teachers today.
        </p>
        <button
          className="btn-primary"
          onClick={() => navigate('/register')}
          type="button"
        >
          Register Now
        </button>
        <p className="signup-note">
          No credit card required • Start immediately • Cancel anytime
        </p>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer id="contact">
    <p>&copy; 2025 Astradex. All rights reserved.</p>
    <p>
      <a href="#privacy">
        Privacy Policy
      </a>
      <a href="#terms">
        Terms of Service
      </a>
    </p>
  </footer>
);

export default function Homepage() {
  return (
    <>
      {/* Shared SVG Gradients */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>

      {/* Animated floating background shapes */}
      <div className="floating-bg">
        <span className="floating-shape plus">+</span>
        <span className="floating-shape dot" />
        <span className="floating-shape triangle" />
        <span className="floating-shape square" />
        <span className="floating-shape ring" />
      </div>
      <div className="background-blur" />
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CoursesPreview />
      <FacultySection />
      <Testimonials />
      <AboutSection />
      <FAQSection />
      <SignupCTA />
      <Footer />
    </>
  );
}
