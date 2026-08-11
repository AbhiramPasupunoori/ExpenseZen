export function formatCurrency(value, currency = "INR") {
  const numericValue = Number(value) || 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

export function formatCompactCurrency(value, currency = "INR") {
  const numericValue = Number(value) || 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(numericValue);
}