// src/contexts/AuthProvider.tsx

import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { login as loginAPI, AuthProps } from './authAPI'; // Use correct path

type LoginFn = (email: string, password: string, isGuestLogin?: boolean) => Promise<void>;

export interface AuthState {
  authenticationError: string | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login?: LoginFn;
  token: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isAuthenticating: false,
  authenticationError: null,
  token: '',
};

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
  children: PropTypes.ReactNodeLike;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const { isAuthenticated, isAuthenticating, authenticationError, token } = state;

 const login = useCallback<LoginFn>(async (email, password, asGuest = false) => {
  setState((prevState) => ({ ...prevState, isAuthenticating: true, authenticationError: null }));

  try {
    const response = await loginAPI(email, password, asGuest);
    console.log("Response:", response);  // Check if response is received
    const token = response?.result?.token || response?.result?.token;  // Update this to match the actual structure
    console.log("Token:", token);  // Check if token is now defined

    if (token) {
      localStorage.setItem('authToken', token);  // Save token to localStorage
      setState((prevState) => ({
        ...prevState,
        token,
        isAuthenticated: true,
        isAuthenticating: false,
      }));
    } else {
      throw new Error('Login failed: No token received');
    }
  } catch (error) {
    setState((prevState) => ({
      ...prevState,
      authenticationError: (error as Error).message,
      isAuthenticating: false,
    }));
  }
}, []);


  const value = { isAuthenticated, login, isAuthenticating, authenticationError, token };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
