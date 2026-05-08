import { scorecardTemplates } from "./scorecardConfig";
import type { ScorecardTemplate } from "./scorecardConfig";

export type PerformanceStatus =
  | "无需考核"
  | "待员工自评"
  | "待上级评价"
  | "待绩效确认"
  | "已确认"
  | "已归档";

export type PerformanceFlowCode = "direct-manager" | "operations-review";

export type PerformanceFlowOption = {
  code: PerformanceFlowCode;
  name: string;
  description: string;
  nodes: string[];
};

export type PerformanceRecord = {
  id: string;
  employeeNo: string;
  name: string;
  departmentKey: string;
  department: string;
  area: string;
  position: string;
  rank: string;
  directManager: string;
  period: string;
  templateId?: string;
  templateName?: string;
  flowCode?: PerformanceFlowCode;
  confirmer?: string;
  status: PerformanceStatus;
  currentHandler?: string;
  modified: boolean;
  submittedAt?: string;
  confirmedAt?: string;
  archiveDate: string;
  selfSubmitted?: boolean;
  score?: number;
};

export type PerformanceConfigRule = {
  id: string;
  name: string;
  objectKeys: string[];
  objectNames: string[];
  departmentKeys: string[];
  departments: string[];
  ranks: string[];
  templateId: string;
  flowCode: PerformanceFlowCode;
  confirmer: string;
};

export type PerformanceLog = {
  id: string;
  recordId: string;
  node: string;
  handler: string;
  action: string;
  time: string;
  remark: string;
};

export const performanceFlowOptions: PerformanceFlowOption[] = [
  {
    code: "direct-manager",
    name: "自评+直属上级评",
    description: "员工完成自评后，由直属上级完成评价；绩效确认作为通用确认环节，不写入评价流程。",
    nodes: ["员工自评", "直属上级评"],
  },
  {
    code: "operations-review",
    name: "运营中心评价流程",
    description: "运营中心岗位使用，员工自评后由运营中心指定评价人完成评价；后续进入通用确认。",
    nodes: ["员工自评", "运营中心评价"],
  },
];

export const performanceConfirmers = ["陈嘉", "林珊", "王越", "周霖"];

export const performanceRanks = ["P1", "P2", "P3", "P4", "P5", "P6", "M1", "M2", "M3", "职能支持"];

export const performanceConfigRules: PerformanceConfigRule[] = [
  {
    id: "rule-ops-p",
    name: "运营一线绩效规则",
    objectKeys: ["department:chengdu-operations", "department:chengdu-warehouse"],
    objectNames: ["运营中心", "仓储中心"],
    departmentKeys: ["chengdu-operations", "chengdu-warehouse"],
    departments: ["运营中心", "仓储中心"],
    ranks: ["P1", "P2", "P3"],
    templateId: "scorecard-probation-v1",
    flowCode: "operations-review",
    confirmer: "陈嘉",
  },
  {
    id: "rule-ops-m",
    name: "运营管理岗绩效规则",
    objectKeys: ["department:chengdu-operations"],
    objectNames: ["运营中心"],
    departmentKeys: ["chengdu-operations"],
    departments: ["运营中心"],
    ranks: ["M1", "M2", "M3"],
    templateId: "scorecard-probation-v1",
    flowCode: "operations-review",
    confirmer: "林珊",
  },
  {
    id: "rule-warehouse",
    name: "仓储岗位绩效规则",
    objectKeys: ["department:chengdu-warehouse"],
    objectNames: ["仓储中心"],
    departmentKeys: ["chengdu-warehouse"],
    departments: ["仓储中心"],
    ranks: ["P1", "P2", "P3", "P4", "P5", "P6"],
    templateId: "scorecard-probation-v1",
    flowCode: "direct-manager",
    confirmer: "陈嘉",
  },
  {
    id: "rule-hr",
    name: "职能支持绩效规则",
    objectKeys: ["department:shenzhen-hr"],
    objectNames: ["人事部"],
    departmentKeys: ["shenzhen-hr"],
    departments: ["人事部"],
    ranks: ["职能支持"],
    templateId: "scorecard-probation-v1",
    flowCode: "direct-manager",
    confirmer: "王越",
  },
];

export const performanceRecords: PerformanceRecord[] = [
  {
    id: "PERF-202605-001",
    employeeNo: "LS0001",
    name: "陈嘉",
    departmentKey: "chengdu-operations",
    department: "运营中心",
    area: "成都",
    position: "运营主管",
    rank: "M2",
    directManager: "许佳",
    period: "2026-05",
    templateId: "scorecard-probation-v1",
    templateName: "试用期转正考核表",
    flowCode: "operations-review",
    confirmer: "林珊",
    status: "待绩效确认",
    currentHandler: "林珊",
    modified: true,
    submittedAt: "2026-05-05 18:20",
    archiveDate: "2026-06-05",
    selfSubmitted: true,
    score: 87,
  },
  {
    id: "PERF-202605-002",
    employeeNo: "LS0002",
    name: "林珊",
    departmentKey: "shenzhen-hr",
    department: "人事部",
    area: "深圳",
    position: "人事专员",
    rank: "P3",
    directManager: "陈嘉",
    period: "2026-05",
    templateId: "scorecard-probation-v1",
    templateName: "试用期转正考核表",
    flowCode: "direct-manager",
    confirmer: "王越",
    status: "待上级评价",
    currentHandler: "陈嘉",
    modified: false,
    submittedAt: "2026-05-05 12:10",
    archiveDate: "2026-06-05",
    selfSubmitted: true,
  },
  {
    id: "PERF-202605-003",
    employeeNo: "LS0003",
    name: "周霖",
    departmentKey: "xiamen-finance",
    department: "财务部",
    area: "厦门",
    position: "财务专员",
    rank: "P2",
    directManager: "赵宁",
    period: "2026-05",
    status: "无需考核",
    currentHandler: "管理员",
    modified: false,
    archiveDate: "2026-06-05",
    selfSubmitted: false,
  },
  {
    id: "PERF-202605-004",
    employeeNo: "LS0004",
    name: "赵宁",
    departmentKey: "chengdu-warehouse",
    department: "仓储中心",
    area: "成都",
    position: "仓储专员",
    rank: "P2",
    directManager: "陈嘉",
    period: "2026-05",
    templateId: "scorecard-probation-v1",
    templateName: "试用期转正考核表",
    flowCode: "direct-manager",
    confirmer: "陈嘉",
    status: "待员工自评",
    currentHandler: "赵宁",
    modified: false,
    archiveDate: "2026-06-05",
    selfSubmitted: false,
  },
  {
    id: "PERF-202605-005",
    employeeNo: "LS0005",
    name: "许佳",
    departmentKey: "chengdu-operations",
    department: "运营中心",
    area: "成都",
    position: "运营专员",
    rank: "P2",
    directManager: "陈嘉",
    period: "2026-05",
    templateId: "scorecard-probation-v1",
    templateName: "试用期转正考核表",
    flowCode: "operations-review",
    confirmer: "陈嘉",
    status: "待绩效确认",
    currentHandler: "陈嘉",
    modified: true,
    submittedAt: "2026-05-04 17:50",
    archiveDate: "2026-06-05",
    selfSubmitted: true,
    score: 91,
  },
  {
    id: "PERF-202605-006",
    employeeNo: "LS0006",
    name: "王越",
    departmentKey: "shenzhen-supply-chain",
    department: "供应链中心",
    area: "深圳",
    position: "供应链经理",
    rank: "M2",
    directManager: "林珊",
    period: "2026-05",
    status: "无需考核",
    currentHandler: undefined,
    modified: false,
    archiveDate: "2026-06-05",
    selfSubmitted: false,
  },
  {
    id: "PERF-202605-007",
    employeeNo: "LS0007",
    name: "孙悦",
    departmentKey: "chengdu-operations",
    department: "运营中心",
    area: "成都",
    position: "运营专员",
    rank: "P1",
    directManager: "陈嘉",
    period: "2026-05",
    templateId: "scorecard-probation-v1",
    templateName: "试用期转正考核表",
    flowCode: "operations-review",
    confirmer: "陈嘉",
    status: "待员工自评",
    currentHandler: "孙悦",
    modified: false,
    archiveDate: "2026-06-05",
    selfSubmitted: false,
  },
  {
    id: "PERF-202605-008",
    employeeNo: "LS0008",
    name: "刘洋",
    departmentKey: "chengdu-warehouse",
    department: "仓储中心",
    area: "成都",
    position: "仓储组长",
    rank: "P3",
    directManager: "陈嘉",
    period: "2026-05",
    templateId: "scorecard-probation-v1",
    templateName: "试用期转正考核表",
    flowCode: "direct-manager",
    confirmer: "陈嘉",
    status: "待上级评价",
    currentHandler: "陈嘉",
    modified: false,
    submittedAt: "2026-05-06 09:20",
    archiveDate: "2026-06-05",
    selfSubmitted: true,
  },
  {
    id: "PERF-202605-009",
    employeeNo: "LS0009",
    name: "高敏",
    departmentKey: "chengdu-warehouse",
    department: "仓储中心",
    area: "成都",
    position: "仓储专员",
    rank: "P2",
    directManager: "陈嘉",
    period: "2026-05",
    templateId: "scorecard-probation-v1",
    templateName: "试用期转正考核表",
    flowCode: "direct-manager",
    confirmer: "陈嘉",
    status: "待绩效确认",
    currentHandler: "陈嘉",
    modified: false,
    submittedAt: "2026-05-06 16:45",
    archiveDate: "2026-06-05",
    selfSubmitted: true,
    score: 84,
  },
  {
    id: "PERF-202605-010",
    employeeNo: "LS0010",
    name: "何然",
    departmentKey: "chengdu-operations",
    department: "运营中心",
    area: "成都",
    position: "运营专员",
    rank: "P2",
    directManager: "陈嘉",
    period: "2026-05",
    templateId: "scorecard-probation-v1",
    templateName: "试用期转正考核表",
    flowCode: "operations-review",
    confirmer: "陈嘉",
    status: "已确认",
    currentHandler: undefined,
    modified: false,
    submittedAt: "2026-05-04 14:30",
    confirmedAt: "2026-05-06 17:30",
    archiveDate: "2026-06-05",
    selfSubmitted: true,
    score: 88,
  },
  {
    id: "PERF-202605-011",
    employeeNo: "LS0011",
    name: "唐琪",
    departmentKey: "chengdu-operations",
    department: "运营中心",
    area: "成都",
    position: "运营主管",
    rank: "M1",
    directManager: "许佳",
    period: "2026-05",
    templateId: "scorecard-probation-v1",
    templateName: "试用期转正考核表",
    flowCode: "operations-review",
    confirmer: "陈嘉",
    status: "待绩效确认",
    currentHandler: "陈嘉",
    modified: true,
    submittedAt: "2026-05-06 18:05",
    archiveDate: "2026-06-05",
    selfSubmitted: true,
    score: 86,
  },
  {
    id: "PERF-202605-012",
    employeeNo: "LS0012",
    name: "邹航",
    departmentKey: "chengdu-incubation",
    department: "产品孵化部",
    area: "成都",
    position: "产品助理",
    rank: "P1",
    directManager: "陈嘉",
    period: "2026-05",
    status: "无需考核",
    currentHandler: undefined,
    modified: false,
    archiveDate: "2026-06-05",
    selfSubmitted: false,
  },
  {
    id: "PERF-202604-013",
    employeeNo: "LS0013",
    name: "宋妍",
    departmentKey: "chengdu-operations",
    department: "运营中心",
    area: "成都",
    position: "运营专员",
    rank: "P3",
    directManager: "陈嘉",
    period: "2026-04",
    templateId: "scorecard-probation-v1",
    templateName: "试用期转正考核表",
    flowCode: "operations-review",
    confirmer: "陈嘉",
    status: "已归档",
    currentHandler: undefined,
    modified: false,
    submittedAt: "2026-05-02 14:20",
    confirmedAt: "2026-05-04 17:20",
    archiveDate: "2026-05-05",
    selfSubmitted: true,
    score: 89,
  },
  {
    id: "PERF-202604-014",
    employeeNo: "LS0014",
    name: "罗佳",
    departmentKey: "chengdu-warehouse",
    department: "仓储中心",
    area: "成都",
    position: "仓储专员",
    rank: "P2",
    directManager: "陈嘉",
    period: "2026-04",
    templateId: "scorecard-probation-v1",
    templateName: "试用期转正考核表",
    flowCode: "direct-manager",
    confirmer: "陈嘉",
    status: "已归档",
    currentHandler: undefined,
    modified: false,
    submittedAt: "2026-05-02 11:05",
    confirmedAt: "2026-05-04 16:40",
    archiveDate: "2026-05-05",
    selfSubmitted: true,
    score: 85,
  },
];

export const performanceLogs: PerformanceLog[] = [
  {
    id: "log-001",
    recordId: "PERF-202605-001",
    node: "系统匹配",
    handler: "系统",
    action: "生成绩效表",
    time: "2026-05-01 08:00",
    remark: "按运营中心 M1/M2/M3 规则匹配模板。",
  },
  {
    id: "log-002",
    recordId: "PERF-202605-001",
    node: "员工自评",
    handler: "陈嘉",
    action: "提交自评",
    time: "2026-05-05 18:20",
    remark: "已提交本周期工作总结。",
  },
  {
    id: "log-003",
    recordId: "PERF-202605-001",
    node: "直属上级评价",
    handler: "许佳",
    action: "提交评价",
    time: "2026-05-06 10:15",
    remark: "建议进入绩效确认。",
  },
  {
    id: "log-004",
    recordId: "PERF-202605-001",
    node: "部门主管修订",
    handler: "许佳",
    action: "修订绩效数据",
    time: "2026-05-06 11:40",
    remark: "补充重点项目得分说明，打上修改标记。",
  },
  {
    id: "log-005",
    recordId: "PERF-202605-002",
    node: "员工自评",
    handler: "林珊",
    action: "提交自评",
    time: "2026-05-05 12:10",
    remark: "流转至直属上级评价。",
  },
];

export function getPerformanceTemplate(record?: PerformanceRecord): ScorecardTemplate | undefined {
  return scorecardTemplates.find((template) => template.id === record?.templateId);
}

export function getPerformanceFlowName(flowCode?: PerformanceFlowCode) {
  return performanceFlowOptions.find((flow) => flow.code === flowCode)?.name ?? "-";
}

export function getPerformanceSubjectValues(record: PerformanceRecord) {
  return {
    employeeName: record.name,
    employeeNo: record.employeeNo,
    department: record.department,
    position: record.position,
    rank: record.rank,
    directManager: record.directManager,
    assessmentPeriod: record.period,
    fillDate: record.submittedAt?.slice(0, 10) ?? "2026-05-06",
  };
}
