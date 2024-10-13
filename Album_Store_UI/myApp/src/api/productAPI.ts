import axios from 'axios';

const API_BASE_URL = 'https://localhost:60505/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token in the Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Get token from localStorage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Product API calls
type GetAllProductsFilter = Partial<{
    Skip: number;
    Take: number;
    SortBy: string;
    SortOrder: string;
    Search: string;
    ArtistName: string;
    Genre: string;
    ArtistId: string;
}>;

type GetAllProductsProduct = {
    id: string;
    name: string;
    price: number;
    bandName: string;
    artistsNames: string;
    Image:string;
};

type GetAllProductsResponse = {
    records: GetAllProductsProduct[];
    totalNumberOfRecords: number;
};

// GET all products with filters
export const getAllProducts = async (filter: GetAllProductsFilter): Promise<GetAllProductsResponse> => {
    try {
        const response = await api.get('/product', { params: filter });
        console.log(response.data);
        return response.data;
    } catch (error: any) {
        return error.response?.data || error.message;
    }
};

// GET a product by ID
export const getProduct = async (id: string) => {
  try {
    const response = await api.get(`/product/${id}`);
    return response.data;
  } catch (error: any) {
    return error.response?.data || error.message;
  }
};

// POST (Create) a product
export const createProduct = async (productData: any) => {
  try {
    const payload = {
      productDto: {
        id: productData.id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        genre: productData.genre,
        numberOfSales: productData.numberOfSales,
        numberOfStock: productData.numberOfStock,
        baseImageUrl: productData.baseImageUrl,
        detailsImageUrl: productData.detailsImageUrl,
        // Conditionally include bandId, artists, and versions
        ...(productData.bandId && { bandId: productData.bandId }),
        ...(productData.productVersions && productData.productVersions.length > 0 && {
          productVersions: productData.productVersions,
        }),
        ...(productData.artistIds && productData.artistIds.length > 0 && { artistIds: productData.artistIds }),
        ...(productData.artists && productData.artists.length > 0 && { artists: productData.artists }),
      },
    };

    const response = await api.post('/product', payload);
    return response.data;
  } catch (error: any) {
    return error.response?.data || error.message;
  }
};

// PUT (Update) a product by ID
export const updateProduct = async (id: string, productData: any) => {
  try {
    const payload = {
      productDto: {
        id: productData.id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        genre: productData.genre,
        numberOfSales: productData.numberOfSales,
        numberOfStock: productData.numberOfStock,
        baseImageUrl: productData.baseImageUrl,
        detailsImageUrl: productData.detailsImageUrl,
        // Conditionally include bandId, artists, and versions
        ...(productData.bandId && { bandId: productData.bandId }),
        ...(productData.productVersions && productData.productVersions.length > 0 && {
          productVersions: productData.productVersions,
        }),
        ...(productData.artistIds && productData.artistIds.length > 0 && { artistIds: productData.artistIds }),
        ...(productData.artists && productData.artists.length > 0 && { artists: productData.artists }),
      },
    };

    const response = await api.put(`/product/${id}`, payload);
    return response.data;
  } catch (error: any) {
    return error.response?.data || error.message;
  }
};

// DELETE a product by ID
export const deleteProduct = async (id: string) => {
  try {
    const response = await api.delete(`/product/${id}`);
    return response.data;
  } catch (error: any) {
    return error.response?.data || error.message;
  }
};
