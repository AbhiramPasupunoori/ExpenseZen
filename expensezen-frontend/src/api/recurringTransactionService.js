import apiClient from "./apiClient";

const BASE_URL = "/recurring-transactions";

export async function getRecurringTransactions() {
  const response = await apiClient.get(BASE_URL);
  return response.data;
}

export async function createRecurringTransaction(data) {
  const response = await apiClient.post(BASE_URL, data);
  return response.data;
}

export async function updateRecurringTransaction(id, data) {
  const response = await apiClient.put(
    `${BASE_URL}/${id}`,
    data,
  );

  return response.data;
}

export async function toggleRecurringTransaction(id) {
  const response = await apiClient.patch(
    `${BASE_URL}/${id}/toggle`,
  );

  return response.data;
}

export async function processDueRecurringTransactions() {
  const response = await apiClient.post(
    `${BASE_URL}/process-due`,
  );

  return response.data;
}

export async function deleteRecurringTransaction(id) {
  await apiClient.delete(`${BASE_URL}/${id}`);
}