import React, { createContext, useContext, useEffect, useState } from 'react';
import { store } from './store';
import { AppState } from '../types';

type AppContextType = {
  state: AppState | null;
  updateState: (updates: Partial<AppState>) => Promise<void>;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    store.getState().then(setState);
  }, []);

  const updateState = async (updates: Partial<AppState>) => {
    const newState = await store.updateState(updates);
    setState(newState);
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center text-primary-400 font-sans animate-pulse">
        稍等片刻，专属空间马上打开...
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ state, updateState }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
