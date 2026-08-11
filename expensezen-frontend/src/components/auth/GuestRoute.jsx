import { Navigate, Outlet } from "react-router";
import useAuth from "../../hooks/useAuth";

function GuestRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default GuestRoute;