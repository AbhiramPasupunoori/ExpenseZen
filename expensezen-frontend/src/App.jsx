import { Route, Routes } from "react-router";
import GuestRoute from "./components/auth/GuestRoute";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import FeaturePlaceholderPage from "./pages/FeaturePlaceholderPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";
import SetupPage from "./pages/SetupPage";
import TransactionsPage from "./pages/TransactionsPage";
import CategoriesPage from "./pages/CategoriesPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SetupPage />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route
            path="/transactions"
            element={<TransactionsPage />}
          />

          <Route
            path="/categories"
            element={<CategoriesPage />}
          />

          <Route
            path="/budgets"
            element={<FeaturePlaceholderPage title="Budgets" />}
          />

          <Route
            path="/savings-goals"
            element={
              <FeaturePlaceholderPage title="Savings goals" />
            }
          />

          <Route
            path="/recurring-transactions"
            element={
              <FeaturePlaceholderPage title="Recurring transactions" />
            }
          />

          <Route
            path="/reports"
            element={<FeaturePlaceholderPage title="Reports" />}
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
