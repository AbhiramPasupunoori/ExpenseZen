import {
  Coins,
  LoaderCircle,
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "../../utils/formatters";

function ContributionModal({
  goal,
  currency,
  onSubmit,
  onClose,
}) {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    const numericAmount = Number(amount);

    if (numericAmount <= 0) {
      setErrorMessage("Contribution must be greater than zero.");
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit(goal.id, numericAmount);
      onClose();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "The contribution could not be added.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <section
        className="contribution-modal"
        role="dialog"
        aria-modal="true"
      >
        <header className="modal-header">
          <div>
            <h2>Add contribution</h2>
            <p>{goal.name}</p>
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

        <form
          className="contribution-form"
          onSubmit={handleSubmit}
        >
          <div className="contribution-summary">
            <Coins size={25} />

            <div>
              <span>Remaining amount</span>
              <strong>
                {formatCurrency(
                  goal.remainingAmount,
                  currency,
                )}
              </strong>
            </div>
          </div>

          {errorMessage && (
            <div className="savings-inline-error">
              {errorMessage}
            </div>
          )}

          <label className="savings-form-field">
            <span>Contribution amount</span>

            <input
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Example: 5000"
              min="0.01"
              step="0.01"
              autoFocus
              required
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
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Add contribution
                </>
              )}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default ContributionModal;