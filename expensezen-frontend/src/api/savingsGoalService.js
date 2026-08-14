import apiClient from "./apiClient";

export async function getSavingsGoals({ signal } = {}) {
  const response = await apiClient.get("/savings-goals", {
    signal,
  });

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.content ?? response.data.goals ?? [];
}

export async function createSavingsGoal(goalData) {
  const response = await apiClient.post(
    "/savings-goals",
    goalData,
  );

  return response.data;
}

export async function updateSavingsGoal(goalId, goalData) {
  const response = await apiClient.put(
    `/savings-goals/${goalId}`,
    goalData,
  );

  return response.data;
}

export async function contributeToSavingsGoal(goalId, amount) {
  const response = await apiClient.patch(
    `/savings-goals/${goalId}/contributions`,
    { amount },
  );

  return response.data;
}

export async function cancelSavingsGoal(goalId) {
  const response = await apiClient.patch(
    `/savings-goals/${goalId}/cancel`,
  );

  return response.data;
}

export async function deleteSavingsGoal(goalId) {
  await apiClient.delete(`/savings-goals/${goalId}`);
}