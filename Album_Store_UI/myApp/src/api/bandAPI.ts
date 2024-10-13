import axios from 'axios';

const API_BASE_URL =  process.env.REACT_APP_SERVER_HTTPS || 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token in the Authorization header
api.interceptors.request.use(
  (config) =>
  {
      const token = localStorage.getItem('authToken'); // Get token from localStorage
      if (token)
      {
          config.headers['Authorization'] = `Bearer ${ token}`;
      }
      return config;
  },
  (error) =>
  {
      return Promise.reject(error);
  }
);



export type Band = {
    id: string;
name: string;
};

type GetAllBandsResponse = {
    records: Band[];
totalNumberOfRecords: number;
};


// GET all products with filters
export const getBands = async (): Promise<GetAllBandsResponse> => {
    try
    {
        const response = await api.get('/band');
        console.log(response.data);
        return response.data;
    }
    catch (error: any) {
        return error.response?.data || error.message;
    }
    };

    // GET a band by ID
    export const getBand = async(id: string) => {
        try
        {
            const response = await api.get(`/ band /${ id}`);
            return response.data;
        }
        catch (error: any) {
            return error.response?.data || error.message;
        }
        };