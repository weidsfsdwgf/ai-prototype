export type UserAccountType = "正式账号" | "代管账号" | "其他账号";
export type UserStatus = "启用" | "停用" | "锁定";

export type DepartmentNode = {
  title: string;
  key: string;
  children?: DepartmentNode[];
};

export type UserRecord = {
  id: string;
  area: string;
  account: string;
  accountType: UserAccountType;
  name: string;
  employeeName?: string;
  department: string;
  role: string;
  status: UserStatus;
  creator: string;
  updater: string;
  createdAt: string;
  updatedAt: string;
};

export const departmentTree: DepartmentNode[] = [
  {
    title: "LAS 集团",
    key: "las",
    children: [
      {
        title: "成都",
        key: "chengdu",
        children: [
          { title: "运营中心", key: "chengdu-operations" },
          { title: "仓储中心", key: "chengdu-warehouse" },
          { title: "供应链中心", key: "chengdu-supply-chain" },
        ],
      },
      {
        title: "深圳",
        key: "shenzhen",
        children: [
          { title: "运营中心", key: "shenzhen-operations" },
          { title: "人事部", key: "shenzhen-hr" },
        ],
      },
      {
        title: "厦门",
        key: "xiamen",
        children: [
          { title: "信息中心", key: "xiamen-it" },
          { title: "财务部", key: "xiamen-finance" },
        ],
      },
    ],
  },
];

export const userRecords: UserRecord[] = [
  {
    id: "U-1001",
    area: "成都",
    account: "LS0001",
    accountType: "正式账号",
    name: "陈嘉",
    employeeName: "陈嘉",
    department: "运营中心",
    role: "系统管理员",
    status: "启用",
    creator: "系统初始化",
    updater: "林珊",
    createdAt: "2026-04-01 09:12",
    updatedAt: "2026-04-29 16:20",
  },
  {
    id: "U-1002",
    area: "深圳",
    account: "LS0002",
    accountType: "正式账号",
    name: "林珊",
    employeeName: "林珊",
    department: "人事部",
    role: "人事管理员",
    status: "启用",
    creator: "系统初始化",
    updater: "陈嘉",
    createdAt: "2026-04-02 10:35",
    updatedAt: "2026-04-28 11:08",
  },
  {
    id: "U-1003",
    area: "厦门",
    account: "王越-代管",
    accountType: "代管账号",
    name: "王越代管账号",
    department: "供应链中心",
    role: "外部协同",
    status: "锁定",
    creator: "王越",
    updater: "王越",
    createdAt: "2026-04-12 14:18",
    updatedAt: "2026-04-27 09:46",
  },
  {
    id: "U-1004",
    area: "厦门",
    account: "audit-review",
    accountType: "其他账号",
    name: "审计复核账号",
    employeeName: "周霖",
    department: "财务部",
    role: "审计查看",
    status: "启用",
    creator: "陈嘉",
    updater: "周霖",
    createdAt: "2026-04-18 13:24",
    updatedAt: "2026-04-26 17:40",
  },
  {
    id: "U-1005",
    area: "成都",
    account: "赵宁-代管",
    accountType: "代管账号",
    name: "赵宁代管账号",
    department: "仓储中心",
    role: "仓储专员",
    status: "停用",
    creator: "赵宁",
    updater: "赵宁",
    createdAt: "2026-04-20 08:58",
    updatedAt: "2026-04-25 15:16",
  },
];
