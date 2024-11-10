import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { login as loginAPI, LoginResult, getCurrentUser } from "./authAPI";
import { Preferences } from "@capacitor/preferences";

type LoginFn = (
  email: string,
  password: string,
  isGuestLogin?: boolean
) => Promise<void>;

export interface AuthState {
  authenticationError: string | null;
  isAuthenticated: boolean;
  isAuthenticating?: boolean;
  loading: boolean;
  login?: LoginFn;
  token: string;
  loginResult?: LoginResult;
}

const initialState: AuthState = {
  isAuthenticated: false,
  loading: true,
  authenticationError: null,
  token: "",
  loginResult: undefined,
};

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
  children: PropTypes.ReactNodeLike;
}

const storeToken = async (token: string) => {
  await Preferences.set({ key: "authToken", value: token });
};

const retrieveToken = async () => {
  const { value } = await Preferences.get({ key: "authToken" });
  return value;
};

const clearToken = async () => {
  await Preferences.remove({ key: "authToken" });
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  const login = useCallback<LoginFn>(
    async (email, password, asGuest = false) => {
      setState((prevState) => ({
        ...prevState,
        loading: true,
        authenticationError: null,
      }));
      try {
        const response = await loginAPI(email, password, asGuest);
        const token = response?.result?.token;
        const loginResult = response?.result;

        if (token) {
          await storeToken(token);
          setState({
            ...state,
            token,
            isAuthenticated: true,
            loading: false,
            loginResult,
          });
        } else {
          throw new Error("Login failed: No token received");
        }
      } catch (error) {
        setState((prevState) => ({
          ...prevState,
          authenticationError: (error as Error).message,
          loading: false,
        }));
      }
    },
    []
  );

  useEffect(() => {
    const checkAuthentication = async () => {
      const savedToken = await retrieveToken();
      if (savedToken) {
        setState({
          ...state,
          token: savedToken,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        setState((prevState) => ({
          ...prevState,
          isAuthenticated: false,
          loading: false,
        }));
      }
    };
    checkAuthentication();
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    setState({
      ...initialState,
      loading: false, // Explicitly set loading to false after logout
    });
  }, []);

  const value = { ...state, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
