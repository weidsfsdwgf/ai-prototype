import type { HealthStatus } from "../types/status";

export type Metric = {
  label: string;
  value: string;
  change: string;
  status: HealthStatus;
};

export type WorkItem = {
  title: string;
  owner: string;
  deadline: string;
  status: "待处理" | "进行中" | "已完成";
};

export const metrics: Metric[] = [
  { label: "本月合同金额", value: "¥ 4,286,000", change: "+12.4%", status: "healthy" },
  { label: "待审批事项", value: "37", change: "8 项临近超时", status: "warning" },
  { label: "活跃客户", value: "1,248", change: "+36", status: "healthy" },
  { label: "风险任务", value: "9", change: "3 项高优先级", status: "risk" },
];

export const workItems: WorkItem[] = [
  { title: "华东区 Q2 采购框架审批", owner: "陈嘉", deadline: "今日 18:00", status: "待处理" },
  { title: "重点客户续约资料补齐", owner: "林珊", deadline: "明日 12:00", status: "进行中" },
  { title: "费用科目合规性抽检", owner: "周霖", deadline: "04-30", status: "已完成" },
  { title: "组织权限季度复核", owner: "王越", deadline: "05-06", status: "进行中" },
];
