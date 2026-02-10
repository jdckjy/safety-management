
import React from 'react';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { AppDataProvider } from './providers/AppDataContext';
import LoginPage from './features/auth/LoginPage';
import MainLayout from './layouts/MainLayout';

// AppContent will decide which main component to show based on auth status.
const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();

  // We are showing a blank screen or a spinner while auth state is loading.
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>; 
  }

  return currentUser ? <MainLayout /> : <LoginPage />;
};

// App is the root component that wraps everything with context providers.
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppDataProvider>
        <AppContent />
      </AppDataProvider>
    </AuthProvider>
  );
};

export default App;
