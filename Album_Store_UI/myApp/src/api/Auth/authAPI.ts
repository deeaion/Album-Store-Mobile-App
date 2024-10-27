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
export const login = async (email: string, password: string,asGuest?:boolean): Promise<AuthProps> => {
  const response: AxiosResponse<AuthProps> = await api.post(apiUrl + "/login", { email, password,asGuest });
  return response.data;  // Now TypeScript knows `data` has a `token`
}

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
