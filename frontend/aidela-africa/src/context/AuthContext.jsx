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
  const [isInitializing, setIsInitializing] = useState(Boolean(storedAuth.token));

  useEffect(() => {
    if (!token) {
      setIsInitializing(false);
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
        writeStoredAuth({ token, user: currentUser });
      } catch {
        if (!isMounted) {
          return;
        }

        setUser(emptyAuthState.user);
        setToken(emptyAuthState.token);
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
    const data = await loginUser(credentials);
    persistAuth(data.user, data.token);
    return data;
  };

  const signup = async (payload) => {
    const data = await registerUser(payload);
    persistAuth(data.user, data.token);
    return data;
  };

  const logout = () => {
    setUser(emptyAuthState.user);
    setToken(emptyAuthState.token);
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
        isAuthenticated: Boolean(user && token),
        isRecruiter: user?.role === "recruiter",
        isJobSeeker: user?.role === "jobseeker",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
