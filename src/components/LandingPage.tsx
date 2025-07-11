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
      src: "/images/dashboard.png",
      alt: "HSK1 Flashcards Dashboard - Complete learning overview with progress tracking",
      title: "Complete Learning Dashboard",
      description: "Track your progress across all 500 words with detailed statistics and visual progress indicators"
    },
    {
      src: "/images/complete.png",
      alt: "HSK1 Session Complete - Achievement celebration and performance statistics",
      title: "Session Complete & Achievements",
      description: "Celebrate your learning milestones with detailed performance analytics and progress tracking"
    },
    {
      src: "/images/session.png",
      alt: "HSK1 Learning Session - Interactive study session with progress indicators",
      title: "Interactive Learning Session",
      description: "Engage with interactive flashcards and track your real-time learning progress"
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
            HSK 1
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-orange-100">
            3.0 Flashcards Tutor
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Master 500 essential Chinese words across 40 categories with our intelligent spaced repetition system. 
            Learn HSK Level 1 vocabulary based on the latest HSK 3.0 standards, effectively and efficiently.
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
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-6xl mb-6 group-hover:animate-bounce">🎯</div>
              <h3 className="text-2xl font-bold text-orange-100 mb-4">Smart Learning</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Our spaced repetition algorithm adapts to your learning pace, 
                focusing on words you need to practice most.
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
          <h3 className="text-3xl md:text-4xl font-bold text-orange-100 mb-12">Learn HSK Level 1 (HSK 3.0 Standards)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group hover:transform hover:scale-110 transition-all duration-300">
              <div className="text-5xl md:text-6xl font-bold text-orange-400 mb-2 group-hover:animate-pulse">500</div>
              <div className="text-gray-300 text-lg">Essential Words</div>
            </div>
            <div className="text-center group hover:transform hover:scale-110 transition-all duration-300">
              <div className="text-5xl md:text-6xl font-bold text-orange-400 mb-2 group-hover:animate-pulse">4</div>
              <div className="text-gray-300 text-lg">Difficulty Levels</div>
            </div>
            <div className="text-center group hover:transform hover:scale-110 transition-all duration-300">
              <div className="text-5xl md:text-6xl font-bold text-orange-400 mb-2 group-hover:animate-pulse">40</div>
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
      <div className="w-full py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-4xl font-bold text-orange-100 mb-12 text-center">See It in Action</h3>
          
          {/* Main Carousel */}
          <div className="relative max-w-5xl mx-auto">
            {/* Carousel Container */}
            <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-white/10">
              {/* Screenshots */}
              <div className="relative h-96 md:h-[500px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl">
                {screenshots.map((screenshot, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img 
                      src={screenshot.src}
                      alt={screenshot.alt}
                      className="w-full h-full object-contain"
                    />
                    {/* Overlay with strong bottom darkening for better text visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <h4 className="font-bold text-2xl mb-2 drop-shadow-lg">{screenshot.title}</h4>
                      <p className="text-lg text-gray-200 drop-shadow-md">{screenshot.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-xl text-white p-3 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-xl text-white p-3 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Dots Navigation */}
            <div className="flex justify-center mt-8 space-x-3">
              {screenshots.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-orange-400 scale-125' 
                      : 'bg-gray-500 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="w-full py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-4xl font-bold text-orange-100 mb-12 text-center">Why Choose Our HSK 1 Flashcards?</h3>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <h4 className="text-2xl font-semibold text-orange-200 mb-4 flex items-center gap-3">
                <span className="text-3xl">✨</span>
                Current HSK Standards
              </h4>
              <p className="text-gray-300 text-lg leading-relaxed">
                Updated to the latest HSK 3.0 standards with 500 carefully curated 
                words across 40 categories and 4 difficulty levels for HSK Level 1 certification.
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
