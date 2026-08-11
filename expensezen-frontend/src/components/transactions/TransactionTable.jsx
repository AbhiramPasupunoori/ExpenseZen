import {
  ArrowDownLeft,
  ArrowUpRight,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatPaymentMethod(value) {
  if (!value) {
    return "—";
  }

  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

function TransactionTable({
  transactions,
  currency,
  loading,
  onEdit,
  onDelete,
}) {
  if (loading && !transactions.length) {
    return (
      <div className="transactions-empty">
        Loading transactions...
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="transactions-empty">
        <h3>No transactions found</h3>
        <p>
          Add a transaction or change the selected filters.
        </p>
      </div>
    );
  }

  return (
    <div className="transaction-table-wrapper">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Category</th>
            <th>Date</th>
            <th>Payment</th>
            <th>Amount</th>
            <th aria-label="Actions" />
          </tr>
        </thead>

        <tbody>
          {transactions.map((transaction) => {
            const income = transaction.type === "INCOME";

            return (
              <tr key={transaction.id}>
                <td>
                  <div className="transaction-title-cell">
                    <span
                      className={`transaction-type-icon ${
                        income ? "income" : "expense"
                      }`}
                    >
                      {income ? (
                        <ArrowUpRight size={18} />
                      ) : (
                        <ArrowDownLeft size={18} />
                      )}
                    </span>

                    <div>
                      <strong>{transaction.title}</strong>
                      <span>
                        {transaction.description ||
                          (income ? "Income" : "Expense")}
                      </span>
                    </div>
                  </div>
                </td>

                <td>
                  <span className="transaction-category">
                    <span
                      style={{
                        background:
                          transaction.categoryColor ||
                          "#64748b",
                      }}
                    />

                    {transaction.categoryName || "Uncategorized"}
                  </span>
                </td>

                <td>
                  {formatDate(
                    transaction.transactionDate ??
                      transaction.date,
                  )}
                </td>

                <td>
                  {formatPaymentMethod(
                    transaction.paymentMethod,
                  )}
                </td>

                <td>
                  <strong
                    className={`transaction-amount ${
                      income ? "income" : "expense"
                    }`}
                  >
                    {income ? "+" : "-"}
                    {formatCurrency(
                      transaction.amount,
                      currency,
                    )}
                  </strong>
                </td>

                <td>
                  <div className="transaction-actions">
                    <button
                      type="button"
                      onClick={() => onEdit(transaction)}
                      aria-label={`Edit ${transaction.title}`}
                      title="Edit"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      className="delete"
                      onClick={() => onDelete(transaction)}
                      aria-label={`Delete ${transaction.title}`}
                      title="Delete"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;