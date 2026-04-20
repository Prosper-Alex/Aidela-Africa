import axios from "axios";

const getNestedError = (errorPayload) => {
  if (Array.isArray(errorPayload?.errors) && errorPayload.errors.length > 0) {
    return errorPayload.errors[0];
  }

  return errorPayload?.message;
};

export const getErrorMessage = (error, fallback = "Something went wrong.") => {
  if (axios.isAxiosError(error)) {
    return getNestedError(error.response?.data) || error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
