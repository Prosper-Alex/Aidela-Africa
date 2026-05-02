// Key feature: Formats salary values for job cards and job detail pages.
const formatMoneyValue = (value, currency) => {
  const amount = new Intl.NumberFormat().format(Number(value));

  if (!currency) {
    return amount;
  }

  return /^[A-Z]{3,5}$/i.test(currency)
    ? `${currency.toUpperCase()} ${amount}`
    : `${currency}${amount}`;
};

export const formatSalary = (salary) => {
  if (salary === null || salary === undefined || salary === "") {
    return "Salary not specified";
  }

  if (typeof salary === "string" || typeof salary === "number") {
    return `${salary}`.trim() || "Salary not specified";
  }

  if (typeof salary === "object") {
    const { min, max, currency = "$" } = salary;
    const hasMin = min !== null && min !== undefined && min !== "";
    const hasMax = max !== null && max !== undefined && max !== "";

    if (hasMin && hasMax) {
      return `${formatMoneyValue(min, currency)} - ${formatMoneyValue(max, currency)}`;
    }

    if (hasMin) {
      return formatMoneyValue(min, currency);
    }

    if (hasMax) {
      return formatMoneyValue(max, currency);
    }
  }

  return "Salary not specified";
};
