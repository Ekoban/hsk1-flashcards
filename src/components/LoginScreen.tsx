import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, User } from 'lucide-react';

const LoginScreen = () => {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white min-h-screen flex flex-col justify-center">
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">📚</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">HSK1 学习</h1>
        <p className="text-gray-600 text-lg mb-2">Master 500 essential Chinese words</p>
        <p className="text-gray-500 text-sm">Sign in to sync your progress across devices</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <LogIn className="w-6 h-6" />
          )}
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span>or</span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>
          
          <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 mx-auto">
            <User className="w-4 h-4" />
            Continue as Guest
          </button>
          <p className="text-xs text-gray-500 mt-2">Progress won't be saved</p>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-xs text-gray-400">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
