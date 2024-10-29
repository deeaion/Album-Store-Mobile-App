// SnackbarContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface SnackbarContextType {
  showSnackbar: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [snackbar, setSnackbar] = useState<{ message: string; open: boolean; severity: 'success' | 'error' | 'warning' | 'info' }>({
    message: '',
    open: false,
    severity: 'info',
  });

// SnackbarContext.tsx
const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  // Prevent snackbar from showing if the message is undefined
  if (!message || message.includes("undefined")) {
    console.log("Blocked snackbar with undefined message:", message); // Debugging line
    return;
  }
  console.log("showSnackbar", message, severity); // Log only intended messages
  setSnackbar({ message, open: true, severity });
};


// SnackbarContext.tsx
const handleClose = () => {
  setSnackbar({ message: '', open: false, severity: 'info' }); // Reset message and state on close
};

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};
