// Key feature: Extracts readable error messages from API failures.
import axios from "axios";

const getNestedError = (errorPayload) => {
  if (Array.isArray(errorPayload?.errors) && errorPayload.errors.length > 0) {
    return errorPayload.errors[0];
  }

  return errorPayload?.message;
};

export const getErrorMessage = (error, fallback = "Something went wrong.") => {
  // Handle custom API interceptor error object { status, message, originalError }
  if (
    error &&
    typeof error === "object" &&
    Array.isArray(error.errors) &&
    error.errors.length > 0
  ) {
    return error.errors[0];
  }

  if (
    error &&
    typeof error === "object" &&
    error.originalError
  ) {
    const nestedMessage = getNestedError(error.originalError.response?.data);
    if (nestedMessage) {
      return nestedMessage;
    }
  }

  if (
    error &&
    typeof error === "object" &&
    error.message &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    return getNestedError(error.response?.data) || error.message || fallback;
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback
  return fallback;
};
