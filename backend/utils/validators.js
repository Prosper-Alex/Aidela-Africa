import validator from "validator";

// Checks that an email looks real before we store or use it.
export const isValidEmail = (email) =>
  typeof email === "string" && validator.isEmail(email);

// URL fields are optional, so empty values are allowed.
export const isValidURL = (url) => {
  if (!url) return true;
  return typeof url === "string" && validator.isURL(url);
};

// Allows normal company names, numbers, spaces, and common punctuation.
export const isValidCompanyName = (name) => {
  if (!name) return true;
  return /^[a-zA-Z0-9 .,&'-]{2,100}$/.test(name);
};
