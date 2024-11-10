import axios from "axios";
import { CreateOrderRequest, Order, GetAllOrdersResponse } from "./orderTypes";
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

// GET all orders
export const getOrders = async (): Promise<GetAllOrdersResponse> => {
  try {
    const response = await api.get("/order");
    return response.data;
  } catch (error: any) {
    throw handleError(error);
  }
};

// GET a single order by ID
export const getOrderById = async (id: string): Promise<Order> => {
  try {
    const response = await api.get(`/order/${id}`);
    return response.data;
  } catch (error: any) {
    throw handleError(error);
  }
};

// POST (Create) a new order
export const createOrder = async (
  orderData: CreateOrderRequest
): Promise<Order> => {
  try {
    const response = await api.post("/order", orderData);
    return response.data;
  } catch (error: any) {
    throw handleError(error);
  }
};
