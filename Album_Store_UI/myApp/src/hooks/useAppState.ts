// src/hooks/useAppState.ts
import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';

export const useAppState = (onAppStateChange: (isActive: boolean) => void) => {
  useEffect(() => {
    // Listen for app state changes
    const handleAppStateChange = (state: { isActive: boolean }) => {
      onAppStateChange(state.isActive);
    };

    CapacitorApp.addListener('appStateChange', handleAppStateChange);

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [onAppStateChange]);
};
