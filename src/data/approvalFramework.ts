import { payrollApprovalInfo, type PayrollApprovalInfo } from "./payrollApproval";

export type ApprovalHandleType = "待办理" | "已通过" | "已驳回" | "已转办" | "抄送";
export type ApprovalStatus = "进行中" | "已结束";
export type ApprovalResult = "处理中" | "已通过" | "已驳回" | "已撤回";

export type ApprovalRecord = {
  id: string;
  flowName: string;
  documentNo: string;
  initiator: string;
  summary: string;
  status: ApprovalStatus;
  result: ApprovalResult;
  createdAt: string;
  currentNode: string;
  handleType: ApprovalHandleType;
  resignationInfo?: {
    name: string;
    area: string;
    department: string;
    position: string;
    rank: string;
    hireDate: string;
    resignationDate: string;
    resignationType: string;
    resignationReasons: string[];
    reasonDescription: string;
  };
  riskConfirmations?: Array<{
    role: string;
    conclusion: "待确认" | "无风险" | "有风险" | "已作废";
    handledAt?: string;
    documentNo: string;
    matter: string;
    requiredAction: string;
    confirmationDetail: string;
    remark: string;
  }>;
  payrollInfo?: PayrollApprovalInfo;
};

export type MyInitiatedApprovalRecord = {
  id: string;
  flowName: string;
  documentNo: string;
  initiator: string;
  summary: string;
  status: ApprovalStatus;
  result: ApprovalResult;
  createdAt: string;
  endedAt: string;
};

export const pendingApprovals: ApprovalRecord[] = [
  {
    id: "AP-1000",
    flowName: "薪酬审批",
    documentNo: "PAY-202604-001",
    initiator: "林珊",
    summary: "薪酬月份：2026-04 | 算薪人数：8 | 薪资合计：154820",
    status: "进行中",
    result: "处理中",
    createdAt: "2026-05-08 18:20",
    currentNode: "薪酬负责人审批",
    handleType: "待办理",
    payrollInfo: payrollApprovalInfo,
  },
  {
    id: "AP-1001",
    flowName: "员工调动审批",
    documentNo: "HR-MOVE-202604-001",
    initiator: "林珊",
    summary: "员工：赵宁 | 原部门：仓储中心 | 目标部门：供应链中心",
    status: "进行中",
    result: "处理中",
    createdAt: "2026-04-30 09:20",
    currentNode: "人事管理员审批",
    handleType: "待办理",
  },
  {
    id: "AP-1002",
    flowName: "菜单权限申请",
    documentNo: "AUTH-202604-018",
    initiator: "王越",
    summary: "申请人：王越 | 权限范围：供应链计划菜单与数据权限",
    status: "进行中",
    result: "处理中",
    createdAt: "2026-04-29 18:12",
    currentNode: "系统管理员审批",
    handleType: "待办理",
  },
  {
    id: "AP-1003",
    flowName: "花名册信息变更",
    documentNo: "HR-EMP-202604-011",
    initiator: "周霖",
    summary: "员工：周霖 | 变更内容：银行卡与紧急联系人信息",
    status: "进行中",
    result: "处理中",
    createdAt: "2026-04-29 14:35",
    currentNode: "负责 HR 审批",
    handleType: "待办理",
  },
];

export const handledApprovals: ApprovalRecord[] = [
  {
    id: "AP-2001",
    flowName: "新增代管账号",
    documentNo: "USER-202604-009",
    initiator: "陈嘉",
    summary: "账号名称：王越-代管 | 账号类型：代管账号",
    status: "已结束",
    result: "已通过",
    createdAt: "2026-04-28 15:30",
    currentNode: "流程结束",
    handleType: "已通过",
  },
  {
    id: "AP-2002",
    flowName: "负责 HR 调整",
    documentNo: "HR-OWNER-202604-004",
    initiator: "赵宁",
    summary: "部门：仓储中心 | 负责HR：林珊",
    status: "已结束",
    result: "已驳回",
    createdAt: "2026-04-27 10:16",
    currentNode: "流程结束",
    handleType: "已驳回",
  },
  {
    id: "AP-2003",
    flowName: "组织负责人变更",
    documentNo: "ORG-202604-006",
    initiator: "许佳",
    summary: "部门：成都运营中心 | 新负责人：许佳",
    status: "进行中",
    result: "处理中",
    createdAt: "2026-04-26 11:42",
    currentNode: "陈嘉",
    handleType: "已转办",
  },
];

export const copiedApprovals: ApprovalRecord[] = [
  {
    id: "AP-3001",
    flowName: "员工离职审批",
    documentNo: "HR-LEAVE-202604-005",
    initiator: "林珊",
    summary: "员工：赵宁 | 抄送部门：信息中心",
    status: "进行中",
    result: "处理中",
    createdAt: "2026-04-28 13:45",
    currentNode: "周霖",
    handleType: "抄送",
  },
  {
    id: "AP-3002",
    flowName: "部门信息变更",
    documentNo: "ORG-202604-008",
    initiator: "陈嘉",
    summary: "部门：深圳供应链中心 | 上级部门：深圳",
    status: "已结束",
    result: "已通过",
    createdAt: "2026-04-27 09:28",
    currentNode: "流程结束",
    handleType: "抄送",
  },
];

export const myInitiatedApprovals: MyInitiatedApprovalRecord[] = [
  {
    id: "MI-1001",
    flowName: "员工调动审批",
    documentNo: "HR-MOVE-202604-001",
    initiator: "林珊",
    summary: "员工：赵宁 | 原部门：仓储中心 | 目标部门：供应链中心",
    status: "进行中",
    result: "处理中",
    createdAt: "2026-04-30 09:20",
    endedAt: "-",
  },
  {
    id: "MI-1002",
    flowName: "新增代管账号",
    documentNo: "USER-202604-009",
    initiator: "陈嘉",
    summary: "账号名称：王越-代管 | 账号类型：代管账号",
    status: "已结束",
    result: "已通过",
    createdAt: "2026-04-28 15:30",
    endedAt: "2026-04-28 17:02",
  },
  {
    id: "MI-1003",
    flowName: "负责 HR 调整",
    documentNo: "HR-OWNER-202604-004",
    initiator: "赵宁",
    summary: "部门：仓储中心 | 负责HR：林珊",
    status: "已结束",
    result: "已驳回",
    createdAt: "2026-04-27 10:16",
    endedAt: "2026-04-27 15:25",
  },
  {
    id: "MI-1004",
    flowName: "部门信息变更",
    documentNo: "ORG-202604-008",
    initiator: "陈嘉",
    summary: "部门：深圳供应链中心 | 上级部门：深圳",
    status: "已结束",
    result: "已撤回",
    createdAt: "2026-04-26 12:11",
    endedAt: "2026-04-26 13:08",
  },
];

export const approvalChain = [
  {
    node: "发起申请",
    operator: "林珊",
    action: "提交",
    time: "2026-04-30 09:20",
    comment: "提交审批单据",
  },
  {
    node: "部门负责人",
    operator: "陈嘉",
    action: "通过",
    time: "2026-04-30 10:08",
    comment: "信息完整，同意提交下一环节",
  },
  {
    node: "人事管理员",
    operator: "待处理",
    action: "待办理",
    time: "-",
    comment: "等待当前审批人处理",
  },
];
