import type { ApprovalRecord, ApprovalResult, ApprovalStatus } from "./approvalFramework";

export type ResignationManagementStatus = "待确认" | "已确认";
export type ResignationApprovalStatus = "审批中" | "已通过" | "已驳回" | "已撤销" | "无审批";

export type ResignationManagementRecord = {
  id: string;
  employeeNo: string;
  name: string;
  area: string;
  department: string;
  position: string;
  rank: string;
  hireDate: string;
  resignationDate: string;
  status: ResignationManagementStatus;
  approvalStatus: ResignationApprovalStatus;
  resignationType: string;
  resignationReasons: string[];
  reasonDescription: string;
  phone: string;
  responsibleHr: string;
  updater: string;
  updatedAt: string;
  submitTime?: string;
  applicationVersion?: string;
  riskResults?: ResignationRiskResult[];
};

export type ResignationApplicationStatus = "审批中" | "已通过" | "已驳回" | "已撤销";

export type ResignationRiskResult = {
  role: "所属部门" | "行政部" | "人力资源部" | "财务部";
  conclusion: "待确认" | "无风险" | "有风险" | "已作废";
  handledAt?: string;
};

export type ResignationApplicationRecord = {
  id: string;
  approvalNo: string;
  employeeNo: string;
  name: string;
  area: string;
  department: string;
  position: string;
  rank: string;
  hireDate: string;
  status: ResignationApplicationStatus;
  resignationDate: string;
  resignationType: string;
  resignationReasons: string[];
  reasonDescription: string;
  phone: string;
  responsibleHr: string;
  submitTime: string;
  updatedAt: string;
  currentNode: string;
  applicationVersion: string;
  riskResults: ResignationRiskResult[];
};

export const resignationReasonOptions = ["个人发展", "家庭原因", "薪酬福利", "工作地点", "职业规划", "其他"];
export const resignationTypeOptions = ["主动离职", "被动离职", "协商解除"];
export const resignationAreaOptions = ["成都", "重庆", "广州", "深圳"];
export const resignationDepartmentOptions = ["财务部", "供应链中心", "信息中心", "运营中心", "仓储中心", "人事部"];
export const resignationHrOptions = ["林珊", "何敏", "周然"];

export const resignationManagementRecords: ResignationManagementRecord[] = [
  {
    id: "RM-1",
    employeeNo: "LS0007",
    name: "赵宁",
    area: "成都",
    department: "仓储中心",
    position: "仓储主管",
    rank: "P3",
    hireDate: "2023-03-15",
    resignationDate: "2026-05-10",
    status: "待确认",
    approvalStatus: "审批中",
    resignationType: "主动离职",
    resignationReasons: ["个人发展"],
    reasonDescription: "已提交离职申请，当前等待直属主管审批。",
    phone: "13800010007",
    responsibleHr: "林珊",
    updater: "赵宁",
    updatedAt: "2026-05-04 16:20",
    submitTime: "2026-05-04 09:40",
    applicationVersion: "V1",
    riskResults: [
      { role: "所属部门", conclusion: "待确认" },
      { role: "行政部", conclusion: "待确认" },
      { role: "人力资源部", conclusion: "待确认" },
      { role: "财务部", conclusion: "待确认" },
    ],
  },
  {
    id: "RM-2",
    employeeNo: "LS0012",
    name: "王越",
    area: "重庆",
    department: "供应链中心",
    position: "采购专员",
    rank: "P2",
    hireDate: "2022-08-01",
    resignationDate: "2026-05-18",
    status: "待确认",
    approvalStatus: "已通过",
    resignationType: "主动离职",
    resignationReasons: ["家庭原因", "工作地点"],
    reasonDescription: "计划回原居住城市发展。",
    phone: "13800010012",
    responsibleHr: "何敏",
    updater: "王越",
    updatedAt: "2026-05-03 18:10",
    submitTime: "2026-05-02 11:25",
    applicationVersion: "V1",
    riskResults: [
      { role: "所属部门", conclusion: "无风险", handledAt: "2026-05-02 14:50" },
      { role: "行政部", conclusion: "无风险", handledAt: "2026-05-02 15:20" },
      { role: "人力资源部", conclusion: "无风险", handledAt: "2026-05-02 15:42" },
      { role: "财务部", conclusion: "无风险", handledAt: "2026-05-02 16:05" },
    ],
  },
  {
    id: "RM-3",
    employeeNo: "LS0018",
    name: "梁悦",
    area: "深圳",
    department: "运营中心",
    position: "运营专员",
    rank: "P1",
    hireDate: "2024-01-08",
    resignationDate: "2026-05-22",
    status: "已确认",
    approvalStatus: "无审批",
    resignationType: "协商解除",
    resignationReasons: ["职业规划"],
    reasonDescription: "HR 在花名册办理离职后进入待离职名单。",
    phone: "13800010018",
    responsibleHr: "周然",
    updater: "林珊",
    updatedAt: "2026-05-04 14:05",
  },
  {
    id: "RM-4",
    employeeNo: "LS0021",
    name: "陈嘉",
    area: "广州",
    department: "信息中心",
    position: "产品经理",
    rank: "P4",
    hireDate: "2021-11-22",
    resignationDate: "2026-06-01",
    status: "已确认",
    approvalStatus: "已通过",
    resignationType: "主动离职",
    resignationReasons: ["个人发展", "职业规划"],
    reasonDescription: "审批通过后 HR 已确认最后工作日。",
    phone: "13800010021",
    responsibleHr: "林珊",
    updater: "林珊",
    updatedAt: "2026-05-04 15:42",
    submitTime: "2026-04-29 10:12",
    applicationVersion: "V1",
    riskResults: [
      { role: "所属部门", conclusion: "无风险", handledAt: "2026-04-29 14:10" },
      { role: "行政部", conclusion: "无风险", handledAt: "2026-04-29 14:35" },
      { role: "人力资源部", conclusion: "无风险", handledAt: "2026-04-29 15:05" },
      { role: "财务部", conclusion: "无风险", handledAt: "2026-04-29 15:28" },
    ],
  },
];

export const resignationApplicationRecords: ResignationApplicationRecord[] = [
  {
    id: "RA-1",
    approvalNo: "HR-RES-202605-001",
    employeeNo: "LS0007",
    name: "赵宁",
    area: "成都",
    department: "仓储中心",
    position: "仓储主管",
    rank: "P3",
    hireDate: "2023-03-15",
    status: "审批中",
    resignationDate: "2026-05-10",
    resignationType: "主动离职",
    resignationReasons: ["个人发展"],
    reasonDescription: "希望尝试新的业务方向。",
    phone: "13800010007",
    responsibleHr: "林珊",
    submitTime: "2026-05-04 09:40",
    updatedAt: "2026-05-04 16:20",
    currentNode: "直属主管审批",
    applicationVersion: "V1",
    riskResults: [
      { role: "所属部门", conclusion: "待确认" },
      { role: "行政部", conclusion: "待确认" },
      { role: "人力资源部", conclusion: "待确认" },
      { role: "财务部", conclusion: "待确认" },
    ],
  },
  {
    id: "RA-2",
    approvalNo: "HR-RES-202605-002",
    employeeNo: "LS0012",
    name: "王越",
    area: "重庆",
    department: "供应链中心",
    position: "采购专员",
    rank: "P2",
    hireDate: "2022-08-01",
    status: "已通过",
    resignationDate: "2026-05-18",
    resignationType: "主动离职",
    resignationReasons: ["家庭原因", "工作地点"],
    reasonDescription: "计划回原居住城市发展。",
    phone: "13800010012",
    responsibleHr: "何敏",
    submitTime: "2026-05-02 11:25",
    updatedAt: "2026-05-03 18:10",
    currentNode: "流程结束",
    applicationVersion: "V1",
    riskResults: [
      { role: "所属部门", conclusion: "无风险", handledAt: "2026-05-02 14:50" },
      { role: "行政部", conclusion: "无风险", handledAt: "2026-05-02 15:20" },
      { role: "人力资源部", conclusion: "无风险", handledAt: "2026-05-02 15:42" },
      { role: "财务部", conclusion: "无风险", handledAt: "2026-05-02 16:05" },
    ],
  },
  {
    id: "RA-3",
    approvalNo: "HR-RES-202604-008",
    employeeNo: "LS0024",
    name: "周霖",
    area: "成都",
    department: "财务部",
    position: "会计",
    rank: "P2",
    hireDate: "2024-06-03",
    status: "已驳回",
    resignationDate: "2026-05-12",
    resignationType: "主动离职",
    resignationReasons: ["薪酬福利"],
    reasonDescription: "申请信息不完整，主管驳回后可重新提交。",
    phone: "13800010024",
    responsibleHr: "林珊",
    submitTime: "2026-04-26 14:35",
    updatedAt: "2026-04-27 11:05",
    currentNode: "流程结束",
    applicationVersion: "V1",
    riskResults: [
      { role: "所属部门", conclusion: "已作废" },
      { role: "行政部", conclusion: "已作废" },
      { role: "人力资源部", conclusion: "已作废" },
      { role: "财务部", conclusion: "已作废" },
    ],
  },
];

const riskDetailByRole: Record<ResignationRiskResult["role"], { matter: string; requiredAction: string; confirmationDetail: string; remark: string }> = {
  所属部门: {
    matter: "工作交接",
    requiredAction: "确认工作内容、文件资料、运营账号和交接表是否完成。",
    confirmationDetail: "已指定陈嘉接收，工作内容和进度已说明；文件资料与运营账号仍需补充确认。",
    remark: "待所属部门补充最终完成情况。",
  },
  行政部: {
    matter: "行政交接",
    requiredAction: "确认办公物品、资产归还和电脑软件清理是否完成。",
    confirmationDetail: "办公用品、钥匙、工牌已归还；电脑已交接；软件已清理。",
    remark: "行政交接已完成。",
  },
  人力资源部: {
    matter: "人力资源办理",
    requiredAction: "确认账号、群组、社保公积金、出勤和工资结算信息是否完成。",
    confirmationDetail: "银行卡信息已提交；微信群已退出；社保/公积金停缴：2026-05；工资截止：2026-05-10。",
    remark: "账号停用随正式离职办理执行。",
  },
  财务部: {
    matter: "财务确认",
    requiredAction: "确认欠款和结算建议是否完成。",
    confirmationDetail: "无欠款，正常进入工资结算。",
    remark: "财务确认已完成。",
  },
};

export function toResignationApprovalRecord(
  record: ResignationApplicationRecord | ResignationManagementRecord,
): ApprovalRecord {
  const approvalNo = "approvalNo" in record ? record.approvalNo : `HR-RES-${record.employeeNo}`;
  const applicationStatus = "status" in record && (record.status === "待确认" || record.status === "已确认") ? record.approvalStatus : record.status;
  const resultMap: Record<string, ApprovalResult> = {
    审批中: "处理中",
    已通过: "已通过",
    已驳回: "已驳回",
    已撤销: "已撤回",
    无审批: "处理中",
  };
  const status: ApprovalStatus = applicationStatus === "审批中" || applicationStatus === "无审批" ? "进行中" : "已结束";
  const result = resultMap[applicationStatus] ?? "处理中";

  return {
    id: record.id,
    flowName: "离职申请",
    documentNo: approvalNo,
    initiator: record.name,
    summary: `姓名：${record.name} | 区域：${record.area} | 部门：${record.department} | 岗位-职级：${record.position}-${record.rank} | 离职日期：${record.resignationDate}`,
    status,
    result,
    createdAt: record.submitTime ?? record.updatedAt,
    currentNode: applicationStatus === "审批中" ? "直属主管审批" : "流程结束",
    handleType: result === "已通过" ? "已通过" : result === "已驳回" ? "已驳回" : "待办理",
    resignationInfo: {
      name: record.name,
      area: record.area,
      department: record.department,
      position: record.position,
      rank: record.rank,
      hireDate: record.hireDate,
      resignationDate: record.resignationDate,
      resignationType: record.resignationType,
      resignationReasons: record.resignationReasons,
      reasonDescription: record.reasonDescription,
    },
    riskConfirmations: (record.riskResults ?? []).map((risk) => {
      const detail = riskDetailByRole[risk.role];

      return {
        role: risk.role,
        conclusion: risk.conclusion,
        handledAt: risk.handledAt,
        documentNo: `${approvalNo}-${risk.role}`,
        matter: detail.matter,
        requiredAction: detail.requiredAction,
        confirmationDetail: risk.conclusion === "待确认" ? "待确认人提交风险确认单据。" : detail.confirmationDetail,
        remark: risk.conclusion === "已作废" ? "当前申请版本已结束，风险确认单据同步作废。" : detail.remark,
      };
    }),
  };
}
