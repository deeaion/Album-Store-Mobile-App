import { Preferences } from "@capacitor/preferences";
import React, {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  useContext,
  useState,
  useRef,
} from "react";
import PropTypes from "prop-types";
import {
  getProducts,
  createProduct,
  updateProduct,
  addProductToFavorites,
  removeProductFromFavorites,
} from "./productAPI";
import { AuthContext } from "../Auth/AuthProvider";
import {
  ProductDetail,
  GetAllProductsFilter,
  GetAllProductsProduct,
  ProductListItem,
} from "./productTypes";
import { OnlineStatusContext } from "../Status/OnlineStatusContext";
import {
  saveDataToPreferences,
  loadDataFromPreferences,
  removeDataFromPreferences,
} from "../../utils/storage";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useSnackbar } from "../Snackbar/SnacbarContext";
import { getCurrentUser, User } from "../Auth/authAPI";

type SaveProductFn = (product: ProductDetail) => Promise<void>;

export interface ProductState {
  products?: ProductListItem[];
  fetching: boolean;
  fetchingError?: Error | null;
  saving: boolean;
  savingError?: Error | null;
  saveProduct?: SaveProductFn;
  setFilter?: (filter: GetAllProductsFilter) => void;
  toggleFavorite?: (productId: string, isFavorited: boolean) => Promise<void>;
  totalNumberOfRecords?: number;
  pendingOperations?: {
    id: string;
    type: string;
    product?: ProductDetail;
    productId?: string;
    isFavorited?: boolean;
  }[];
}

const initialState: ProductState = {
  products: [],
  fetching: false,
  saving: false,
  totalNumberOfRecords: 0,
};

const FETCH_PRODUCTS_STARTED = "FETCH_PRODUCTS_STARTED";
const FETCH_PRODUCTS_SUCCEEDED = "FETCH_PRODUCTS_SUCCEEDED";
const FETCH_PRODUCTS_FAILED = "FETCH_PRODUCTS_FAILED";
const SAVE_PRODUCT_STARTED = "SAVE_PRODUCT_STARTED";
const SAVE_PRODUCT_SUCCEEDED = "SAVE_PRODUCT_SUCCEEDED";
const SAVE_PRODUCT_FAILED = "SAVE_PRODUCT_FAILED";
const TOGGLE_FAVORITE = "TOGGLE_FAVORITE";
const ADD_PENDING_OPERATION = "ADD_PENDING_OPERATION";
const REMOVE_PENDING_OPERATION = "REMOVE_PENDING_OPERATION";

const reducer = (
  state: ProductState,
  action: { type: string; payload?: any }
): ProductState => {
  switch (action.type) {
    case FETCH_PRODUCTS_STARTED:
      return { ...state, fetching: true, fetchingError: null };
    case FETCH_PRODUCTS_SUCCEEDED:
      return {
        ...state,
        products: action.payload.reset
          ? action.payload.products
          : [...(state.products || []), ...action.payload.products],
        fetching: false,
        totalNumberOfRecords:
          action.payload.totalNumberOfRecords || state.totalNumberOfRecords,
      };
    case FETCH_PRODUCTS_FAILED:
      return { ...state, fetchingError: action.payload.error, fetching: false };
    case SAVE_PRODUCT_STARTED:
      return { ...state, savingError: null, saving: true };
    case SAVE_PRODUCT_SUCCEEDED:
      const updatedProducts = [...(state.products || [])];
      const product = action.payload.product;
      const index = updatedProducts.findIndex((p) => p.id === product.id);
      if (index === -1) updatedProducts.push(product);
      else updatedProducts[index] = product;
      saveDataToPreferences("products", updatedProducts);
      return { ...state, products: updatedProducts, saving: false };
    case SAVE_PRODUCT_FAILED:
      return { ...state, savingError: action.payload.error, saving: false };
    case TOGGLE_FAVORITE:
      const productsWithToggledFavorite = state.products?.map((p) =>
        p.id === action.payload.productId
          ? { ...p, isFavorited: action.payload.isFavorited }
          : p
      );
      saveDataToPreferences("products", productsWithToggledFavorite);
      return { ...state, products: productsWithToggledFavorite };
    case ADD_PENDING_OPERATION:
      return {
        ...state,
        pendingOperations: [
          ...(state.pendingOperations || []),
          action.payload.operation,
        ],
      };
    case REMOVE_PENDING_OPERATION:
      return {
        ...state,
        pendingOperations: (state.pendingOperations || []).filter(
          (op) => op.id !== action.payload.id
        ),
      };
    default:
      return state;
  }
};

export const ProductContext = createContext<ProductState>(initialState);

interface ProductProviderProps {
  children: PropTypes.ReactNodeLike;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({
  children,
}) => {
  const { token } = useContext(AuthContext);
  const { isOnline } = useContext(OnlineStatusContext);
  const { showSnackbar } = useSnackbar();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [filter, setFilter] = useState<GetAllProductsFilter>({
    Skip: 0,
    Take: 10,
  });
  const dispatchThrottleRef = useRef<boolean>(false);
  // console.log(token);
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setUserId(currentUser?.id || null); // Store userId separately
      console.log("User loaded:", currentUser);
    };
    loadUser();
  }, []);

  // console.log(user);

  const fetchProducts = useCallback(async () => {
    if (!isOnline) {
      showSnackbar("You are offline! Showing cached products.", "warning");
      const cachedData = await loadDataFromPreferences<{
        products: ProductDetail[];
        totalNumberOfRecords: number;
      }>("products");
      if (cachedData) {
        dispatch({
          type: FETCH_PRODUCTS_SUCCEEDED,
          payload: {
            products: cachedData.products,
            totalNumberOfRecords: cachedData.totalNumberOfRecords,
            reset: true,
          },
        });
      } else {
        dispatch({
          type: FETCH_PRODUCTS_FAILED,
          payload: { error: "Offline and no cached data available." },
        });
      }
      return;
    }

    dispatch({ type: FETCH_PRODUCTS_STARTED });
    try {
      const result: GetAllProductsProduct = await getProducts(filter);
      dispatch({
        type: FETCH_PRODUCTS_SUCCEEDED,
        payload: {
          products: result.records,
          totalNumberOfRecords: result.totalNumberOfRecords,
          reset: filter.Skip === 0,
        },
      });
      await saveDataToPreferences("products", {
        products: result.records,
        totalNumberOfRecords: result.totalNumberOfRecords,
      });
    } catch (error) {
      dispatch({ type: FETCH_PRODUCTS_FAILED, payload: { error } });
    }
  }, [filter, isOnline]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const attemptSync = useCallback(async () => {
    if (isOnline && state.pendingOperations?.length) {
      for (const operation of state.pendingOperations) {
        try {
          if (operation.type === "SAVE_PRODUCT" && operation.product) {
            await saveProduct(operation.product);
          } else if (
            operation.type === "TOGGLE_FAVORITE" &&
            operation.productId
          ) {
            await toggleFavorite(
              operation.productId,
              operation.isFavorited ?? false
            );
          }
          dispatch({
            type: REMOVE_PENDING_OPERATION,
            payload: { id: operation.id },
          });
        } catch (error) {
          console.error("Failed to sync operation:", error);
        }
      }
    }
  }, [isOnline, state.pendingOperations]);

  useEffect(() => {
    if (isOnline) {
      attemptSync();
    }
  }, [isOnline, attemptSync]);

  const saveProduct = useCallback(
    async (product: ProductDetail) => {
      if (!isOnline) {
        showSnackbar(
          "You are offline! Your changes will sync when online.",
          "warning"
        );
        dispatch({
          type: ADD_PENDING_OPERATION,
          payload: { operation: { type: "SAVE_PRODUCT", product } },
        });
        return;
      }

      dispatch({ type: SAVE_PRODUCT_STARTED });
      try {
        const savedProduct = await (product.id
          ? updateProduct(product.id, product)
          : createProduct(product));
        dispatch({
          type: SAVE_PRODUCT_SUCCEEDED,
          payload: { product: savedProduct },
        });
      } catch (error) {
        dispatch({ type: SAVE_PRODUCT_FAILED, payload: { error } });
      }
    },
    [isOnline, showSnackbar]
  );

  const toggleFavorite = useCallback(
    async (productId: string, isFavorited: boolean) => {
      if (!isOnline) {
        showSnackbar(
          "You are offline! Your changes will sync when online.",
          "warning"
        );
        dispatch({
          type: ADD_PENDING_OPERATION,
          payload: {
            operation: { type: "TOGGLE_FAVORITE", productId, isFavorited },
          },
        });
        return;
      }

      try {
        if (isFavorited) {
          await removeProductFromFavorites(productId);
        } else {
          await addProductToFavorites(productId);
        }
        dispatch({
          type: TOGGLE_FAVORITE,
          payload: { productId, isFavorited: !isFavorited },
        });
      } catch (error) {
        showSnackbar(
          "Failed to toggle favorite status. Will retry later.",
          "error"
        );
        dispatch({
          type: ADD_PENDING_OPERATION,
          payload: {
            operation: { type: "TOGGLE_FAVORITE", productId, isFavorited },
          },
        });
      }
    },
    [isOnline, showSnackbar]
  );

  const newProductThrottleRef = useRef<boolean>(false);
  const deletedProductThrottleRef = useRef<boolean>(false);
  const throttledFetchProducts = useCallback(() => {
    if (dispatchThrottleRef.current) return;
    dispatchThrottleRef.current = true;
    fetchProducts();
    setTimeout(() => (dispatchThrottleRef.current = false), 1000); // Reset throttle after 1 second
  }, [fetchProducts]);

  const handleNewProduct = useCallback(
    (product: { message: string; ProductName: string }) => {
      // console.log('Handling new product:', product);
      throttledFetchProducts();
      // console.log("New product added: ", product.ProductName);
      showSnackbar(`New product added: ${product.ProductName}`, "success");
    },
    [throttledFetchProducts, showSnackbar]
  );

  const handleDeletedProduct = useCallback(
    (product: { message: string; ProductName: string }) => {
      // console.log('Handling deleted product message:', product);
      throttledFetchProducts();
      // console.log("Product deleted: ", product.ProductName);
      showSnackbar(`Product deleted: ${product.ProductName}`, "warning");
    },
    [throttledFetchProducts, showSnackbar]
  );

  const handleMessage = useCallback(
    (rawMessage: any) => {
      // console.log("------------------------------------------------------");
      // console.log('Raw message received:', rawMessage);

      const message =
        typeof rawMessage === "string" ? JSON.parse(rawMessage) : rawMessage;
      const Type = message.Type || null;
      const msgContent = message.Message || null;
      const ProductName = message.ProductName || null;
      // console.log('Parsed message:', { Type, msgContent, ProductName });

      if (Type === "ProductAdded") {
        // console.log('Triggering handleNewProduct for:', ProductName);
        handleNewProduct({ message: msgContent, ProductName });
        return;
      } else if (Type === "ProductDeleted") {
        // console.log('Triggering handleDeletedProduct for:', ProductName);
        handleDeletedProduct({ message: msgContent, ProductName });
        return;
      } else {
        console.warn("Unknown message type received:", Type);
      }
    },
    [handleNewProduct, handleDeletedProduct]
  );

  // Initialize WebSocket connection using `useWebSocket`
  const wsConfig = {
    url: "https://localhost:60505/hubs/albumstore",
    token,
    userId: userId || undefined,
    onMessage: handleMessage,
  };

  useWebSocket(wsConfig);

  return (
    <ProductContext.Provider
      value={{ ...state, saveProduct, setFilter, toggleFavorite }}
    >
      {children}
    </ProductContext.Provider>
  );
};
