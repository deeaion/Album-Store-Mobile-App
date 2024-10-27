// src/contexts/AuthProvider.tsx
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { login as loginAPI, AuthProps, LoginResult } from './authAPI';
import { Preferences } from '@capacitor/preferences';

type LoginFn = (email: string, password: string, isGuestLogin?: boolean) => Promise<void>;

export interface AuthState {
  authenticationError: string | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login?: LoginFn;
  token: string;
  loginResult?: LoginResult;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isAuthenticating: false,
  authenticationError: null,
  token: '',
  loginResult: undefined,
};

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
  children: PropTypes.ReactNodeLike;
}

const storeToken = async (token: string) => {
  await Preferences.set({ key: 'authToken', value: token });
};

const retrieveToken = async () => {
  const { value } = await Preferences.get({ key: 'authToken' });
  return value;
};

const clearToken = async () => {
  await Preferences.remove({ key: 'authToken' });
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const { isAuthenticated, isAuthenticating, authenticationError, token } = state;

  const login = useCallback<LoginFn>(async (email, password, asGuest = false) => {
    setState((prevState) => ({ ...prevState, isAuthenticating: true, authenticationError: null }));

    try {
      const response = await loginAPI(email, password, asGuest);
      const token = response?.result?.token;
      const loginResult = response?.result;

      if (token) {
        await storeToken(token); // Use Capacitor to store token
        setState((prevState) => ({
          ...prevState,
          token,
          isAuthenticated: true,
          isAuthenticating: false,
          loginResult,
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

  useEffect(() => {
    const checkAuthentication = async () => {
      const savedToken = await retrieveToken(); // Retrieve token from Preferences
      if (savedToken) {
        setState((prevState) => ({
          ...prevState,
          token: savedToken,
          isAuthenticated: true,
        }));
      }
    };
    checkAuthentication();
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    setState(initialState);
    window.location.href = '/login';
  }, []);

  const value = { isAuthenticated, login, logout, isAuthenticating, authenticationError, token };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
