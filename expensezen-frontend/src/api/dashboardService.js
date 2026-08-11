import apiClient from "./apiClient";

export async function getDashboardData({
  month,
  year,
  trendMonths = 6,
  signal,
}) {
  const response = await apiClient.get("/dashboard", {
    params: {
      month,
      year,
      trendMonths,
    },
    signal,
  });

  return response.data;
}