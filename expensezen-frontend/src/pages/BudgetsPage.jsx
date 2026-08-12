import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Plus,
  RefreshCw,
  WalletCards,
} from "lucide-react";
import {
  createBudget,
  deleteBudget,
  getBudgetSummary,
  updateBudget,
} from "../api/budgetService";
import { getCategories } from "../api/categoryService";
import BudgetCard from "../components/budgets/BudgetCard";
import BudgetFormModal from "../components/budgets/BudgetFormModal";
import DeleteBudgetModal from "../components/budgets/DeleteBudgetModal";
import useAuth from "../hooks/useAuth";
import { formatCurrency } from "../utils/formatters";
import "../styles/budgets.css";

function getCurrentMonth() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${date.getFullYear()}-${month}`;
}

function moveMonth(value, amount) {
  const [year, month] = value.split("-").map(Number);
  const date = new Date(year, month - 1 + amount, 1);
  const nextMonth = String(date.getMonth() + 1).padStart(
    2,
    "0",
  );

  return `${date.getFullYear()}-${nextMonth}`;
}

function BudgetsPage() {
  const { user } = useAuth();
  const currency = user?.currency || "INR";

  const [selectedMonth, setSelectedMonth] = useState(
    getCurrentMonth,
  );
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingBudget, setDeletingBudget] = useState(null);

  const [year, month] = selectedMonth
    .split("-")
    .map(Number);

  const monthLabel = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const data = await getCategories({
          signal: controller.signal,
        });

        setCategories(data);
      } catch (error) {
        if (error.code !== "ERR_CANCELED") {
          setErrorMessage(
            error.response?.data?.message ||
              "Categories could not be loaded.",
          );
        }
      }
    }

    loadCategories();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadBudgets() {
      setLoading(true);
      setErrorMessage("");

      try {
        const data = await getBudgetSummary({
          month,
          year,
          signal: controller.signal,
        });

        if (active) {
          setSummary(data);
        }
      } catch (error) {
        if (active && error.code !== "ERR_CANCELED") {
          setErrorMessage(
            error.response?.data?.message ||
              "Budget information could not be loaded.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBudgets();

    return () => {
      active = false;
      controller.abort();
    };
  }, [month, year, refreshKey]);

  const budgets = summary?.budgets ?? [];

  function showSuccess(message) {
    setSuccessMessage(message);

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3500);
  }

  function openCreate() {
    setEditingBudget(null);
    setFormOpen(true);
  }

  function openEdit(budget) {
    setEditingBudget(budget);
    setFormOpen(true);
  }

  async function handleSave(budgetData) {
    if (editingBudget) {
      await updateBudget(editingBudget.id, budgetData);
      showSuccess("Budget updated successfully.");
    } else {
      await createBudget(budgetData);
      showSuccess("Budget created successfully.");
    }

    setRefreshKey((current) => current + 1);
  }

  async function handleDelete(budgetId) {
    await deleteBudget(budgetId);
    showSuccess("Budget deleted successfully.");
    setRefreshKey((current) => current + 1);
  }

  return (
    <div className="budgets-page">
      <section className="budgets-page-header">
        <div>
          <h2>Monthly budgets</h2>

          <p>
            Set spending limits and monitor your monthly
            expenses.
          </p>
        </div>

        <button
          type="button"
          className="add-budget-button"
          onClick={openCreate}
        >
          <Plus size={19} />
          Create budget
        </button>
      </section>

      {successMessage && (
        <div className="transaction-success">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="dashboard-error">
          {errorMessage}
        </div>
      )}

      <section className="budget-month-selector">
        <button
          type="button"
          onClick={() =>
            setSelectedMonth((current) =>
              moveMonth(current, -1),
            )
          }
          aria-label="Previous month"
        >
          <ChevronLeft size={19} />
        </button>

        <label>
          <span>Selected month</span>

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
            setSelectedMonth((current) =>
              moveMonth(current, 1),
            )
          }
          aria-label="Next month"
        >
          <ChevronRight size={19} />
        </button>

        <strong>{monthLabel}</strong>

        <button
          type="button"
          className="budget-refresh-button"
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
      </section>

      <section className="budget-summary-grid">
        <article>
          <span className="budget-summary-icon total">
            <WalletCards size={22} />
          </span>

          <div>
            <span>Total budget</span>
            <strong>
              {formatCurrency(
                summary?.totalBudget,
                currency,
              )}
            </strong>
          </div>
        </article>

        <article>
          <span className="budget-summary-icon spent">
            <AlertTriangle size={22} />
          </span>

          <div>
            <span>Total spent</span>
            <strong>
              {formatCurrency(
                summary?.totalSpent,
                currency,
              )}
            </strong>
          </div>
        </article>

        <article>
          <span className="budget-summary-icon remaining">
            <CircleCheck size={22} />
          </span>

          <div>
            <span>Total remaining</span>
            <strong>
              {formatCurrency(
                summary?.totalRemaining,
                currency,
              )}
            </strong>
          </div>
        </article>

        <article>
          <span
            className={`budget-summary-icon ${
              summary?.overallStatus?.toLowerCase() ||
              "safe"
            }`}
          >
            <AlertTriangle size={22} />
          </span>

          <div>
            <span>Overall usage</span>
            <strong>
              {Number(
                summary?.usagePercentage ?? 0,
              ).toFixed(1)}
              %
            </strong>
          </div>
        </article>
      </section>

      <section className="budget-warning-summary">
        <span>
          <CircleCheck size={17} />
          {summary?.budgetCount ?? 0} budgets
        </span>

        <span className="warning">
          <AlertTriangle size={17} />
          {summary?.warningCount ?? 0} warnings
        </span>

        <span className="exceeded">
          <AlertTriangle size={17} />
          {summary?.exceededCount ?? 0} exceeded
        </span>
      </section>

      {loading && !summary ? (
        <div className="budget-empty">
          <RefreshCw className="spin" />
          <p>Loading budgets...</p>
        </div>
      ) : budgets.length ? (
        <section className="budget-card-grid">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              currency={currency}
              onEdit={openEdit}
              onDelete={setDeletingBudget}
            />
          ))}
        </section>
      ) : (
        <div className="budget-empty">
          <WalletCards size={38} />
          <h3>No budgets for {monthLabel}</h3>
          <p>
            Create a category budget to start monitoring your
            spending.
          </p>

          <button type="button" onClick={openCreate}>
            <Plus size={18} />
            Create budget
          </button>
        </div>
      )}

      {formOpen && (
        <BudgetFormModal
          budget={editingBudget}
          categories={categories}
          selectedMonth={selectedMonth}
          onSubmit={handleSave}
          onClose={() => {
            setFormOpen(false);
            setEditingBudget(null);
          }}
        />
      )}

      {deletingBudget && (
        <DeleteBudgetModal
          budget={deletingBudget}
          onConfirm={handleDelete}
          onClose={() => setDeletingBudget(null)}
        />
      )}
    </div>
  );
}

export default BudgetsPage;