// src/hooks/usePreferences.ts
import { Preferences } from '@capacitor/preferences';

export const usePreferences = () => {
  const setPreference = async (key: string, value: string) => {
    await Preferences.set({ key, value });
  };

  const getPreference = async (key: string) => {
    const { value } = await Preferences.get({ key });
    return value;
  };

  const removePreference = async (key: string) => {
    await Preferences.remove({ key });
  };

  return { setPreference, getPreference, removePreference };
};
