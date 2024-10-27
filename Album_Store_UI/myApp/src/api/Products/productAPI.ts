// src/api/productAPI.ts
import axios from 'axios';
import { GetAllProductsFilter, GetAllProductsProduct, ProductDetail } from './productTypes';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const API_BASE_URL = process.env.REACT_APP_SERVER_HTTPS || 'http://localhost:60505/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const retrieveToken = async () => {
  const { value } = await Preferences.get({ key: 'authToken' });
  return value;
};

// Interceptor to add token to all requests
api.interceptors.request.use(
  async (config) => {
    // Retrieve token asynchronously
    const token = await retrieveToken();
    console.log("Attempting request with token:", token); // Debug token presence
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
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

// add product to favorites -> send as object json with productId to /product/favorite
export const addProductToFavorites = async (productId: string): Promise<{ message: string }> => {
  try {
    const response = await api.post(`/product/favorite`, { productId });
    return response.data;
  } catch (error: any) {
    throw handleError(error);
  }
};
// remove product from favorites -> send as object json with productId to /product/favorite
export const removeProductFromFavorites = async (productId: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/product/favorite`, { data: { productId } });
    return response.data;
  } catch (error: any) {
    throw handleError(error);
  }
};