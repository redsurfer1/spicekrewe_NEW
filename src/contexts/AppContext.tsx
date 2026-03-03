import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppContextType {
  showMap: boolean;
  setShowMap: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [showMap, setShowMapState] = useState<boolean>(() => {
    const stored = localStorage.getItem('spicekrewe_showMap');
    return stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem('spicekrewe_showMap', String(showMap));
  }, [showMap]);

  const setShowMap = (show: boolean) => {
    setShowMapState(show);
  };

  return (
    <AppContext.Provider value={{ showMap, setShowMap }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
