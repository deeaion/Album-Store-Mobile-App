// src/api/Basket/BasketContext.tsx
import React, {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  useContext,
} from "react";
import PropTypes from "prop-types";
import {
  getBasket,
  addBasketItem,
  updateBasketItem,
  deleteBasketItem,
} from "./basketAPI";
import { Basket, BasketItem, UpdateBasketItemRequest } from "./basketTypes";
import { OnlineStatusContext } from "../Status/OnlineStatusContext";
import {
  saveDataToPreferences,
  loadDataFromPreferences,
} from "../../utils/storage";
import { useSnackbar } from "../Snackbar/SnacbarContext";

export interface BasketState {
  basket?: Basket;
  fetching: boolean;
  fetchingError?: Error | null;
  saving: boolean;
  savingError?: Error | null;
  hasFetched: boolean;
  addItem?: (item: BasketItem) => Promise<void>;
  updateItem?: (updateData: UpdateBasketItemRequest) => Promise<void>;
  deleteItem?: (id: string) => Promise<void>;
  fetchBasket?: () => Promise<void>;
}

const initialState: BasketState = {
  basket: { basketId: "", items: [] },
  fetching: false,
  saving: false,
  hasFetched: false,
};

const FETCH_BASKET_STARTED = "FETCH_BASKET_STARTED";
const FETCH_BASKET_SUCCEEDED = "FETCH_BASKET_SUCCEEDED";
const FETCH_BASKET_FAILED = "FETCH_BASKET_FAILED";
const SAVE_ITEM_STARTED = "SAVE_ITEM_STARTED";
const SAVE_ITEM_SUCCEEDED = "SAVE_ITEM_SUCCEEDED";
const SAVE_ITEM_FAILED = "SAVE_ITEM_FAILED";
const DELETE_ITEM_STARTED = "DELETE_ITEM_STARTED";
const DELETE_ITEM_SUCCEEDED = "DELETE_ITEM_SUCCEEDED";
const DELETE_ITEM_FAILED = "DELETE_ITEM_FAILED";

const reducer = (
  state: BasketState,
  action: { type: string; payload?: any }
): BasketState => {
  switch (action.type) {
    case FETCH_BASKET_STARTED:
      return { ...state, fetching: true, fetchingError: null };
    case FETCH_BASKET_SUCCEEDED:
      return {
        ...state,
        basket: action.payload.basket,
        fetching: false,
        hasFetched: true,
      };
    case FETCH_BASKET_FAILED:
      return { ...state, fetchingError: action.payload.error, fetching: false };
    case SAVE_ITEM_STARTED:
      return { ...state, savingError: null, saving: true };
    case SAVE_ITEM_SUCCEEDED:
      return { ...state, basket: action.payload.basket, saving: false };
    case SAVE_ITEM_FAILED:
      return { ...state, savingError: action.payload.error, saving: false };
    case DELETE_ITEM_STARTED:
      return { ...state, saving: true };
    case DELETE_ITEM_SUCCEEDED:
      return { ...state, basket: action.payload.basket, saving: false };
    case DELETE_ITEM_FAILED:
      return { ...state, savingError: action.payload.error, saving: false };
    default:
      return state;
  }
};

export const BasketContext = createContext<BasketState>(initialState);

interface BasketProviderProps {
  children: PropTypes.ReactNodeLike;
}

export const BasketProvider: React.FC<BasketProviderProps> = ({ children }) => {
  const { isOnline } = useContext(OnlineStatusContext);
  const { showSnackbar } = useSnackbar();
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchBasket = useCallback(async () => {
    if (state.hasFetched) return;
    if (!isOnline) {
      showSnackbar("You are offline! Showing cached basket items.", "warning");
      const cachedData = await loadDataFromPreferences<Basket>("basket");
      if (cachedData) {
        dispatch({
          type: FETCH_BASKET_SUCCEEDED,
          payload: { basket: cachedData },
        });
      } else {
        dispatch({
          type: FETCH_BASKET_FAILED,
          payload: { error: "Offline and no cached data available." },
        });
      }
      return;
    }

    dispatch({ type: FETCH_BASKET_STARTED });
    try {
      const basket = await getBasket();
      dispatch({ type: FETCH_BASKET_SUCCEEDED, payload: { basket } });
      await saveDataToPreferences("basket", basket);
    } catch (error) {
      dispatch({ type: FETCH_BASKET_FAILED, payload: { error } });
    }
  }, [isOnline, state.hasFetched]);

  useEffect(() => {
    fetchBasket();
  }, [fetchBasket]);

  const addItem = useCallback(
    async (item: BasketItem) => {
      if (!isOnline) {
        showSnackbar(
          "You are offline! Your item will sync when online.",
          "warning"
        );
        dispatch({ type: SAVE_ITEM_FAILED, payload: { error: "Offline" } });
        return;
      }

      dispatch({ type: SAVE_ITEM_STARTED });
      try {
        await addBasketItem({ productBasket: item });
        const updatedBasket = await getBasket();
        dispatch({
          type: SAVE_ITEM_SUCCEEDED,
          payload: { basket: updatedBasket },
        });
      } catch (error) {
        dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
      }
    },
    [isOnline, showSnackbar]
  );

  const updateItem = useCallback(
    async (updateData: UpdateBasketItemRequest) => {
      if (!isOnline) {
        showSnackbar(
          "You are offline! Your changes will sync when online.",
          "warning"
        );
        dispatch({ type: SAVE_ITEM_FAILED, payload: { error: "Offline" } });
        return;
      }

      dispatch({ type: SAVE_ITEM_STARTED });
      try {
        await updateBasketItem(updateData);
        const updatedBasket = await getBasket();
        dispatch({
          type: SAVE_ITEM_SUCCEEDED,
          payload: { basket: updatedBasket },
        });
      } catch (error) {
        dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
      }
    },
    [isOnline, showSnackbar]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      if (!isOnline) {
        showSnackbar(
          "You are offline! Your delete will sync when online.",
          "warning"
        );
        dispatch({ type: DELETE_ITEM_FAILED, payload: { error: "Offline" } });
        return;
      }

      dispatch({ type: DELETE_ITEM_STARTED });
      try {
        await deleteBasketItem(id);
        const updatedBasket = await getBasket();
        dispatch({
          type: DELETE_ITEM_SUCCEEDED,
          payload: { basket: updatedBasket },
        });
      } catch (error) {
        dispatch({ type: DELETE_ITEM_FAILED, payload: { error } });
      }
    },
    [isOnline, showSnackbar]
  );

  return (
    <BasketContext.Provider
      value={{
        ...state,
        addItem,
        updateItem,
        deleteItem,
        fetchBasket,
      }}
    >
      {children}
    </BasketContext.Provider>
  );
};
