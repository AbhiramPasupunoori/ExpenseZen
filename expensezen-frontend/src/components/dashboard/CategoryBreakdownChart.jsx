import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatCurrency } from "../../utils/formatters";

function CategoryBreakdownChart({ data, currency }) {
  if (!data.length) {
    return (
      <div className="chart-empty">
        No expense categories exist for this month.
      </div>
    );
  }

  return (
    <>
      <div className="category-chart-canvas">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="name"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((category) => (
                <Cell
                  key={category.id ?? category.name}
                  fill={category.color}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) =>
                formatCurrency(value, currency)
              }
              contentStyle={{
                background: "#0f1c2e",
                border: "1px solid #253750",
                borderRadius: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="category-list">
        {data.map((category) => (
          <div
            className="category-list-item"
            key={category.id ?? category.name}
          >
            <span
              className="category-color"
              style={{ background: category.color }}
            />

            <div>
              <strong>{category.name}</strong>
              <span>
                {category.percentage.toFixed(1)}%
              </span>
            </div>

            <strong>
              {formatCurrency(category.amount, currency)}
            </strong>
          </div>
        ))}
      </div>
    </>
  );
}

export default CategoryBreakdownChart;