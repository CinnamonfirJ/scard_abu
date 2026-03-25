import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use production rendering URL if defined in .env, otherwise fallback to local dev URLs
const LOCAL_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
const API_URL = process.env.EXPO_PUBLIC_API_URL || LOCAL_API_URL;

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

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
};
