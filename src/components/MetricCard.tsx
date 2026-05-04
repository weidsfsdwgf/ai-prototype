import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { HealthStatus } from "../types/status";
import "./MetricCard.css";

type MetricCardProps = {
  label: string;
  value: string;
  change: string;
  status: HealthStatus;
};

const statusIcon = {
  healthy: <ArrowUpRight size={16} />,
  warning: <Minus size={16} />,
  risk: <ArrowDownRight size={16} />,
};

export function MetricCard({ label, value, change, status }: MetricCardProps) {
  return (
    <section className={`metric-card metric-card--${status}`}>
      <span className="metric-card__label">{label}</span>
      <strong>{value}</strong>
      <span className="metric-card__change">
        {statusIcon[status]}
        {change}
      </span>
    </section>
  );
}
