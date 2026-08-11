import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  Tags,
} from "lucide-react";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../api/categoryService";
import CategoryCard from "../components/categories/CategoryCard";
import CategoryFormModal from "../components/categories/CategoryFormModal";
import DeleteCategoryModal from "../components/categories/DeleteCategoryModal";
import "../styles/categories.css";

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [selectedType, setSelectedType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadCategories() {
      setLoading(true);
      setErrorMessage("");

      try {
        const data = await getCategories({
          signal: controller.signal,
        });

        if (active) {
          setCategories(data);
        }
      } catch (error) {
        if (active && error.code !== "ERR_CANCELED") {
          setErrorMessage(
            error.response?.data?.message ||
              "Categories could not be loaded.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      active = false;
      controller.abort();
    };
  }, [refreshKey]);

  const visibleCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return categories.filter((category) => {
      const typeMatches =
        selectedType === "ALL" ||
        category.type === selectedType;

      const nameMatches = category.name
        .toLowerCase()
        .includes(normalizedSearch);

      return typeMatches && nameMatches;
    });
  }, [categories, selectedType, search]);

  const incomeCount = categories.filter(
    (category) => category.type === "INCOME",
  ).length;

  const expenseCount = categories.filter(
    (category) => category.type === "EXPENSE",
  ).length;

  function showSuccess(message) {
    setSuccessMessage(message);

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3500);
  }

  function openCreate() {
    setEditingCategory(null);
    setFormOpen(true);
  }

  function openEdit(category) {
    setEditingCategory(category);
    setFormOpen(true);
  }

  async function handleSave(categoryData) {
    if (editingCategory) {
      await updateCategory(
        editingCategory.id,
        categoryData,
      );

      showSuccess("Category updated successfully.");
    } else {
      await createCategory(categoryData);
      showSuccess("Category created successfully.");
    }

    setRefreshKey((current) => current + 1);
  }

  async function handleDelete(categoryId) {
    await deleteCategory(categoryId);
    showSuccess("Category deleted successfully.");
    setRefreshKey((current) => current + 1);
  }

  return (
    <div className="categories-page">
      <section className="categories-page-header">
        <div>
          <h2>Categories</h2>
          <p>
            Organize your income and expenses into categories.
          </p>
        </div>

        <button
          type="button"
          className="add-category-button"
          onClick={openCreate}
        >
          <Plus size={19} />
          Create category
        </button>
      </section>

      {successMessage && (
        <div className="transaction-success">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="dashboard-error">
          {errorMessage}
        </div>
      )}

      <section className="category-summary-grid">
        <article>
          <span className="category-summary-icon all">
            <Tags size={21} />
          </span>

          <div>
            <span>Total categories</span>
            <strong>{categories.length}</strong>
          </div>
        </article>

        <article>
          <span className="category-summary-icon expense">
            <ArrowDownLeft size={21} />
          </span>

          <div>
            <span>Expense categories</span>
            <strong>{expenseCount}</strong>
          </div>
        </article>

        <article>
          <span className="category-summary-icon income">
            <ArrowUpRight size={21} />
          </span>

          <div>
            <span>Income categories</span>
            <strong>{incomeCount}</strong>
          </div>
        </article>
      </section>

      <section className="category-toolbar">
        <div className="category-tabs">
          {["ALL", "EXPENSE", "INCOME"].map((type) => (
            <button
              key={type}
              type="button"
              className={selectedType === type ? "active" : ""}
              onClick={() => setSelectedType(type)}
            >
              {type === "ALL"
                ? "All"
                : type === "EXPENSE"
                  ? "Expenses"
                  : "Income"}
            </button>
          ))}
        </div>

        <label className="category-search">
          <Search size={18} />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search categories..."
          />
        </label>
      </section>

      {loading ? (
        <div className="category-empty">
          Loading categories...
        </div>
      ) : visibleCategories.length ? (
        <section className="category-card-grid">
          {visibleCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={openEdit}
              onDelete={setDeletingCategory}
            />
          ))}
        </section>
      ) : (
        <div className="category-empty">
          <Tags size={35} />
          <h3>No categories found</h3>
          <p>Create a category or change your search.</p>
        </div>
      )}

      {formOpen && (
        <CategoryFormModal
          category={editingCategory}
          initialType={
            selectedType === "INCOME"
              ? "INCOME"
              : "EXPENSE"
          }
          onSubmit={handleSave}
          onClose={() => {
            setFormOpen(false);
            setEditingCategory(null);
          }}
        />
      )}

      {deletingCategory && (
        <DeleteCategoryModal
          category={deletingCategory}
          onConfirm={handleDelete}
          onClose={() => setDeletingCategory(null)}
        />
      )}
    </div>
  );
}

export default CategoriesPage;