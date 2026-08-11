import {
  ChartNoAxesCombined,
  FolderKanban,
  Goal,
  LayoutDashboard,
  PiggyBank,
  ReceiptText,
  Repeat2,
  WalletCards,
  X,
} from "lucide-react";
import { NavLink } from "react-router";

const navigation = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Transactions",
    path: "/transactions",
    icon: ReceiptText,
  },
  {
    name: "Categories",
    path: "/categories",
    icon: FolderKanban,
  },
  {
    name: "Budgets",
    path: "/budgets",
    icon: PiggyBank,
  },
  {
    name: "Savings goals",
    path: "/savings-goals",
    icon: Goal,
  },
  {
    name: "Recurring",
    path: "/recurring-transactions",
    icon: Repeat2,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: ChartNoAxesCombined,
  },
];

function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}

      <aside className={`app-sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">
            <WalletCards size={25} />
          </span>

          <div>
            <strong>ExpenseZen</strong>
            <span>Finance manager</span>
          </div>

          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        <nav className="sidebar-navigation">
          <span className="navigation-label">Workspace</span>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `navigation-item ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;