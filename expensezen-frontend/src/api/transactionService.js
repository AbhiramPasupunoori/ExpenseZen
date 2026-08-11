import apiClient from "./apiClient";

export async function getTransactions({
  page = 0,
  size = 10,
  search = "",
  type = "",
  categoryId = "",
  startDate = "",
  endDate = "",
  signal,
}) {
  const response = await apiClient.get("/transactions", {
    params: {
      page,
      size,
      ...(search && { search }),
      ...(type && { type }),
      ...(categoryId && { categoryId }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    },
    signal,
  });

  return response.data;
}

export async function createTransaction(transactionData) {
  const response = await apiClient.post(
    "/transactions",
    transactionData,
  );

  return response.data;
}

export async function updateTransaction(
  transactionId,
  transactionData,
) {
  const response = await apiClient.put(
    `/transactions/${transactionId}`,
    transactionData,
  );

  return response.data;
}

export async function deleteTransaction(transactionId) {
  await apiClient.delete(`/transactions/${transactionId}`);
}