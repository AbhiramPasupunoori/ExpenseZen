import {
  Ban,
  CalendarDays,
  CheckCircle2,
  Coins,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

function formatDate(value) {
  if (!value) {
    return "No target date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function SavingsGoalCard({
  goal,
  currency,
  onEdit,
  onContribute,
  onCancel,
  onDelete,
}) {
  const status = goal.status ?? "ACTIVE";
  const active = status === "ACTIVE";
  const completed = status === "COMPLETED";
  const cancelled = status === "CANCELLED";

  const percentage = Math.min(
    Math.max(Number(goal.progressPercentage ?? 0), 0),
    100,
  );

  return (
    <article
      className={`savings-goal-card ${status.toLowerCase()}`}
    >
      <header className="goal-card-header">
        <span
          className={`goal-card-icon ${status.toLowerCase()}`}
        >
          {completed ? (
            <CheckCircle2 size={24} />
          ) : cancelled ? (
            <Ban size={24} />
          ) : (
            <Coins size={24} />
          )}
        </span>

        <span
          className={`goal-status ${status.toLowerCase()}`}
        >
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </span>
      </header>

      <div className="goal-card-content">
        <h3>{goal.name}</h3>

        <span className="goal-target-date">
          <CalendarDays size={15} />
          Target: {formatDate(goal.targetDate)}
        </span>
      </div>

      <div className="goal-amounts">
        <div>
          <span>Saved</span>
          <strong>
            {formatCurrency(goal.savedAmount, currency)}
          </strong>
        </div>

        <div>
          <span>Target</span>
          <strong>
            {formatCurrency(goal.targetAmount, currency)}
          </strong>
        </div>
      </div>

      <div className="goal-progress-information">
        <span>{percentage.toFixed(1)}% completed</span>

        <span>
          {formatCurrency(goal.remainingAmount, currency)} remaining
        </span>
      </div>

      <div
        className="goal-progress"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={percentage}
      >
        <span style={{ width: `${percentage}%` }} />
      </div>

      <footer className="goal-card-actions">
        {active && (
          <>
            <button
              type="button"
              className="goal-contribute-button"
              onClick={() => onContribute(goal)}
            >
              <Plus size={17} />
              Contribute
            </button>

            <button
              type="button"
              onClick={() => onEdit(goal)}
              title="Edit goal"
              aria-label={`Edit ${goal.name}`}
            >
              <Pencil size={17} />
            </button>

            <button
              type="button"
              onClick={() => onCancel(goal)}
              title="Cancel goal"
              aria-label={`Cancel ${goal.name}`}
            >
              <Ban size={17} />
            </button>
          </>
        )}

        <button
          type="button"
          className="delete"
          onClick={() => onDelete(goal)}
          title="Delete goal"
          aria-label={`Delete ${goal.name}`}
        >
          <Trash2 size={17} />
        </button>
      </footer>
    </article>
  );
}

export default SavingsGoalCard;