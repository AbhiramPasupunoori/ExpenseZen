import { LoaderCircle, Trash2, X } from "lucide-react";
import { useState } from "react";

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    "The transaction could not be deleted."
  );
}

function DeleteTransactionModal({
  transaction,
  onConfirm,
  onClose,
}) {
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setErrorMessage("");

    try {
      await onConfirm(transaction.id);
      onClose();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
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
        aria-labelledby="delete-modal-title"
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

        <h2 id="delete-modal-title">Delete transaction?</h2>

        <p>
          The transaction <strong>{transaction.title}</strong>{" "}
          will be permanently removed.
        </p>

        {errorMessage && (
          <div className="transaction-form-error">
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

export default DeleteTransactionModal;