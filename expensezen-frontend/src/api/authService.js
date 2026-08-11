import apiClient from "./apiClient";

function normalizeResponse(data, fallbackUser = {}) {
  const token = data.accessToken ?? data.token ?? data.jwtToken;

  if (!token) {
    throw new Error("The backend did not return an access token.");
  }

  const user =
    data.user ??
    {
      id: data.userId ?? null,
      fullName: data.fullName ?? fallbackUser.fullName ?? "",
      email: data.email ?? fallbackUser.email ?? "",
      currency: data.currency ?? fallbackUser.currency ?? "INR",
      roles: data.roles ?? [],
    };

  return { token, user };
}

export async function loginRequest(credentials) {
  const response = await apiClient.post("/auth/login", credentials);
  return normalizeResponse(response.data, credentials);
}

export async function registerRequest(registrationData) {
  const response = await apiClient.post(
    "/auth/register",
    registrationData,
  );

  return normalizeResponse(response.data, registrationData);
}