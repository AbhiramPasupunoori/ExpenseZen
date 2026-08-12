import { LoaderCircle, Trash2, X } from "lucide-react";
import { useState } from "react";

function DeleteBudgetModal({
  budget,
  onConfirm,
  onClose,
}) {
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setErrorMessage("");

    try {
      await onConfirm(budget.id);
      onClose();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "The budget could not be deleted.",
      );
    } finally {
      setDeleting(false);
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
            <Trash2 size={23} />
          </span>

          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>

        <h2>Delete budget?</h2>

        <p>
          The monthly budget for{" "}
          <strong>{budget.categoryName}</strong> will be
          removed. Existing transactions will not be deleted.
        </p>

        {errorMessage && (
          <div className="budget-delete-error">
            {errorMessage}
          </div>
        )}

        <footer className="modal-actions">
          <button
            type="button"
            className="modal-cancel-button"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="delete-confirm-button"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <LoaderCircle className="spin" size={18} />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={18} />
                Delete
              </>
            )}
          </button>
        </footer>
      </section>
    </div>
  );
}

export default DeleteBudgetModal;