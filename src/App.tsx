
import React from 'react';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { AppDataProvider } from './providers/AppDataContext';
import { NotificationProvider } from './providers/NotificationProvider';
import { SearchProvider } from './providers/SearchProvider'; // 1. SearchProvider 임포트
import LoginPage from './features/auth/LoginPage';
import MainLayout from './layouts/MainLayout';

const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>; 
  }

  return currentUser ? <MainLayout /> : <LoginPage />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppDataProvider>
          <SearchProvider> {/* 2. SearchProvider 추가 */}
            <AppContent />
          </SearchProvider>
        </AppDataProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
