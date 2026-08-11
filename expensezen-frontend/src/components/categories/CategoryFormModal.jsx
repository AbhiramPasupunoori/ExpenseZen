import { LoaderCircle, Plus, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CategoryIcon,
  categoryIconOptions,
} from "../../utils/categoryIcons";

const presetColors = [
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#22C55E",
  "#14B8A6",
  "#06B6D4",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#EC4899",
];

function initialForm(category, initialType) {
  return {
    name: category?.name ?? "",
    type: category?.type ?? initialType ?? "EXPENSE",
    color: category?.color ?? "#22C55E",
    icon: category?.icon ?? "tags",
  };
}

function getErrorMessage(error) {
  const validationErrors =
    error.response?.data?.validationErrors;

  if (validationErrors) {
    const firstError = Object.values(validationErrors)[0];

    if (firstError) {
      return firstError;
    }
  }

  return (
    error.response?.data?.message ||
    error.message ||
    "The category could not be saved."
  );
}

function CategoryFormModal({
  category,
  initialType,
  onSubmit,
  onClose,
}) {
  const editing = Boolean(category);

  const [formData, setFormData] = useState(() =>
    initialForm(category, initialType),
  );

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const validColor = /^#[0-9A-Fa-f]{6}$/.test(
    formData.color,
  )
    ? formData.color
    : "#22C55E";

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

    if (!/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
      setErrorMessage(
        "Enter a valid six-digit hexadecimal color.",
      );
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        name: formData.name.trim(),
        type: formData.type,
        color: formData.color.toUpperCase(),
        icon: formData.icon,
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
        className="category-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
      >
        <header className="modal-header">
          <div>
            <h2 id="category-modal-title">
              {editing ? "Edit category" : "Create category"}
            </h2>

            <p>Select a name, type, color and icon.</p>
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
          <div className="category-form-error" role="alert">
            {errorMessage}
          </div>
        )}

        <form
          className="category-form"
          onSubmit={handleSubmit}
        >
          <label className="category-form-field">
            <span>Category name</span>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Example: Subscriptions"
              minLength="2"
              maxLength="50"
              required
            />
          </label>

          <div className="category-type-selector">
            <label
              className={
                formData.type === "EXPENSE"
                  ? "selected expense"
                  : ""
              }
            >
              <input
                type="radio"
                name="type"
                value="EXPENSE"
                checked={formData.type === "EXPENSE"}
                onChange={handleChange}
                disabled={editing}
              />

              Expense
            </label>

            <label
              className={
                formData.type === "INCOME"
                  ? "selected income"
                  : ""
              }
            >
              <input
                type="radio"
                name="type"
                value="INCOME"
                checked={formData.type === "INCOME"}
                onChange={handleChange}
                disabled={editing}
              />

              Income
            </label>
          </div>

          {editing && (
            <p className="category-type-note">
              Category type cannot be changed while editing.
            </p>
          )}

          <fieldset className="category-color-field">
            <legend>Category color</legend>

            <div className="preset-colors">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={
                    formData.color.toUpperCase() === color
                      ? "selected"
                      : ""
                  }
                  style={{ background: color }}
                  onClick={() =>
                    setFormData((current) => ({
                      ...current,
                      color,
                    }))
                  }
                  aria-label={`Select ${color}`}
                />
              ))}
            </div>

            <div className="custom-color-row">
              <input
                type="color"
                name="color"
                value={validColor}
                onChange={handleChange}
                aria-label="Color picker"
              />

              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="#22C55E"
                maxLength="7"
                required
              />
            </div>
          </fieldset>

          <fieldset className="category-icon-field">
            <legend>Category icon</legend>

            <div className="category-icon-grid">
              {categoryIconOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={
                    formData.icon === option.value
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setFormData((current) => ({
                      ...current,
                      icon: option.value,
                    }))
                  }
                  title={option.label}
                  aria-label={`Select ${option.label} icon`}
                >
                  <CategoryIcon
                    name={option.value}
                    size={20}
                  />
                </button>
              ))}
            </div>
          </fieldset>

          <div className="category-preview">
            <span
              style={{
                color: validColor,
                background: `${validColor}20`,
              }}
            >
              <CategoryIcon
                name={formData.icon}
                size={23}
              />
            </span>

            <div>
              <strong>
                {formData.name || "Category preview"}
              </strong>

              <small>
                {formData.type === "INCOME"
                  ? "Income"
                  : "Expense"}
              </small>
            </div>
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
                  <LoaderCircle
                    className="spin"
                    size={18}
                  />
                  Saving...
                </>
              ) : (
                <>
                  {editing ? (
                    <Save size={18} />
                  ) : (
                    <Plus size={18} />
                  )}

                  {editing
                    ? "Save changes"
                    : "Create category"}
                </>
              )}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default CategoryFormModal;