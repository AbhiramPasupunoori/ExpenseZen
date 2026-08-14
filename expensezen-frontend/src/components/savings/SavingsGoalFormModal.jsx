import {
  Goal,
  LoaderCircle,
  Save,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

function today() {
  return new Date().toISOString().split("T")[0];
}

function getErrorMessage(error) {
  const validationErrors =
    error.response?.data?.validationErrors;

  if (validationErrors) {
    return (
      Object.values(validationErrors)[0] ||
      "Please check the form."
    );
  }

  return (
    error.response?.data?.message ||
    error.message ||
    "The savings goal could not be saved."
  );
}

function SavingsGoalFormModal({
  goal,
  onSubmit,
  onClose,
}) {
  const editing = Boolean(goal);

  const [formData, setFormData] = useState({
    name: goal?.name ?? "",
    targetAmount: goal?.targetAmount ?? "",
    initialAmount: goal?.savedAmount ?? "0",
    targetDate: goal?.targetDate ?? "",
  });

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
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    const targetAmount = Number(formData.targetAmount);
    const initialAmount = Number(formData.initialAmount);

    if (!editing && initialAmount > targetAmount) {
      setErrorMessage(
        "Initial savings cannot be greater than the target amount.",
      );
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        name: formData.name.trim(),
        targetAmount,
        initialAmount: editing
          ? Number(goal.savedAmount ?? 0)
          : initialAmount,
        targetDate: formData.targetDate,
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
        className="savings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="savings-modal-title"
      >
        <header className="modal-header">
          <div>
            <h2 id="savings-modal-title">
              {editing ? "Edit savings goal" : "Create savings goal"}
            </h2>

            <p>Define your target and track your progress.</p>
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
          <div className="savings-form-error" role="alert">
            {errorMessage}
          </div>
        )}

        <form className="savings-form" onSubmit={handleSubmit}>
          <label className="savings-form-field">
            <span>Goal name</span>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Example: New laptop"
              minLength="2"
              maxLength="100"
              required
            />
          </label>

          <div className="savings-form-grid">
            <label className="savings-form-field">
              <span>Target amount</span>

              <input
                type="number"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleChange}
                placeholder="80000"
                min="1"
                step="0.01"
                required
              />
            </label>

            <label className="savings-form-field">
              <span>
                {editing ? "Current savings" : "Initial savings"}
              </span>

              <input
                type="number"
                name="initialAmount"
                value={formData.initialAmount}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                disabled={editing}
                required
              />
            </label>
          </div>

          <label className="savings-form-field">
            <span>Target date</span>

            <input
              type="date"
              name="targetDate"
              value={formData.targetDate}
              onChange={handleChange}
              min={today()}
              required
            />
          </label>

          <div className="savings-information">
            <Goal size={21} />

            <p>
              Add contributions regularly to increase progress
              toward your target.
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
                  {editing ? "Save changes" : "Create goal"}
                </>
              )}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default SavingsGoalFormModal;