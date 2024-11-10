import axios from "axios";
import {
  Basket,
  BasketItem,
  CreateBasketItemRequest,
  UpdateBasketItemRequest,
  ApiResponse,
} from "./basketTypes";
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
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const handleError = (error: any) =>
  error.response?.data || { message: error.message };

// GET all basket items
export const getBasket = async (): Promise<Basket> => {
  try {
    const response = await api.get("/basket");
    return response.data;
  } catch (error: any) {
    throw handleError(error);
  }
};

// GET a single basket item by ID
export const getBasketItemById = async (id: string): Promise<BasketItem> => {
  try {
    const response = await api.get(`/basket/${id}`);
    return response.data;
  } catch (error: any) {
    throw handleError(error);
  }
};

// POST (Create) a new basket item
export const addBasketItem = async (
  itemData: CreateBasketItemRequest
): Promise<ApiResponse> => {
  try {
    const response = await api.post("/basket", itemData);
    return response.data;
  } catch (error: any) {
    throw handleError(error);
  }
};

// PUT (Update) quantity of a basket item
export const updateBasketItem = async (
  updateData: UpdateBasketItemRequest
): Promise<ApiResponse> => {
  try {
    const response = await api.put("/basket", updateData);
    return response.data;
  } catch (error: any) {
    throw handleError(error);
  }
};

// DELETE a basket item by ID
export const deleteBasketItem = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await api.delete(`/basket/${id}`);
    return response.data;
  } catch (error: any) {
    throw handleError(error);
  }
};
