// Add this at the top of your main TypeScript entry file
if (typeof (window as any).browser === 'undefined') {
  (window as any).browser = (window as any).chrome;
}
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AppProviders } from './api/AppProvider';


const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <AppProviders>
    <App />
    </AppProviders>
  </React.StrictMode>
);