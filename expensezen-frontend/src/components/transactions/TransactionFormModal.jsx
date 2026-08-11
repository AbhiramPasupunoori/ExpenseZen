import { useEffect, useMemo, useState } from "react";
import {
  LoaderCircle,
  PlusCircle,
  Save,
  X,
} from "lucide-react";

const paymentMethods = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CREDIT_CARD", label: "Credit card" },
  { value: "DEBIT_CARD", label: "Debit card" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "OTHER", label: "Other" },
];

function currentDate() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

function getInitialForm(transaction) {
  return {
    title: transaction?.title ?? "",
    amount: transaction?.amount ?? "",
    type: transaction?.type ?? "EXPENSE",
    transactionDate:
      transaction?.transactionDate ??
      transaction?.date ??
      currentDate(),
    categoryId: transaction?.categoryId
      ? String(transaction.categoryId)
      : "",
    paymentMethod: transaction?.paymentMethod ?? "UPI",
    description: transaction?.description ?? "",
  };
}

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
    "The transaction could not be saved."
  );
}

function TransactionFormModal({
  transaction,
  categories,
  onSubmit,
  onClose,
}) {
  const [formData, setFormData] = useState(() =>
    getInitialForm(transaction),
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const editing = Boolean(transaction);

  const availableCategories = useMemo(
    () =>
      categories.filter(
        (category) => category.type === formData.type,
      ),
    [categories, formData.type],
  );

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

    setFormData((current) => {
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

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      await onSubmit({
        title: formData.title.trim(),
        amount: Number(formData.amount),
        type: formData.type,
        transactionDate: formData.transactionDate,
        categoryId: Number(formData.categoryId),
        paymentMethod: formData.paymentMethod,
        description: formData.description.trim() || null,
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
      role="presentation"
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
        className="transaction-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-modal-title"
      >
        <header className="modal-header">
          <div>
            <h2 id="transaction-modal-title">
              {editing ? "Edit transaction" : "Add transaction"}
            </h2>

            <p>
              {editing
                ? "Update your transaction information."
                : "Record new income or expense."}
            </p>
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
          <div className="transaction-form-error" role="alert">
            {errorMessage}
          </div>
        )}

        <form
          className="transaction-form"
          onSubmit={handleSubmit}
        >
          <div className="transaction-type-selector">
            <label
              className={
                formData.type === "EXPENSE" ? "selected expense" : ""
              }
            >
              <input
                type="radio"
                name="type"
                value="EXPENSE"
                checked={formData.type === "EXPENSE"}
                onChange={handleChange}
              />
              Expense
            </label>

            <label
              className={
                formData.type === "INCOME" ? "selected income" : ""
              }
            >
              <input
                type="radio"
                name="type"
                value="INCOME"
                checked={formData.type === "INCOME"}
                onChange={handleChange}
              />
              Income
            </label>
          </div>

          <label className="transaction-field full-width">
            <span>Title</span>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Example: Grocery shopping"
              maxLength="100"
              required
            />
          </label>

          <div className="transaction-form-grid">
            <label className="transaction-field">
              <span>Amount</span>

              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
            </label>

            <label className="transaction-field">
              <span>Date</span>

              <input
                type="date"
                name="transactionDate"
                value={formData.transactionDate}
                onChange={handleChange}
                required
              />
            </label>

            <label className="transaction-field">
              <span>Category</span>

              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>

                {availableCategories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="transaction-field">
              <span>Payment method</span>

              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
              >
                {paymentMethods.map((method) => (
                  <option
                    key={method.value}
                    value={method.value}
                  >
                    {method.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="transaction-field full-width">
            <span>Description</span>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional description"
              maxLength="500"
              rows="4"
            />
          </label>

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
                  {editing ? (
                    <Save size={18} />
                  ) : (
                    <PlusCircle size={18} />
                  )}

                  {editing ? "Save changes" : "Add transaction"}
                </>
              )}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default TransactionFormModal;