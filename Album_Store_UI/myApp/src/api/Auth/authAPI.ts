import { Preferences } from '@capacitor/preferences';
import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_SERVER_HTTPS}`;
const apiUrl = `${API_BASE_URL}/auth`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
export type LoginResult = {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  }
}
export interface AuthProps {
  errors: string[];
  isValid:true;
  result: LoginResult;
}

// Login
// In authAPI.ts
export const login = async (email: string, password: string, asGuest?: boolean): Promise<AuthProps> => {
  const response: AxiosResponse<AuthProps> = await api.post(apiUrl + "/login", { email, password, asGuest });
  console.log("API response data:", response.data); // Check the response structure here
  return response.data;
};


// Register
type RegisterCommand = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  displayName?: string;
}

export const register = async (registerCommand: RegisterCommand): Promise<AuthProps> => {
  const response: AxiosResponse<AuthProps> = await api.post(apiUrl + '/register', registerCommand);
  return response.data;  // Now TypeScript knows `data` has a `token`
}
export type User= {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  roles: string[];
}
// Add a request interceptor to include the Bearer token
api.interceptors.request.use(
  async (config) => {
    const { value: token } = await Preferences.get({ key: 'authToken' });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Request config:", config); // Debug request config
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Fetch Current User
export const getCurrentUser = async (): Promise<User> => {
  try {
    // Retrieve the token from Preferences
    const { value: token } = await Preferences.get({ key: 'authToken' });
    
    // Validate the token
    if (!token) {
      throw new Error("User is not authenticated. Please log in.");
    }

    // Make the request to get current user details
    const response: AxiosResponse<User> = await api.get(`${API_BASE_URL}/Account`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("User data fetched successfully:", response.data); // Debugging

    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch current user:", error);
    throw new Error(
      error.response?.data?.message || "Unable to retrieve user data. Please check your network and try again."
    );
  }
};