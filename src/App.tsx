
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { ProjectDataProvider } from './providers/ProjectDataProvider';
import { NotificationProvider } from './providers/NotificationProvider';
import { SearchProvider } from './providers/SearchProvider';
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
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ProjectDataProvider>
            <SearchProvider>
              <AppContent />
            </SearchProvider>
          </ProjectDataProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
