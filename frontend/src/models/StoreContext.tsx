import React, { createContext, useContext } from 'react';
import { RootStoreType, createRootStore } from './RootStore';

const StoreContext = createContext<RootStoreType | null>(null);

const rootStore = createRootStore();

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>;
}

export function useStore(): RootStoreType {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used within StoreProvider');
  return store;
}
