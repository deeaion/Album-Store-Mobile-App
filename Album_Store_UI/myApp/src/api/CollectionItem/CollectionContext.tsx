import React, {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  useContext,
  useState,
} from "react";
import PropTypes from "prop-types";
import {
  getCollections,
  createCollectionItem,
  deleteCollectionItem,
} from "./collectionItemAPI";
import { CollectionItem, GetAllCollectionsResponse } from "./collectionTypes";
import { OnlineStatusContext } from "../Status/OnlineStatusContext";
import {
  saveDataToPreferences,
  loadDataFromPreferences,
} from "../../utils/storage";
import { useSnackbar } from "../Snackbar/SnacbarContext";

export interface CollectionState {
  collections?: CollectionItem[];
  fetching: boolean;
  fetchingError?: Error | null;
  saving: boolean;
  savingError?: Error | null;
  saveCollectionItem?: (item: CollectionItem) => Promise<void>;
  deleteCollectionItem?: (id: string) => Promise<void>;
  totalNumberOfRecords?: number;
}

const initialState: CollectionState = {
  collections: [],
  fetching: false,
  saving: false,
  totalNumberOfRecords: 0,
};

const FETCH_COLLECTIONS_STARTED = "FETCH_COLLECTIONS_STARTED";
const FETCH_COLLECTIONS_SUCCEEDED = "FETCH_COLLECTIONS_SUCCEEDED";
const FETCH_COLLECTIONS_FAILED = "FETCH_COLLECTIONS_FAILED";
const SAVE_COLLECTION_STARTED = "SAVE_COLLECTION_STARTED";
const SAVE_COLLECTION_SUCCEEDED = "SAVE_COLLECTION_SUCCEEDED";
const SAVE_COLLECTION_FAILED = "SAVE_COLLECTION_FAILED";
const DELETE_COLLECTION_STARTED = "DELETE_COLLECTION_STARTED";
const DELETE_COLLECTION_SUCCEEDED = "DELETE_COLLECTION_SUCCEEDED";
const DELETE_COLLECTION_FAILED = "DELETE_COLLECTION_FAILED";

const reducer = (
  state: CollectionState,
  action: { type: string; payload?: any }
): CollectionState => {
  switch (action.type) {
    case FETCH_COLLECTIONS_STARTED:
      return { ...state, fetching: true, fetchingError: null };
    case FETCH_COLLECTIONS_SUCCEEDED:
      return {
        ...state,
        collections: action.payload.reset
          ? action.payload.collections
          : [...(state.collections || []), ...action.payload.collections],
        fetching: false,
        totalNumberOfRecords:
          action.payload.totalNumberOfRecords || state.totalNumberOfRecords,
      };
    case FETCH_COLLECTIONS_FAILED:
      return { ...state, fetchingError: action.payload.error, fetching: false };
    case SAVE_COLLECTION_STARTED:
      return { ...state, savingError: null, saving: true };
    case SAVE_COLLECTION_SUCCEEDED:
      const updatedCollections = [...(state.collections || [])];
      const collection = action.payload.collection;
      const index = updatedCollections.findIndex((c) => c.id === collection.id);
      if (index === -1) updatedCollections.push(collection);
      else updatedCollections[index] = collection;
      saveDataToPreferences("collections", updatedCollections);
      return { ...state, collections: updatedCollections, saving: false };
    case SAVE_COLLECTION_FAILED:
      return { ...state, savingError: action.payload.error, saving: false };
    case DELETE_COLLECTION_STARTED:
      return { ...state, saving: true };
    case DELETE_COLLECTION_SUCCEEDED:
      const collectionsAfterDelete = state.collections?.filter(
        (c) => c.id !== action.payload.id
      );
      saveDataToPreferences("collections", collectionsAfterDelete);
      return { ...state, collections: collectionsAfterDelete, saving: false };
    case DELETE_COLLECTION_FAILED:
      return { ...state, savingError: action.payload.error, saving: false };
    default:
      return state;
  }
};

export const CollectionContext = createContext<CollectionState>(initialState);

interface CollectionProviderProps {
  children: PropTypes.ReactNodeLike;
}

export const CollectionProvider: React.FC<CollectionProviderProps> = ({
  children,
}) => {
  const { isOnline } = useContext(OnlineStatusContext);
  const { showSnackbar } = useSnackbar();
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchCollections = useCallback(async () => {
    console.log("fetchCollections");
    if (!isOnline) {
      showSnackbar("You are offline! Showing cached collections.", "warning");
      const cachedData = await loadDataFromPreferences<{
        collections: CollectionItem[];
        totalNumberOfRecords: number;
      }>("collections");
      if (cachedData) {
        dispatch({
          type: FETCH_COLLECTIONS_SUCCEEDED,
          payload: {
            collections: cachedData.collections,
            totalNumberOfRecords: cachedData.totalNumberOfRecords,
            reset: true,
          },
        });
      } else {
        dispatch({
          type: FETCH_COLLECTIONS_FAILED,
          payload: { error: "Offline and no cached data available." },
        });
      }
      return;
    }

    dispatch({ type: FETCH_COLLECTIONS_STARTED });
    try {
      const result: GetAllCollectionsResponse = await getCollections();
      console.log("result", result);
      dispatch({
        type: FETCH_COLLECTIONS_SUCCEEDED,
        payload: {
          collections: result.records,
          totalNumberOfRecords: result.totalNumberOfRecords,
          reset: true,
        },
      });
      await saveDataToPreferences("collections", {
        collections: result.records,
        totalNumberOfRecords: result.totalNumberOfRecords,
      });
    } catch (error) {
      dispatch({ type: FETCH_COLLECTIONS_FAILED, payload: { error } });
    }
  }, [isOnline]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const saveCollectionItem = useCallback(
    async (item: CollectionItem) => {
      if (!isOnline) {
        showSnackbar(
          "You are offline! Your changes will sync when online.",
          "warning"
        );
        dispatch({
          type: SAVE_COLLECTION_FAILED,
          payload: { error: "Offline" },
        });
        return;
      }

      dispatch({ type: SAVE_COLLECTION_STARTED });
      try {
        const savedItem = await createCollectionItem({ collectionItem: item });
        dispatch({
          type: SAVE_COLLECTION_SUCCEEDED,
          payload: { collection: savedItem },
        });

        await fetchCollections();
      } catch (error) {
        dispatch({ type: SAVE_COLLECTION_FAILED, payload: { error } });
      }
    },
    [isOnline, showSnackbar, fetchCollections]
  );

  const deleteCollectionItemById = useCallback(
    async (id: string) => {
      if (!isOnline) {
        showSnackbar(
          "You are offline! Delete will sync when online.",
          "warning"
        );
        dispatch({
          type: DELETE_COLLECTION_FAILED,
          payload: { error: "Offline" },
        });
        return;
      }

      dispatch({ type: DELETE_COLLECTION_STARTED });
      try {
        await deleteCollectionItem(id);
        dispatch({ type: DELETE_COLLECTION_SUCCEEDED, payload: { id } });
      } catch (error) {
        dispatch({ type: DELETE_COLLECTION_FAILED, payload: { error } });
      }
    },
    [isOnline, showSnackbar]
  );

  return (
    <CollectionContext.Provider
      value={{
        ...state,
        saveCollectionItem,
        deleteCollectionItem: deleteCollectionItemById,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
};
