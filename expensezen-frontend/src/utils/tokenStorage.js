const SESSION_KEY = "expensezen_session";

export function getSession() {
  try {
    const value = localStorage.getItem(SESSION_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveSession(token, user = null) {
  const session = { token, user };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function removeSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getToken() {
  return getSession()?.token ?? null;
}

export function hasToken() {
  return Boolean(getToken());
}