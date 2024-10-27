import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_SERVER_HTTPS || 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Define the Band type and response type
export type Band = {
  id: string;
  name: string;
};

type GetAllBandsResponse = {
  records: Band[];
  totalNumberOfRecords: number;
};

// GET all bands
export const getBands = async (): Promise<GetAllBandsResponse> => {
  const response = await api.get('/band');
  return response.data;
};

// GET a band by ID
export const getBand = async (id: string): Promise<Band> => {
  const response = await api.get(`/band/${id}`);
  return response.data;
};

// add band to favorites -> /band/favorite and as objects {bandId: string}
export const addBandToFavorites = async (bandId: string): Promise<{ message: string }> => {
  const response = await api.post('/band/favorite', { bandId });
  return response.data;
};