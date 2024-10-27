import React from 'react';
import { AuthProvider } from './Auth//AuthProvider';
import { ProductProvider } from './Products/ProductContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <ProductProvider>
        {children}
      </ProductProvider>
    </AuthProvider>
  );
};
