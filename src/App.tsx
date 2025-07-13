import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { createUserProfile, migrateLocalStorageData } from './services/dataService';
import HSK1FlashcardApp from './components/HSK1FlashcardApp';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';

const AppContent = () => {
  const { currentUser, loading, isGuestMode } = useAuth();

  // Check if current URL is admin route
  const isAdminRoute = window.location.pathname === '/admin' || window.location.search.includes('admin=true');

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-100">Loading...</p>
        </div>
      </div>
    );
  }

  // Show admin dashboard if requested
  if (isAdminRoute) {
    return <AdminDashboard />;
  }

  // Show app if user is logged in OR in guest mode
  return (currentUser || isGuestMode) ? <HSK1FlashcardApp /> : <LandingPage />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
