import {
  CircleCheck,
  LogOut,
  WalletCards,
} from "lucide-react";
import useAuth from "../hooks/useAuth";

function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main className="dashboard-placeholder">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <WalletCards />
          <span>ExpenseZen</span>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={logout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <section className="dashboard-welcome">
        <CircleCheck size={42} />

        <h1>
          Welcome{user?.fullName ? `, ${user.fullName}` : ""}
        </h1>

        <p>
          Registration, login and protected routes are working.
        </p>

        {user?.email && (
          <span className="user-email">{user.email}</span>
        )}
      </section>
    </main>
  );
}

export default DashboardPage;