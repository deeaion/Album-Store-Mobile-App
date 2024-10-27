import React, { createContext, useReducer, useEffect, useCallback, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { getProducts, createProduct, updateProduct } from './productAPI';
import { AuthContext } from '../Auth/AuthProvider';
import { ProductDetail, GetAllProductsFilter, GetAllProductsProduct } from './productTypes';
import { OnlineStatusContext } from '../Status/OnlineStatusContext';
import { saveDataToAsyncStorage, loadDataFromAsyncStorage } from '../../utils/storage';
import { useWebSocket } from '../../hooks/useWebSocket';

type SaveProductFn = (product: ProductDetail) => Promise<void>;

export interface ProductState {
  products?: ProductDetail[];
  fetching: boolean;
  fetchingError?: Error | null;
  saving: boolean;
  savingError?: Error | null;
  saveProduct?: SaveProductFn;
  setFilter?: (filter: GetAllProductsFilter) => void;
}

const initialState: ProductState = {
  products: [],
  fetching: false,
  saving: false,
};

const FETCH_PRODUCTS_STARTED = 'FETCH_PRODUCTS_STARTED';
const FETCH_PRODUCTS_SUCCEEDED = 'FETCH_PRODUCTS_SUCCEEDED';
const FETCH_PRODUCTS_FAILED = 'FETCH_PRODUCTS_FAILED';
const SAVE_PRODUCT_STARTED = 'SAVE_PRODUCT_STARTED';
const SAVE_PRODUCT_SUCCEEDED = 'SAVE_PRODUCT_SUCCEEDED';
const SAVE_PRODUCT_FAILED = 'SAVE_PRODUCT_FAILED';

const reducer = (state: ProductState, action: { type: string; payload?: any }): ProductState => {
  switch (action.type) {
    case FETCH_PRODUCTS_STARTED:
      return { ...state, fetching: true, fetchingError: null };
    case FETCH_PRODUCTS_SUCCEEDED:
      return { ...state, products: action.payload.products, fetching: false };
    case FETCH_PRODUCTS_FAILED:
      return { ...state, fetchingError: action.payload.error, fetching: false };
    case SAVE_PRODUCT_STARTED:
      return { ...state, savingError: null, saving: true };
    case SAVE_PRODUCT_SUCCEEDED:
      const products = [...(state.products || [])];
      const product = action.payload.product;
      const index = products.findIndex((p) => p.id === product.id);
      if (index === -1) products.push(product);
      else products[index] = product;
      saveDataToAsyncStorage('products', products);
      return { ...state, products, saving: false };
    case SAVE_PRODUCT_FAILED:
      return { ...state, savingError: action.payload.error, saving: false };
    default:
      return state;
  }
};

export const ProductContext = createContext<ProductState>(initialState);

interface ProductProviderProps {
  children: PropTypes.ReactNodeLike;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const { token } = useContext(AuthContext);
  const { isOnline } = useContext(OnlineStatusContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { products, fetching, fetchingError, saving, savingError } = state;
  const [filter, setFilter] = useState<GetAllProductsFilter>({});

  const saveProduct = useCallback(async (product: ProductDetail) => {
    dispatch({ type: SAVE_PRODUCT_STARTED });
    try {
      const savedProduct = await (product.id ? updateProduct(product.id, product) : createProduct(product));
      dispatch({ type: SAVE_PRODUCT_SUCCEEDED, payload: { product: savedProduct } });
    } catch (error) {
      dispatch({ type: SAVE_PRODUCT_FAILED, payload: { error } });
      const queuedChanges = (await loadDataFromAsyncStorage<any[]>('product_changes')) || [];
      queuedChanges.push({ action: product.id ? 'update' : 'create', product });
      saveDataToAsyncStorage('product_changes', queuedChanges);
    }
  }, [token]);

  const fetchProducts = useCallback(async () => {
    if (!isOnline) {
      const cachedProducts = await loadDataFromAsyncStorage<ProductDetail[]>('products');
      if (cachedProducts) {
        dispatch({ type: FETCH_PRODUCTS_SUCCEEDED, payload: { products: cachedProducts } });
      } else {
        dispatch({ type: FETCH_PRODUCTS_FAILED, payload: { error: 'Offline and no cached data available.' } });
      }
      return;
    }

    dispatch({ type: FETCH_PRODUCTS_STARTED });
    try {
      const result: GetAllProductsProduct = await getProducts(filter);
      dispatch({ type: FETCH_PRODUCTS_SUCCEEDED, payload: { products: result.records } });
      saveDataToAsyncStorage('products', result.records);
    } catch (error) {
      dispatch({ type: FETCH_PRODUCTS_FAILED, payload: { error } });
    }
  }, [filter, isOnline]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useWebSocket({
    url: 'https://localhost:60505/hubs/albumstore',
    token,
    onMessage: (product) => {
      dispatch({ type: SAVE_PRODUCT_SUCCEEDED, payload: { product } });
    },
  });

  return (
    <ProductContext.Provider value={{ products, fetching, fetchingError, saving, savingError, saveProduct, setFilter }}>
      {children}
    </ProductContext.Provider>
  );
};
