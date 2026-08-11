import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FilterX,
  Plus,
  Search,
} from "lucide-react";
import { getCategories } from "../api/categoryService";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../api/transactionService";
import DeleteTransactionModal from "../components/transactions/DeleteTransactionModal";
import TransactionFormModal from "../components/transactions/TransactionFormModal";
import TransactionTable from "../components/transactions/TransactionTable";
import useAuth from "../hooks/useAuth";
import useDebounce from "../hooks/useDebounce";
import "../styles/transactions.css";

const initialFilters = {
  search: "",
  type: "",
  categoryId: "",
  startDate: "",
  endDate: "",
};

function TransactionsPage() {
  const { user } = useAuth();
  const currency = user?.currency || "INR";

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState(null);

  const debouncedSearch = useDebounce(filters.search, 400);

  const filteredCategories = useMemo(() => {
    if (!filters.type) {
      return categories;
    }

    return categories.filter(
      (category) => category.type === filters.type,
    );
  }, [categories, filters.type]);

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

    async function loadTransactions() {
      setLoading(true);
      setErrorMessage("");

      try {
        const data = await getTransactions({
          page,
          size: pageSize,
          search: debouncedSearch,
          type: filters.type,
          categoryId: filters.categoryId,
          startDate: filters.startDate,
          endDate: filters.endDate,
          signal: controller.signal,
        });

        if (active) {
          const content =
            data.content ?? data.transactions ?? [];

          setTransactions(content);
          setTotalPages(data.totalPages ?? 0);
          setTotalElements(
            data.totalElements ?? content.length,
          );
        }
      } catch (error) {
        if (active && error.code !== "ERR_CANCELED") {
          setErrorMessage(
            error.response?.data?.message ||
              "Transactions could not be loaded.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTransactions();

    return () => {
      active = false;
      controller.abort();
    };
  }, [
    page,
    pageSize,
    debouncedSearch,
    filters.type,
    filters.categoryId,
    filters.startDate,
    filters.endDate,
    refreshKey,
  ]);

  function updateFilter(name, value) {
    setPage(0);

    setFilters((current) => {
      if (name === "type") {
        return {
          ...current,
          type: value,
          categoryId: "",
        };
      }

      return {
        ...current,
        [name]: value,
      };
    });
  }

  function clearFilters() {
    setFilters(initialFilters);
    setPage(0);
  }

  function openCreateModal() {
    setEditingTransaction(null);
    setFormOpen(true);
  }

  function openEditModal(transaction) {
    setEditingTransaction(transaction);
    setFormOpen(true);
  }

  async function handleSave(payload) {
    if (editingTransaction) {
      await updateTransaction(
        editingTransaction.id,
        payload,
      );

      setSuccessMessage("Transaction updated successfully.");
    } else {
      await createTransaction(payload);
      setSuccessMessage("Transaction added successfully.");
    }

    setRefreshKey((current) => current + 1);

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3500);
  }

  async function handleDelete(transactionId) {
    await deleteTransaction(transactionId);

    setSuccessMessage("Transaction deleted successfully.");

    if (transactions.length === 1 && page > 0) {
      setPage((current) => current - 1);
    } else {
      setRefreshKey((current) => current + 1);
    }

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3500);
  }

  return (
    <div className="transactions-page">
      <section className="transactions-page-header">
        <div>
          <h2>Transactions</h2>
          <p>
            Manage all your income and expense records.
          </p>
        </div>

        <button
          type="button"
          className="add-transaction-button"
          onClick={openCreateModal}
        >
          <Plus size={19} />
          Add transaction
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

      <section className="transaction-filters">
        <label className="transaction-search">
          <Search size={18} />

          <input
            type="search"
            value={filters.search}
            onChange={(event) =>
              updateFilter("search", event.target.value)
            }
            placeholder="Search transactions..."
          />
        </label>

        <select
          value={filters.type}
          onChange={(event) =>
            updateFilter("type", event.target.value)
          }
          aria-label="Transaction type"
        >
          <option value="">All types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>

        <select
          value={filters.categoryId}
          onChange={(event) =>
            updateFilter("categoryId", event.target.value)
          }
          aria-label="Category"
        >
          <option value="">All categories</option>

          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(event) =>
            updateFilter("startDate", event.target.value)
          }
          aria-label="Start date"
        />

        <input
          type="date"
          value={filters.endDate}
          min={filters.startDate || undefined}
          onChange={(event) =>
            updateFilter("endDate", event.target.value)
          }
          aria-label="End date"
        />

        <button
          type="button"
          className="clear-filter-button"
          onClick={clearFilters}
          title="Clear filters"
        >
          <FilterX size={18} />
          Clear
        </button>
      </section>

      <section className="transaction-list-panel">
        <header className="transaction-list-header">
          <div>
            <h3>Transaction history</h3>
            <span>
              {totalElements.toLocaleString("en-IN")} records
            </span>
          </div>

          <label>
            <span>Rows</span>

            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(0);
              }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </label>
        </header>

        <TransactionTable
          transactions={transactions}
          currency={currency}
          loading={loading}
          onEdit={openEditModal}
          onDelete={setDeletingTransaction}
        />

        <footer className="transaction-pagination">
          <span>
            Page {totalPages ? page + 1 : 0} of {totalPages}
          </span>

          <div>
            <button
              type="button"
              onClick={() =>
                setPage((current) => current - 1)
              }
              disabled={page === 0 || loading}
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            <button
              type="button"
              onClick={() =>
                setPage((current) => current + 1)
              }
              disabled={
                page + 1 >= totalPages || loading
              }
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </footer>
      </section>

      {formOpen && (
        <TransactionFormModal
          transaction={editingTransaction}
          categories={categories}
          onSubmit={handleSave}
          onClose={() => {
            setFormOpen(false);
            setEditingTransaction(null);
          }}
        />
      )}

      {deletingTransaction && (
        <DeleteTransactionModal
          transaction={deletingTransaction}
          onConfirm={handleDelete}
          onClose={() => setDeletingTransaction(null)}
        />
      )}
    </div>
  );
}

export default TransactionsPage;