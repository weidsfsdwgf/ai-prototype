export type TodoTaskStatus = "pending" | "handled";
export type TodoTaskKind = "normal" | "resignationRiskConfirmation";
export type ResignationRiskRole = "行政部" | "财务部" | "所属部门" | "人力资源部" | "当事人";

export type ResignationRiskChecklistItem = {
  id: string;
  role: ResignationRiskRole;
  matter: string;
  requiredAction: string;
  riskSignal: string;
};

export type TodoTaskAssignee = {
  name: string;
  status: TodoTaskStatus;
  handledAt?: string;
};

export type TodoTask = {
  id: string;
  kind: TodoTaskKind;
  title: string;
  creator: string;
  assignees: TodoTaskAssignee[];
  createdAt: string;
  deadline: string;
  description: string;
  sourceDocumentNo?: string;
  applicationVersion?: string;
  riskRole?: ResignationRiskRole;
  riskItems?: ResignationRiskChecklistItem[];
  riskConclusion?: "无风险" | "有风险" | "待确认";
};

export const currentTodoUser = "陈嘉";

export type ResignationMatterName = "工作交接" | "行政交接" | "人力资源办理" | "财务确认";

export const resignationMatterNames: ResignationMatterName[] = ["工作交接", "行政交接", "人力资源办理", "财务确认"];

export type ResignationMatterAssigneeConfig = Record<ResignationMatterName, Record<string, string>>;

export const resignationMatterAssigneeConfig: ResignationMatterAssigneeConfig = {
  工作交接: { 成都: currentTodoUser, 重庆: currentTodoUser, 广州: currentTodoUser, 深圳: currentTodoUser },
  行政交接: { 成都: currentTodoUser, 重庆: currentTodoUser, 广州: "许佳", 深圳: "许佳" },
  人力资源办理: { 成都: currentTodoUser, 重庆: currentTodoUser, 广州: "林珊", 深圳: "林珊" },
  财务确认: { 成都: currentTodoUser, 重庆: currentTodoUser, 广州: "周霖", 深圳: "周霖" },
};

export function getResignationMatterAssignee(
  matter: ResignationMatterName,
  area: string,
  config: ResignationMatterAssigneeConfig = resignationMatterAssigneeConfig,
) {
  return config[matter]?.[area] ?? currentTodoUser;
}

export const todoTasks: TodoTask[] = [
  {
    id: "TODO-RES-1001",
    kind: "resignationRiskConfirmation",
    title: "离职事项确认：赵宁 / 行政部",
    creator: "系统",
    assignees: [{ name: getResignationMatterAssignee("行政交接", "成都"), status: "pending" }],
    createdAt: "2026-05-05 10:05",
    deadline: "2026-05-06 18:00",
    description: "请确认赵宁的行政交接是否完成，包括办公用品、钥匙、电脑、电话卡、工牌、借样衣服归还，以及电脑软件清理。提交后回写离职申请 V1。",
    sourceDocumentNo: "HR-RES-202605-001",
    applicationVersion: "V1",
    riskRole: "行政部",
    riskConclusion: "待确认",
    riskItems: [
      {
        id: "admin-assets",
        role: "行政部",
        matter: "办公物品与资产归还",
        requiredAction: "逐项勾选归还状态；电脑需填写开机密码或交接说明；借样衣服需选择未借样、已归还或待归还。",
        riskSignal: "任一物品待归还、电脑无法交接或借样待归还时标记为有风险。",
      },
      {
        id: "admin-software",
        role: "行政部",
        matter: "电脑软件清理",
        requiredAction: "选择是否已清除，并填写未清除原因或处理计划。",
        riskSignal: "未清除且无明确处理计划时标记为有风险。",
      },
    ],
  },
  {
    id: "TODO-RES-1002",
    kind: "resignationRiskConfirmation",
    title: "离职事项确认：赵宁 / 财务部",
    creator: "系统",
    assignees: [{ name: getResignationMatterAssignee("财务确认", "成都"), status: "pending" }],
    createdAt: "2026-05-05 10:05",
    deadline: "2026-05-06 18:00",
    description: "请确认赵宁的财务事项是否完成，包括是否存在欠款、欠款金额、款项说明和结算建议。提交后回写离职申请 V1。",
    sourceDocumentNo: "HR-RES-202605-001",
    applicationVersion: "V1",
    riskRole: "财务部",
    riskConclusion: "待确认",
    riskItems: [
      {
        id: "finance-debt",
        role: "财务部",
        matter: "欠款核实",
        requiredAction: "选择是否有欠款；如有欠款需填写欠款金额、款项说明和扣回或结清建议。",
        riskSignal: "存在未结清欠款或金额待核实时标记为有风险。",
      },
    ],
  },
  {
    id: "TODO-RES-1003",
    kind: "resignationRiskConfirmation",
    title: "离职事项确认：赵宁 / 工作交接",
    creator: "系统",
    assignees: [{ name: getResignationMatterAssignee("工作交接", "成都"), status: "pending" }],
    createdAt: "2026-05-05 10:05",
    deadline: "2026-05-06 18:00",
    description: "请确认赵宁的工作交接是否完成，包括交接接收人、工作内容、文档资料、当前进度、运营账号密码变更和工作交接表。提交后回写离职申请 V1。",
    sourceDocumentNo: "HR-RES-202605-001",
    applicationVersion: "V1",
    riskRole: "所属部门",
    riskConclusion: "待确认",
    riskItems: [
      {
        id: "department-handover",
        role: "所属部门",
        matter: "工作交接",
        requiredAction: "确认是否无需交接；如需交接，指定接收人、交接内容、文件资料移交结果、运营账号密码修改结果和工作交接表页数。",
        riskSignal: "无人接收、文件资料未移交、运营账号未改密或工作交接表缺失时标记为有风险。",
      },
    ],
  },
  {
    id: "TODO-RES-1004",
    kind: "resignationRiskConfirmation",
    title: "离职事项确认：赵宁 / 人力资源部",
    creator: "系统",
    assignees: [{ name: getResignationMatterAssignee("人力资源办理", "成都"), status: "pending" }],
    createdAt: "2026-05-05 10:05",
    deadline: "2026-05-06 18:00",
    description: "请确认赵宁的人力资源办理是否完成，包括银行卡信息、企点/钉钉、微信群、马帮、企业邮箱、社保公积金、出勤天数和工资结算截止日期。提交后回写离职申请 V1。",
    sourceDocumentNo: "HR-RES-202605-001",
    applicationVersion: "V1",
    riskRole: "人力资源部",
    riskConclusion: "待确认",
    riskItems: [
      {
        id: "hr-account-settlement",
        role: "人力资源部",
        matter: "人力资源办理",
        requiredAction: "逐项确认账号停用、退出群、社保公积金停缴时间、离职当月上班天数和工资结算截止日期。",
        riskSignal: "账号未停用、社保公积金时间缺失、出勤或工资截止日期未确认时标记为有风险。",
      },
    ],
  },
  {
    id: "TODO-1001",
    kind: "normal",
    title: "补充成都运营中心岗位编制说明",
    creator: "林珊",
    assignees: [
      { name: currentTodoUser, status: "pending" },
      { name: "赵宁", status: "pending" },
      { name: "王越", status: "handled", handledAt: "2026-05-05 11:05" },
    ],
    createdAt: "2026-05-05 09:20",
    deadline: "2026-05-06 18:00",
    description: "请结合本月组织调整结果，补充运营主管与仓储专员的岗位编制依据，并同步给人事管理员复核。",
  },
  {
    id: "TODO-1002",
    kind: "normal",
    title: "确认低值易耗品盘点差异",
    creator: "周霖",
    assignees: [
      { name: currentTodoUser, status: "pending" },
      { name: "林珊", status: "pending" },
      { name: "赵宁", status: "pending" },
      { name: "许佳", status: "handled", handledAt: "2026-05-05 09:42" },
    ],
    createdAt: "2026-05-04 16:40",
    deadline: "2026-05-05 17:30",
    description: "华西仓本周盘点存在 3 条耗材账实差异，需要确认差异原因及责任人后回填处理意见。",
  },
  {
    id: "TODO-1003",
    kind: "normal",
    title: "审批流节点配置复核",
    creator: "王越",
    assignees: [{ name: currentTodoUser, status: "pending" }],
    createdAt: "2026-05-04 10:12",
    deadline: "2026-05-07 12:00",
    description: "请复核离职审批、转正审批两个流程的区域负责人节点，避免新组织架构上线后出现流转空节点。",
  },
  {
    id: "TODO-2001",
    kind: "normal",
    title: "更新供应链中心通讯录",
    creator: "赵宁",
    assignees: [
      { name: currentTodoUser, status: "handled", handledAt: "2026-05-03 11:26" },
      { name: "林珊", status: "handled", handledAt: "2026-05-03 10:50" },
    ],
    createdAt: "2026-05-02 14:08",
    deadline: "2026-05-03 18:00",
    description: "已按最新组织架构更新部门成员、手机号码与汇报关系，并完成部门负责人确认。",
  },
  {
    id: "TODO-3001",
    kind: "normal",
    title: "发起月度资产使用反馈",
    creator: currentTodoUser,
    assignees: [
      { name: "林珊", status: "pending" },
      { name: "周霖", status: "pending" },
      { name: "赵宁", status: "handled", handledAt: "2026-05-04 17:10" },
    ],
    createdAt: "2026-05-01 09:30",
    deadline: "2026-05-08 18:00",
    description: "请各区域资产管理员补充本月低值易耗品领用反馈，重点说明异常损耗和补货建议。",
  },
  {
    id: "TODO-3002",
    kind: "normal",
    title: "收集新员工试用期辅导记录",
    creator: currentTodoUser,
    assignees: [{ name: "周霖", status: "handled", handledAt: "2026-05-05 10:18" }],
    createdAt: "2026-04-30 15:12",
    deadline: "2026-05-06 18:00",
    description: "请整理本批转正员工的试用期辅导记录，缺失材料请在截止日前完成补录。",
  },
];

export const resignationRiskChecklist: ResignationRiskChecklistItem[] = [
  {
    id: "department-handover",
    role: "所属部门",
    matter: "工作交接、文件资料移交、运营账号密码变更和工作交接表",
    requiredAction: "确认是否无需交接；如需交接，指定接收人、交接内容、文件资料移交结果、运营账号密码修改结果和工作交接表页数。",
    riskSignal: "无人接收、文件资料未移交、运营账号未改密或工作交接表缺失。",
  },
  {
    id: "admin-assets",
    role: "行政部",
    matter: "办公用品、办公室钥匙、电脑、电话机、电话卡、工牌、借样衣服是否归还",
    requiredAction: "逐项勾选归还状态；电脑需填写开机密码或交接说明；借样衣服需选择未借样、已归还或待归还。",
    riskSignal: "任一物品待归还、电脑无法交接或借样待归还。",
  },
  {
    id: "admin-software",
    role: "行政部",
    matter: "电脑无用或有安全隐患的软件是否清除",
    requiredAction: "选择是否已清除，并填写未清除原因或处理计划。",
    riskSignal: "未清除且无明确处理计划。",
  },
  {
    id: "hr-account-settlement",
    role: "人力资源部",
    matter: "银行卡信息、企点/钉钉、微信群、马帮、企业邮箱、社保公积金、出勤和工资截止日",
    requiredAction: "逐项确认账号停用、退出群、社保公积金停缴时间、离职当月上班天数和工资结算截止日期。",
    riskSignal: "账号未停用、社保公积金时间缺失、出勤或工资截止日期未确认。",
  },
  {
    id: "finance-debt",
    role: "财务部",
    matter: "是否存在员工欠款",
    requiredAction: "选择是否有欠款；如有欠款需填写欠款金额、款项说明和扣回或结清建议。",
    riskSignal: "存在未结清欠款或金额待核实。",
  },
  {
    id: "employee-confirmation",
    role: "当事人",
    matter: "确认手续办妥、资料交还、保密义务和劳动关系结束",
    requiredAction: "阅读确认声明并签署确认。",
    riskSignal: "拒绝确认或资料交还存在争议。",
  },
];
