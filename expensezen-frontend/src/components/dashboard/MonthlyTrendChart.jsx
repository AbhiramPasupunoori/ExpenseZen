import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatCompactCurrency,
  formatCurrency,
} from "../../utils/formatters";

function MonthlyTrendChart({ data, currency }) {
  if (!data.length) {
    return (
      <div className="chart-empty">
        No monthly transaction data is available.
      </div>
    );
  }

  return (
    <div className="chart-canvas">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 12,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient
              id="incomeGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="#22c55e"
                stopOpacity={0.35}
              />
              <stop
                offset="95%"
                stopColor="#22c55e"
                stopOpacity={0}
              />
            </linearGradient>

            <linearGradient
              id="expenseGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="#ef4444"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="#ef4444"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="#253750"
            strokeDasharray="4 4"
            vertical={false}
          />

          <XAxis
            dataKey="label"
            stroke="#94a3b8"
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            stroke="#94a3b8"
            tickLine={false}
            axisLine={false}
            width={75}
            tickFormatter={(value) =>
              formatCompactCurrency(value, currency)
            }
          />

          <Tooltip
            formatter={(value, name) => [
              formatCurrency(value, currency),
              name === "income" ? "Income" : "Expenses",
            ]}
            contentStyle={{
              background: "#0f1c2e",
              border: "1px solid #253750",
              borderRadius: "12px",
            }}
          />

          <Legend />

          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#22c55e"
            strokeWidth={3}
            fill="url(#incomeGradient)"
          />

          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#ef4444"
            strokeWidth={3}
            fill="url(#expenseGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MonthlyTrendChart;