import { createContext, useContext, useEffect, useState } from "react";
import {
  clearStoredAuth,
  emptyAuthState,
  readStoredAuth,
  writeStoredAuth,
} from "../utils/authStorage";
import {
  fetchCurrentUser,
  loginUser,
  registerUser,
} from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const storedAuth = readStoredAuth();
  const [user, setUser] = useState(storedAuth.user);
  const [token, setToken] = useState(storedAuth.token);
  const [isInitializing, setIsInitializing] = useState(
    Boolean(storedAuth.token),
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only run sync logic if token exists (avoid setState in effect body)
    if (!token) {
      return;
    }

    let isMounted = true;

    const syncCurrentUser = async () => {
      try {
        const currentUser = await fetchCurrentUser();

        if (!isMounted) {
          return;
        }

        setUser(currentUser);
        setError(null);
        writeStoredAuth({ token, user: currentUser });
      } catch (err) {
        if (!isMounted) {
          return;
        }

        console.error("[AUTH] Failed to sync user:", err.message || err);
        setUser(emptyAuthState.user);
        setToken(emptyAuthState.token);
        setError("Session expired. Please log in again.");
        clearStoredAuth();
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    syncCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const persistAuth = (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    writeStoredAuth({
      user: nextUser,
      token: nextToken,
    });
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const data = await loginUser(credentials);
      persistAuth(data.user, data.token);
      return data;
    } catch (err) {
      const errorMsg = err.message || "Login failed. Please try again.";
      setError(errorMsg);
      console.error("[AUTH] Login error:", errorMsg);
      throw err;
    }
  };

  const signup = async (payload) => {
    try {
      setError(null);
      const data = await registerUser(payload);
      persistAuth(data.user, data.token);
      return data;
    } catch (err) {
      const errorMsg = err.message || "Signup failed. Please try again.";
      setError(errorMsg);
      console.error("[AUTH] Signup error:", errorMsg);
      throw err;
    }
  };

  const logout = () => {
    setUser(emptyAuthState.user);
    setToken(emptyAuthState.token);
    setError(null);
    clearStoredAuth();
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);

    if (token) {
      writeStoredAuth({
        user: nextUser,
        token,
      });
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        logout,
        updateUser,
        isInitializing,
        error,
        clearError,
        isAuthenticated: Boolean(user && token),
        isRecruiter: user?.role === "recruiter",
        isJobSeeker: user?.role === "jobseeker",
      }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
