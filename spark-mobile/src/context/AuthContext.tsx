/**
 * SPARK Smart Parking - Auth Context
 *
 * Provides global authentication state (user, token, loading)
 * and methods (signIn, signUp, signOut) to the entire app.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import {
  loginUser,
  registerUser,
  getMe,
  clearTokens,
  getAccessToken,
  UserProfile,
} from "../services/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string,
    role?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: check if we have a stored token and verify it
  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const profile = await getMe();
          setUser(profile);
        }
      } catch {
        // Token invalid or expired — clear it
        await clearTokens();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await loginUser(email, password);
    setUser(result.user);
  };

  const signUp = async (
    name: string,
    email: string,
    password: string,
    role: string = "mahasiswa"
  ) => {
    const result = await registerUser(name, email, password, role);
    setUser(result.user);
  };

  const signOut = async () => {
    await clearTokens();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const profile = await getMe();
      setUser(profile);
    } catch {
      await signOut();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
