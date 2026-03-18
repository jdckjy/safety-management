
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface LayoutContextType {
  pageTitle: string;
  setPageTitle: (title: string) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pageTitle, setPageTitle] = useState('');

  return (
    <LayoutContext.Provider value={{ pageTitle, setPageTitle }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
