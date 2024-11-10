import axios from "axios";
import {
  CollectionItem,
  CreateCollectionRequest,
  GetAllCollectionsResponse,
  ApiResponse,
} from "./collectionTypes";
import { Preferences } from "@capacitor/preferences";

const API_BASE_URL =
  process.env.REACT_APP_SERVER_HTTPS || "http://localhost:60505/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const retrieveToken = async () => {
  const { value } = await Preferences.get({ key: "authToken" });
  return value;
};

api.interceptors.request.use(
  async (config) => {
    const token = await retrieveToken();
    console.log("Attempting request with token:", token);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const handleError = (error: any) =>
  error.response?.data || { message: error.message };

// GET all collection items
export const getCollections = async (): Promise<GetAllCollectionsResponse> => {
  try {
    const response = await api.get("/collection");
    return response.data;
  } catch (error: any) {
    throw handleError(error);
  }
};

// GET a single collection item by ID
export const getCollectionById = async (
  id: string
): Promise<CollectionItem> => {
  try {
    const response = await api.get(`/collection/${id}`);
    return response.data;
  } catch (error: any) {
    throw handleError(error);
  }
};

// POST (Create) a new collection item
export const createCollectionItem = async (
  collectionData: CreateCollectionRequest
): Promise<ApiResponse> => {
  try {
    const response = await api.post("/collection", collectionData);
    return response.data;
  } catch (error: any) {
    throw handleError(error);
  }
};

// DELETE a collection item by ID
export const deleteCollectionItem = async (
  id: string
): Promise<ApiResponse> => {
  try {
    const response = await api.delete(`/collection/${id}`);
    return response.data;
  } catch (error: any) {
    throw handleError(error);
  }
};
