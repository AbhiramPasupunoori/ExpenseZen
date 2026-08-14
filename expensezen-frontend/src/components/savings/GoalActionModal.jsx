import {
  Ban,
  LoaderCircle,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

function GoalActionModal({
  goal,
  action,
  onConfirm,
  onClose,
}) {
  const deleting = action === "delete";
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleConfirm() {
    setProcessing(true);
    setErrorMessage("");

    try {
      await onConfirm(goal.id);
      onClose();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          `The goal could not be ${deleting ? "deleted" : "cancelled"}.`,
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <section
        className="delete-modal"
        role="alertdialog"
        aria-modal="true"
      >
        <header>
          <span className="delete-warning-icon">
            {deleting ? (
              <Trash2 size={23} />
            ) : (
              <Ban size={23} />
            )}
          </span>

          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>

        <h2>
          {deleting ? "Delete savings goal?" : "Cancel savings goal?"}
        </h2>

        <p>
          {deleting
            ? `The goal "${goal.name}" will be permanently removed.`
            : `The goal "${goal.name}" will be marked as cancelled.`}
        </p>

        {errorMessage && (
          <div className="savings-inline-error">
            {errorMessage}
          </div>
        )}

        <footer className="modal-actions">
          <button
            type="button"
            className="modal-cancel-button"
            onClick={onClose}
            disabled={processing}
          >
            Go back
          </button>

          <button
            type="button"
            className="delete-confirm-button"
            onClick={handleConfirm}
            disabled={processing}
          >
            {processing ? (
              <>
                <LoaderCircle className="spin" size={18} />
                Processing...
              </>
            ) : (
              <>
                {deleting ? (
                  <Trash2 size={18} />
                ) : (
                  <Ban size={18} />
                )}

                {deleting ? "Delete" : "Cancel goal"}
              </>
            )}
          </button>
        </footer>
      </section>
    </div>
  );
}

export default GoalActionModal;