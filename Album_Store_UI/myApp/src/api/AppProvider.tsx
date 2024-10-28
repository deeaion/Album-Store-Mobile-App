import React from 'react';
import { AuthProvider } from './Auth//AuthProvider';
import { ProductProvider } from './Products/ProductContext';
import { SnackbarProvider } from './Snackbar/SnacbarContext';
import { OnlineStatusContext, OnlineStatusProvider } from './Status/OnlineStatusContext';
import { BandProvider } from './Band/BandContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <OnlineStatusProvider>
    <SnackbarProvider>
    <AuthProvider>
      <ProductProvider>
        <BandProvider>
        {children}
        </BandProvider>
      </ProductProvider>
    </AuthProvider>
    </SnackbarProvider>
    // </OnlineStatusProvider>
  );
};
