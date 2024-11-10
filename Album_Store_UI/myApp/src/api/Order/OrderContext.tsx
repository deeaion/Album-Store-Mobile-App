// src/api/OrderContext.ts

import React, {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  useContext,
} from "react";
import PropTypes from "prop-types";
import { getOrders, createOrder, getOrderById } from "./orderAPI";
import { Order, GetAllOrdersResponse, CreateOrderRequest } from "./orderTypes";
import { OnlineStatusContext } from "../Status/OnlineStatusContext";
import {
  saveDataToPreferences,
  loadDataFromPreferences,
} from "../../utils/storage";
import { useSnackbar } from "../Snackbar/SnacbarContext";

export interface OrderState {
  orders?: Order[];
  fetching: boolean;
  fetchingError?: Error | null;
  saving: boolean;
  savingError?: Error | null;
  saveOrder?: (orderData: CreateOrderRequest) => Promise<void>;
  fetchOrders?: () => Promise<void>;
  fetchOrderById?: (id: string) => Promise<void>;
  totalNumberOfRecords?: number;
}

const initialState: OrderState = {
  orders: [],
  fetching: false,
  saving: false,
  totalNumberOfRecords: 0,
};

const FETCH_ORDERS_STARTED = "FETCH_ORDERS_STARTED";
const FETCH_ORDERS_SUCCEEDED = "FETCH_ORDERS_SUCCEEDED";
const FETCH_ORDERS_FAILED = "FETCH_ORDERS_FAILED";
const FETCH_ORDER_BY_ID_STARTED = "FETCH_ORDER_BY_ID_STARTED";
const FETCH_ORDER_BY_ID_SUCCEEDED = "FETCH_ORDER_BY_ID_SUCCEEDED";
const FETCH_ORDER_BY_ID_FAILED = "FETCH_ORDER_BY_ID_FAILED";
const SAVE_ORDER_STARTED = "SAVE_ORDER_STARTED";
const SAVE_ORDER_SUCCEEDED = "SAVE_ORDER_SUCCEEDED";
const SAVE_ORDER_FAILED = "SAVE_ORDER_FAILED";

const reducer = (
  state: OrderState,
  action: { type: string; payload?: any }
): OrderState => {
  switch (action.type) {
    case FETCH_ORDERS_STARTED:
      return { ...state, fetching: true, fetchingError: null };
    case FETCH_ORDERS_SUCCEEDED:
      return {
        ...state,
        orders: action.payload.reset
          ? action.payload.orders
          : [...(state.orders || []), ...action.payload.orders],
        fetching: false,
        totalNumberOfRecords:
          action.payload.totalNumberOfRecords || state.totalNumberOfRecords,
      };
    case FETCH_ORDERS_FAILED:
      return { ...state, fetchingError: action.payload.error, fetching: false };
    case FETCH_ORDER_BY_ID_STARTED:
      return { ...state, fetching: true, fetchingError: null };
    case FETCH_ORDER_BY_ID_SUCCEEDED:
      const existingOrders = state.orders || [];
      const updatedOrders = existingOrders.some(
        (order) => order.id === action.payload.order.id
      )
        ? existingOrders.map((order) =>
            order.id === action.payload.order.id ? action.payload.order : order
          )
        : [...existingOrders, action.payload.order];
      return { ...state, orders: updatedOrders, fetching: false };
    case FETCH_ORDER_BY_ID_FAILED:
      return { ...state, fetchingError: action.payload.error, fetching: false };
    case SAVE_ORDER_STARTED:
      return { ...state, savingError: null, saving: true };
    case SAVE_ORDER_SUCCEEDED:
      return {
        ...state,
        orders: [...(state.orders || []), action.payload.order],
        saving: false,
      };
    case SAVE_ORDER_FAILED:
      return { ...state, savingError: action.payload.error, saving: false };
    default:
      return state;
  }
};

export const OrderContext = createContext<OrderState>(initialState);

interface OrderProviderProps {
  children: PropTypes.ReactNodeLike;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const { isOnline } = useContext(OnlineStatusContext);
  const { showSnackbar } = useSnackbar();
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchOrders = useCallback(async () => {
    if (!isOnline) {
      showSnackbar("You are offline! Showing cached orders.", "warning");
      const cachedData = await loadDataFromPreferences<{
        orders: Order[];
        totalNumberOfRecords: number;
      }>("orders");
      if (cachedData) {
        dispatch({
          type: FETCH_ORDERS_SUCCEEDED,
          payload: {
            orders: cachedData.orders,
            totalNumberOfRecords: cachedData.totalNumberOfRecords,
            reset: true,
          },
        });
      } else {
        dispatch({
          type: FETCH_ORDERS_FAILED,
          payload: { error: "Offline and no cached data available." },
        });
      }
      return;
    }

    dispatch({ type: FETCH_ORDERS_STARTED });
    try {
      const result: GetAllOrdersResponse = await getOrders();
      dispatch({
        type: FETCH_ORDERS_SUCCEEDED,
        payload: {
          orders: result.records,
          totalNumberOfRecords: result.totalNumberOfRecords,
          reset: true,
        },
      });
      await saveDataToPreferences("orders", {
        orders: result.records,
        totalNumberOfRecords: result.totalNumberOfRecords,
      });
    } catch (error) {
      dispatch({ type: FETCH_ORDERS_FAILED, payload: { error } });
    }
  }, [isOnline]);

  const fetchOrderById = useCallback(async (id: string) => {
    dispatch({ type: FETCH_ORDER_BY_ID_STARTED });
    try {
      const order = await getOrderById(id);
      dispatch({ type: FETCH_ORDER_BY_ID_SUCCEEDED, payload: { order } });
    } catch (error) {
      dispatch({ type: FETCH_ORDER_BY_ID_FAILED, payload: { error } });
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const saveOrder = useCallback(
    async (orderData: CreateOrderRequest) => {
      if (!isOnline) {
        showSnackbar(
          "You are offline! Your changes will sync when online.",
          "warning"
        );
        dispatch({ type: SAVE_ORDER_FAILED, payload: { error: "Offline" } });
        return;
      }

      dispatch({ type: SAVE_ORDER_STARTED });
      try {
        const savedOrder = await createOrder(orderData);
        dispatch({
          type: SAVE_ORDER_SUCCEEDED,
          payload: { order: savedOrder },
        });
      } catch (error) {
        dispatch({ type: SAVE_ORDER_FAILED, payload: { error } });
      }
    },
    [isOnline, showSnackbar]
  );

  return (
    <OrderContext.Provider
      value={{ ...state, saveOrder, fetchOrders, fetchOrderById }}
    >
      {children}
    </OrderContext.Provider>
  );
};
