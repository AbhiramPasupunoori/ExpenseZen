import apiClient from "./apiClient";

export async function downloadTransactionCsv({
  startDate,
  endDate,
  type = "",
}) {
  const response = await apiClient.get(
    "/reports/transactions.csv",
    {
      params: {
        startDate,
        endDate,
        ...(type && { type }),
      },
      responseType: "blob",
    },
  );

  return response;
}