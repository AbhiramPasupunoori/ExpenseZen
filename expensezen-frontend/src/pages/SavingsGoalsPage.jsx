import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Coins,
  Goal,
  Plus,
  Search,
  Target,
} from "lucide-react";
import {
  cancelSavingsGoal,
  contributeToSavingsGoal,
  createSavingsGoal,
  deleteSavingsGoal,
  getSavingsGoals,
  updateSavingsGoal,
} from "../api/savingsGoalService";
import ContributionModal from "../components/savings/ContributionModal";
import GoalActionModal from "../components/savings/GoalActionModal";
import SavingsGoalCard from "../components/savings/SavingsGoalCard";
import SavingsGoalFormModal from "../components/savings/SavingsGoalFormModal";
import useAuth from "../hooks/useAuth";
import { formatCurrency } from "../utils/formatters";
import "../styles/savings-goals.css";

function SavingsGoalsPage() {
  const { user } = useAuth();
  const currency = user?.currency || "INR";

  const [goals, setGoals] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [contributionGoal, setContributionGoal] = useState(null);
  const [actionGoal, setActionGoal] = useState(null);
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadGoals() {
      setLoading(true);
      setErrorMessage("");

      try {
        const data = await getSavingsGoals({
          signal: controller.signal,
        });

        if (active) {
          setGoals(data);
        }
      } catch (error) {
        if (active && error.code !== "ERR_CANCELED") {
          setErrorMessage(
            error.response?.data?.message ||
              "Savings goals could not be loaded.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadGoals();

    return () => {
      active = false;
      controller.abort();
    };
  }, [refreshKey]);

  const visibleGoals = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return goals.filter((goalItem) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        goalItem.status === statusFilter;

      const matchesSearch = goalItem.name
        .toLowerCase()
        .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [goals, statusFilter, search]);

  const activeGoals = goals.filter(
    (goalItem) => goalItem.status === "ACTIVE",
  );

  const completedGoals = goals.filter(
    (goalItem) => goalItem.status === "COMPLETED",
  );

  const totalSaved = goals.reduce(
    (total, goalItem) =>
      total + Number(goalItem.savedAmount ?? 0),
    0,
  );

  function showSuccess(message) {
    setSuccessMessage(message);

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3500);
  }

  async function handleSave(goalData) {
    if (editingGoal) {
      await updateSavingsGoal(editingGoal.id, goalData);
      showSuccess("Savings goal updated successfully.");
    } else {
      await createSavingsGoal(goalData);
      showSuccess("Savings goal created successfully.");
    }

    setRefreshKey((current) => current + 1);
  }

  async function handleContribution(goalId, amount) {
    await contributeToSavingsGoal(goalId, amount);
    showSuccess("Contribution added successfully.");
    setRefreshKey((current) => current + 1);
  }

  async function handleCancel(goalId) {
    await cancelSavingsGoal(goalId);
    showSuccess("Savings goal cancelled.");
    setRefreshKey((current) => current + 1);
  }

  async function handleDelete(goalId) {
    await deleteSavingsGoal(goalId);
    showSuccess("Savings goal deleted.");
    setRefreshKey((current) => current + 1);
  }

  function openAction(goalItem, action) {
    setActionGoal(goalItem);
    setActionType(action);
  }

  return (
    <div className="savings-page">
      <section className="savings-page-header">
        <div>
          <h2>Savings goals</h2>
          <p>Set financial targets and monitor your progress.</p>
        </div>

        <button
          type="button"
          className="add-savings-button"
          onClick={() => {
            setEditingGoal(null);
            setFormOpen(true);
          }}
        >
          <Plus size={19} />
          Create goal
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

      <section className="savings-summary-grid">
        <article>
          <span className="savings-summary-icon total">
            <Target size={22} />
          </span>
          <div>
            <span>Total goals</span>
            <strong>{goals.length}</strong>
          </div>
        </article>

        <article>
          <span className="savings-summary-icon active">
            <Goal size={22} />
          </span>
          <div>
            <span>Active goals</span>
            <strong>{activeGoals.length}</strong>
          </div>
        </article>

        <article>
          <span className="savings-summary-icon completed">
            <CheckCircle2 size={22} />
          </span>
          <div>
            <span>Completed goals</span>
            <strong>{completedGoals.length}</strong>
          </div>
        </article>

        <article>
          <span className="savings-summary-icon saved">
            <Coins size={22} />
          </span>
          <div>
            <span>Total saved</span>
            <strong>
              {formatCurrency(totalSaved, currency)}
            </strong>
          </div>
        </article>
      </section>

      <section className="savings-toolbar">
        <div className="savings-tabs">
          {["ALL", "ACTIVE", "COMPLETED", "CANCELLED"].map(
            (status) => (
              <button
                key={status}
                type="button"
                className={
                  statusFilter === status ? "active" : ""
                }
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0) +
                  status.slice(1).toLowerCase()}
              </button>
            ),
          )}
        </div>

        <label className="savings-search">
          <Search size={18} />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search goals..."
          />
        </label>
      </section>

      {loading ? (
        <div className="savings-empty">Loading goals...</div>
      ) : visibleGoals.length ? (
        <section className="savings-card-grid">
          {visibleGoals.map((goalItem) => (
            <SavingsGoalCard
              key={goalItem.id}
              goal={goalItem}
              currency={currency}
              onEdit={(selectedGoal) => {
                setEditingGoal(selectedGoal);
                setFormOpen(true);
              }}
              onContribute={setContributionGoal}
              onCancel={(selectedGoal) =>
                openAction(selectedGoal, "cancel")
              }
              onDelete={(selectedGoal) =>
                openAction(selectedGoal, "delete")
              }
            />
          ))}
        </section>
      ) : (
        <div className="savings-empty">
          <Goal size={39} />
          <h3>No savings goals found</h3>
          <p>Create a goal or change the selected filter.</p>
        </div>
      )}

      {formOpen && (
        <SavingsGoalFormModal
          goal={editingGoal}
          onSubmit={handleSave}
          onClose={() => {
            setFormOpen(false);
            setEditingGoal(null);
          }}
        />
      )}

      {contributionGoal && (
        <ContributionModal
          goal={contributionGoal}
          currency={currency}
          onSubmit={handleContribution}
          onClose={() => setContributionGoal(null)}
        />
      )}

      {actionGoal && (
        <GoalActionModal
          goal={actionGoal}
          action={actionType}
          onConfirm={
            actionType === "delete"
              ? handleDelete
              : handleCancel
          }
          onClose={() => {
            setActionGoal(null);
            setActionType(null);
          }}
        />
      )}
    </div>
  );
}

export default SavingsGoalsPage;