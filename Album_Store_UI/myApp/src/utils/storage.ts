// src/utils/preferencesStorage.ts

import { Preferences } from '@capacitor/preferences';

type SuccessfulKeys = 'products' | 'userInformation' | 'bands';
type ChangesKeys= 'product_changes' | 'userInformation_changes';
type StorageKey = SuccessfulKeys | ChangesKeys;

export const saveDataToPreferences = async (key: StorageKey, data: any) => {
  try {
    await Preferences.set({ key, value: JSON.stringify(data) });
    console.log(`Data saved to Preferences under key: ${key}`, data);
  } catch (error) {
    console.error(`Error saving ${key} to Preferences`, error);
  }
};

export const loadDataFromPreferences = async <T>(key: StorageKey): Promise<T | null> => {
  try {
    const { value } = await Preferences.get({ key });
    console.log(`Data loaded from Preferences for key: ${key}`, value);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error loading ${key} from Preferences`, error);
    return null;
  }
};

export const removeDataFromPreferences = async (key: StorageKey) => {
  try {
    await Preferences.remove({ key });
    console.log(`Data removed from Preferences for key: ${key}`);
  } catch (error) {
    console.error(`Error removing ${key} from Preferences`, error);
  }
};
