import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  ReceiptText,
  Wallet,
} from "lucide-react";
import { getDashboardData } from "../api/dashboardService";
import CategoryBreakdownChart from "../components/dashboard/CategoryBreakdownChart";
import MonthlyTrendChart from "../components/dashboard/MonthlyTrendChart";
import StatCard from "../components/dashboard/StatCard";
import useAuth from "../hooks/useAuth";
import { formatCurrency } from "../utils/formatters";

function getCurrentMonth() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${date.getFullYear()}-${month}`;
}

function normalizeTrends(trends = []) {
  return trends.map((item) => {
    const monthNumber = Number(item.month);
    const monthName = new Intl.DateTimeFormat("en", {
      month: "short",
    }).format(new Date(Number(item.year), monthNumber - 1, 1));

    return {
      label: `${monthName} ${String(item.year).slice(-2)}`,
      income: Number(item.income ?? item.totalIncome ?? 0),
      expenses: Number(
        item.expenses ?? item.expense ?? item.totalExpenses ?? 0,
      ),
    };
  });
}

function normalizeCategories(categories = []) {
  return categories.map((item, index) => ({
    id: item.categoryId ?? item.id ?? index,
    name: item.categoryName ?? item.name ?? "Other",
    amount: Number(
      item.amount ?? item.totalAmount ?? item.spentAmount ?? 0,
    ),
    percentage: Number(item.percentage ?? 0),
    color:
      item.categoryColor ??
      item.color ??
      ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"][
        index % 4
      ],
  }));
}

function DashboardPage() {
  const { user } = useAuth();
  const currency = user?.currency || "INR";

  const [selectedMonth, setSelectedMonth] = useState(
    getCurrentMonth,
  );
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadDashboard() {
      const [year, month] = selectedMonth
        .split("-")
        .map(Number);

      setLoading(true);
      setErrorMessage("");

      try {
        const data = await getDashboardData({
          month,
          year,
          trendMonths: 6,
          signal: controller.signal,
        });

        if (active) {
          setDashboard(data);
        }
      } catch (error) {
        if (active && error.code !== "ERR_CANCELED") {
          setErrorMessage(
            error.response?.data?.message ||
              "Dashboard data could not be loaded.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
      controller.abort();
    };
  }, [selectedMonth, refreshKey]);

  const trends = useMemo(
    () => normalizeTrends(dashboard?.monthlyTrends),
    [dashboard],
  );

  const categories = useMemo(
    () => normalizeCategories(dashboard?.categoryBreakdown),
    [dashboard],
  );

  const totalIncome = Number(dashboard?.totalIncome ?? 0);
  const totalExpenses = Number(dashboard?.totalExpenses ?? 0);
  const balance = Number(
    dashboard?.balance ?? dashboard?.currentBalance ?? 0,
  );
  const transactionCount = Number(
    dashboard?.transactionCount ?? 0,
  );

  return (
    <div className="dashboard-page">
      <section className="dashboard-page-header">
        <div>
          <h2>Financial overview</h2>
          <p>
            Review your income, expenses and spending patterns.
          </p>
        </div>

        <div className="dashboard-filters">
          <label>
            <span>Month</span>

            <input
              type="month"
              value={selectedMonth}
              onChange={(event) =>
                setSelectedMonth(event.target.value)
              }
            />
          </label>

          <button
            type="button"
            onClick={() =>
              setRefreshKey((current) => current + 1)
            }
            disabled={loading}
          >
            <RefreshCw
              size={18}
              className={loading ? "spin" : ""}
            />
            Refresh
          </button>
        </div>
      </section>

      {errorMessage && (
        <div className="dashboard-error" role="alert">
          <span>{errorMessage}</span>

          <button
            type="button"
            onClick={() =>
              setRefreshKey((current) => current + 1)
            }
          >
            Try again
          </button>
        </div>
      )}

      {loading && !dashboard ? (
        <div className="dashboard-loading">
          <RefreshCw className="spin" />
          <p>Loading your financial dashboard...</p>
        </div>
      ) : (
        <>
          <section className="statistics-grid">
            <StatCard
              title="Current balance"
              value={formatCurrency(balance, currency)}
              description="Income minus expenses"
              icon={Wallet}
              tone={balance < 0 ? "red" : "blue"}
            />

            <StatCard
              title="Total income"
              value={formatCurrency(totalIncome, currency)}
              description="Income during this month"
              icon={ArrowUpRight}
              tone="green"
            />

            <StatCard
              title="Total expenses"
              value={formatCurrency(totalExpenses, currency)}
              description="Spending during this month"
              icon={ArrowDownRight}
              tone="red"
            />

            <StatCard
              title="Transactions"
              value={transactionCount.toLocaleString("en-IN")}
              description="Recorded during this month"
              icon={ReceiptText}
              tone="orange"
            />
          </section>

          <section className="dashboard-chart-grid">
            <article className="dashboard-panel trend-panel">
              <header className="panel-header">
                <div>
                  <h3>Income and expense trend</h3>
                  <p>Financial activity over six months</p>
                </div>
              </header>

              <MonthlyTrendChart
                data={trends}
                currency={currency}
              />
            </article>

            <article className="dashboard-panel">
              <header className="panel-header">
                <div>
                  <h3>Expense categories</h3>
                  <p>Where your money was spent</p>
                </div>
              </header>

              <CategoryBreakdownChart
                data={categories}
                currency={currency}
              />
            </article>
          </section>
        </>
      )}
    </div>
  );
}

export default DashboardPage;