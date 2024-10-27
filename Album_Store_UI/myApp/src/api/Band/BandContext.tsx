import React, { createContext, useReducer, useEffect, useCallback, ReactNode, useContext } from 'react';
import { getBands } from './bandAPI';
import { Band } from './bandTypes';
import { saveDataToPreferences,loadDataFromPreferences } from '../../utils/storage';
import { OnlineStatusContext } from '../Status/OnlineStatusContext';
import PropTypes  from 'prop-types';
// BandState interface
interface BandState {
  bands?: Band[];
  fetching: boolean;
  fetchingError?: Error | null;
  fetchBands?: () => void;
}

// Initial state
const initialState: BandState = {
  bands: [],
  fetching: false,
  fetchingError: null,
};

// Action types
const FETCH_BANDS_STARTED = 'FETCH_BANDS_STARTED';
const FETCH_BANDS_SUCCEEDED = 'FETCH_BANDS_SUCCEEDED';
const FETCH_BANDS_FAILED = 'FETCH_BANDS_FAILED';
const TOGGLE_FAVORITE= 'TOGGLE_FAVORITE';
// Reducer function
const reducer = (state: BandState, action: { type: string; payload?: any }): BandState => {
  switch (action.type) {
    case FETCH_BANDS_STARTED:
      return { ...state, fetching: true, fetchingError: null };
    case FETCH_BANDS_SUCCEEDED:
      return { ...state, bands: action.payload.bands, fetching: false };
    case FETCH_BANDS_FAILED:
      return { ...state, fetchingError: action.payload.error, fetching: false };
  
      default:
      return state;
  }
};

export const BandContext = createContext<BandState>(initialState as BandState);


// BandProviderProps interface
interface BandProviderProps {
  children: PropTypes.ReactNodeLike;
}

// BandProvider component
export const BandProvider: React.FC<BandProviderProps> = ({ children }) => {
  const { isOnline } = useContext(OnlineStatusContext);
  const [state, dispatch] = useReducer(reducer, initialState);

  // fetchBands function
  const fetchBands = useCallback(async () => {
    if (!isOnline) {
      const cachedData = await loadDataFromPreferences<{ bands: Band[] }>('bands');
      if (cachedData?.bands) {
        dispatch({ type: FETCH_BANDS_SUCCEEDED, payload: { bands: cachedData.bands } });
      } else {
        dispatch({ type: FETCH_BANDS_FAILED, payload: { error: 'Offline and no cached data available.' } });
      }
      return;
    }

    dispatch({ type: FETCH_BANDS_STARTED });
    try {
      const result = await getBands();
      dispatch({ type: FETCH_BANDS_SUCCEEDED, payload: { bands: result.records } });

      await saveDataToPreferences('bands', { bands: result.records });
    } catch (error) {
      dispatch({ type: FETCH_BANDS_FAILED, payload: { error } });
    }
  }, [isOnline]);

  // fetchBands on component mount
  useEffect(() => {
    fetchBands();
  }, [fetchBands]);

  return (
    <BandContext.Provider value={{...state}}>
      {children}
    </BandContext.Provider>
  );
};
