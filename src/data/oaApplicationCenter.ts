import type { Metric } from "./dashboard";

export type OaApplicationCategory = "人事" | "行政" | "财务" | "采购" | "合同";
export type OaApplicationTypeStatus = "启用" | "停用";
export type OaDocumentStatus = "进行中" | "已结束";
export type OaDocumentResult = "处理中" | "已通过" | "已驳回" | "已撤回";

export type OaApplicationField = {
  label: string;
  name: string;
  kind: "input" | "textarea" | "select" | "dateRange" | "number" | "upload";
  required?: boolean;
  options?: string[];
};

export type OaApplicationType = {
  id: string;
  flowName: string;
  category: OaApplicationCategory;
  ownerDept: string;
  description: string;
  defaultSla: string;
  approvalRule: string;
  status: OaApplicationTypeStatus;
  updatedAt: string;
  formFields: OaApplicationField[];
  flowNodes: string[];
};

export type OaApplicationRecord = {
  id: string;
  flowName: string;
  documentNo: string;
  initiator: string;
  department: string;
  category: OaApplicationCategory;
  summary: string;
  status: OaDocumentStatus;
  result: OaDocumentResult;
  currentNode: string;
  createdAt: string;
  endedAt: string;
  flowNodes: string[];
};

export type OaApprovalRule = {
  id: string;
  name: string;
  scope: string;
  condition: string;
  owner: string;
  enabled: boolean;
};

export const oaApplicationMetrics: Metric[] = [
  { label: "申请类型", value: "6", change: "已接入通用审批中心", status: "healthy" },
  { label: "线上化覆盖率", value: "92%", change: "目标 90% 以上", status: "healthy" },
  { label: "平均审批耗时", value: "1.8 天", change: "较线下缩短 43%", status: "healthy" },
  { label: "退回率", value: "8%", change: "规则提示持续优化", status: "warning" },
];

export const oaApplicationTypes: OaApplicationType[] = [
  {
    id: "regularization",
    flowName: "转正申请",
    category: "人事",
    ownerDept: "人事部",
    description: "试用期员工提交转正材料，审批通过后回写员工状态。",
    defaultSla: "5 个工作日",
    approvalRule: "员工所属组织 + 直属主管 + 负责 HR",
    status: "启用",
    updatedAt: "2026-05-04 10:20",
    formFields: [
      { label: "试用期工作总结", name: "workSummary", kind: "textarea", required: true },
      { label: "工作成果", name: "achievements", kind: "textarea", required: true },
      { label: "自我评价", name: "selfEvaluation", kind: "textarea", required: true },
      { label: "附件材料", name: "attachments", kind: "upload" },
    ],
    flowNodes: ["员工提交", "直属主管评价", "部门负责人审批", "HR 审核", "业务负责人确认", "回写员工状态"],
  },
  {
    id: "leave",
    flowName: "请假申请",
    category: "人事",
    ownerDept: "人事部",
    description: "年假、调休、病假、事假的统一申请入口。",
    defaultSla: "1 个工作日",
    approvalRule: "请假天数 + 员工所属组织",
    status: "启用",
    updatedAt: "2026-04-30 15:12",
    formFields: [
      { label: "请假类型", name: "leaveType", kind: "select", required: true, options: ["年假", "调休", "病假", "事假"] },
      { label: "请假时间", name: "leavePeriod", kind: "dateRange", required: true },
      { label: "请假原因", name: "reason", kind: "textarea", required: true },
      { label: "证明材料", name: "attachments", kind: "upload" },
    ],
    flowNodes: ["员工提交", "直属主管审批", "HR 备案", "回写考勤状态"],
  },
  {
    id: "business-trip",
    flowName: "出差申请",
    category: "行政",
    ownerDept: "行政部",
    description: "出差计划、预算和行程审批。",
    defaultSla: "2 个工作日",
    approvalRule: "出差城市 + 预计费用 + 部门负责人",
    status: "启用",
    updatedAt: "2026-04-30 14:06",
    formFields: [
      { label: "出差城市", name: "city", kind: "input", required: true },
      { label: "出差时间", name: "tripPeriod", kind: "dateRange", required: true },
      { label: "预计费用", name: "budget", kind: "number", required: true },
      { label: "出差事由", name: "reason", kind: "textarea", required: true },
    ],
    flowNodes: ["员工提交", "直属主管审批", "行政审核", "部门负责人审批", "生成出差记录"],
  },
  {
    id: "expense",
    flowName: "费用报销",
    category: "财务",
    ownerDept: "财务部",
    description: "日常费用、差旅费用和招待费用报销。",
    defaultSla: "3 个工作日",
    approvalRule: "费用类型 + 金额区间 + 成本中心",
    status: "启用",
    updatedAt: "2026-04-29 17:42",
    formFields: [
      { label: "费用类型", name: "expenseType", kind: "select", required: true, options: ["差旅", "招待", "办公", "其他"] },
      { label: "报销金额", name: "amount", kind: "number", required: true },
      { label: "费用说明", name: "description", kind: "textarea", required: true },
      { label: "票据附件", name: "attachments", kind: "upload", required: true },
    ],
    flowNodes: ["员工提交", "直属主管审批", "财务初审", "财务负责人审批", "付款状态回写"],
  },
  {
    id: "purchase",
    flowName: "采购申请",
    category: "采购",
    ownerDept: "采购中心",
    description: "物资、服务和软件采购的申请入口。",
    defaultSla: "4 个工作日",
    approvalRule: "采购品类 + 采购金额 + 预算占用",
    status: "启用",
    updatedAt: "2026-04-29 15:24",
    formFields: [
      { label: "采购品类", name: "purchaseType", kind: "select", required: true, options: ["物资", "服务", "软件"] },
      { label: "采购金额", name: "amount", kind: "number", required: true },
      { label: "需求说明", name: "description", kind: "textarea", required: true },
      { label: "供应商建议", name: "supplier", kind: "input" },
    ],
    flowNodes: ["需求人提交", "部门负责人审批", "预算校验", "采购中心审批", "生成采购需求"],
  },
  {
    id: "seal",
    flowName: "用印申请",
    category: "合同",
    ownerDept: "法务部",
    description: "合同、证明、授权书等文件用印。",
    defaultSla: "1 个工作日",
    approvalRule: "印章类型 + 文件类型 + 合同金额",
    status: "停用",
    updatedAt: "2026-04-28 11:30",
    formFields: [
      { label: "印章类型", name: "sealType", kind: "select", required: true, options: ["公章", "合同章", "法人章"] },
      { label: "文件类型", name: "fileType", kind: "input", required: true },
      { label: "用印说明", name: "description", kind: "textarea", required: true },
      { label: "文件附件", name: "attachments", kind: "upload", required: true },
    ],
    flowNodes: ["申请人提交", "部门负责人审批", "法务复核", "印章管理员办理", "归档用印记录"],
  },
];

export const oaApplicationRecords: OaApplicationRecord[] = [
  {
    id: "OA-1",
    flowName: "转正申请",
    documentNo: "HR-REG-202605-001",
    initiator: "周霖",
    department: "财务部",
    category: "人事",
    summary: "员工：周霖 | 部门：财务部 | 试用期截止：2026-05-20",
    status: "进行中",
    result: "处理中",
    currentNode: "直属主管评价",
    createdAt: "2026-05-04 09:18",
    endedAt: "-",
    flowNodes: ["员工提交", "直属主管评价", "部门负责人审批", "HR 审核", "业务负责人确认", "回写员工状态"],
  },
  {
    id: "OA-2",
    flowName: "费用报销",
    documentNo: "FIN-EXP-202604-018",
    initiator: "赵宁",
    department: "仓储中心",
    category: "财务",
    summary: "费用类型：招待 | 报销金额：18600 元 | 成本中心：仓储中心",
    status: "进行中",
    result: "处理中",
    currentNode: "财务初审",
    createdAt: "2026-04-30 16:45",
    endedAt: "-",
    flowNodes: ["员工提交", "直属主管审批", "财务初审", "财务负责人审批", "付款状态回写"],
  },
  {
    id: "OA-3",
    flowName: "采购申请",
    documentNo: "PUR-REQ-202604-011",
    initiator: "陈嘉",
    department: "运营中心",
    category: "采购",
    summary: "采购品类：移动终端 | 采购金额：126000 元 | 需求日期：2026-05-15",
    status: "已结束",
    result: "已通过",
    currentNode: "流程结束",
    createdAt: "2026-04-28 13:20",
    endedAt: "2026-04-30 18:20",
    flowNodes: ["需求人提交", "部门负责人审批", "预算校验", "采购中心审批", "生成采购需求"],
  },
  {
    id: "OA-4",
    flowName: "用印申请",
    documentNo: "LEG-SEAL-202604-006",
    initiator: "林珊",
    department: "人事部",
    category: "合同",
    summary: "印章类型：合同章 | 文件类型：校招三方协议 | 用印份数：2",
    status: "已结束",
    result: "已通过",
    currentNode: "流程结束",
    createdAt: "2026-04-27 09:35",
    endedAt: "2026-04-27 15:42",
    flowNodes: ["申请人提交", "部门负责人审批", "法务复核", "印章管理员办理", "归档用印记录"],
  },
  {
    id: "OA-5",
    flowName: "出差申请",
    documentNo: "ADM-TRIP-202604-014",
    initiator: "王越",
    department: "供应链中心",
    category: "行政",
    summary: "出差城市：深圳 | 出差天数：3 天 | 预计费用：4200 元",
    status: "已结束",
    result: "已驳回",
    currentNode: "流程结束",
    createdAt: "2026-04-26 10:24",
    endedAt: "2026-04-26 17:10",
    flowNodes: ["员工提交", "直属主管审批", "行政审核", "部门负责人审批", "生成出差记录"],
  },
];

export const oaApprovalRules: OaApprovalRule[] = [
  {
    id: "RULE-1",
    name: "人事类申请",
    scope: "人事",
    condition: "按员工主部门匹配直属主管，转正类追加负责 HR 与业务负责人",
    owner: "人事部",
    enabled: true,
  },
  {
    id: "RULE-2",
    name: "财务金额分级",
    scope: "财务",
    condition: "报销金额小于 5000 元走主管 + 财务初审；大于等于 5000 元追加财务负责人",
    owner: "财务部",
    enabled: true,
  },
  {
    id: "RULE-3",
    name: "采购预算校验",
    scope: "采购",
    condition: "采购申请提交后先校验预算占用，预算不足时自动退回申请人",
    owner: "采购中心",
    enabled: true,
  },
  {
    id: "RULE-4",
    name: "用印法务复核",
    scope: "合同",
    condition: "合同类文件必须经过法务复核，证明类文件可按部门负责人审批后办理",
    owner: "法务部",
    enabled: false,
  },
];
