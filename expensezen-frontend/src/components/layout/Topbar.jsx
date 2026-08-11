import { LogOut, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import useAuth from "../../hooks/useAuth";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/categories": "Categories",
  "/budgets": "Budgets",
  "/savings-goals": "Savings goals",
  "/recurring-transactions": "Recurring transactions",
  "/reports": "Reports",
};

function getInitials(name, email) {
  if (name) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  }

  return email?.charAt(0)?.toUpperCase() || "U";
}

function Topbar({ onOpenSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="app-topbar">
      <div className="topbar-title-area">
        <button
          type="button"
          className="mobile-menu-button"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
        >
          <Menu size={23} />
        </button>

        <div>
          <h1>{pageTitles[location.pathname] || "ExpenseZen"}</h1>
          <p>Track smarter. Spend better.</p>
        </div>
      </div>

      <div className="topbar-account">
        <div className="account-avatar">
          {getInitials(user?.fullName, user?.email)}
        </div>

        <div className="account-information">
          <strong>{user?.fullName || "ExpenseZen User"}</strong>
          <span>{user?.email || "Authenticated account"}</span>
        </div>

        <button
          type="button"
          className="topbar-logout"
          onClick={handleLogout}
          aria-label="Logout"
          title="Logout"
        >
          <LogOut size={19} />
        </button>
      </div>
    </header>
  );
}

export default Topbar;