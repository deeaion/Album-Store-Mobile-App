import axios from 'axios';
import { ProductDetail, GetAllProductsProduct, GetAllProductsFilter } from './productTypes';

const API_BASE_URL = process.env.REACT_APP_SERVER_HTTPS || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token conditionally
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers?.authRequired) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    delete config.headers?.authRequired;
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper for error handling
const handleError = (error: any) => error.response?.data || { message: error.message };

// GET all products (anonymous access allowed)
export const getProducts = async (filter: GetAllProductsFilter): Promise<GetAllProductsProduct> => {
  try {
    const response = await api.get('/product', { params: filter });
    return response.data;
  } catch (error: any) {
    throw handleError(error);
  }
};

// GET a single product by ID (anonymous access allowed)
export const getProduct = async (id: string): Promise<ProductDetail> => {
  try {
    const response = await api.get(`/product/${id}`);
    return response.data;
  } catch (error: any) {
    throw handleError(error);
  }
};

// POST (Create) a new product (requires authentication)
export const createProduct = async (productData: Partial<ProductDetail>): Promise<ProductDetail> => {
  try {
    const response = await api.post(
      '/product',
      { productDto: productData },
      { headers: { authRequired: true } }
    );
    return response.data;
  } catch (error: any) {
    throw handleError(error);
  }
};

// PUT (Update) a product by ID (requires authentication)
export const updateProduct = async (id: string, productData: Partial<ProductDetail>): Promise<ProductDetail> => {
  try {
    const response = await api.put(
      `/product/${id}`,
      { productDto: productData },
      { headers: { authRequired: true } }
    );
    return response.data;
  } catch (error: any) {
    throw handleError(error);
  }
};

// DELETE a product by ID (requires authentication)
export const deleteProduct = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/product/${id}`, { headers: { authRequired: true } });
    return response.data;
  } catch (error: any) {
    throw handleError(error);
  }
};
