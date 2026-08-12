import {
  AlertTriangle,
  CircleCheck,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import { CategoryIcon } from "../../utils/categoryIcons";
import { formatCurrency } from "../../utils/formatters";

function getStatusInformation(status) {
  switch (status) {
    case "EXCEEDED":
      return {
        label: "Exceeded",
        icon: XCircle,
        className: "exceeded",
        message: "This budget limit has been exceeded.",
      };

    case "WARNING":
      return {
        label: "Warning",
        icon: AlertTriangle,
        className: "warning",
        message: "You are close to reaching this limit.",
      };

    default:
      return {
        label: "Safe",
        icon: CircleCheck,
        className: "safe",
        message: "Your spending is within the limit.",
      };
  }
}

function BudgetCard({
  budget,
  currency,
  onEdit,
  onDelete,
}) {
  const percentage = Number(budget.usagePercentage ?? 0);
  const status = getStatusInformation(budget.status);
  const StatusIcon = status.icon;

  const progressWidth = Math.min(
    Math.max(percentage, 0),
    100,
  );

  return (
    <article className={`budget-card ${status.className}`}>
      <header className="budget-card-header">
        <div className="budget-category">
          <span
            className="budget-category-icon"
            style={{
              color: budget.categoryColor || "#64748b",
              background: `${budget.categoryColor || "#64748b"}20`,
            }}
          >
            <CategoryIcon
              name={budget.categoryIcon}
              size={22}
            />
          </span>

          <div>
            <h3>{budget.categoryName}</h3>

            <span className={`budget-status ${status.className}`}>
              <StatusIcon size={14} />
              {status.label}
            </span>
          </div>
        </div>

        <div className="budget-card-actions">
          <button
            type="button"
            onClick={() => onEdit(budget)}
            aria-label={`Edit ${budget.categoryName} budget`}
            title="Edit"
          >
            <Pencil size={17} />
          </button>

          <button
            type="button"
            className="delete"
            onClick={() => onDelete(budget)}
            aria-label={`Delete ${budget.categoryName} budget`}
            title="Delete"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </header>

      <div className="budget-amount-information">
        <div>
          <span>Spent</span>
          <strong>
            {formatCurrency(budget.spentAmount, currency)}
          </strong>
        </div>

        <div>
          <span>Budget</span>
          <strong>
            {formatCurrency(budget.amount, currency)}
          </strong>
        </div>
      </div>

      <div className="budget-progress-header">
        <span>{percentage.toFixed(1)}% used</span>

        <span>
          {formatCurrency(
            budget.remainingAmount,
            currency,
          )}{" "}
          remaining
        </span>
      </div>

      <div
        className="budget-progress"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <span
          className={status.className}
          style={{ width: `${progressWidth}%` }}
        />
      </div>

      <p className={`budget-message ${status.className}`}>
        <StatusIcon size={15} />
        {status.message}
      </p>
    </article>
  );
}

export default BudgetCard;