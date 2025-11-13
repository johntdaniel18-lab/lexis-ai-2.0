import React, { useEffect, useRef } from 'react';
import Logo from './icons/Logo';
import Button from './common/Button';
import BrainCircuitIcon from './icons/BrainCircuitIcon';
import ClockIcon from './icons/ClockIcon';
import SparklesIcon from './icons/SparklesIcon';
import ChartBarIcon from './icons/ChartBarIcon';

interface LandingPageProps {
  onStart: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <div className="flex items-center gap-4 mb-3">
            <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-orange-100 text-orange-600">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        </div>
        <p className="text-slate-600">{children}</p>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px',
        threshold: 0.15,
      }
    );

    const currentSections = sectionsRef.current.filter(Boolean);
    currentSections.forEach(section => {
      observer.observe(section!);
    });

    return () => {
        currentSections.forEach(section => {
            if (section) {
                observer.unobserve(section);
            }
      });
    };
  }, []);

  return (
    <div className="bg-slate-50 text-slate-700 font-sans antialiased">
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl tracking-tight text-slate-800">
            <Logo className="h-10 w-10" />
            <span className="font-bold">Lexis<span className="font-extrabold text-orange-500 ml-1">AI</span></span>
          </div>
          <Button onClick={onStart} variant="secondary">Login / Start</Button>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 sm:py-28 text-center bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight">
              Master the IELTS Writing Exam with Your Personal AI Tutor.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Go beyond simple grammar checks with AI-guided preparation, timed practice, and detailed feedback based on official band descriptors.
            </p>
            <div className="mt-8">
              <Button onClick={onStart} variant="primary" className="px-8 py-3 text-lg">
                Start Your Free Practice
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="py-20 sm:py-24 bg-slate-50 fade-in-section"
          // FIX: Changed ref callback to return void to match the expected `RefCallback` type.
          ref={el => { sectionsRef.current[0] = el; }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">How It Works</h2>
              <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">A smarter way to prepare for your writing test in four simple steps.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard icon={<BrainCircuitIcon />} title="AI-Guided Prep">
                Chat with your AI tutor to analyze the prompt, brainstorm ideas, and build a solid essay outline before you even start writing.
              </FeatureCard>
              <FeatureCard icon={<ClockIcon />} title="Timed Practice">
                Write under realistic exam conditions with a built-in timer for Task 1, Task 2, or a full mock test to build stamina and speed.
              </FeatureCard>
              <FeatureCard icon={<SparklesIcon />} title="Instant Feedback">
                Receive a detailed, criteria-based score and actionable suggestions for improvement, highlighting areas in your text that need attention.
              </FeatureCard>
              <FeatureCard icon={<ChartBarIcon />} title="Personalized Drills">
                Sharpen your weakest skills with targeted 5-minute exercises based on your past performance, helping you improve where it matters most.
              </FeatureCard>
            </div>
          </div>
        </section>
        
        {/* Why Lexis AI Section */}
        <section
          id="why"
          className="py-20 sm:py-24 bg-white fade-in-section"
          // FIX: Changed ref callback to return void to match the expected `RefCallback` type.
          ref={el => { sectionsRef.current[1] = el; }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Why Lexis AI?</h2>
                    <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">Our unique features are designed to give you a competitive edge.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Focus on Official Criteria</h3>
                        <p className="text-slate-600">Feedback isn't just about grammar. It's a full analysis of Task Achievement, Coherence, Lexical Resource, and Grammar, just like a real examiner.</p>
                    </div>
                     <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Interactive Preparation</h3>
                        <p className="text-slate-600">Our unique AI chat helps you plan your essay *before* you write, a step that's crucial for a high score and often overlooked in self-study.</p>
                    </div>
                     <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Data-Driven Improvement</h3>
                        <p className="text-slate-600">The 'My Progress' hub tracks your scores and identifies your weakest area, suggesting personalized drills to help you improve faster.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* About Me Section */}
        <section
          id="about"
          className="py-20 sm:py-24 bg-slate-50 fade-in-section"
          // FIX: Changed ref callback to return void to match the expected `RefCallback` type.
          ref={el => { sectionsRef.current[2] = el; }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-shrink-0">
              <div className="h-48 w-48 bg-slate-300 rounded-full flex items-center justify-center">
                <span className="text-slate-500 text-sm">Your Photo Here</span>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900">About the Creator</h2>
              <p className="mt-4 text-lg text-slate-600">
                Hi, I'm John Vu. As a former teacher and IELTS candidate myself, I saw how many students struggled to get targeted, consistent feedback for the writing section. It's often the hardest part to improve on your own.
              </p>
              <p className="mt-4 text-lg text-slate-600">
                I created Lexis AI to bridge that gap, providing an accessible tool that gives you the practice and detailed, criteria-based feedback you need to understand your weaknesses and achieve your target score.
              </p>
            </div>
          </div>
        </section>
        
        {/* Final CTA */}
        <section
          className="py-20 sm:py-28 text-center bg-white fade-in-section"
          // FIX: Changed ref callback to return void to match the expected `RefCallback` type.
          ref={el => { sectionsRef.current[3] = el; }}
        >
           <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Ready to achieve your target score?
            </h2>
            <div className="mt-8">
              <Button onClick={onStart} variant="primary" className="px-8 py-3 text-lg">
                Start Practicing Now
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white text-slate-600 py-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>© 2026 John Vu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;