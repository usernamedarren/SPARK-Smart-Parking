/**
 * SPARK Smart Parking - API Service
 *
 * Centralized axios client for communicating with the FastAPI backend.
 * Token management via AsyncStorage.
 */

import axios from "axios";
import AsyncStorageModule from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Safe resolver for both ES modules and CommonJS environments (prevents undefined default exports)
const AsyncStorage = (AsyncStorageModule as any)?.default || AsyncStorageModule;

const memoryStorage: Record<string, string> = {};
const warnedKeys = new Set<string>();

const warnOnce = (message: string, error: any) => {
  const cacheKey = `${message}-${error?.message || "error"}`;
  if (!warnedKeys.has(cacheKey)) {
    warnedKeys.add(cacheKey);
    console.warn(message, error);
  }
};

// Safe storage wrapper to prevent crash on Web/Browser environments:
// "[@RNC/AsyncStorage]: NativeModule: AsyncStorage is null."
const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === "web" || typeof window !== "undefined") {
        return window.localStorage.getItem(key);
      }
      if (!AsyncStorage || typeof AsyncStorage.getItem !== "function") {
        throw new Error("AsyncStorage module is not fully loaded on this platform.");
      }
      return await AsyncStorage.getItem(key);
    } catch (e) {
      warnOnce("safeStorage.getItem falling back to memory/localStorage:", e);
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return memoryStorage[key] || null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === "web" || typeof window !== "undefined") {
        window.localStorage.setItem(key, value);
        return;
      }
      if (!AsyncStorage || typeof AsyncStorage.setItem !== "function") {
        throw new Error("AsyncStorage module is not fully loaded on this platform.");
      }
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      warnOnce("safeStorage.setItem falling back to memory/localStorage:", e);
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      memoryStorage[key] = value;
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === "web" || typeof window !== "undefined") {
        window.localStorage.removeItem(key);
        return;
      }
      if (!AsyncStorage || typeof AsyncStorage.removeItem !== "function") {
        throw new Error("AsyncStorage module is not fully loaded on this platform.");
      }
      await AsyncStorage.removeItem(key);
    } catch (e) {
      warnOnce("safeStorage.removeItem falling back to memory/localStorage:", e);
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      delete memoryStorage[key];
    }
  }
};

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

// Change this to your backend's IP/hostname.
// - Physical device on same Wi-Fi:  http://192.168.x.x:8000
// - Android emulator:               http://10.0.2.2:8000
// - iOS simulator:                   http://localhost:8000
const API_BASE_URL = "https://prowling-unkind-arbitrate.ngrok-free.dev";

const TOKEN_KEY = "spark_access_token";
const REFRESH_KEY = "spark_refresh_token";

// ---------------------------------------------------------------------------
// Axios Instance
// ---------------------------------------------------------------------------

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
api.interceptors.request.use(async (config) => {
  const token = await safeStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Token Helpers
// ---------------------------------------------------------------------------

export async function storeTokens(access: string, refresh: string) {
  await safeStorage.setItem(TOKEN_KEY, access);
  await safeStorage.setItem(REFRESH_KEY, refresh);
}

export async function getAccessToken(): Promise<string | null> {
  return safeStorage.getItem(TOKEN_KEY);
}

export async function clearTokens() {
  await safeStorage.removeItem(TOKEN_KEY);
  await safeStorage.removeItem(REFRESH_KEY);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  notification_preference: boolean;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
}

export interface ParkingAreaWithStatus {
  id: string;
  name: string;
  location_description?: string;
  latitude: number;
  longitude: number;
  total_slots: number;
  camera_device_id?: string;
  occupied_slots: number;
  available_slots: number;
  occupancy_rate: number;
  status_label: "available" | "limited" | "full";
  captured_at?: string;
  updated_at?: string;
  image_url?: string;
  slot_status?: Record<string, unknown>;
}

export interface RecommendationItem {
  area_id: string;
  area_name: string;
  available_slots: number;
  total_slots: number;
  occupancy_rate: number;
  status_label: string;
  distance_km: number;
  estimated_walk_minutes: number;
  score: number;
}

export interface RecommendationResponse {
  destination: string;
  recommendations: RecommendationItem[];
}

export interface PredictionResponse {
  area_id: string;
  area_name: string;
  arrival_time: string;
  current_available_slots: number;
  predicted_available_slots: number;
  predicted_occupancy_rate: number;
  predicted_status_label: string;
  confidence: number;
  sample_size: number;
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/login", { email, password });
  await storeTokens(res.data.access_token, res.data.refresh_token);
  return res.data;
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: string = "mahasiswa"
): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/register", {
    name,
    email,
    password,
    role,
  });
  await storeTokens(res.data.access_token, res.data.refresh_token);
  return res.data;
}

export async function getMe(): Promise<UserProfile> {
  const res = await api.get<UserProfile>("/auth/me");
  return res.data;
}

// ---------------------------------------------------------------------------
// User API
// ---------------------------------------------------------------------------

export async function updateProfile(data: {
  name?: string;
  role?: string;
}): Promise<UserProfile> {
  const res = await api.put<UserProfile>("/user/profile", data);
  return res.data;
}

export async function updateNotifications(
  preference: boolean
): Promise<UserProfile> {
  const res = await api.put<UserProfile>("/user/notifications", {
    notification_preference: preference,
  });
  return res.data;
}

export async function updatePassword(
  newPassword: string
): Promise<{ message: string; success: boolean }> {
  const res = await api.put<{ message: string; success: boolean }>("/user/password", {
    new_password: newPassword,
  });
  return res.data;
}

// ---------------------------------------------------------------------------
// Parking API
// ---------------------------------------------------------------------------

export async function getParkingAreas(): Promise<ParkingAreaWithStatus[]> {
  const res = await api.get<ParkingAreaWithStatus[]>("/parking/status");
  return res.data;
}

export async function getParkingAreaStatus(
  areaId: string
): Promise<ParkingAreaWithStatus> {
  const res = await api.get<ParkingAreaWithStatus>(
    `/parking/status/${areaId}`
  );
  return res.data;
}

// ---------------------------------------------------------------------------
// Recommendation API
// ---------------------------------------------------------------------------

export async function getRecommendations(
  destination: string,
  topN: number = 5
): Promise<RecommendationResponse> {
  const res = await api.get<RecommendationResponse>("/recommendation", {
    params: { destination, top_n: topN },
  });
  return res.data;
}

// ---------------------------------------------------------------------------
// Prediction API
// ---------------------------------------------------------------------------

export async function getPrediction(
  areaId: string,
  arrivalTime: string
): Promise<PredictionResponse> {
  const res = await api.get<PredictionResponse>("/prediction", {
    params: { area_id: areaId, arrival_time: arrivalTime },
  });
  return res.data;
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/** Build full URL for a parking snapshot image */
export function getSnapshotUrl(cameraDeviceId: string): string {
  return `${API_BASE_URL}/static/snapshots/${cameraDeviceId}.jpg`;
}

export { API_BASE_URL };
export default api;
