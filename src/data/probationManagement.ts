import type { Metric } from "./dashboard";

export type ProbationApprovalStatus = "待提交" | "审批中" | "已驳回" | "已通过";
export type ProbationNoticeStatus = "未通知" | "已通知";
export type RegularizationApplicationStatus = "审批中" | "已通过" | "已驳回" | "已撤销";

export type ProbationManagementRecord = {
  id: string;
  employeeNo: string;
  name: string;
  area: string;
  department: string;
  position: string;
  rank: string;
  phone: string;
  hireDate: string;
  expectedRegularDate: string;
  actualRegularDate: string;
  approvalStatus?: ProbationApprovalStatus;
  noticeStatus: ProbationNoticeStatus;
  responsibleHr: string;
  updater: string;
  updatedAt: string;
  employeeCreatedAt: string;
  hasFormalAccount: boolean;
  probationSalary?: number;
  regularSalary?: number;
  salaryByOffer?: boolean;
  effectiveDate?: string;
  assessmentTemplate?: string;
  examFile?: string;
};

export type RegularizationApplicationRecord = {
  id: string;
  employeeNo: string;
  name: string;
  area: string;
  department: string;
  position: string;
  rank: string;
  phone: string;
  hireDate: string;
  expectedRegularDate: string;
  actualRegularDate: string;
  status: RegularizationApplicationStatus;
  responsibleHr: string;
  submitTime: string;
  updatedAt: string;
  approvalNo: string;
  currentNode: string;
  assessmentTemplate: string;
  assessmentFile: string;
  valueTestFile: string;
  examFile: string;
};

export type RegularizationFileTemplate = {
  id: string;
  mainDepartment: string;
  assessmentTemplate: string;
  examTemplate: string;
  updater: string;
  updatedAt: string;
};

export const probationMetrics: Metric[] = [
  { label: "近期转正", value: "4", change: "30天内含逾期未办理", status: "warning" },
  { label: "未通知", value: "2", change: "可发起转正通知", status: "warning" },
  { label: "审批中", value: "2", change: "需等待磐石流程结束", status: "healthy" },
  { label: "待手动办理", value: "1", change: "审批结束后可更新实际日期", status: "healthy" },
];

export const applicationMetrics: Metric[] = [
  { label: "待发起", value: "1", change: "HR已通知，员工未提交", status: "warning" },
  { label: "审批中", value: "2", change: "SSC/主管审批流转", status: "healthy" },
  { label: "已通过", value: "1", change: "通过后回写转正管理", status: "healthy" },
  { label: "已撤销", value: "1", change: "仅本人可撤销", status: "warning" },
];

export const areaOptions = ["成都", "深圳", "厦门", "上海"];
export const departmentOptions = ["财务部", "供应链中心", "信息中心", "运营中心", "仓储中心", "人事部"];
export const hrOptions = ["林珊", "陈嘉", "许佳"];

export const probationFlowNodes = ["负责区域SSC会签", "直属主管审批", "部门负责人审批", "审批结束", "回写实际转正日期"];

export const probationFileTemplates: RegularizationFileTemplate[] = [
  {
    id: "TPL-1",
    mainDepartment: "财务部",
    assessmentTemplate: "财务岗位转正评估表.docx",
    examTemplate: "财务制度转正考试.pdf",
    updater: "林珊",
    updatedAt: "2026-05-01 14:20",
  },
  {
    id: "TPL-2",
    mainDepartment: "供应链中心",
    assessmentTemplate: "供应链岗位转正评估表.docx",
    examTemplate: "供应链计划考试.pdf",
    updater: "林珊",
    updatedAt: "2026-04-28 10:16",
  },
  {
    id: "TPL-3",
    mainDepartment: "信息中心",
    assessmentTemplate: "信息技术岗位转正评估表.docx",
    examTemplate: "信息安全基础测试.pdf",
    updater: "陈嘉",
    updatedAt: "2026-04-25 17:40",
  },
];

const unsortedProbationManagementRecords: ProbationManagementRecord[] = [
  {
    id: "REG-MGT-1",
    employeeNo: "LS0003",
    name: "周霖",
    area: "厦门",
    department: "财务部",
    position: "财务专员",
    rank: "P2",
    phone: "13800010003",
    hireDate: "2026-02-20",
    expectedRegularDate: "2026-05-20",
    actualRegularDate: "",
    approvalStatus: "审批中",
    noticeStatus: "已通知",
    responsibleHr: "林珊",
    updater: "林珊",
    updatedAt: "2026-05-04 09:18",
    employeeCreatedAt: "2026-02-20 09:00",
    hasFormalAccount: true,
    probationSalary: 9000,
    regularSalary: 10500,
    salaryByOffer: false,
    effectiveDate: "2026-05-20",
    assessmentTemplate: "财务岗位转正评估表.docx",
    examFile: "财务制度转正考试.pdf",
  },
  {
    id: "REG-MGT-2",
    employeeNo: "LS0011",
    name: "王越",
    area: "深圳",
    department: "供应链中心",
    position: "供应链计划",
    rank: "P2",
    phone: "13800010011",
    hireDate: "2026-02-12",
    expectedRegularDate: "2026-05-12",
    actualRegularDate: "",
    approvalStatus: "已通过",
    noticeStatus: "已通知",
    responsibleHr: "林珊",
    updater: "林珊",
    updatedAt: "2026-05-03 18:12",
    employeeCreatedAt: "2026-02-12 10:12",
    hasFormalAccount: true,
    probationSalary: 11000,
    regularSalary: 12000,
    salaryByOffer: true,
    effectiveDate: "2026-05-12",
    assessmentTemplate: "供应链岗位转正评估表.docx",
    examFile: "供应链计划考试.pdf",
  },
  {
    id: "REG-MGT-3",
    employeeNo: "LS0012",
    name: "许佳",
    area: "成都",
    department: "信息中心",
    position: "前端工程师",
    rank: "P3",
    phone: "13800010012",
    hireDate: "2026-02-03",
    expectedRegularDate: "2026-05-03",
    actualRegularDate: "",
    noticeStatus: "已通知",
    responsibleHr: "陈嘉",
    updater: "陈嘉",
    updatedAt: "2026-05-02 16:20",
    employeeCreatedAt: "2026-02-03 09:35",
    hasFormalAccount: true,
    assessmentTemplate: "信息技术岗位转正评估表.docx",
    examFile: "信息安全基础测试.pdf",
  },
  {
    id: "REG-MGT-4",
    employeeNo: "LS0014",
    name: "顾然",
    area: "成都",
    department: "仓储中心",
    position: "仓储专员",
    rank: "P2",
    phone: "13800010014",
    hireDate: "2026-02-28",
    expectedRegularDate: "2026-05-28",
    actualRegularDate: "",
    noticeStatus: "未通知",
    responsibleHr: "林珊",
    updater: "林珊",
    updatedAt: "2026-04-30 11:26",
    employeeCreatedAt: "2026-02-28 09:10",
    hasFormalAccount: false,
  },
  {
    id: "REG-MGT-5",
    employeeNo: "LS0015",
    name: "孟琳",
    area: "上海",
    department: "运营中心",
    position: "运营专员",
    rank: "P2",
    phone: "13800010015",
    hireDate: "2026-01-18",
    expectedRegularDate: "2026-04-18",
    actualRegularDate: "",
    approvalStatus: "已驳回",
    noticeStatus: "已通知",
    responsibleHr: "许佳",
    updater: "许佳",
    updatedAt: "2026-04-29 15:08",
    employeeCreatedAt: "2026-01-18 13:24",
    hasFormalAccount: true,
    probationSalary: 8500,
    regularSalary: 9500,
    salaryByOffer: false,
    effectiveDate: "2026-04-18",
  },
  {
    id: "REG-MGT-6",
    employeeNo: "LS0016",
    name: "陆骁",
    area: "深圳",
    department: "人事部",
    position: "SSC专员",
    rank: "P2",
    phone: "13800010016",
    hireDate: "2026-03-15",
    expectedRegularDate: "",
    actualRegularDate: "",
    noticeStatus: "未通知",
    responsibleHr: "林珊",
    updater: "林珊",
    updatedAt: "2026-04-27 10:00",
    employeeCreatedAt: "2026-03-15 09:00",
    hasFormalAccount: true,
  },
  {
    id: "REG-MGT-7",
    employeeNo: "LS0013",
    name: "赵晴",
    area: "成都",
    department: "运营中心",
    position: "运营专员",
    rank: "P2",
    phone: "13800010013",
    hireDate: "2026-01-15",
    expectedRegularDate: "2026-04-15",
    actualRegularDate: "2026-04-15",
    approvalStatus: "已通过",
    noticeStatus: "已通知",
    responsibleHr: "林珊",
    updater: "系统",
    updatedAt: "2026-04-15 18:22",
    employeeCreatedAt: "2026-01-15 09:10",
    hasFormalAccount: true,
    probationSalary: 7800,
    regularSalary: 8800,
    salaryByOffer: true,
    effectiveDate: "2026-04-15",
    assessmentTemplate: "运营岗位转正评估表.docx",
    examFile: "运营标准转正考试.pdf",
  },
];

export const probationManagementRecords = [...unsortedProbationManagementRecords].sort((a, b) => {
  if (!a.expectedRegularDate && b.expectedRegularDate) {
    return -1;
  }

  if (a.expectedRegularDate && !b.expectedRegularDate) {
    return 1;
  }

  if (a.expectedRegularDate !== b.expectedRegularDate) {
    return b.expectedRegularDate.localeCompare(a.expectedRegularDate);
  }

  return a.employeeCreatedAt.localeCompare(b.employeeCreatedAt);
});

export const regularizationApplications: RegularizationApplicationRecord[] = [
  {
    id: "REG-APP-1",
    employeeNo: "LS0003",
    name: "周霖",
    area: "厦门",
    department: "财务部",
    position: "财务专员",
    rank: "P2",
    phone: "13800010003",
    hireDate: "2026-02-20",
    expectedRegularDate: "2026-05-20",
    actualRegularDate: "2026-05-20",
    status: "审批中",
    responsibleHr: "林珊",
    submitTime: "2026-05-04 09:18",
    updatedAt: "2026-05-04 10:05",
    approvalNo: "HR-REG-202605-001",
    currentNode: "直属主管审批",
    assessmentTemplate: "财务岗位转正评估表.docx",
    assessmentFile: "周霖-转正评估表.docx",
    valueTestFile: "周霖-价值观测试.pdf",
    examFile: "财务制度转正考试.pdf",
  },
  {
    id: "REG-APP-2",
    employeeNo: "LS0011",
    name: "王越",
    area: "深圳",
    department: "供应链中心",
    position: "供应链计划",
    rank: "P2",
    phone: "13800010011",
    hireDate: "2026-02-12",
    expectedRegularDate: "2026-05-12",
    actualRegularDate: "2026-05-12",
    status: "已通过",
    responsibleHr: "林珊",
    submitTime: "2026-05-02 14:20",
    updatedAt: "2026-05-03 18:12",
    approvalNo: "HR-REG-202605-002",
    currentNode: "审批结束",
    assessmentTemplate: "供应链岗位转正评估表.docx",
    assessmentFile: "王越-转正评估表.docx",
    valueTestFile: "王越-价值观测试.pdf",
    examFile: "供应链计划考试.pdf",
  },
  {
    id: "REG-APP-3",
    employeeNo: "LS0015",
    name: "孟琳",
    area: "上海",
    department: "运营中心",
    position: "运营专员",
    rank: "P2",
    phone: "13800010015",
    hireDate: "2026-01-18",
    expectedRegularDate: "2026-04-18",
    actualRegularDate: "2026-04-18",
    status: "已驳回",
    responsibleHr: "许佳",
    submitTime: "2026-04-16 11:30",
    updatedAt: "2026-04-17 15:08",
    approvalNo: "HR-REG-202604-011",
    currentNode: "审批结束",
    assessmentTemplate: "运营岗位转正评估表.docx",
    assessmentFile: "孟琳-转正评估表.docx",
    valueTestFile: "孟琳-价值观测试.pdf",
    examFile: "运营标准转正考试.pdf",
  },
  {
    id: "REG-APP-4",
    employeeNo: "LS0017",
    name: "唐宁",
    area: "成都",
    department: "运营中心",
    position: "门店运营",
    rank: "P1",
    phone: "13800010017",
    hireDate: "2026-02-01",
    expectedRegularDate: "2026-05-01",
    actualRegularDate: "2026-05-01",
    status: "已撤销",
    responsibleHr: "林珊",
    submitTime: "2026-04-20 09:16",
    updatedAt: "2026-04-20 10:02",
    approvalNo: "HR-REG-202604-015",
    currentNode: "审批结束",
    assessmentTemplate: "运营岗位转正评估表.docx",
    assessmentFile: "唐宁-转正评估表.docx",
    valueTestFile: "唐宁-价值观测试.pdf",
    examFile: "运营标准转正考试.pdf",
  },
];

export const currentApplicationCandidate = probationManagementRecords.find((record) => record.employeeNo === "LS0012")!;
