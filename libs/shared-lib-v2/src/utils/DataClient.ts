// shared/idbService.js
import { get, set, del } from 'idb-keyval';

export const setData = async (key: IDBValidKey, value: any) => {
  try {
    await set(key, value);
    console.log(`Data set successfully: ${key}`);
  } catch (error) {
    console.error('Error setting data in IDB:', error);
  }
};

export const getData = async (key: IDBValidKey) => {
  try {
    const value = await get(key);
    console.log(`Data retrieved successfully: ${key}`);
    return value;
  } catch (error) {
    console.error('Error getting data from IDB:', error);
  }
};

export const removeData = async (key: IDBValidKey) => {
  try {
    await del(key);
    console.log(`Data removed successfully: ${key}`);
  } catch (error) {
    console.error('Error removing data from IDB:', error);
  }
};
