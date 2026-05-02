// Key feature: Persists and clears auth data in browser storage.
export const AUTH_STORAGE_KEY = "aidela-africa-auth";

export const emptyAuthState = {
  token: "",
  user: null,
};

export const readStoredAuth = () => {
  if (typeof window === "undefined") {
    return emptyAuthState;
  }

  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawValue) {
      return emptyAuthState;
    }

    const parsedValue = JSON.parse(rawValue);

    if (!parsedValue?.token || !parsedValue?.user) {
      return emptyAuthState;
    }

    return parsedValue;
  } catch {
    return emptyAuthState;
  }
};

export const writeStoredAuth = (value) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value));
};

export const clearStoredAuth = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};
