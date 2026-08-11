import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  loginRequest,
  registerRequest,
} from "../api/authService";
import {
  getSession,
  removeSession,
  saveSession,
} from "../utils/tokenStorage";
import AuthContext from "./AuthContext";

function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getSession());

  useEffect(() => {
    function handleUnauthorized() {
      setSession(null);
    }

    window.addEventListener(
      "expensezen:unauthorized",
      handleUnauthorized,
    );

    return () => {
      window.removeEventListener(
        "expensezen:unauthorized",
        handleUnauthorized,
      );
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await loginRequest(credentials);
    const savedSession = saveSession(result.token, result.user);

    setSession(savedSession);
    return savedSession;
  }, []);

  const register = useCallback(async (registrationData) => {
    const result = await registerRequest(registrationData);
    const savedSession = saveSession(result.token, result.user);

    setSession(savedSession);
    return savedSession;
  }, []);

  const logout = useCallback(() => {
    removeSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      token: session?.token ?? null,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.token),
      login,
      register,
      logout,
    }),
    [session, login, register, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;