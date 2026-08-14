import {
  CalendarDays,
  CreditCard,
  Pencil,
  Power,
  Repeat2,
  Trash2,
  Wallet,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

function formatDate(value) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatFrequency(frequency) {
  if (!frequency) {
    return "Unknown";
  }

  return (
    frequency.charAt(0) +
    frequency.slice(1).toLowerCase()
  );
}

function RecurringTransactionCard({
  transaction,
  currency,
  onEdit,
  onToggle,
  onDelete,
}) {
  const isIncome = transaction.type === "INCOME";

  return (
    <article
      className={`recurring-card ${
        transaction.active ? "active" : "inactive"
      }`}
    >
      <header className="recurring-card-header">
        <div
          className={`recurring-card-icon ${
            isIncome ? "income" : "expense"
          }`}
        >
          <Repeat2 size={23} />
        </div>

        <span
          className={`recurring-status ${
            transaction.active ? "active" : "inactive"
          }`}
        >
          {transaction.active ? "Active" : "Inactive"}
        </span>
      </header>

      <div className="recurring-card-title">
        <h3>{transaction.title}</h3>

        {transaction.description && (
          <p>{transaction.description}</p>
        )}
      </div>

      <div
        className={`recurring-card-amount ${
          isIncome ? "income" : "expense"
        }`}
      >
        {isIncome ? "+" : "-"}
        {formatCurrency(transaction.amount, currency)}
      </div>

      <div className="recurring-card-details">
        <div>
          <span>
            <Wallet size={15} />
            Category
          </span>

          <strong>
            {transaction.categoryName || "Uncategorized"}
          </strong>
        </div>

        <div>
          <span>
            <Repeat2 size={15} />
            Frequency
          </span>

          <strong>
            {formatFrequency(transaction.frequency)}
          </strong>
        </div>

        <div>
          <span>
            <CreditCard size={15} />
            Payment
          </span>

          <strong>
            {transaction.paymentMethod || "Not specified"}
          </strong>
        </div>

        <div>
          <span>
            <CalendarDays size={15} />
            Next run
          </span>

          <strong>
            {formatDate(transaction.nextRunDate)}
          </strong>
        </div>
      </div>

      <div className="recurring-card-dates">
        <span>
          Started: {formatDate(transaction.startDate)}
        </span>

        {transaction.endDate && (
          <span>
            Ends: {formatDate(transaction.endDate)}
          </span>
        )}
      </div>

      <footer className="recurring-card-actions">
        <button
          type="button"
          className="recurring-toggle-button"
          onClick={() => onToggle(transaction)}
        >
          <Power size={17} />
          {transaction.active ? "Deactivate" : "Activate"}
        </button>

        <button
          type="button"
          onClick={() => onEdit(transaction)}
          title="Edit recurring transaction"
          aria-label={`Edit ${transaction.title}`}
        >
          <Pencil size={17} />
        </button>

        <button
          type="button"
          className="delete"
          onClick={() => onDelete(transaction)}
          title="Delete recurring transaction"
          aria-label={`Delete ${transaction.title}`}
        >
          <Trash2 size={17} />
        </button>
      </footer>
    </article>
  );
}

export default RecurringTransactionCard;