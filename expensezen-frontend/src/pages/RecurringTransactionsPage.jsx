import {
  CalendarClock,
  Plus,
  RefreshCw,
  Repeat2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createRecurringTransaction,
  deleteRecurringTransaction,
  getRecurringTransactions,
  processDueRecurringTransactions,
  toggleRecurringTransaction,
  updateRecurringTransaction,
} from "../api/recurringTransactionService";

import "../styles/recurring-transactions.css";

import { getCategories } from "../api/categoryService";

import RecurringTransactionCard from "../components/recurring/RecurringTransactionCard";
import RecurringTransactionFormModal from "../components/recurring/RecurringTransactionFormModal";

function RecurringTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const loadTransactions = useCallback(async () => {
    try {
      setErrorMessage("");

      const [transactionData, categoryData] =
        await Promise.all([
          getRecurringTransactions(),
          getCategories(),
        ]);

      setTransactions(
        Array.isArray(transactionData)
          ? transactionData
          : [],
      );

      setCategories(
        Array.isArray(categoryData)
          ? categoryData
          : [],
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Unable to load recurring transactions.",
      );
    }
  }, []);

  useEffect(() => {
    async function loadPage() {
      setLoading(true);

      await loadTransactions();

      setLoading(false);
    }

    loadPage();
  }, [loadTransactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        transaction.title
          ?.toLowerCase()
          .includes(searchValue) ||
        transaction.categoryName
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && transaction.active) ||
        (statusFilter === "INACTIVE" &&
          !transaction.active);

      const matchesType =
        typeFilter === "ALL" ||
        transaction.type === typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [
    transactions,
    search,
    statusFilter,
    typeFilter,
  ]);

  const summary = useMemo(() => {
    const active = transactions.filter(
      (transaction) => transaction.active,
    );

    const income = active
      .filter((transaction) => transaction.type === "INCOME")
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0,
      );

    const expenses = active
      .filter((transaction) => transaction.type === "EXPENSE")
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0,
      );

    return {
      total: transactions.length,
      active: active.length,
      inactive: transactions.length - active.length,
      income,
      expenses,
    };
  }, [transactions]);

  async function handleRefresh() {
    setRefreshing(true);
    setSuccessMessage("");

    try {
      await loadTransactions();
    } finally {
      setRefreshing(false);
    }
  }

  function handleAdd() {
    setEditingTransaction(null);
    setShowModal(true);
  }

  function handleEdit(transaction) {
    setEditingTransaction(transaction);
    setShowModal(true);
  }

  async function handleSubmit(data) {
    if (editingTransaction) {
      const updated =
        await updateRecurringTransaction(
          editingTransaction.id,
          data,
        );

      setTransactions((current) =>
        current.map((transaction) =>
          transaction.id === updated.id
            ? updated
            : transaction,
        ),
      );

      setSuccessMessage(
        "Recurring transaction updated successfully.",
      );
    } else {
      const created =
        await createRecurringTransaction(data);

      setTransactions((current) => [
        created,
        ...current,
      ]);

      setSuccessMessage(
        "Recurring transaction created successfully.",
      );
    }
  }

  async function handleToggle(transaction) {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const updated =
        await toggleRecurringTransaction(
          transaction.id,
        );

      setTransactions((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item,
        ),
      );

      setSuccessMessage(
        updated.active
          ? "Recurring transaction activated."
          : "Recurring transaction deactivated.",
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Unable to change transaction status.",
      );
    }
  }

  async function handleDelete(transaction) {
    const confirmed = window.confirm(
      `Delete "${transaction.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage("");
      setSuccessMessage("");

      await deleteRecurringTransaction(
        transaction.id,
      );

      setTransactions((current) =>
        current.filter(
          (item) => item.id !== transaction.id,
        ),
      );

      setSuccessMessage(
        "Recurring transaction deleted successfully.",
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Unable to delete recurring transaction.",
      );
    }
  }

  async function handleProcessDue() {
    try {
      setProcessing(true);
      setErrorMessage("");
      setSuccessMessage("");

      const result =
        await processDueRecurringTransactions();

      await loadTransactions();

      setSuccessMessage(
        result?.message ||
          "Due recurring transactions processed successfully.",
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Unable to process due transactions.",
      );
    } finally {
      setProcessing(false);
    }
  }

  function closeModal() {
    if (showModal) {
      setShowModal(false);
      setEditingTransaction(null);
    }
  }

  if (loading) {
    return (
      <main className="page-container recurring-page">
        <div className="page-loading">
          <RefreshCw className="spin" size={24} />
          <span>Loading recurring transactions...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container recurring-page">
      <header className="page-header">
        <div>
          <div className="page-title-row">
            <Repeat2 size={28} />

            <h1>Recurring Transactions</h1>
          </div>

          <p>
            Automatically manage your scheduled income
            and expenses.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              size={18}
              className={refreshing ? "spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={handleProcessDue}
            disabled={processing}
          >
            <CalendarClock size={18} />
            {processing
              ? "Processing..."
              : "Process Due"}
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={handleAdd}
          >
            <Plus size={18} />
            Add Recurring
          </button>
        </div>
      </header>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

      <section className="recurring-summary-grid">
        <div className="summary-card">
          <span>Total schedules</span>
          <strong>{summary.total}</strong>
        </div>

        <div className="summary-card">
          <span>Active</span>
          <strong>{summary.active}</strong>
        </div>

        <div className="summary-card">
          <span>Inactive</span>
          <strong>{summary.inactive}</strong>
        </div>

        <div className="summary-card">
          <span>Monthly active expenses</span>
          <strong>
            ₹{summary.expenses.toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="summary-card">
          <span>Active income</span>
          <strong>
            ₹{summary.income.toLocaleString("en-IN")}
          </strong>
        </div>
      </section>

      <section className="recurring-filters">
        <input
          type="search"
          placeholder="Search by title or category..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value)
          }
        >
          <option value="ALL">All types</option>
          <option value="EXPENSE">Expenses</option>
          <option value="INCOME">Income</option>
        </select>
      </section>

      {filteredTransactions.length === 0 ? (
        <section className="recurring-empty-state">
          <Repeat2 size={42} />

          <h2>
            {transactions.length === 0
              ? "No recurring transactions"
              : "No matching transactions"}
          </h2>

          <p>
            {transactions.length === 0
              ? "Create your first recurring transaction to automate your finances."
              : "Try changing your search or filters."}
          </p>

          {transactions.length === 0 && (
            <button
              type="button"
              className="primary-button"
              onClick={handleAdd}
            >
              <Plus size={18} />
              Create Recurring Transaction
            </button>
          )}
        </section>
      ) : (
        <section className="recurring-grid">
          {filteredTransactions.map((transaction) => (
            <RecurringTransactionCard
              key={transaction.id}
              transaction={transaction}
              currency="INR"
              onEdit={handleEdit}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </section>
      )}

      {showModal && (
        <RecurringTransactionFormModal
          key={editingTransaction?.id ?? "new"}
          transaction={editingTransaction}
          categories={categories}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
    </main>
  );
}

export default RecurringTransactionsPage;
