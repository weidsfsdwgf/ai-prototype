import { Tag } from "antd";
import type { ApprovalStatus } from "../types/status";

const approvalStatusMeta: Record<ApprovalStatus, { color: string; label: string }> = {
  pending: { color: "gold", label: "待审批" },
  processing: { color: "blue", label: "审批中" },
  approved: { color: "green", label: "已通过" },
  rejected: { color: "red", label: "已驳回" },
};

type StatusTagProps = {
  status: ApprovalStatus;
};

export function StatusTag({ status }: StatusTagProps) {
  const meta = approvalStatusMeta[status];
  return <Tag color={meta.color}>{meta.label}</Tag>;
}
