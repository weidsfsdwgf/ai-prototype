export type RosterStatus = "试用期" | "正式" | "待离职" | "已离职";

export type RosterArchiveMaterial = {
  id: string;
  fileName: string;
  fileType: string;
  sourceModule: string;
  businessNo: string;
  status: "已归档" | "同步中";
  syncedAt: string;
  updatedBy: string;
};

export type RosterRecord = {
  id: string;
  employeeNo: string;
  name: string;
  area: string;
  phone: string;
  departments: string[];
  primaryDepartment: string;
  positions: string[];
  rank: string;
  directLeader: string;
  employeeType: string;
  employeeStatus: RosterStatus;
  hireDate: string;
  expectedRegularDate: string;
  regularDate: string;
  workingYears: string;
  responsibleHr: string;
  email: string;
  updatedAt: string;
  archiveMaterials?: RosterArchiveMaterial[];
};

export const rosterRecords: RosterRecord[] = [
  {
    id: "EMP-1",
    employeeNo: "LS0001",
    name: "陈嘉",
    area: "成都",
    phone: "13800010001",
    departments: ["运营中心", "仓储中心"],
    primaryDepartment: "运营中心",
    positions: ["运营主管"],
    rank: "M2",
    directLeader: "许佳",
    employeeType: "正式员工",
    employeeStatus: "正式",
    hireDate: "2024-03-12",
    expectedRegularDate: "2024-06-12",
    regularDate: "2024-06-12",
    workingYears: "2 年 1 个月",
    responsibleHr: "林珊",
    email: "chenjia@example.com",
    updatedAt: "2026-04-29 16:20",
    archiveMaterials: [
      {
        id: "FILE-EMP-1-001",
        fileName: "陈嘉-劳动合同-2024.pdf",
        fileType: "劳动合同",
        sourceModule: "合同管理",
        businessNo: "CON-202403-001",
        status: "已归档",
        syncedAt: "2024-03-12 18:20",
        updatedBy: "林珊",
      },
    ],
  },
  {
    id: "EMP-2",
    employeeNo: "LS0002",
    name: "林珊",
    area: "深圳",
    phone: "13800010002",
    departments: ["人事部"],
    primaryDepartment: "人事部",
    positions: ["人事专员"],
    rank: "P3",
    directLeader: "陈嘉",
    employeeType: "正式员工",
    employeeStatus: "正式",
    hireDate: "2025-02-18",
    expectedRegularDate: "2025-05-18",
    regularDate: "2025-05-18",
    workingYears: "1 年 2 个月",
    responsibleHr: "林珊",
    email: "linshan@example.com",
    updatedAt: "2026-04-28 11:08",
  },
  {
    id: "EMP-3",
    employeeNo: "LS0003",
    name: "周霖",
    area: "厦门",
    phone: "13800010003",
    departments: ["财务部"],
    primaryDepartment: "财务部",
    positions: ["财务专员"],
    rank: "P2",
    directLeader: "赵宁",
    employeeType: "正式员工",
    employeeStatus: "试用期",
    hireDate: "2026-02-20",
    expectedRegularDate: "2026-05-20",
    regularDate: "",
    workingYears: "2 个月",
    responsibleHr: "林珊",
    email: "zhoulin@example.com",
    updatedAt: "2026-04-27 17:40",
  },
  {
    id: "EMP-4",
    employeeNo: "LS0004",
    name: "赵宁",
    area: "成都",
    phone: "13800010004",
    departments: ["仓储中心"],
    primaryDepartment: "仓储中心",
    positions: ["仓储专员"],
    rank: "P2",
    directLeader: "陈嘉",
    employeeType: "劳务员工",
    employeeStatus: "待离职",
    hireDate: "2023-11-08",
    expectedRegularDate: "2024-02-08",
    regularDate: "2024-02-08",
    workingYears: "2 年 5 个月",
    responsibleHr: "林珊",
    email: "zhaoning@example.com",
    updatedAt: "2026-04-25 15:16",
    archiveMaterials: [
      {
        id: "FILE-EMP-4-001",
        fileName: "赵宁-离职证明.docx",
        fileType: "离职证明",
        sourceModule: "离职管理",
        businessNo: "SEAL-202605-0004",
        status: "同步中",
        syncedAt: "2026-05-13 18:45",
        updatedBy: "林珊",
      },
      {
        id: "FILE-EMP-4-002",
        fileName: "赵宁-离职事项确认单.pdf",
        fileType: "离职材料",
        sourceModule: "待办任务",
        businessNo: "TODO-202605-0128",
        status: "已归档",
        syncedAt: "2026-05-12 17:30",
        updatedBy: "系统同步",
      },
    ],
  },
  {
    id: "EMP-5",
    employeeNo: "LS0005",
    name: "许佳",
    area: "深圳",
    phone: "13800010005",
    departments: ["供应链中心"],
    primaryDepartment: "供应链中心",
    positions: ["供应链计划"],
    rank: "M1",
    directLeader: "陈嘉",
    employeeType: "正式员工",
    employeeStatus: "已离职",
    hireDate: "2022-07-01",
    expectedRegularDate: "2022-10-01",
    regularDate: "2022-10-01",
    workingYears: "3 年 8 个月",
    responsibleHr: "林珊",
    email: "xujia@example.com",
    updatedAt: "2026-05-13 19:10",
    archiveMaterials: [
      {
        id: "FILE-EMP-5-001",
        fileName: "许佳-离职证明.docx",
        fileType: "离职证明",
        sourceModule: "离职管理",
        businessNo: "SEAL-202605-0005",
        status: "已归档",
        syncedAt: "2026-05-13 19:02",
        updatedBy: "林珊",
      },
      {
        id: "FILE-EMP-5-002",
        fileName: "许佳-劳动合同解除协议.pdf",
        fileType: "离职材料",
        sourceModule: "离职管理",
        businessNo: "RS-202605-0005",
        status: "已归档",
        syncedAt: "2026-05-13 18:56",
        updatedBy: "系统同步",
      },
    ],
  },
];

export const rosterSelectOptions = {
  areas: ["成都", "深圳", "厦门"],
  departments: ["运营中心", "仓储中心", "供应链中心", "人事部", "信息中心", "财务部"],
  positions: ["运营主管", "仓储专员", "供应链计划", "人事专员", "财务专员"],
  ranks: ["P1", "P2", "P3", "M1", "M2"],
  leaders: ["陈嘉", "林珊", "周霖", "赵宁", "许佳"],
  recruitmentChannels: ["Boss 直聘", "猎头推荐", "员工推荐", "校园招聘"],
  employeeTypes: ["正式员工", "劳务员工", "实习生", "外包"],
  employeeStatuses: ["试用期", "正式", "待离职", "已离职"],
  contracts: ["固定期限劳动合同", "无固定期限劳动合同", "劳务协议"],
  socialSecurity: ["已缴纳", "未缴纳", "无需缴纳"],
  providentFund: ["已缴纳", "未缴纳", "无需缴纳"],
  hrUsers: ["林珊", "陈嘉"],
  genders: ["男", "女"],
  nationalities: ["汉族", "壮族", "满族", "回族", "其他"],
  politicalStatuses: ["群众", "共青团员", "中共党员", "其他"],
  maritalStatuses: ["已婚", "未婚"],
  hukou: ["本市", "外市"],
  hukouTypes: ["城镇", "农村"],
  yesNo: ["是", "否"],
  education: ["博士", "硕士", "本科", "大专", "中专", "高中", "初中", "小学", "其他"],
  examSubjectTypes: ["理综", "文综", "物理类", "历史类"],
  contractSubjects: ["成都拉森科技有限公司", "深圳拉森运营有限公司", "厦门拉森供应链有限公司"],
  contractTypes: ["劳动合同", "劳务合同", "实习协议"],
};
