import apiClient from "./apiClient";

export async function getBudgetSummary({
  month,
  year,
  signal,
}) {
  const response = await apiClient.get("/budgets/summary", {
    params: {
      month,
      year,
    },
    signal,
  });

  return response.data;
}

export async function createBudget(budgetData) {
  const response = await apiClient.post(
    "/budgets",
    budgetData,
  );

  return response.data;
}

export async function updateBudget(budgetId, budgetData) {
  const response = await apiClient.put(
    `/budgets/${budgetId}`,
    budgetData,
  );

  return response.data;
}

export async function deleteBudget(budgetId) {
  await apiClient.delete(`/budgets/${budgetId}`);
}