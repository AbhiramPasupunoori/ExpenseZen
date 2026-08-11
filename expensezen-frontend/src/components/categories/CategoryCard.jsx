import { LockKeyhole, Pencil, Trash2 } from "lucide-react";
import { CategoryIcon } from "../../utils/categoryIcons";

function CategoryCard({ category, onEdit, onDelete }) {
  const defaultCategory =
    category.defaultCategory ??
    category.isDefault ??
    false;

  const color = category.color || "#64748b";

  return (
    <article
      className="category-card"
      style={{ "--category-color": color }}
    >
      <header>
        <span className="category-card-icon">
          <CategoryIcon name={category.icon} size={23} />
        </span>

        <span
          className={`category-type-badge ${category.type.toLowerCase()}`}
        >
          {category.type === "INCOME" ? "Income" : "Expense"}
        </span>
      </header>

      <div className="category-card-content">
        <h3>{category.name}</h3>

        <p>
          {defaultCategory
            ? "Automatically created default category"
            : "Custom category"}
        </p>
      </div>

      <footer>
        {defaultCategory ? (
          <span className="default-category-label">
            <LockKeyhole size={15} />
            Protected
          </span>
        ) : (
          <div className="category-card-actions">
            <button
              type="button"
              onClick={() => onEdit(category)}
              aria-label={`Edit ${category.name}`}
            >
              <Pencil size={17} />
              Edit
            </button>

            <button
              type="button"
              className="delete"
              onClick={() => onDelete(category)}
              aria-label={`Delete ${category.name}`}
            >
              <Trash2 size={17} />
            </button>
          </div>
        )}
      </footer>
    </article>
  );
}

export default CategoryCard;