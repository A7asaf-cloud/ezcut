"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function WeightChart({
  data,
}: {
  data: { date: string; weightKg: number }[];
}) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-neutral-400">
        Log your first day to see your weight trend here.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} />
        <YAxis
          stroke="#a1a1aa"
          fontSize={12}
          domain={["dataMin - 1", "dataMax + 1"]}
        />
        <Tooltip
          contentStyle={{
            background: "#171717",
            border: "1px solid #27272a",
            borderRadius: 8,
            color: "#fff",
          }}
        />
        <Line
          type="monotone"
          dataKey="weightKg"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
