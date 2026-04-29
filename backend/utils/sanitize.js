// Cleans a single text value by removing extra spaces at the start and end.
export const sanitizeString = (value) => {
  if (typeof value !== "string") return value;
  return value.trim();
};

// Cleans a list of values and removes empty strings.
export const sanitizeArray = (arr) => {
  if (!Array.isArray(arr)) return arr;
  return arr.map((v) => (typeof v === "string" ? v.trim() : v)).filter(Boolean);
};
