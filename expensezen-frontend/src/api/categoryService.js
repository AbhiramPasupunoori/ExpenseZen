import apiClient from "./apiClient";

export async function getCategories({ signal } = {}) {
  const response = await apiClient.get("/categories", {
    signal,
  });

  const data = response.data;

  if (Array.isArray(data)) {
    return data;
  }

  return data.content ?? data.categories ?? [];
}