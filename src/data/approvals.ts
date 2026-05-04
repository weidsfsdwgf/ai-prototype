import type { ApprovalStatus } from "../types/status";

export type ApprovalRecord = {
  id: string;
  title: string;
  category: string;
  applicant: string;
  amount: number;
  department: string;
  submittedAt: string;
  status: ApprovalStatus;
};

export const approvalRecords: ApprovalRecord[] = [
  {
    id: "AP-20260429-001",
    title: "年度软件服务采购",
    category: "采购申请",
    applicant: "杨帆",
    amount: 286000,
    department: "信息技术部",
    submittedAt: "2026-04-29 09:12",
    status: "pending",
  },
  {
    id: "AP-20260428-014",
    title: "华南区客户招待费用",
    category: "费用报销",
    applicant: "赵宁",
    amount: 18600,
    department: "销售一部",
    submittedAt: "2026-04-28 16:45",
    status: "processing",
  },
  {
    id: "AP-20260427-032",
    title: "核心供应商准入",
    category: "供应商管理",
    applicant: "孟琪",
    amount: 0,
    department: "采购中心",
    submittedAt: "2026-04-27 13:20",
    status: "approved",
  },
  {
    id: "AP-20260426-018",
    title: "临时额度调整",
    category: "客户信用",
    applicant: "顾然",
    amount: 500000,
    department: "风控部",
    submittedAt: "2026-04-26 11:05",
    status: "rejected",
  },
];
