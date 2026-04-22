import { createContext, useContext, useEffect, useState } from "react";
import {
  clearStoredAuth,
  emptyAuthState,
  readStoredAuth,
  writeStoredAuth,
} from "../utils/authStorage";
import { normalizeUserRole } from "../utils/normalizeRole";
import {
  fetchCurrentUser,
  loginUser,
  registerUser,
} from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const storedAuth = readStoredAuth();
  const [user, setUser] = useState(normalizeUserRole(storedAuth.user));
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

        const normalizedUser = normalizeUserRole(currentUser);
        setUser(normalizedUser);
        setError(null);
        writeStoredAuth({ token, user: normalizedUser });
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
    const normalizedUser = normalizeUserRole(nextUser);
    setUser(normalizedUser);
    setToken(nextToken);
    writeStoredAuth({
      user: normalizedUser,
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
    const normalizedUser = normalizeUserRole(nextUser);
    setUser(normalizedUser);

    if (token) {
      writeStoredAuth({
        user: normalizedUser,
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
