import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, ChevronLeft, ChevronRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { signInWithGoogle, continueAsGuest } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const screenshots = [
    {
      src: "/images/Screenshot 2025-07-12 at 21-07-59 HSK 1-3 Flashcards Tutor.png",
      alt: "HSK Flashcards Landing Page - Welcome screen with authentication and feature overview",
      title: "Welcome to HSK 1-3 Tutor",
      description: "Clean, modern interface with Google sign-in and guest mode. Start your Chinese learning journey with 2,200+ words across HSK levels 1-3"
    },
    {
      src: "/images/Screenshot 2025-07-12 at 21-08-25 HSK 1-3 Flashcards Tutor.png",
      alt: "HSK Learning Dashboard - Progress tracking and session configuration",
      title: "Smart Learning Dashboard", 
      description: "Comprehensive learning overview with HSK level selection, progress statistics, and customizable study sessions across 70+ word categories"
    },
    {
      src: "/images/Screenshot 2025-07-12 at 21-09-00 HSK 1-3 Flashcards Tutor.png",
      alt: "HSK Session Settings - Advanced customization options for personalized learning including audio settings",
      title: "Customizable Study Experience",
      description: "Fine-tune your learning with category filters, difficulty levels, stroke count ranges, language display preferences, and audio pronunciation controls"
    },
    {
      src: "/images/Screenshot 2025-07-12 at 21-09-25 HSK 1-3 Flashcards Tutor.png",
      alt: "HSK Interactive Flashcard - Real-time learning with spaced repetition feedback and audio pronunciation",
      title: "Interactive Flashcard System with Audio",
      description: "Engaging flashcard interface with pinyin, IPA pronunciation, audio speaker buttons, and immediate feedback using scientifically-proven spaced repetition"
    },
    {
      src: "/images/Screenshot 2025-07-12 at 21-10-09 HSK 1-3 Flashcards Tutor.png",
      alt: "HSK Session Complete - Achievement celebration with detailed progress analytics",
      title: "Achievement & Progress Tracking",
      description: "Celebrate your learning milestones with confetti animations and detailed session statistics to track your vocabulary mastery"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % screenshots.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    continueAsGuest();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900/80 to-amber-900/60">
      {/* Hero Section */}
      <div className="w-full py-24">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="text-8xl mb-8 animate-pulse">🧠</div>
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
            HSK 1-3
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-orange-100">
            3.0 Flashcards Tutor
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Master 2,200+ essential Chinese words across 70+ categories with our intelligent spaced repetition system and <span className="text-orange-400 font-semibold">built-in audio pronunciation</span>. 
            Learn HSK Levels 1-3 vocabulary based on the latest HSK 3.0 standards, effectively and efficiently.
          </p>
          
          {/* Authentication Section - Clean and Centered */}
          <div className="max-w-3xl mx-auto">
            {error && (
              <div className="mb-6 p-3 bg-red-500/20 rounded-3xl text-red-200 text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full lg:w-80 bg-gradient-to-r from-orange-500 to-amber-600 text-white py-4 px-8 rounded-2xl font-semibold text-lg hover:from-orange-600 hover:to-amber-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl transform hover:scale-105 h-14"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                )}
                {isLoading ? 'Signing in...' : 'Sign in with Google'}
              </button>

              {/* Separator */}
              <div className="flex items-center justify-center">
                <div className="hidden lg:flex flex-col items-center px-4">
                  <div className="w-px h-4 bg-gray-600"></div>
                  <span className="text-sm text-gray-400 py-2">Or</span>
                  <div className="w-px h-4 bg-gray-600"></div>
                </div>
                <div className="lg:hidden flex items-center w-full px-4">
                  <div className="flex-1 h-px bg-gray-600"></div>
                  <span className="text-sm text-gray-400 px-4">Or</span>
                  <div className="flex-1 h-px bg-gray-600"></div>
                </div>
              </div>

              {/* Guest Button */}
              <button 
                onClick={handleGuestMode}
                className="w-full lg:w-80 text-orange-100 py-4 px-8 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all hover:bg-white/10 h-14"
              >
                <User className="w-5 h-5" />
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-6xl mb-6 group-hover:animate-bounce">🎯</div>
              <h3 className="text-2xl font-bold text-orange-100 mb-4">Smart Learning</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Our spaced repetition algorithm adapts to your learning pace, 
                focusing on words you need to practice most.
              </p>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300 relative">
              <div className="text-6xl mb-6 group-hover:animate-bounce">🔊</div>
              {/* NEW Badge */}
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse shadow-lg">
                NEW
              </div>
              <h3 className="text-2xl font-bold text-orange-100 mb-4">Audio Pronunciation</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Hear native Chinese pronunciation with built-in text-to-speech. 
                Perfect your pronunciation with adjustable speed controls.
              </p>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-6xl mb-6 group-hover:animate-bounce">📊</div>
              <h3 className="text-2xl font-bold text-orange-100 mb-4">Progress Tracking</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Monitor your learning journey with detailed statistics and 
                visual progress indicators for each word.
              </p>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-6xl mb-6 group-hover:animate-bounce">🏆</div>
              <h3 className="text-2xl font-bold text-orange-100 mb-4">Gamified Experience</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Celebrate your achievements with confetti animations and 
                unlock new levels as you master vocabulary.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="w-full py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-orange-100 mb-12">Learn HSK Levels 1-3 (HSK 3.0 Standards)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group hover:transform hover:scale-110 transition-all duration-300">
              <div className="text-5xl md:text-6xl font-bold text-orange-400 mb-2 group-hover:animate-pulse">2,200+</div>
              <div className="text-gray-300 text-lg">Essential Words</div>
            </div>
            <div className="text-center group hover:transform hover:scale-110 transition-all duration-300">
              <div className="text-5xl md:text-6xl font-bold text-orange-400 mb-2 group-hover:animate-pulse">3</div>
              <div className="text-gray-300 text-lg">HSK Levels</div>
            </div>
            <div className="text-center group hover:transform hover:scale-110 transition-all duration-300">
              <div className="text-5xl md:text-6xl font-bold text-orange-400 mb-2 group-hover:animate-pulse">70+</div>
              <div className="text-gray-300 text-lg">Word Categories</div>
            </div>
            <div className="text-center group hover:transform hover:scale-110 transition-all duration-300">
              <div className="text-5xl md:text-6xl font-bold text-orange-400 mb-2 group-hover:animate-pulse">∞</div>
              <div className="text-gray-300 text-lg">Practice Sessions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Screenshots Carousel Section */}
      <div className="w-full py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-4xl md:text-5xl font-bold text-orange-100 mb-20 text-center">Experience the App</h3>
          
          {/* Sleek Carousel */}
          <div className="relative max-w-5xl mx-auto">
            {/* Main Display Area */}
            <div className="relative">
              {/* Screenshot Container with Ultra-Modern Design */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-800/20 to-gray-900/40 backdrop-blur-2xl border border-white/10 shadow-2xl">
                {/* Screenshots */}
                <div className="relative h-[350px] md:h-[550px] lg:h-[650px]">
                  {screenshots.map((screenshot, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                        index === currentSlide 
                          ? 'opacity-100 scale-100' 
                          : 'opacity-0 scale-95'
                      }`}
                    >
                      <img 
                        src={screenshot.src}
                        alt={screenshot.alt}
                        className="w-full h-full object-contain p-4"
                      />
                      {/* Subtle bottom gradient for visual depth */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none"></div>
                    </div>
                  ))}
                </div>

                {/* Ultra-Sleek Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/30 backdrop-blur-xl text-white rounded-full hover:bg-black/50 transition-all duration-300 hover:scale-110 flex items-center justify-center group border border-white/10 shadow-xl"
                >
                  <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-300" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/30 backdrop-blur-xl text-white rounded-full hover:bg-black/50 transition-all duration-300 hover:scale-110 flex items-center justify-center group border border-white/10 shadow-xl"
                >
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>

              {/* Content Info Panel */}
              <div className="mt-8 text-center">
                <h4 className="text-2xl md:text-3xl font-bold text-orange-100 mb-4">
                  {screenshots[currentSlide]?.title || "App Screenshot"}
                </h4>
                <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  {screenshots[currentSlide]?.description || "Explore the features of our HSK learning app"}
                </p>
              </div>
            </div>

            {/* Enhanced Dots Navigation */}
            <div className="flex justify-center mt-10 space-x-3">
              {screenshots.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`transition-all duration-500 rounded-full hover:scale-110 ${
                    index === currentSlide 
                      ? 'w-12 h-4 bg-gradient-to-r from-orange-400 to-amber-500 shadow-lg' 
                      : 'w-4 h-4 bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>

            {/* Enhanced Thumbnail Navigation for Desktop */}
            <div className="hidden lg:flex justify-center mt-16 space-x-6">
              {screenshots.map((screenshot, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105 ${
                    index === currentSlide 
                      ? 'ring-3 ring-orange-400 shadow-2xl scale-105' 
                      : 'opacity-70 hover:opacity-90'
                  }`}
                >
                  <img 
                    src={screenshot.src}
                    alt={screenshot.alt}
                    className="w-28 h-20 object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t transition-all duration-300 ${
                    index === currentSlide 
                      ? 'from-orange-500/20 to-transparent' 
                      : 'from-black/40 to-black/10'
                  }`}></div>
                  {/* Active indicator */}
                  {index === currentSlide && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-orange-400 rounded-full shadow-lg"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="w-full py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-4xl font-bold text-orange-100 mb-12 text-center">Why Choose Our HSK 1-3 Flashcards?</h3>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <h4 className="text-2xl font-semibold text-orange-200 mb-4 flex items-center gap-3">
                <span className="text-3xl">✨</span>
                Current HSK Standards
              </h4>
              <p className="text-gray-300 text-lg leading-relaxed">
                Updated to the latest HSK 3.0 standards with 2,200+ carefully curated 
                words across 70+ categories and multiple difficulty levels for HSK Levels 1-3 certification.
              </p>
            </div>
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <h4 className="text-2xl font-semibold text-orange-200 mb-4 flex items-center gap-3">
                <span className="text-3xl">🔊</span>
                Built-in Audio Pronunciation
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full ml-2">NEW</span>
              </h4>
              <p className="text-gray-300 text-lg leading-relaxed">
                Hear native Chinese pronunciation with Web Speech API integration. 
                Adjustable speed controls and auto-play mode for perfect pronunciation practice.
              </p>
            </div>
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <h4 className="text-2xl font-semibold text-orange-200 mb-4 flex items-center gap-3">
                <span className="text-3xl">🧠</span>
                Scientifically Proven
              </h4>
              <p className="text-gray-300 text-lg leading-relaxed">
                Our spaced repetition system is based on cognitive science research, 
                ensuring optimal retention and recall for Chinese vocabulary.
              </p>
            </div>
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <h4 className="text-2xl font-semibold text-orange-200 mb-4 flex items-center gap-3">
                <span className="text-3xl">⚡</span>
                Quick Start
              </h4>
              <p className="text-gray-300 text-lg leading-relaxed">
                No complex setup required. Start learning immediately with our 
                intuitive interface and smart difficulty progression.
              </p>
            </div>
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <h4 className="text-2xl font-semibold text-orange-200 mb-4 flex items-center gap-3">
                <span className="text-3xl">📱</span>
                Works Everywhere
              </h4>
              <p className="text-gray-300 text-lg leading-relaxed">
                Perfect on desktop, tablet, or mobile. Your progress syncs 
                across all devices when signed in with Google.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full py-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-400">
          <p className="text-sm mb-2">
            By using this app, you agree to our Terms of Service and Privacy Policy
          </p>
          <p className="text-sm">© 2024 HSK 1 Flashcards • Built with ❤️ for Chinese learners</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
