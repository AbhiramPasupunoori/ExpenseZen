import {
  CalendarDays,
  LoaderCircle,
  Save,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const INITIAL_FORM = {
  title: "",
  amount: "",
  description: "",
  type: "EXPENSE",
  paymentMethod: "CASH",
  frequency: "MONTHLY",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  categoryId: "",
};

function getInitialForm(transaction) {
  if (!transaction) {
    return INITIAL_FORM;
  }

  return {
    title: transaction.title ?? "",
    amount: transaction.amount ?? "",
    description: transaction.description ?? "",
    type: transaction.type ?? "EXPENSE",
    paymentMethod: transaction.paymentMethod ?? "CASH",
    frequency: transaction.frequency ?? "MONTHLY",
    startDate:
      transaction.startDate ??
      new Date().toISOString().split("T")[0],
    endDate: transaction.endDate ?? "",
    categoryId: transaction.categoryId ?? "",
  };
}

function getErrorMessage(error) {
  const validationErrors =
    error.response?.data?.validationErrors;

  if (validationErrors) {
    const firstError = Object.values(validationErrors)[0];

    if (Array.isArray(firstError)) {
      return firstError[0];
    }

    return firstError || "Please check the form.";
  }

  return (
    error.response?.data?.message ||
    error.message ||
    "Unable to save recurring transaction."
  );
}

function RecurringTransactionFormModal({
  transaction,
  categories = [],
  onSubmit,
  onClose,
}) {
  const editing = Boolean(transaction);

  const [formData, setFormData] = useState(() =>
    getInitialForm(transaction),
  );

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      ...(name === "type"
        ? { categoryId: "" }
        : {}),
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  }

  const availableCategories = categories.filter(
    (category) => category.type === formData.type,
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!formData.categoryId) {
      setErrorMessage("Please select a category.");
      return;
    }

    if (
      formData.endDate &&
      formData.endDate < formData.startDate
    ) {
      setErrorMessage(
        "End date cannot be before start date.",
      );
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        title: formData.title.trim(),
        amount: Number(formData.amount),
        description: formData.description.trim() || null,
        type: formData.type,
        paymentMethod: formData.paymentMethod,
        frequency: formData.frequency,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
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
        className="recurring-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recurring-modal-title"
      >
        <header className="modal-header">
          <div>
            <h2 id="recurring-modal-title">
              {editing
                ? "Edit recurring transaction"
                : "Create recurring transaction"}
            </h2>

            <p>
              Automatically track transactions on a schedule.
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
          <div
            className="recurring-form-error"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        <form
          className="recurring-form"
          onSubmit={handleSubmit}
        >
          <label className="recurring-form-field">
            <span>Title</span>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Example: Netflix subscription"
              minLength="2"
              maxLength="100"
              required
            />
          </label>

          <div className="recurring-form-grid">
            <label className="recurring-form-field">
              <span>Amount</span>

              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="999"
                min="0.01"
                step="0.01"
                required
              />
            </label>

            <label className="recurring-form-field">
              <span>Type</span>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </label>
          </div>

          <div className="recurring-form-grid">
            <label className="recurring-form-field">
              <span>Category</span>

              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select category
                </option>

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

            <label className="recurring-form-field">
              <span>Payment method</span>

              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CREDIT_CARD">
                  Credit Card
                </option>
                <option value="DEBIT_CARD">
                  Debit Card
                </option>
                <option value="BANK_TRANSFER">
                  Bank Transfer
                </option>
                <option value="OTHER">Other</option>
              </select>
            </label>
          </div>

          <div className="recurring-form-grid">
            <label className="recurring-form-field">
              <span>Frequency</span>

              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                required
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </label>

            <label className="recurring-form-field">
              <span>Start date</span>

              <div className="date-input-wrapper">
                <CalendarDays size={17} />

                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </label>
          </div>

          <label className="recurring-form-field">
            <span>End date (optional)</span>

            <div className="date-input-wrapper">
              <CalendarDays size={17} />

              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate}
              />
            </div>
          </label>

          <label className="recurring-form-field">
            <span>Description (optional)</span>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add a note..."
              rows="3"
              maxLength="500"
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
                  <LoaderCircle
                    className="spin"
                    size={18}
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {editing
                    ? "Save changes"
                    : "Create schedule"}
                </>
              )}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default RecurringTransactionFormModal;