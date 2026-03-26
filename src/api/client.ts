import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use production rendering URL if defined in .env, otherwise fallback to local dev URLs
const LOCAL_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
const API_URL = process.env.EXPO_PUBLIC_API_URL || LOCAL_API_URL;
if (!process.env.EXPO_PUBLIC_API_URL && !__DEV__) {
  console.warn("WARNING: EXPO_PUBLIC_API_URL is not set in production. App will likely fail to connect.");
}

export const getToken = async () => {
  try {
    return await SecureStore.getItemAsync('userToken');
  } catch (e) {
    return null;
  }
};

export const setToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync('userToken', token);
  } catch (e) {
    console.error('Error saving token', e);
  }
};

export const clearToken = async () => {
  try {
    await SecureStore.deleteItemAsync('userToken');
  } catch (e) {
    console.error('Error deleting token', e);
  }
};

export const fetchClient = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

  try {
    const url = `${API_URL}${endpoint}`;
    console.log(`[API Call] ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const errorMsg = data.error || data.message || `HTTP error! status: ${response.status} at ${endpoint}`;
      console.error("Fetch API Error:", errorMsg, data);
      throw new Error(errorMsg);
    }

    return data;
  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      console.error(`[API Timeout] ${endpoint} timed out after 15s`);
      throw new Error("Request timed out. Please check your connection.");
    }
    console.error(`[API Network Error] ${endpoint}:`, e);
    throw e;
  }
};
