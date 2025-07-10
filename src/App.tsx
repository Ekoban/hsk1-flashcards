import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { createUserProfile, migrateLocalStorageData } from './services/dataService';
import HSK1FlashcardApp from './components/HSK1FlashcardApp';
import LoginScreen from './components/LoginScreen';

const AppContent = () => {
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    const handleUserLogin = async () => {
      if (currentUser) {
        // Create user profile in Firestore
        await createUserProfile(currentUser);
        
        // Migrate localStorage data if it's their first time
        await migrateLocalStorageData(currentUser.uid);
      }
    };

    handleUserLogin();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return currentUser ? <HSK1FlashcardApp /> : <LoginScreen />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
