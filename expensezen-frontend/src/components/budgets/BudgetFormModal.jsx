import { LoaderCircle, PiggyBank, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function getErrorMessage(error) {
  const validationErrors =
    error.response?.data?.validationErrors;

  if (validationErrors) {
    const firstError = Object.values(validationErrors)[0];

    if (firstError) {
      return firstError;
    }
  }

  return (
    error.response?.data?.message ||
    error.message ||
    "The budget could not be saved."
  );
}

function BudgetFormModal({
  budget,
  categories,
  selectedMonth,
  onSubmit,
  onClose,
}) {
  const editing = Boolean(budget);

  const [year, month] = selectedMonth
    .split("-")
    .map(Number);

  const [formData, setFormData] = useState({
    amount: budget?.amount ?? "",
    categoryId: budget?.categoryId
      ? String(budget.categoryId)
      : "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const expenseCategories = useMemo(
    () =>
      categories.filter(
        (category) => category.type === "EXPENSE",
      ),
    [categories],
  );

  const monthLabel = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, submitting]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      await onSubmit({
        amount: Number(formData.amount),
        month,
        year,
        categoryId: Number(formData.categoryId),
      });

      onClose();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !submitting
        ) {
          onClose();
        }
      }}
    >
      <section
        className="budget-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-modal-title"
      >
        <header className="modal-header">
          <div>
            <h2 id="budget-modal-title">
              {editing ? "Edit budget" : "Create budget"}
            </h2>

            <p>Set a spending limit for {monthLabel}.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
          >
            <X size={21} />
          </button>
        </header>

        {errorMessage && (
          <div className="budget-form-error" role="alert">
            {errorMessage}
          </div>
        )}

        <form className="budget-form" onSubmit={handleSubmit}>
          <label className="budget-form-field">
            <span>Expense category</span>

            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              disabled={editing}
              required
            >
              <option value="">Select category</option>

              {expenseCategories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          {editing && (
            <p className="budget-category-note">
              The category cannot be changed while editing.
            </p>
          )}

          <label className="budget-form-field">
            <span>Monthly budget amount</span>

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Example: 5000"
              min="1"
              step="0.01"
              required
            />
          </label>

          <div className="budget-form-information">
            <PiggyBank size={21} />

            <p>
              Expense transactions in this category will
              automatically update the spent and remaining
              amounts.
            </p>
          </div>

          <footer className="modal-actions">
            <button
              type="button"
              className="modal-cancel-button"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="modal-save-button"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <LoaderCircle className="spin" size={18} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {editing ? "Save changes" : "Create budget"}
                </>
              )}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
export default BudgetFormModal;