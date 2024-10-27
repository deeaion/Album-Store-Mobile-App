// src/utils/asyncStorage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
type SuccessfulKeys = 'products' | 'userInformation';
type ChangesKeys= 'product_changes' | 'userInformation_changes';
type StorageKey = SuccessfulKeys | ChangesKeys;

export const saveDataToAsyncStorage = async (key: StorageKey, data: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to AsyncStorage`, error);
  }
};

export const loadDataFromAsyncStorage = async <T>(key: StorageKey): Promise<T | null> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error loading ${key} from AsyncStorage`, error);
    return null;
  }
};

export const removeDataFromAsyncStorage = async (key: StorageKey) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from AsyncStorage`, error);
  }
};
