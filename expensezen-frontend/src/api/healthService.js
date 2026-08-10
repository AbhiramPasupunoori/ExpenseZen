import apiClient from "./apiClient";

export async function checkBackendHealth() {
  const response = await apiClient.get("/health");
  return response.data;
}