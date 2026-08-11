import apiClient from "./apiClient";

function normalizeCategories(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return data.content ?? data.categories ?? [];
}

export async function getCategories({
  type = "",
  signal,
} = {}) {
  const response = await apiClient.get("/categories", {
    params: {
      ...(type && { type }),
    },
    signal,
  });

  return normalizeCategories(response.data);
}

export async function createCategory(categoryData) {
  const response = await apiClient.post(
    "/categories",
    categoryData,
  );

  return response.data;
}

export async function updateCategory(
  categoryId,
  categoryData,
) {
  const response = await apiClient.put(
    `/categories/${categoryId}`,
    categoryData,
  );

  return response.data;
}

export async function deleteCategory(categoryId) {
  await apiClient.delete(`/categories/${categoryId}`);
}