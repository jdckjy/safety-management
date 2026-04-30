import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationState {
  menuKey: string;
  selectedKpiId?: string;
  selectedActivityId?: string;
  selectedTaskId?: string;
  selectedMonth: number;
}

interface NavigationContextType {
  navigationState: NavigationState;
  setNavigationState: React.Dispatch<React.SetStateAction<NavigationState>>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    menuKey: 'dashboard',
    selectedMonth: new Date().getMonth() + 1,
  });

  return (
    <NavigationContext.Provider value={{ navigationState, setNavigationState }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
